import { useState } from "react";

import DiagnosticFacade
from "../../facade/DiagnosticFacade";

export function useDiagnosticViewModel(){

    const facade =
        new DiagnosticFacade();

    const [loading,setLoading]=
        useState(false);

    const [result,setResult]=
        useState(null);

    async function diagnose(

        image:string,

        description:string,

    ){

        setLoading(true);

        try{

            const response =
                await facade.diagnose(
                    image,
                    description,
                );

            setResult(response);

        }finally{

            setLoading(false);

        }

    }

    return{

        loading,

        result,

        diagnose,

    };

}