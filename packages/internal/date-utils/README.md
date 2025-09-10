# @template/date-utils

A comprehensive date and time utility library for the Axon AI platform, built on top of `date-fns` and `date-fns-tz`. This package provides timezone-aware date manipulation, social media scheduling utilities, and campaign management tools designed specifically for influencer marketing workflows.

## Features

✅ **Modular & Tree-shakable** - Import only what you need
✅ **Timezone-aware** - Proper handling of timezones with DST support
✅ **Social Media Optimized** - Platform-specific optimal posting times
✅ **Campaign Management** - Multi-platform content scheduling
✅ **Type-safe** - Full TypeScript support with Zod validation
✅ **Performance First** - Based on date-fns for maximum speed

## Installation

This package is already included in the Axon AI monorepo. Import it in your modules:

```typescript
import { dateUtils, socialScheduling } from '@template/date-utils'
```

## Basic Usage

### Core Date Operations

```typescript
import { dateUtils } from '@template/date-utils'

// Add time periods
const futureDate = dateUtils.add.minutes(new Date(), 30)
const nextWeek = dateUtils.add.days(new Date(), 7)

// Subtract time periods
const pastDate = dateUtils.subtract.hours(new Date(), 2)

// Format dates
const isoString = dateUtils.format.iso(new Date())
const readable = dateUtils.format.readable(new Date())
// Output: "January 15th, 2025 at 2:30 PM"
```

### Timezone Operations

```typescript
import { dateUtils, COMMON_TIMEZONES } from '@template/date-utils'

// Convert between timezones
const nycTime = new Date()
const lagosTime = dateUtils.timezone.convert(nycTime, 'America/New_York', 'Africa/Lagos')

// Convert to/from UTC
const utcTime = dateUtils.timezone.toUtc(new Date(), 'America/Los_Angeles')
const localTime = dateUtils.timezone.fromUtc(utcTime, 'Europe/London')

// Format in specific timezone
const formatted = dateUtils.format.inTimezone(new Date(), 'Asia/Tokyo')
// Output: "January 15th, 2025 at 11:30 PM JST"

// Use common timezone shortcuts
const timezone = COMMON_TIMEZONES.WAT // 'Africa/Lagos'
```

## Social Media Scheduling

### Content Slots

Create and manage social media content slots with optimal timing:

```typescript
import { socialScheduling } from '@template/date-utils'

// Generate optimal posting times
const optimalTime = socialScheduling.generateOptimalTimes(
  'instagram',
  'America/New_York',
  1 // days from now
)

// Create a content slot
const slot = socialScheduling.createContentSlot({
  platform: 'tiktok',
  content: {
    title: 'Summer Fashion Haul',
    description: 'Check out these amazing summer pieces!',
    hashtags: ['#SummerFashion', '#OOTD', '#Haul'],
    mentions: ['@brand_partner']
  },
  scheduledAt: optimalTime,
  creatorTimezone: 'America/Los_Angeles'
})
```

### Multi-Platform Campaign Scheduling

```typescript
import { socialScheduling } from '@template/date-utils'

// Schedule across multiple platforms with optimal delays
const campaignSlots = socialScheduling.scheduleCampaignSlots({
  platforms: ['instagram', 'tiktok', 'facebook'],
  content: {
    title: 'Product Launch Campaign',
    description: 'Announcing our newest collection!',
    hashtags: ['#NewDrop', '#Fashion2025']
  },
  startDate: new Date('2025-01-20T10:00:00Z'),
  creatorTimezone: 'America/Chicago',
  delayBetweenPosts: { minutes: 30 } // 30 min between platforms
})

console.log(campaignSlots)
// [
//   { platform: 'instagram', scheduledAt: '2025-01-20T16:00:00Z' },
//   { platform: 'tiktok', scheduledAt: '2025-01-20T16:30:00Z' },
//   { platform: 'facebook', scheduledAt: '2025-01-20T17:00:00Z' }
// ]
```

### Schedule Validation & Optimization

