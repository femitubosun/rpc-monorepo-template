import { z } from 'zod';

export const TimezoneSchema = z
  .string()
  .regex(
    /^[A-Za-z_]+\/[A-Za-z_]+$/,
    'Invalid timezone format. Use format like "America/New_York"'
  );

export const ScheduleTimeSchema = z.object({
  dateTime: z.date(),
  timezone: TimezoneSchema,
});

export const DurationSchema = z.object({
  years: z.number().optional(),
  months: z.number().optional(),
  weeks: z.number().optional(),
  days: z.number().optional(),
  hours: z.number().optional(),
  minutes: z.number().optional(),
  seconds: z.number().optional(),
});

export const PostingScheduleSchema = z.object({
  platform: z.enum(['instagram', 'tiktok', 'facebook', 'twitter', 'linkedin']),
  publishAt: z.date(),
  timezone: TimezoneSchema,
  delayAfterPrevious: DurationSchema.optional(),
});

export type Timezone = z.infer<typeof TimezoneSchema>;
export type ScheduleTime = z.infer<typeof ScheduleTimeSchema>;
export type Duration = z.infer<typeof DurationSchema>;
export type PostingSchedule = z.infer<typeof PostingScheduleSchema>;

export const COMMON_TIMEZONES = {
  PST: 'America/Los_Angeles',
  MST: 'America/Denver',
  CST: 'America/Chicago',
  EST: 'America/New_York',
  UTC: 'UTC',
  GMT: 'Europe/London',
  CET: 'Europe/Paris',
  JST: 'Asia/Tokyo',
  AEST: 'Australia/Sydney',
  WAT: 'Africa/Lagos',
} as const;

export type CommonTimezone = keyof typeof COMMON_TIMEZONES;

export type DateUtils = {
  add: {
    seconds: (date: Date, amount: number) => Date;
    minutes: (date: Date, amount: number) => Date;
    hours: (date: Date, amount: number) => Date;
    days: (date: Date, amount: number) => Date;
    weeks: (date: Date, amount: number) => Date;
    months: (date: Date, amount: number) => Date;
    years: (date: Date, amount: number) => Date;
  };
  subtract: {
    seconds: (date: Date, amount: number) => Date;
    minutes: (date: Date, amount: number) => Date;
    hours: (date: Date, amount: number) => Date;
    days: (date: Date, amount: number) => Date;
    weeks: (date: Date, amount: number) => Date;
    months: (date: Date, amount: number) => Date;
    years: (date: Date, amount: number) => Date;
  };
  format: {
    iso: (date: Date) => string;
    readable: (date: Date) => string;
    time: (date: Date) => string;
    inTimezone: (date: Date, timezone: Timezone) => string;
  };
  timezone: {
    convert: (date: Date, fromTz: Timezone, toTz: Timezone) => Date;
    toUtc: (date: Date, timezone: Timezone) => Date;
    fromUtc: (date: Date, timezone: Timezone) => Date;
  };
  schedule: {
    createSlot: (schedule: PostingSchedule) => Date;
    calculateDelays: (schedules: PostingSchedule[]) => Date[];
    isValidScheduleTime: (date: Date) => boolean;
  };
};
