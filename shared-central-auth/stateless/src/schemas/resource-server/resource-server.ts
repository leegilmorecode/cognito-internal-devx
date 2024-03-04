export const schema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  type: 'object',
  properties: {
    identifier: {
      type: 'string',
    },
    userPoolId: {
      type: 'string',
    },
    name: {
      type: 'string',
    },
    scopes: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          scopeName: {
            type: 'string',
          },
          scopeDescription: {
            type: 'string',
          },
        },
        required: ['scopeName', 'scopeDescription'],
      },
    },
  },
  required: ['identifier', 'userPoolId', 'name', 'scopes'],
};
