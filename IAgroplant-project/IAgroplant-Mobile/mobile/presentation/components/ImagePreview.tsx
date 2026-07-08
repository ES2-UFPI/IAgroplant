import React from "react";

import {

    Image,

    StyleSheet,

} from "react-native";

interface Props{

    uri:string;

}

export default function ImagePreview({

    uri,

}:Props){

    return(

        <Image

            source={{uri}}

            style={styles.image}

        />

    );

}

const styles=StyleSheet.create({

image:{

width:"100%",

height:250,

borderRadius:12,

marginVertical:20,

},

});