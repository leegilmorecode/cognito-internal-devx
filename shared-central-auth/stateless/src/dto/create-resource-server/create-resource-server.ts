import { ScopeType } from '@dto/scope-type';

export type CreateResourceServer = {
  identifier: string;
  name: string;
  scopes: ScopeType[];
};
