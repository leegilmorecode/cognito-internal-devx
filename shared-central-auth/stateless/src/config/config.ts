const convict = require('convict');

export const config = convict({
  userPoolId: {
    doc: 'The ID of the shared auth user pool',
    format: String,
    default: '',
    env: 'USER_POOL_ID',
  },
}).validate({ allowed: 'strict' });
