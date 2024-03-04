import { ScopeType } from '@dto/scope-type';

export type ResourceServer = {
  userPoolId?: string;
  identifier?: string;
  name?: string;
  scopes?: ScopeType[];
};
