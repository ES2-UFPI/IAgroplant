import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';


//const API_URL = 'http://10.13.15.165:8000/api';


const api = axios.create({

  baseURL: API_URL,

  timeout: 5000,

});



// Interceptor to automatically add Bearer token

api.interceptors.request.use(

  async (config) => {

    try {

      const storedUser =
        await AsyncStorage.getItem('@iagroplant/auth-user');


      if (storedUser) {

        const parsed =
          JSON.parse(storedUser);


        if (parsed && parsed.id) {

          const token =
            await AsyncStorage.getItem('@iagroplant/auth-token')
            || 'mock-token';


          config.headers.Authorization =
            `Bearer ${token}`;

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


  } catch (error:any) {


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



  } catch (error:any) {


    console.warn(

      `POST ${url} failed.`,
      error.message

    );


    throw error;

  }

}




export default api;