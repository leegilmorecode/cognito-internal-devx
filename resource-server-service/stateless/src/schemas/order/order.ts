export const schema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  type: 'object',
  properties: {
    id: {
      type: 'string',
    },
    created: {
      type: 'string',
    },
    customer: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        email: { type: 'string', format: 'email' },
        phone: { type: 'string', pattern: '^\\+?[0-9]+$' },
        address: { type: 'string' },
      },
      required: ['name', 'email', 'phone', 'address'],
    },
    items: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          itemId: { type: 'string' },
          name: { type: 'string' },
          quantity: { type: 'integer', minimum: 1 },
          price: { type: 'number', minimum: 0 },
        },
        required: ['itemId', 'name', 'quantity', 'price'],
      },
    },
    total: { type: 'number', minimum: 0 },
    paymentMethod: { type: 'string' },
    paymentStatus: { type: 'string' },
    orderStatus: { type: 'string' },
    timestamp: { type: 'string', format: 'date-time' },
  },
  required: [
    'id',
    'customer',
    'items',
    'total',
    'paymentMethod',
    'paymentStatus',
    'orderStatus',
    'timestamp',
  ],
};
