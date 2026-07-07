import { diagnosePlant } from "../application/services/DiagnosticService";

export default class DiagnosticFacade {

    async diagnose(

        image: any,

        description: string,

    ) {

        console.log("========== FACADE ==========");
        console.log("Imagem recebida:");
        console.log(image);

        const formData = new FormData();

        formData.append(

            "image",

            {

                uri: image.uri,

                type: image.mimeType ?? image.type ?? "image/jpeg",

                name: image.fileName ?? "plant-image.jpg",

            } as any

        );

        formData.append(

            "description",

            description,

        );

        console.log("Enviando FormData para API...");

        return await diagnosePlant(

            formData,

        );

    }

}