export interface Client {
  userPoolId?: string;
  clientName?: string;
  clientId?: string;
  lastModifiedDate?: Date;
  creationDate?: Date;
  allowedOAuthScopes?: string[];
}
