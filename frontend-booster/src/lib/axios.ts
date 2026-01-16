import axios from "axios";

/**
 * Instância do Axios configurada para a API
 */
export const api = axios.create({
  baseURL: "http://localhost:3000",
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Interceptor para adicionar o token JWT em todas as requisições
 */
api.interceptors.request.use(
  (config) => {
    // Pegar o token do localStorage
    const token = localStorage.getItem("access_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

/**
 * Interceptor para tratar erros de autenticação
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Se receber 401 (não autorizado), redirecionar para login
    if (error.response?.status === 401) {
      localStorage.removeItem("access_token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }

    return Promise.reject(error);
  },
);
