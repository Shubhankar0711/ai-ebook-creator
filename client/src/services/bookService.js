import api from "./api";

export const bookService = {
  getBooks: (params) => api.get("/books", { params }),
  getBook: (id) => api.get(`/books/${id}`),
  createBook: (data) => api.post("/books", data),
  updateBook: (id, data) => api.put(`/books/${id}`, data),
  deleteBook: (id) => api.delete(`/books/${id}`),
  duplicateBook: (id) => api.post(`/books/${id}/duplicate`),
  toggleFavorite: (id) => api.put(`/books/${id}/favorite`),
  generateShareLink: (id) => api.post(`/books/${id}/share`),
  getSharedBook: (token) => api.get(`/books/share/${token}`),
};

export const chapterService = {
  getChapters: (bookId) => api.get(`/chapters/book/${bookId}`),
  createChapter: (data) => api.post("/chapters", data),
  updateChapter: (id, data) => api.put(`/chapters/${id}`, data),
  deleteChapter: (id) => api.delete(`/chapters/${id}`),
  reorderChapters: (data) => api.put("/chapters/reorder", data),
};

export const aiService = {
  generateDescription: (data) => api.post("/ai/generate-description", data),
  generateOutline: (data) => api.post("/ai/generate-outline", data),
  generateChapter: (data) => api.post("/ai/generate-chapter", data),
  rewrite: (data) => api.post("/ai/rewrite", data),
  expand: (data) => api.post("/ai/expand", data),
  summarize: (data) => api.post("/ai/summarize", data),
  improveGrammar: (data) => api.post("/ai/improve-grammar", data),
  continueWriting: (data) => api.post("/ai/continue", data),
  generateTitles: (data) => api.post("/ai/generate-titles", data),
  generateCoverPrompt: (data) => api.post("/ai/generate-cover-prompt", data),
};

export const exportService = {
  exportPDF: (bookId, data) =>
    api.post(`/export/pdf/${bookId}`, data || {}, { responseType: "blob" }),
  exportTXT: (bookId) =>
    api.get(`/export/txt/${bookId}`, { responseType: "blob" }),
  exportDOCX: (bookId) =>
    api.post(`/export/docx/${bookId}`, {}, { responseType: "blob" }),
};

export const userService = {
  getAnalytics: () => api.get("/users/analytics"),
  getFavoriteBooks: () => api.get("/users/favorites"),
  updateProfile: (data) => api.put("/auth/profile", data),
  changePassword: (data) => api.put("/auth/change-password", data),
  downgradePlan: () => api.post("/payments/cancel"),
};
