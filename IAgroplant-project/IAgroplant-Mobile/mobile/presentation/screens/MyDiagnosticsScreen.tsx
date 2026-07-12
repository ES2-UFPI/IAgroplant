import React, {
    useCallback,
    useState,
} from "react";

import {
    View,
    Text,
    FlatList,
    Button,
    Alert,
    StyleSheet,
    ActivityIndicator,
} from "react-native";

import {
    useFocusEffect,
} from "@react-navigation/native";

import DiagnosticHistoryFacade
    from "../../facade/DiagnosticHistoryFacade";

import {
    DiagnosticRecord,
} from "../../domain/entities/diagnostic-history.entity";


export default function MyDiagnosticsScreen() {


    const facade =
        new DiagnosticHistoryFacade();



    const [loading, setLoading] =
        useState(true);



    const [records, setRecords] =
        useState<DiagnosticRecord[]>([]);




    async function loadDiagnostics() {


        setLoading(true);


        try {


            const data =
                await facade.getMine();


            setRecords(data);


        }

        catch(error:any){


            console.log(
                "Erro ao carregar diagnósticos:",
                error.message
            );


            Alert.alert(
                "Erro",
                "Não foi possível carregar os diagnósticos."
            );


        }

        finally {


            setLoading(false);


        }


    }





    useFocusEffect(


        useCallback(() => {


            loadDiagnostics();


        }, [])


    );





    function remove(id:string){


        Alert.alert(


            "Excluir diagnóstico",


            "Deseja realmente excluir este diagnóstico?",


            [


                {

                    text:"Cancelar",

                    style:"cancel",

                },



                {


                    text:"Excluir",


                    style:"destructive",


                    onPress: async()=>{


                        try {


                            await facade.delete(id);


                            await loadDiagnostics();



                        }


                        catch(error:any){


                            console.log(
                                error
                            );


                            Alert.alert(

                                "Erro",

                                "Não foi possível excluir o diagnóstico."

                            );


                        }


                    }


                }


            ]

        );


    }





    if(loading){


        return (

            <View style={styles.center}>


                <ActivityIndicator

                    size="large"

                />


                <Text>

                    Carregando diagnósticos...

                </Text>


            </View>

        );


    }







    return (


        <FlatList


            data={records}


            keyExtractor={
                item=>item.id
            }



            contentContainerStyle={

                records.length === 0

                ?

                styles.emptyContainer

                :

                undefined

            }



            ListEmptyComponent={


                <View style={styles.center}>


                    <Text style={styles.emptyText}>

                        Nenhum diagnóstico encontrado.

                    </Text>


                </View>


            }



            renderItem={({item})=>(



                <View style={styles.card}>


                    <Text style={styles.title}>


                        🦠 {item.pathogen}


                    </Text>





                    <Text style={styles.label}>


                        Severidade


                    </Text>



                    <Text style={styles.value}>


                        {item.severity}


                    </Text>





                    <Text style={styles.label}>


                        Manejo


                    </Text>



                    <Text style={styles.value}>


                        {item.management}


                    </Text>





                    <Text style={styles.label}>


                        Aviso técnico


                    </Text>



                    <Text style={styles.warning}>


                        {item.technical_warning}


                    </Text>





                    <Text style={styles.label}>


                        Status


                    </Text>



                    <Text>


                        {item.confirmed

                        ?

                        "✅ Confirmado"

                        :

                        "⏳ Aguardando confirmação"

                        }


                    </Text>





                    <Text style={styles.date}>


                        📅

                        {" "}

                        {

                            new Date(

                                item.created_at

                            ).toLocaleString()

                        }


                    </Text>





                    <View

                        style={styles.buttonContainer}

                    >


                        <Button


                            title="Excluir"


                            color="red"


                            onPress={

                                ()=>remove(item.id)

                            }


                        />


                    </View>



                </View>


            )}



        />


    );


}





const styles = StyleSheet.create({


    center:{


        flex:1,


        justifyContent:"center",


        alignItems:"center",


    },



    emptyContainer:{


        flex:1,


    },



    emptyText:{


        fontSize:16,


        color:"#666",


    },



    card:{


        margin:12,


        padding:18,


        borderRadius:15,


        backgroundColor:"#F5F5F5",


        elevation:3,


    },



    title:{


        fontSize:20,


        fontWeight:"bold",


        marginBottom:15,


    },



    label:{


        marginTop:10,


        fontWeight:"bold",


        color:"#555",


    },



    value:{


        marginTop:4,


        lineHeight:20,


    },



    warning:{


        color:"red",


        marginTop:4,


    },



    date:{


        marginTop:15,


        color:"#666",


    },



    buttonContainer:{


        marginTop:15,


    },


});