```typescript
import { socialScheduling } from '@template/date-utils'

// Validate posting time
const validation = socialScheduling.validateScheduleTiming(slot)

if (!validation.isValid) {
  console.log('Warnings:', validation.warnings)
  console.log('Suggestions:', validation.suggestions)
}

// Get best posting windows for the week
const bestTimes = socialScheduling.getBestPostingWindows('America/New_York', 7)
console.log(bestTimes)
// [
//   {
//     platform: 'instagram',
//     date: Date,
//     localTime: 'Tue 2:00 PM',
//     engagement: 'high'
//   },
//   ...
// ]
```

## Campaign Management

### Full Campaign Creation

```typescript
import { campaignScheduler } from '@template/date-utils'

const campaign = campaignScheduler.createCampaign({
  platforms: ['instagram', 'tiktok', 'linkedin'],
  contentItems: [
    {
      title: 'Brand Partnership Announcement',
      description: 'Excited to partner with @amazing_brand!',
      hashtags: ['#Partnership', '#BrandLove']
    },
    {
      title: 'Behind the Scenes',
      description: 'See how the magic happens!',
      hashtags: ['#BTS', '#ContentCreation']
    }
  ],
  timezone: 'America/Los_Angeles',
  startDate: new Date('2025-01-25T09:00:00'),
  distributionStrategy: 'optimal' // 'burst' | 'even' | 'optimal'
})

// Get campaign metrics
const metrics = campaignScheduler.calculateCampaignMetrics(campaign)
console.log(metrics)
// {
//   totalSlots: 6,
//   published: 0,
//   scheduled: 6,
//   failed: 0,
//   platformDistribution: { instagram: 2, tiktok: 2, linkedin: 2 },
//   campaignDuration: 2
// }
```

## Platform-Specific Optimal Times

The library includes research-based optimal posting times for each platform:

| Platform  | Weekday    | Weekend    | Best Engagement         |
|-----------|------------|------------|------------------------|
| Instagram | 11:00 AM   | 2:00 PM    | Weekends, Tue-Thu      |
| TikTok    | 6:00 AM    | 9:00 AM    | Early morning          |
| Facebook  | 3:00 PM    | 12:00 PM   | Afternoon              |
| Twitter   | 9:00 AM    | 10:00 AM   | Business hours         |
| LinkedIn  | 8:00 AM    | 10:00 AM   | Weekdays only          |

These times are automatically applied when using `generateOptimalTimes()` and can be customized based on your audience analytics.

## Common Timezones

Predefined timezone constants for major markets:

```typescript
import { COMMON_TIMEZONES } from '@template/date-utils'

const timezones = {
  PST: 'America/Los_Angeles',  // Pacific Standard Time
  MST: 'America/Denver',       // Mountain Standard Time
  CST: 'America/Chicago',      // Central Standard Time
  EST: 'America/New_York',     // Eastern Standard Time
  UTC: 'UTC',                  // Coordinated Universal Time
  GMT: 'Europe/London',        // Greenwich Mean Time
  CET: 'Europe/Paris',         // Central European Time
  JST: 'Asia/Tokyo',           // Japan Standard Time
  AEST: 'Australia/Sydney',    // Australian Eastern Standard Time
  WAT: 'Africa/Lagos'          // West Africa Time (Nigeria)
}
```

## Advanced Usage

### Custom Duration Operations

```typescript
import { addDuration, createDuration } from '@template/date-utils'

// Create complex durations
const campaignDuration = createDuration({
  weeks: 2,
  days: 3,
  hours: 4,
  minutes: 30
})

// Add duration to any date
const campaignEnd = addDuration(new Date(), {
  months: 1,
  weeks: 2
})
```

### Content Slot Formatting

```typescript
import { socialScheduling } from '@template/date-utils'

// Format schedule for creator display
const humanReadable = socialScheduling.formatScheduleForCreator(slot)
// "Instagram post scheduled for Wednesday, January 15th, 2025 at 2:30 PM PST"
```

### Timezone Offset Calculations

```typescript
import { getTimezoneOffset } from '@template/date-utils'

// Get timezone offset in minutes
const offsetMinutes = getTimezoneOffset(new Date(), 'Europe/London')
console.log(offsetMinutes) // e.g., -300 (5 hours behind UTC)
```

