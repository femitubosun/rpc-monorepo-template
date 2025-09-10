import { addDays, getDay, isWeekend, setHours, setMinutes } from 'date-fns';

import { formatInTimeZone, toZonedTime } from 'date-fns-tz';

import type { Duration, Timezone } from './__defs__/index.js';
import { addDuration, dateUtils } from './index.js';

export interface ContentSlot {
  id: string;
  platform: 'instagram' | 'tiktok' | 'facebook' | 'twitter' | 'linkedin';
  content: {
    title?: string;
    description?: string;
    hashtags?: string[];
    mentions?: string[];
  };
  scheduledAt: Date;
  creatorTimezone: Timezone;
  status: 'draft' | 'scheduled' | 'published' | 'failed';
}

export interface CampaignSchedule {
  campaignId: string;
  slots: ContentSlot[];
  timezone: Timezone;
  startDate: Date;
  endDate?: Date;
}

export const OPTIMAL_POSTING_TIMES = {
  instagram: {
    weekday: { hour: 11, minute: 0 },
    weekend: { hour: 14, minute: 0 },
  },
  tiktok: {
    weekday: { hour: 6, minute: 0 },
    weekend: { hour: 9, minute: 0 },
  },
  facebook: {
    weekday: { hour: 15, minute: 0 },
    weekend: { hour: 12, minute: 0 },
  },
  twitter: {
    weekday: { hour: 9, minute: 0 },
    weekend: { hour: 10, minute: 0 },
  },
  linkedin: {
    weekday: { hour: 8, minute: 0 },
    weekend: { hour: 10, minute: 0 },
  },
} as const;

