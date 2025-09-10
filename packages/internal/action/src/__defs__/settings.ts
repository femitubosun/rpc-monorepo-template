export interface QJobRetrySettings {
  attempts: number;
  backoff?: {
    type: 'exponential' | 'fixed';
    delay: number;
  };
}

export interface QSettings {
  validateInput: boolean;
  validateOutput: boolean;
  timeout: number;
  concurrency: number;
  cron?: CronExpression;
  jobRetry?: QJobRetrySettings;
}

export const Q_GRACEFUL_SHUTDOWN_TIMEOUT = 30_000;

// Default to 5 minutes
export const Q_TIMEOUT = 300_000;

export const Q_DEFAULT_CONCURRENCY = 500;

export const Q_DEFAULT_SETTINGS: QSettings = {
  validateInput: true,
  validateOutput: true,
  timeout: Q_TIMEOUT,
  concurrency: Q_DEFAULT_CONCURRENCY,
};

export const CRON = {
  every_minute: '* * * * *',
  every_five_minutes: '*/5 * * * *',
  every_ten_minutes: '*/10 * * * *',
  every_fifteen_minutes: '*/15 * * * *',
  every_thirty_minutes: '*/30 * * * *',

  every_hour: '0 * * * *',
  every_two_hours: '0 */2 * * *',
  every_three_hours: '0 */3 * * *',
  every_six_hours: '0 */6 * * *',
  every_twelve_hours: '0 */12 * * *',

  every_day: '0 0 * * *',
  every_day_at_midnight: '0 0 * * *',
  every_day_at_noon: '0 12 * * *',
  every_day_at_6am: '0 6 * * *',
  every_day_at_7am: '0 7 * * *',
  every_day_at_8am: '0 8 * * *',

  every_monday: '0 0 * * 1',
  every_tuesday: '0 0 * * 2',
  every_wednesday: '0 0 * * 3',
  every_thursday: '0 0 * * 4',
  every_friday: '0 0 * * 5',
  every_saturday: '0 0 * * 6',
  every_sunday: '0 0 * * 0',

  every_week: '0 0 * * 0',
  every_month: '0 0 1 * *',
  every_quarter: '0 0 1 */3 *',
  every_six_months: '0 0 1 */6 *',
  every_year: '0 0 1 1 *',
  every_weekday: '0 0 * * 1-5',
  every_weekend: '0 0 * * 6,0',
} as const;

export type CronExpression = keyof typeof CRON;
