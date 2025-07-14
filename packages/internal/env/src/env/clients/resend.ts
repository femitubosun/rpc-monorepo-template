import { z } from 'zod';
import { makeDefinition } from '../utils';

const RESEND = makeDefinition({
  RESEND_API_KEY: z.string(),
});

export default RESEND;
