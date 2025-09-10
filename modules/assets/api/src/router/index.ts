import {
  CreateAssetInput,
  CreateAssetOutput,
  FullAssetOutput,
} from '@template/assets-defs';
import { Route } from '@template/router';
import z from 'zod';

export const _router = {
  create: Route.post('assets')
    .jsonBody(CreateAssetInput)
    .jsonResponse(201, 'Success', CreateAssetOutput)
    .build(),

  verify: Route.get('assets/{id}/verify')
    .params(
      z.object({
        id: z.string(),
      })
    )
    .jsonResponse(200, 'Success', FullAssetOutput)
    .build(),
} as const;

export default _router;
