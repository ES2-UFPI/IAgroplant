import React from "react";

import {

    View,

    Text,

    StyleSheet,

} from "react-native";

interface Props{

    result:any;

}

export default function DiagnosticResultCard({

    result,

}:Props){

    return(

        <View style={styles.card}>

            <Text style={styles.title}>

                Diagnóstico

            </Text>

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

        </View>

    );

}

const styles=StyleSheet.create({

card:{

marginTop:30,

padding:20,

backgroundColor:"#F5F5F5",

borderRadius:12,

},

title:{

fontSize:22,

fontWeight:"bold",

marginBottom:15,

},

});