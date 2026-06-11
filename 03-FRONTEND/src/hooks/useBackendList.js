import { useState, useEffect, useCallback } from 'react';


export function useBackendList({
  loadPage,
  filterDeps = [],
  buildParams,
  debounceMs = 350,
  initialPageSize = 10,
  sort = 'name,asc',
}) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(initialPageSize);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm.trim()), debounceMs);
    return () => clearTimeout(timer);
  }, [searchTerm, debounceMs]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, itemsPerPage, ...filterDeps]);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage - 1,
        size: itemsPerPage,
        sort,
        ...(buildParams ? buildParams() : {}),
      };
      if (debouncedSearch) params.q = debouncedSearch;

      const res = await loadPage(params);
      setItems(Array.isArray(res?.content) ? res.content : []);
      setTotalItems(res?.totalElements ?? 0);
      setTotalPages(res?.totalPages ?? 0);
    } catch (error) {
      setItems([]);
      setTotalItems(0);
      setTotalPages(0);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, debouncedSearch, loadPage, buildParams, sort]);

  useEffect(() => {
    reload().catch(() => {});
  }, [reload]);

  const indexOfFirstItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage;
  const indexOfLastItem = Math.min(currentPage * itemsPerPage, totalItems);

  const handlePageChange = (page) => setCurrentPage(page);

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(parseInt(e.target.value, 10));
    setCurrentPage(1);
  };

  return {
    items,
    setItems,
    loading,
    searchTerm,
    setSearchTerm,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    totalItems,
    totalPages,
    reload,
    indexOfFirstItem,
    indexOfLastItem,
    handlePageChange,
    handleItemsPerPageChange,
  };
}

export default useBackendList;
