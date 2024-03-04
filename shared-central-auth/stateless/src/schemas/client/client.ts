export const schema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  type: 'object',
  properties: {
    userPoolId: {
      type: 'string',
    },
    clientId: {
      type: 'string',
    },
    clientName: {
      type: 'string',
    },
    clientSecret: {
      type: 'string',
    },
  },
  required: ['userPoolId', 'clientId', 'clientName'],
};
