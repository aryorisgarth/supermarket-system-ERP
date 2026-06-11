
export const unwrapPageContent = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.content)) return data.content;
  return [];
};


export const fetchAllOptions = async (requestFn, size = 500, sort = 'name,asc') => {
  const data = await requestFn({ page: 0, size, sort });
  return unwrapPageContent(data);
};
