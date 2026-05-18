import axios from "axios";

export const httpClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api",
  headers: { "Content-Type": "application/json" },
});

let viewOnlyErrorHandler: ((message: string) => void) | null = null;

export function registerViewOnlyErrorHandler(handler: (message: string) => void): void {
  viewOnlyErrorHandler = handler;
}

export function unregisterViewOnlyErrorHandler(): void {
  viewOnlyErrorHandler = null;
}

httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      const currentAuthHeader = httpClient.defaults.headers.common["Authorization"];
      if (currentAuthHeader) {
        localStorage.removeItem("auth_token");
        delete httpClient.defaults.headers.common["Authorization"];
        window.location.href = "/login";
      }
    }
    if (error.response?.status === 403 && error.response?.data?.error === "Forbidden: account is view-only") {
      if (viewOnlyErrorHandler) {
        viewOnlyErrorHandler(error.response.data.error);
      }
    }
    return Promise.reject(error);
  }
);

export const api = {
  companies: {
    list: () => httpClient.get("/companies").then((response) => response.data),
    get: (id: number) => httpClient.get(`/companies/${id}`).then((response) => response.data),
    create: (data: any) => httpClient.post("/companies", data).then((response) => response.data),
    update: (id: number, data: any) => httpClient.put(`/companies/${id}`, data).then((response) => response.data),
    delete: (id: number) => httpClient.delete(`/companies/${id}`).then((response) => response.data),
  },
  customers: {
    list: () => httpClient.get("/customers").then((response) => response.data),
    get: (id: number) => httpClient.get(`/customers/${id}`).then((response) => response.data),
    create: (data: any) => httpClient.post("/customers", data).then((response) => response.data),
    update: (id: number, data: any) => httpClient.put(`/customers/${id}`, data).then((response) => response.data),
    delete: (id: number) => httpClient.delete(`/customers/${id}`).then((response) => response.data),
  },
  products: {
    list: () => httpClient.get("/products").then((response) => response.data),
    get: (id: number) => httpClient.get(`/products/${id}`).then((response) => response.data),
    create: (data: any) => httpClient.post("/products", data).then((response) => response.data),
    update: (id: number, data: any) => httpClient.put(`/products/${id}`, data).then((response) => response.data),
    delete: (id: number) => httpClient.delete(`/products/${id}`).then((response) => response.data),
  },
  auth: {
    login: (username: string, password: string) => httpClient.post("/auth/login", { username, password }).then((response) => response.data),
    me: () => httpClient.get("/auth/me").then((response) => response.data),
    register: (data: any) => httpClient.post("/auth/register", data).then((response) => response.data),
    listUsers: () => httpClient.get("/auth/users").then((response) => response.data),
    updateUser: (id: number, data: any) => httpClient.put(`/auth/users/${id}`, data).then((response) => response.data),
    deleteUser: (id: number) => httpClient.delete(`/auth/users/${id}`).then((response) => response.data),
  },
  returns: {
    list: () => httpClient.get("/returns").then((response) => response.data),
    get: (id: number) => httpClient.get(`/returns/${id}`).then((response) => response.data),
    create: (data: any) => httpClient.post("/returns", data).then((response) => response.data),
    sendToCompany: (id: number) => httpClient.patch(`/returns/${id}/send-to-company`).then((response) => response.data),
    receiveFromCompany: (id: number, data?: { new_serial_number?: string }) =>
      httpClient.patch(`/returns/${id}/receive-from-company`, data ? data : {}).then((response) => response.data),
    complete: (id: number) => httpClient.patch(`/returns/${id}/complete`).then((response) => response.data),
  },
};
