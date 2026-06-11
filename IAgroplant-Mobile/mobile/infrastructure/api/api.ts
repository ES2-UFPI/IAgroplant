import axios from "axios";

export const api = axios.create({
  baseURL: "http://10.13.65.194:8000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

export async function post(
  url: string,
  data: any
) {
  const response = await api.post(
    url,
    data
  );

  return response.data;
}