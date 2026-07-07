import { diagnosePlant } from "../application/services/DiagnosticService";


export default class DiagnosticFacade {


    async diagnose(

        image: any,

        description: string,

    ) {


        const formData = new FormData();


        formData.append(

            "image",

            {
                uri: image.uri,

                type:
                    image.mimeType ?? "image/jpeg",

                name:
                    "plant-image.jpg",

            } as any

        );


            formData.append(
                "description",
                description,
            );


        return await diagnosePlant(

            formData,

        );


    }


}