## Type Safety

All functions are fully typed with comprehensive TypeScript definitions:

```typescript
import type {
  Timezone,
  ContentSlot,
  CampaignSchedule,
  Duration,
  PostingSchedule,
  CommonTimezone
} from '@template/date-utils'

// Timezone validation with Zod
import { TimezoneSchema, DurationSchema } from '@template/date-utils'

const validTimezone = TimezoneSchema.parse('America/New_York') // ✓
const invalidTimezone = TimezoneSchema.parse('Invalid/Zone') // ✗ throws error
```

## Integration Examples

### In Module Actions

```typescript
// modules/content/module/src/actions/schedule-post.ts
import { dateUtils, socialScheduling } from '@template/date-utils'
import { z } from 'zod'

const SchedulePostInput = z.object({
  platform: z.enum(['instagram', 'tiktok', 'facebook']),
  content: z.object({
    title: z.string(),
    description: z.string()
  }),
  publishAt: z.string().datetime(),
  creatorTimezone: z.string()
})

export async function schedulePost(input: z.infer<typeof SchedulePostInput>) {
  // Parse and validate the scheduled time
  const scheduledDate = new Date(input.publishAt)

  // Create content slot with validation
  const slot = socialScheduling.createContentSlot({
    platform: input.platform,
    content: input.content,
    scheduledAt: scheduledDate,
    creatorTimezone: input.creatorTimezone
  })

  // Validate timing
  const validation = socialScheduling.validateScheduleTiming(slot)
  if (!validation.isValid) {
    return {
      success: false,
      warnings: validation.warnings,
      suggestions: validation.suggestions
    }
  }

  // Convert to UTC for database storage
  const utcTime = dateUtils.timezone.toUtc(scheduledDate, input.creatorTimezone)

  // Store in database...
  return {
    success: true,
    slot,
    scheduledUtc: utcTime
  }
}
```

### In API Handlers

```typescript
// modules/content/api/src/handlers/create-campaign.ts
import { campaignScheduler } from '@template/date-utils'

export async function createCampaignHandler(c: Context) {
  const body = await c.req.json()

  // Create optimized campaign schedule
  const campaign = campaignScheduler.createCampaign({
    platforms: body.platforms,
    contentItems: body.content,
    timezone: body.creatorTimezone,
    startDate: new Date(body.startDate),
    distributionStrategy: 'optimal'
  })

  // Get metrics for UI display
  const metrics = campaignScheduler.calculateCampaignMetrics(campaign)

  return c.json({
    campaign,
    metrics,
    message: `Campaign created with ${metrics.totalSlots} content slots`
  })
}
```

## Performance Considerations

- **Tree Shaking**: Only import functions you need to minimize bundle size
- **Timezone Caching**: Timezone conversions are optimized for performance
- **Native Date Objects**: Built on native Date for maximum speed
- **Functional Approach**: Stateless functions enable better caching and optimization

## Best Practices

1. **Always store dates in UTC** in your database
2. **Convert to user timezone** only for display purposes
3. **Use validation functions** before scheduling content
4. **Leverage optimal posting times** for better engagement
5. **Handle timezone edge cases** like DST transitions
6. **Batch timezone operations** when processing multiple dates

## Contributing

This package follows the monorepo development patterns. When adding new functionality:

1. Add types to `src/date-utils/__defs__/index.ts`
2. Implement functions in `src/date-utils/index.ts` or specialized files
3. Export from `src/index.ts`
4. Add comprehensive examples to this README
5. Run `pnpm build` and `pnpm check-types` to verify

## Development

```bash
# Build the package
pnpm build

# Watch for changes
pnpm dev

# Type checking
pnpm check-types

# Run from project root to build all packages
pnpm build
```

## Dependencies

- **date-fns**: ^4.1.0 - Core date manipulation functions
- **date-fns-tz**: ^3.2.0 - Timezone-aware operations
- **zod**: ^3.25.74 - Runtime type validation

Built with ❤️ for the Axon AI mentoring platform.
