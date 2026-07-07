import React from "react";

import {

    TextInput,

    StyleSheet,

} from "react-native";

interface Props{

    value:string;

    placeholder:string;

    onChangeText:(text:string)=>void;

    multiline?:boolean;

}

export default function PrimaryInput({

    value,

    placeholder,

    onChangeText,

    multiline,

}:Props){

    return(

        <TextInput

            style={styles.input}

            value={value}

            placeholder={placeholder}

            multiline={multiline}

            onChangeText={onChangeText}

        />

    );

}

const styles=StyleSheet.create({

input:{

borderWidth:1,

borderColor:"#DDD",

padding:14,

borderRadius:10,

marginVertical:12,

backgroundColor:"#FFF",

},

});