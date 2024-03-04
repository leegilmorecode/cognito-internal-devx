const convict = require('convict');

export const config = convict({
  tableName: {
    doc: 'The database table where we store orders',
    format: String,
    default: 'tableName',
    env: 'TABLE_NAME',
  },
  userPoolId: {
    doc: 'The user pool id',
    format: String,
    default: '',
    env: 'USERPOOL_ID',
  },
  scopes: {
    doc: 'The scopes for this client',
    format: String,
    default: 'lj-health-food/place-order',
  },
  clientId: {
    doc: 'The valid clientIds',
    format: String,
    default: 'your-client-id',
  },
}).validate({ allowed: 'strict' });
