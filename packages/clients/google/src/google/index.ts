import Env from '@template/env';
import { GoogleNoop } from './google.noop';
import { Google } from './google.service';

export const google = ['development', 'testing'].includes(Env.NODE_ENV)
  ? new GoogleNoop()
  : new Google();
