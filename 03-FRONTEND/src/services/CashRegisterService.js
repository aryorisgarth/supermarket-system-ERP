import api from './api';

const CashRegisterService = {
  getCurrentSession: async () => {
    try {
      const response = await api.get('/cash-registers/current');
      return response.status === 204 ? null : response.data;
    } catch (error) {
      return null;
    }
  },

  openSession: async (openingBalance) => {
    const response = await api.post('/cash-registers/open', { openingBalance });
    return response.data;
  },

  closeSession: async (actualClosingBalance, notes) => {
    const response = await api.post('/cash-registers/close', { actualClosingBalance, notes });
    return response.data;
  },

  closeSessionDetailed: async ({ actualClosingBalance, countedCard = 0, countedTransfer = 0, notes = '' }) => {
    const response = await api.post('/cash-registers/close', {
      actualClosingBalance,
      countedCard,
      countedTransfer,
      notes,
    });
    return response.data;
  },

  getCurrentSummary: async () => {
    const response = await api.get('/cash-registers/current/summary');
    return response.data;
  },

  createMovement: async ({ type, amount, reason }) => {
    const response = await api.post('/cash-registers/movements', { type, amount, reason });
    return response.data;
  },

  getActiveSessions: async () => {
    const response = await api.get('/cash-registers/sessions/active');
    return response.data;
  },

  searchSessions: async (params = {}) => {
    const response = await api.get('/cash-registers/sessions', { params });
    return response.data;
  },

  getSessionById: async (id) => {
    const response = await api.get(`/cash-registers/sessions/${id}`);
    return response.data;
  },

  getSessionSummary: async (id) => {
    const response = await api.get(`/cash-registers/sessions/${id}/summary`);
    return response.data;
  },

  getReport: async (params = {}) => {
    const response = await api.get('/cash-registers/report', { params });
    return response.data;
  },
};

export default CashRegisterService;
