import { z } from 'zod';
import R2 from './clients/r2';
import RESEND from './clients/resend';
import GLOBALS from './globals';
import AUTH from './modules/auth';

export const envDefinition = z.object({
  ...GLOBALS,
  ...AUTH,
  ...R2,
  ...RESEND,
});
