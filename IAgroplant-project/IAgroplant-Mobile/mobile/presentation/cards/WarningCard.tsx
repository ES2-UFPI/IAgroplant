import React from "react";

import {

    Text,

    StyleSheet,

} from "react-native";

export default function WarningCard(){

    return(

        <Text style={styles.warning}>

            ⚠ Este diagnóstico é gerado por Inteligência Artificial e serve apenas como auxílio técnico.

            Consulte um profissional habilitado antes de realizar qualquer manejo.

        </Text>

    );

}

const styles=StyleSheet.create({

warning:{

marginTop:25,

fontSize:15,

color:"#B71C1C",

},

});