import { z } from 'zod';
import { makeDefinition } from '../utils';

const R2 = makeDefinition({
  R2_DEFAULT_APP_BUCKET: z.string(),
  R2_ACCESS_KEY_ID: z.string(),
  R2_ACCESS_KEY: z.string(),
  R2_ENDPOINT_URL: z.string().url(),
  R2_BASE_URL: z.string().url(),
});

export default R2;
