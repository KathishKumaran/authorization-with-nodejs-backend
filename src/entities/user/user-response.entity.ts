export const detailUserOpts = {
  type: 'object',
  properties: {
    id: { type: 'number' },
    first_name: { type: 'string' },
    last_name: { type: 'string' },
    email: { type: 'string' },
    role: { type: 'string' },
    created_at: { type: 'string' },
    updated_at: { type: 'string' },
  },
};

export const listAndPaginationUserOpts = {
  type: 'object',
  properties: {
    pagination: {
      type: 'object',
      properties: {
        end_at: { type: 'number' },
        start_at: { type: 'number' },
        per_page: { type: 'number' },
        next_page: { type: 'number' },
        prev_page: { type: 'number' },
        total_pages: { type: 'number' },
        total_count: { type: 'number' },
        current_page: { type: 'number' },
        is_last_page: { type: 'boolean' },
        is_first_page: { type: 'boolean' },
      },
    },
  },
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
    updated_at: { type: 'string' },
  },
};
