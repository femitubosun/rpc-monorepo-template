import Env from '@template/env';
import type { IGithub } from './__defs__';
import { GithubNoop } from './github.noop';
import { Github } from './github.service';

export const github: IGithub = [
  'development',
  'testing',
].includes(Env.NODE_ENV)
  ? new GithubNoop()
  : new Github();
