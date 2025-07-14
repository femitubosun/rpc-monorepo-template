import { z } from 'zod';
import { makeDefinition } from '../utils';

const R2 = makeDefinition({
  R2_ACCOUNT_ID: z.string(),
  R2_ACCESS_KEY_ID: z.string(),
  R2_SECRET_ACCESS_KEY: z.string(),
});

export default R2;
