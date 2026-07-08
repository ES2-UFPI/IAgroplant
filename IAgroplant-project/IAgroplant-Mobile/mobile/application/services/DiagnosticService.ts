import { post } from "../../infrastructure/api/api";


export async function diagnosePlant(

    formData: FormData

) {

    return await post(

        "/diagnostic/",

        formData,

    );

}