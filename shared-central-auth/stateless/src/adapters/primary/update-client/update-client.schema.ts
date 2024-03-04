export const schema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  type: 'object',
  properties: {
    clientId: {
      type: 'string',
    },
    scopes: {
      type: 'array',
      items: {
        type: 'string',
      },
      minItems: 1,
    },
  },
  required: ['clientId', 'scopes'],
};
