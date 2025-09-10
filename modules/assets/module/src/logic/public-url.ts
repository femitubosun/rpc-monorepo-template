import Env from '@template/env';

export const getPublicUrl = (bucketKey: string) =>
  `${Env.R2_BASE_URL}/${bucketKey}`;
