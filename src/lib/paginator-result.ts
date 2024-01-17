export interface PaginatorType {
  data: any[];
  total: number;
  per_page: number;
  last_page: number;
  current_page: number;
}

export interface PaginateType {
  count: number;
  rows: any[];
}

const paginatorResult = (paginator: PaginatorType, type: string) => {
  const totalPages = paginator.last_page;
  const currentPage = paginator.current_page;
  const perPage = paginator.per_page;
  const { total } = paginator;
  const startAt = (currentPage - 1) * perPage + 1;
  const end = currentPage * perPage;
  const endAt = total < end ? total : end;
  const result = {
    [type]: paginator.data,
    pagination: {
      end_at: endAt,
      start_at: startAt,
      per_page: perPage,
      next_page: currentPage >= totalPages ? null : currentPage + 1,
      prev_page: currentPage === 1 ? null : currentPage - 1,
      total_pages: totalPages,
      total_count: total,
      current_page: currentPage,
      is_last_page: currentPage >= totalPages,
      is_first_page: currentPage === 1,
    },
  };
  return result;
};

const paginate = (data: any, perPage: number, page: number) => {
  const limit = perPage;
  const total = data.count;
  const result = {
    data: data.rows,
    total,
    per_page: limit,
    last_page: Math.ceil(total / perPage),
    current_page: page,
  };
  return result;
};

export { paginatorResult, paginate };
