import { AuthResponseSchema } from '@template/auth-defs';
import { Route } from '@template/router';
import z from 'zod';

export const code = {
  use: Route.post('/auth/code/use')
    .jsonBody(
      z.object({
        email: z.string(),
        otp: z.string(),
      })
    )
    .tags(['Auth'])
    .jsonResponse(200, 'Auth Success', AuthResponseSchema)
    .build(),
};
