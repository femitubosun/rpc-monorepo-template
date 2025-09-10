import { A, G } from '@template/action';
import {
  CreateAssetInput,
  CreateAssetOutput,
  FullAssetOutput,
} from '@template/assets-defs';
import z from 'zod';

const AssetsActions = G({
  create: A('assets.create').input(CreateAssetInput).output(CreateAssetOutput),
  verify: A('assets.verify')
    .input(
      z.object({
        id: z.string(),
      })
    )
    .output(FullAssetOutput),

  process: A('assets.process')
    .input(
      z.object({
        id: z.string(),
      })
    )
    .output(
      z.object({
        ok: z.boolean(),
      })
    ),
});

export default AssetsActions;