export const socialScheduling = {
  generateOptimalTimes: (
    platform: ContentSlot['platform'],
    targetTimezone: Timezone,
    daysFromNow: number = 1
  ) => {
    const baseDate = addDays(new Date(), daysFromNow);
    const isWeekendDay = isWeekend(baseDate);

    const optimalTime = OPTIMAL_POSTING_TIMES[platform];
    const timeConfig = isWeekendDay ? optimalTime.weekend : optimalTime.weekday;

    const scheduledTime = setMinutes(
      setHours(baseDate, timeConfig.hour),
      timeConfig.minute
    );

    return dateUtils.timezone.fromUtc(scheduledTime, targetTimezone);
  },

  createContentSlot: (params: {
    platform: ContentSlot['platform'];
    content: ContentSlot['content'];
    scheduledAt: Date;
    creatorTimezone: Timezone;
  }): ContentSlot => {
    return {
      id: `slot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      platform: params.platform,
      content: params.content,
      scheduledAt: params.scheduledAt,
      creatorTimezone: params.creatorTimezone,
      status: 'draft',
    };
  },

  scheduleCampaignSlots: (params: {
    platforms: ContentSlot['platform'][];
    content: ContentSlot['content'];
    startDate: Date;
    creatorTimezone: Timezone;
    delayBetweenPosts?: Duration;
  }): ContentSlot[] => {
    const slots: ContentSlot[] = [];
    const defaultDelay: Duration = { minutes: 15 };
    const delay = params.delayBetweenPosts || defaultDelay;

    params.platforms.forEach((platform, index) => {
      const baseTime =
        index === 0
          ? params.startDate
          : addDuration(slots[index - 1].scheduledAt, delay);

      const optimizedTime = socialScheduling.generateOptimalTimes(
        platform,
        params.creatorTimezone,
        0
      );

      const finalTime = baseTime > optimizedTime ? baseTime : optimizedTime;

      const slot = socialScheduling.createContentSlot({
        platform,
        content: params.content,
        scheduledAt: finalTime,
        creatorTimezone: params.creatorTimezone,
      });

      slots.push(slot);
    });

    return slots;
  },

  validateScheduleTiming: (
    slot: ContentSlot
  ): {
    isValid: boolean;
    warnings: string[];
    suggestions: string[];
  } => {
    const warnings: string[] = [];
    const suggestions: string[] = [];

    const localTime = toZonedTime(slot.scheduledAt, slot.creatorTimezone);
    const hour = localTime.getHours();
    const dayOfWeek = getDay(localTime);

    if (hour < 6 || hour > 22) {
      warnings.push('Posting outside optimal hours (6 AM - 10 PM)');
      suggestions.push(
        'Consider scheduling between 6 AM and 10 PM for better engagement'
      );
    }

    if (slot.platform === 'linkedin' && (dayOfWeek === 0 || dayOfWeek === 6)) {
      warnings.push('LinkedIn posts perform better on weekdays');
      suggestions.push('Consider moving LinkedIn posts to Monday-Friday');
    }

    if (slot.platform === 'instagram' && dayOfWeek === 1) {
      warnings.push('Monday is typically low-engagement for Instagram');
      suggestions.push(
        'Consider Tuesday-Thursday for peak Instagram engagement'
      );
    }

    return {
      isValid: warnings.length === 0,
      warnings,
      suggestions,
    };
  },

  formatScheduleForCreator: (slot: ContentSlot): string => {
    const localTime = formatInTimeZone(
      slot.scheduledAt,
      slot.creatorTimezone,
      "EEEE, MMMM do, yyyy 'at' h:mm a z"
    );

    return `${slot.platform.charAt(0).toUpperCase() + slot.platform.slice(1)} post scheduled for ${localTime}`;
  },

  getBestPostingWindows: (timezone: Timezone, daysAhead: number = 7) => {
    const windows: Array<{
      platform: ContentSlot['platform'];
      date: Date;
      localTime: string;
      engagement: 'high' | 'medium' | 'low';
    }> = [];

    for (let day = 1; day <= daysAhead; day++) {
      Object.entries(OPTIMAL_POSTING_TIMES).forEach(([platform, times]) => {
        const targetDate = addDays(new Date(), day);
        const isWeekendDay = isWeekend(targetDate);
        const timeConfig = isWeekendDay ? times.weekend : times.weekday;

        const optimalTime = setMinutes(
          setHours(targetDate, timeConfig.hour),
          timeConfig.minute
        );

        const localTime = formatInTimeZone(optimalTime, timezone, 'EEE h:mm a');

        let engagement: 'high' | 'medium' | 'low' = 'medium';

        if (platform === 'linkedin' && !isWeekendDay) engagement = 'high';
        if (platform === 'instagram' && isWeekendDay) engagement = 'high';
        if (platform === 'tiktok' && timeConfig.hour < 10) engagement = 'high';

        windows.push({
          platform: platform as ContentSlot['platform'],
          date: optimalTime,
          localTime,
          engagement,
        });
      });
    }

    return windows.sort((a, b) => a.date.getTime() - b.date.getTime());
  },
};

export const campaignScheduler = {
  createCampaign: (params: {
    platforms: ContentSlot['platform'][];
    contentItems: ContentSlot['content'][];
    timezone: Timezone;
    startDate: Date;
    endDate?: Date;
    distributionStrategy?: 'even' | 'burst' | 'optimal';
  }): CampaignSchedule => {
    const strategy = params.distributionStrategy || 'optimal';
    const slots: ContentSlot[] = [];

    params.contentItems.forEach((content, contentIndex) => {
      const contentSlots = socialScheduling.scheduleCampaignSlots({
        platforms: params.platforms,
        content,
        startDate: addDays(params.startDate, contentIndex),
        creatorTimezone: params.timezone,
        delayBetweenPosts:
          strategy === 'burst'
            ? { minutes: 5 }
            : strategy === 'even'
              ? { hours: 2 }
              : { minutes: 15 },
      });

      slots.push(...contentSlots);
    });

    return {
      campaignId: `campaign_${Date.now()}`,
      slots,
      timezone: params.timezone,
      startDate: params.startDate,
      endDate: params.endDate,
    };
  },

  calculateCampaignMetrics: (campaign: CampaignSchedule) => {
    const now = new Date();
    const published = campaign.slots.filter((s) => s.status === 'published');
    const scheduled = campaign.slots.filter(
      (s) => s.status === 'scheduled' && s.scheduledAt > now
    );
    const failed = campaign.slots.filter((s) => s.status === 'failed');

    const platformCounts = campaign.slots.reduce(
      (acc, slot) => {
        acc[slot.platform] = (acc[slot.platform] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    return {
      totalSlots: campaign.slots.length,
      published: published.length,
      scheduled: scheduled.length,
      failed: failed.length,
      platformDistribution: platformCounts,
      campaignDuration: campaign.endDate
        ? Math.ceil(
            (campaign.endDate.getTime() - campaign.startDate.getTime()) /
              (1000 * 60 * 60 * 24)
          )
        : null,
    };
  },
};
