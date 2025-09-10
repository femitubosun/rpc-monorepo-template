import { callAction } from '@template/action';
import { signJwt } from '@template/api-utils';
import type { AppContext, ContextUserSchema } from '@template/app-defs';
import AuthAction from '@template/auth-action-defs';

export async function createSessionForUser(
  user: ContextUserSchema,
  context: AppContext
) {
  const { data: existingSession } = await callAction(AuthAction.session.get, {
    context,
    input: { userId: user.id },
  });

  const sessionVersion = existingSession?.version ?? 1;

  const { data: newSession } = await callAction(AuthAction.session.create, {
    input: { user, version: sessionVersion },
    context,
  });

  return signJwt(newSession);
}
