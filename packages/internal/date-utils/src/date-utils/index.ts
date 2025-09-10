import {
  addDays,
  addHours,
  addMinutes,
  addMonths,
  addSeconds,
  addWeeks,
  addYears,
  differenceInMinutes,
  format,
  formatISO,
  isFuture,
  isValid,
  subDays,
  subHours,
  subMinutes,
  subMonths,
  subSeconds,
  subWeeks,
  subYears,
} from 'date-fns';

import { formatInTimeZone, fromZonedTime, toZonedTime } from 'date-fns-tz';

import type {
  DateUtils,
  Duration,
  PostingSchedule,
  Timezone,
} from './__defs__';

export { COMMON_TIMEZONES } from './__defs__';

export const dateUtils: DateUtils = {
  add: {
    seconds: (date: Date, amount: number) => addSeconds(date, amount),
    minutes: (date: Date, amount: number) => addMinutes(date, amount),
    hours: (date: Date, amount: number) => addHours(date, amount),
    days: (date: Date, amount: number) => addDays(date, amount),
    weeks: (date: Date, amount: number) => addWeeks(date, amount),
    months: (date: Date, amount: number) => addMonths(date, amount),
    years: (date: Date, amount: number) => addYears(date, amount),
  },

  subtract: {
    seconds: (date: Date, amount: number) => subSeconds(date, amount),
    minutes: (date: Date, amount: number) => subMinutes(date, amount),
    hours: (date: Date, amount: number) => subHours(date, amount),
    days: (date: Date, amount: number) => subDays(date, amount),
    weeks: (date: Date, amount: number) => subWeeks(date, amount),
    months: (date: Date, amount: number) => subMonths(date, amount),
    years: (date: Date, amount: number) => subYears(date, amount),
  },

  format: {
    iso: (date: Date) => formatISO(date),
    readable: (date: Date) => format(date, 'PPP p'),
    time: (date: Date) => format(date, 'HH:mm'),
    inTimezone: (date: Date, timezone: Timezone) =>
      formatInTimeZone(date, timezone, 'PPP p z'),
  },

  timezone: {
    convert: (date: Date, fromTz: Timezone, toTz: Timezone) => {
      const utcDate = fromZonedTime(date, fromTz);
      return toZonedTime(utcDate, toTz);
    },
    toUtc: (date: Date, timezone: Timezone) => fromZonedTime(date, timezone),
    fromUtc: (date: Date, timezone: Timezone) => toZonedTime(date, timezone),
  },

  schedule: {
    createSlot: (schedule: PostingSchedule) => {
      return fromZonedTime(schedule.publishAt, schedule.timezone);
    },

    calculateDelays: (schedules: PostingSchedule[]) => {
      const results: Date[] = [];

      schedules.forEach((schedule, index) => {
        if (index === 0) {
          results.push(dateUtils.schedule.createSlot(schedule));
          return;
        }

        const previousTime = results[index - 1];
        let scheduledTime = dateUtils.schedule.createSlot(schedule);

        if (schedule.delayAfterPrevious) {
          const delay = schedule.delayAfterPrevious;
          let delayedTime = previousTime;

          if (delay.years) delayedTime = addYears(delayedTime, delay.years);
          if (delay.months) delayedTime = addMonths(delayedTime, delay.months);
          if (delay.weeks) delayedTime = addWeeks(delayedTime, delay.weeks);
          if (delay.days) delayedTime = addDays(delayedTime, delay.days);
          if (delay.hours) delayedTime = addHours(delayedTime, delay.hours);
          if (delay.minutes)
            delayedTime = addMinutes(delayedTime, delay.minutes);
          if (delay.seconds)
            delayedTime = addSeconds(delayedTime, delay.seconds);

          scheduledTime =
            delayedTime > scheduledTime ? delayedTime : scheduledTime;
        }

        results.push(scheduledTime);
      });

      return results;
    },

    isValidScheduleTime: (date: Date) => {
      return isValid(date) && isFuture(date);
    },
  },
};

export const createDuration = (duration: Duration): Date => {
  let result = new Date();

  if (duration.years) result = addYears(result, duration.years);
  if (duration.months) result = addMonths(result, duration.months);
  if (duration.weeks) result = addWeeks(result, duration.weeks);
  if (duration.days) result = addDays(result, duration.days);
  if (duration.hours) result = addHours(result, duration.hours);
  if (duration.minutes) result = addMinutes(result, duration.minutes);
  if (duration.seconds) result = addSeconds(result, duration.seconds);

  return result;
};

export const addDuration = (date: Date, duration: Duration): Date => {
  let result = date;

  if (duration.years) result = addYears(result, duration.years);
  if (duration.months) result = addMonths(result, duration.months);
  if (duration.weeks) result = addWeeks(result, duration.weeks);
  if (duration.days) result = addDays(result, duration.days);
  if (duration.hours) result = addHours(result, duration.hours);
  if (duration.minutes) result = addMinutes(result, duration.minutes);
  if (duration.seconds) result = addSeconds(result, duration.seconds);

  return result;
};

export const getTimezoneOffset = (date: Date, timezone: Timezone): number => {
  const utcDate = fromZonedTime(date, timezone);
  return differenceInMinutes(utcDate, date);
};
