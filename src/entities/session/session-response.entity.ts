export const loginOpts = {
  type: 'object',
  properties: {
    id: { type: 'number' },
    role: { type: 'string' },
    email: { type: 'string' },
    last_name: { type: 'string' },
    first_name: { type: 'string' },
    created_at: { type: 'string' },
    updated_at: { type: 'string' },
    organization_id: { type: 'number' },
    organization_name: { type: 'string' },
  },
};

export const logoutOpts = {
  type: 'object',
  properties: {
    message: { type: 'string' },
  },
};
