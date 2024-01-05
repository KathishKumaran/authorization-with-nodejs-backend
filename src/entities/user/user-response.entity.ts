export const detailUserOpts = {
  type: 'object',
  properties: {
    id: { type: 'number' },
    first_name: { type: 'string' },
    last_name: { type: 'string' },
    email: { type: 'string' },
    role: { type: 'string' },
    created_at: { type: 'string' },
    updated_at: { type: 'string' }
  }
};

export const createUserOpts = {
  type: 'object',
  properties: {
    id: { type: 'number' },
    first_name: { type: 'string' },
    last_name: { type: 'string' },
    email: { type: 'string' },
    role_id: { type: 'number' },
    created_at: { type: 'string' },
    updated_at: { type: 'string' }
  }
};
