import { post } from "../../infrastructure/api/api";



export async function diagnosePlant(

    formData:FormData

){


    console.log(
        "Enviando FormData para API..."
    );


    return await post(

        "/diagnostic/",

        formData

    );


}