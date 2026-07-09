import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Em emulador/simulador local, localhost (iOS) ou 10.0.2.2 (Android) funcionam.
// Em um dispositivo físico via Expo Go, é preciso o IP de LAN da máquina que
// roda o backend — defina EXPO_PUBLIC_API_URL em um .env.local para isso.
//const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8000/api';
const API_URL = 'http://192.168.0.110:8000/api';

const api = axios.create({


  baseURL: API_URL,

  timeout: 15000,

});


api.interceptors.request.use(

  (config) => {


    console.log("=================");
    console.log(
      "REQUEST:",
      config.method,
      (config.baseURL ?? '') + (config.url ?? '')
    );


    console.log(
      "HEADERS:",
      config.headers
    );


    console.log("=================");



    return config;


  }

);

// Interceptor to automatically add Bearer token
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('@iagroplant/auth-token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        // Fallback para mock local se não houver token real salvo ainda
        const storedUser = await AsyncStorage.getItem('@iagroplant/auth-user');
        if (storedUser) {
          config.headers.Authorization = 'Bearer mock-token';
        }
      }
    } catch (error: any) {
      console.log("========== AXIOS ERROR ==========");
      console.log("message:", error.message);
      console.log("code:", error.code);
      console.log("response:", error.response?.data);
      console.log("status:", error.response?.status);
      console.log("request:", error.request);
      console.log(error);
      throw error;
    }
    return config;
  },


  (error) => {

    return Promise.reject(error);

  }

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


    console.warn(

      `GET ${url} failed.`,
      error.message

    );


    throw error;

  }

}






export async function post(

  url: string,

  data?: any

) {

  try {


    const isFormData =
      data instanceof FormData;



    const response =
      await api.post(

        url,

        data,

        {

          headers:

            isFormData

              ?

              {

                // Axios define automaticamente multipart boundary

              }

              :

              {

                'Content-Type':
                  'application/json',

              },

        }

      );



    return response.data;



  } catch (error: any) {


    console.warn(

      `POST ${url} failed.`,
      error.message

    );


    throw error;

  }

}

export async function put(url: string, data?: any) {
  try {
    const response = await api.put(url, data);
    return response.data;
  } catch (error: any) {
    console.warn(`PUT ${url} failed, using local fallback.`, error.message);
    throw error;
  }
}

export async function patch(url: string, data?: any) {
  try {
    const response = await api.patch(url, data);
    return response.data;
  } catch (error: any) {
    console.warn(`PATCH ${url} failed, using local fallback.`, error.message);
    throw error;
  }
}


export async function uploadFile(url: string, fileUri: string, fieldName: string) {
  try {
    const filename = fileUri.split('/').pop() ?? `${fieldName}.jpg`;
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';

    const formData = new FormData();
    formData.append(fieldName, { uri: fileUri, name: filename, type } as any);

    const response = await api.post(url, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  } catch (error: any) {
    console.warn(`UPLOAD ${url} failed, using local fallback.`, error.message);
    throw error;
  }
}

export default api;
