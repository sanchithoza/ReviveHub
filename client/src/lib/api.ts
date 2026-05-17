import axios from "axios";

const httpClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api",
  headers: { "Content-Type": "application/json" },
});

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
