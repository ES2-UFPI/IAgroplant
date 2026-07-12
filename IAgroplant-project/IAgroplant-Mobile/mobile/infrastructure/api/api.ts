import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = "http://10.13.64.181:8000/api";

const api = axios.create({
    baseURL: API_URL,
    timeout: 15000,
});

api.interceptors.request.use(
    async (config) => {

        const token =
            await AsyncStorage.getItem(
                "@iagroplant/auth-token"
            );

        if (token) {

            config.headers.Authorization =
                `Bearer ${token}`;

        }

        console.log("======================");
        console.log(
            "REQUEST:",
            config.method?.toUpperCase(),
            (config.baseURL ?? "") + (config.url ?? "")
        );

        console.log(
            "Authorization:",
            config.headers.Authorization ?? "SEM TOKEN"
        );

        console.log("Headers:");
        console.log(config.headers);

        console.log("======================");

        return config;
    },

    (error) => Promise.reject(error)
);

export async function get(
    url: string,
    params?: any
) {

    try {

        const response =
            await api.get(
                url,
                {
                    params,
                }
            );

        return response.data;

    } catch (error: any) {

        console.log(error.response?.data);

        throw error;

    }

}

export async function post(
    url: string,
    data?: any
) {

    try {

        const response =
            await api.post(
                url,
                data,
                {
                    headers:
                        data instanceof FormData
                            ? {}
                            : {
                                  "Content-Type":
                                      "application/json",
                              },
                }
            );

        return response.data;

    } catch (error: any) {

        console.log("======================");
        console.log("POST ERROR");
        console.log("Status:", error.response?.status);
        console.log("Resposta:", error.response?.data);
        console.log("======================");

        throw error;

    }

}

export async function put(
    url: string,
    data?: any
) {

    const response =
        await api.put(url, data);

    return response.data;

}

export async function patch(
    url: string,
    data?: any
) {

    const response =
        await api.patch(url, data);

    return response.data;

}

export default api;

export async function del(
    url: string,
) {

    try {

        const response =
            await api.delete(url);

        return response.data;

    }

    catch (error: any) {

        console.log("======================");
        console.log("DELETE ERROR");
        console.log("Status:", error.response?.status);
        console.log("Resposta:", error.response?.data);
        console.log("======================");

        throw error;

    }

}