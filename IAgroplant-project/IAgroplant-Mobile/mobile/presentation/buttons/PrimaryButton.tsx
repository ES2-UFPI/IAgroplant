import React from "react";

import {

    TouchableOpacity,

    Text,

    StyleSheet,

} from "react-native";

interface Props{

    title:string;

    onPress:()=>void;

}

export default function PrimaryButton({

    title,

    onPress,

}:Props){

    return(

        <TouchableOpacity

            style={styles.button}

            onPress={onPress}

        >

            <Text style={styles.text}>

                {title}

            </Text>

        </TouchableOpacity>

    );

}

const styles=StyleSheet.create({

button:{

backgroundColor:"#2E7D32",

padding:16,

borderRadius:12,

alignItems:"center",

marginVertical:10,

},

text:{

color:"#FFF",

fontWeight:"bold",

fontSize:18,

},

});