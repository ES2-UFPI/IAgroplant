import React, {
    useState,
} from "react";

import {
    View,
    Text,
    TextInput,
    Button,
    Image,
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Alert,
} from "react-native";

import {
    selectImage,
} from "../../infrastructure/api/image/ImagePickerService";

import DiagnosticFacade from "../../facade/DiagnosticFacade";

const addLog = (...args: any[]) => console.log(...args);

export default function DiagnosticScreen() {


    const facade =
        new DiagnosticFacade();


    const [image, setImage] =
        useState<any>(null);


    const [description, setDescription] =
        useState("");


    const [loading, setLoading] =
        useState(false);


    const [result, setResult] =
        useState<any>(null);


    const [debug, setDebug] =
        useState<string>("");


    function addLog(message:string){

        console.log(message);

        setDebug(
            old =>
            old + "\n" + message
        );

    }



    async function chooseImage(){


        /*addLog(
            "Selecionando imagem..."
        );*/


        try{


            const img =
                await selectImage();


            /*addLog(
                "Retorno do ImagePicker:"
            );*/


            console.log(img);


            if(img){


                /*addLog(
                    "Imagem recebida com sucesso"
                );*/


                setImage(img);


            }
            else{


                addLog(
                    "Nenhuma imagem selecionada"
                );


            }


        }
        catch(error:any){


            addLog(
                "Erro no ImagePicker:"
            );


            addLog(
                error.message
            );


        }


    }




    async function diagnose(){


        /*addLog(
            "========== INICIO DIAGNOSTICO =========="
        );*/



        if(!image){


            addLog(
                "ERRO: nenhuma imagem selecionada"
            );


            Alert.alert(
                "Aviso",
                "Selecione uma imagem primeiro."
            );


            return;

        }



        /*addLog(
            "Imagem encontrada"
        );*/


        /*addLog(
            JSON.stringify(
                image,
                null,
                2
            )
        );*/


        /*addLog(
            "Descrição:"
            +
            description
        );*/



        setLoading(true);



        try{


            /*addLog(
                "Chamando DiagnosticFacade..."
            );*/



            const response =
                await facade.diagnose(

                    image,

                    description,

                );



            /*addLog(
                "Resposta recebida do backend"
            );*/


            /*addLog(
                JSON.stringify(
                    response,
                    null,
                    2
                )
            );*/



            setResult(response);



        }
        catch(error:any){



            addLog(
                "========== ERRO =========="
            );



            addLog(
                error.message
                ??
                "Erro desconhecido"
            );



            if(error.response){


                addLog(
                    "Status HTTP:"
                    +
                    error.response.status
                );


                addLog(
                    JSON.stringify(
                        error.response.data,
                        null,
                        2
                    )
                );


            }



            Alert.alert(
                "Erro",
                "Falha ao realizar diagnóstico."
            );



        }
        finally{


            addLog(
                "Finalizando requisição"
            );


            setLoading(false);


        }


    }




    return (

        <ScrollView

            contentContainerStyle={
                styles.container
            }

        >


            <Text style={styles.title}>

                Diagnóstico IA

            </Text>



            <Button

                title="Selecionar Imagem"

                onPress={chooseImage}

            />



            {
                image &&


                <Image

                    source={{
                        uri:image.uri
                    }}

                    style={styles.image}

                />

            }



            <TextInput

                style={styles.input}

                placeholder="Descrição da planta"

                value={description}

                onChangeText={setDescription}

                multiline

            />



            <Button

                title="Diagnosticar"

                onPress={diagnose}

            />



            {
                loading &&

                <ActivityIndicator

                    size="large"

                    style={{
                        marginTop:20
                    }}

                />

            }



            {
                result &&


                <View style={styles.card}>


                    <Text>
                        Patógeno:
                    </Text>


                    <Text>
                        {result.pathogen}
                    </Text>



                    <Text>
                        Severidade:
                    </Text>


                    <Text>
                        {result.severity}
                    </Text>



                    <Text>
                        Manejo:
                    </Text>


                    <Text>
                        {result.management}
                    </Text>



                    <Text style={styles.warning}>
                        {result.technical_warning}
                    </Text>


                </View>

            }


            
            {/*<View style={styles.debug}>


                <Text style={styles.debugTitle}>
                    LOG:
                </Text>


                <Text>
                    {debug}
                </Text>


            </View>}*/}



        </ScrollView>

    );

}



const styles =
StyleSheet.create({

    container:{

        padding:20,

    },


    title:{

        fontSize:28,

        fontWeight:"bold",

        marginBottom:20,

    },


    image:{

        width:"100%",

        height:250,

        marginVertical:20,

        borderRadius:12,

    },


    input:{

        borderWidth:1,

        borderColor:"#ccc",

        padding:10,

        marginVertical:20,

        borderRadius:10,

        minHeight:120,

    },


    card:{

        marginTop:30,

        padding:20,

        backgroundColor:"#F5F5F5",

        borderRadius:12,

    },


    warning:{

        marginTop:20,

        color:"red",

        fontWeight:"bold",

    },


    debug:{

        marginTop:30,

        padding:10,

        backgroundColor:"#eeeeee",

    },


    debugTitle:{

        fontWeight:"bold",

    },


});