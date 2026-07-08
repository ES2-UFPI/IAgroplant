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
} from "react-native";

import {
    selectImage,
} from "../../infrastructure/api/image/ImagePickerService";

import DiagnosticFacade from "../../facade/DiagnosticFacade";

export default function DiagnosticScreen() {

    const facade =
        new DiagnosticFacade();

    const [
        image,
        setImage,
    ] = useState<any>(null);

    const [
        description,
        setDescription,
    ] = useState("");

    const [
        loading,
        setLoading,
    ] = useState(false);

    const [
        result,
        setResult,
    ] = useState<any>(null);

    async function chooseImage() {

        const img =
            await selectImage();

        if (img) {

            console.log("========== IMAGEM SELECIONADA ==========");
            console.log(img);

            setImage(img);

        }

    }

    async function diagnose() {

    if (!image) {

        alert("Selecione uma imagem.");

        return;

    }

    console.log("========== DIAGNÓSTICO ==========");
    console.log("Imagem:");
    console.log(image);

    console.log("Descrição:");
    console.log(description);

    setLoading(true);

    try {

        const response =
            await facade.diagnose(
                image,
                description,
            );

        console.log("========== RESPOSTA ==========");
        console.log(response);

        setResult(response);

    }
    catch (error) {

        console.log("========== ERRO ==========");
        console.log(error);

        alert("Erro ao realizar o diagnóstico.");

    }
    finally {

        setLoading(false);

    }

}
    return (

        <ScrollView

            contentContainerStyle={styles.container}

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

                        uri: image.uri,

                    }}

                    style={styles.image}

                />

            }

            <TextInput

                style={styles.input}

                placeholder="Descrição"

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

                        marginTop: 30,

                    }}

                />

            }

            {

                result &&

                <View

                    style={styles.card}

                >

                    <Text>

                        Patógeno

                    </Text>

                    <Text>

                        {result.pathogen}

                    </Text>

                    <Text>

                        Severidade

                    </Text>

                    <Text>

                        {result.severity}

                    </Text>

                    <Text>

                        Manejo

                    </Text>

                    <Text>

                        {result.management}

                    </Text>

                    <Text

                        style={styles.warning}

                    >

                        {result.technical_warning}

                    </Text>

                </View>

            }

        </ScrollView>

    );

}

const styles =

StyleSheet.create({

    container: {

        padding: 20,

    },

    title: {

        fontSize: 28,

        fontWeight: "bold",

        marginBottom: 20,

    },

    image: {

        width: "100%",

        height: 250,

        marginVertical: 20,

        borderRadius: 12,

    },

    input: {

        borderWidth: 1,

        borderColor: "#ccc",

        padding: 10,

        marginVertical: 20,

        borderRadius: 10,

        minHeight: 120,

    },

    card: {

        marginTop: 30,

        padding: 20,

        backgroundColor: "#F5F5F5",

        borderRadius: 12,

    },

    warning: {

        marginTop: 20,

        color: "red",

        fontWeight: "bold",

    },

});