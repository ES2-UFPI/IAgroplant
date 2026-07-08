import React from "react";

import {

    ActivityIndicator,

    View,

    StyleSheet,

} from "react-native";

export default function LoadingOverlay(){

    return(

        <View

            style={styles.container}

        >

            <ActivityIndicator

                size="large"

                color="#2E7D32"

            />

        </View>

    );

}

const styles=StyleSheet.create({

container:{

marginTop:30,

},

});