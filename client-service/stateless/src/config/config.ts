const convict = require('convict');

export const config = convict({
  clientId: {
    doc: 'The client id',
    format: String,
    default: '',
    env: 'CLIENT_ID',
  },
  // note: storing the client secret here for the demo only
  clientSecret: {
    doc: 'The client secret',
    format: String,
    default: '',
    env: 'CLIENT_SECRET',
  },
  authUrl: {
    doc: 'The auth url for generating a token',
    format: String,
    default: '',
    env: 'AUTH_URL',
  },
  resourceServerUrl: {
    doc: 'The resource server that we want to place orders with',
    format: String,
    default: '',
    env: 'RESOURCE_SERVER_URL',
  },
  tableName: {
    doc: 'The database table where we store orders',
    format: String,
    default: 'tableName',
    env: 'TABLE_NAME',
  },
}).validate({ allowed: 'strict' });
