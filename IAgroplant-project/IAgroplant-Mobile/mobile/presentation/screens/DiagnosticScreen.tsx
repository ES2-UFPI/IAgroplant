import React, { useState } from "react";

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

export default function DiagnosticScreen() {

    const facade = new DiagnosticFacade();

    const [image, setImage] = useState<any>(null);

    const [description, setDescription] = useState("");

    const [loading, setLoading] = useState(false);

    const [result, setResult] = useState<any>(null);

    async function chooseImage() {

        const img = await selectImage();

        if (!img) {
            return;
        }

        console.log("========== IMAGEM SELECIONADA ==========");
        console.log(img);

        setImage(img);
        setResult(null);
    }

    async function diagnose() {

        if (!image) {

            Alert.alert(
                "Imagem obrigatória",
                "Selecione uma imagem antes de realizar o diagnóstico."
            );

            return;
        }

        console.log("========== DIAGNÓSTICO ==========");
        console.log("Imagem:");
        console.log(image);

        console.log("Descrição:");
        console.log(description);

        setLoading(true);

        try {

            const response = await facade.diagnose(
                image,
                description,
            );

            console.log("========== RESPOSTA ==========");
            console.log(response);

            setResult(response);

        } catch (error: any) {

            console.log("========== ERRO ==========");
            console.log(error);

            if (error.response) {

                console.log("Status:", error.response.status);
                console.log("Dados:", error.response.data);

            }

            Alert.alert(
                "Erro",
                "Não foi possível realizar o diagnóstico."
            );

        } finally {

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
                placeholder="Descrição (opcional)"
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

                <View style={styles.card}>

                    <Text style={styles.label}>
                        Patógeno
                    </Text>

                    <Text style={styles.value}>
                        {result.pathogen}
                    </Text>

                    <Text style={styles.label}>
                        Severidade
                    </Text>

                    <Text style={styles.value}>
                        {result.severity}
                    </Text>

                    <Text style={styles.label}>
                        Manejo
                    </Text>

                    <Text style={styles.value}>
                        {result.management}
                    </Text>

                    <Text style={styles.warning}>
                        {result.technical_warning}
                    </Text>

                </View>

            }

        </ScrollView>

    );

}

const styles = StyleSheet.create({

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

    label: {

        fontSize: 16,
        fontWeight: "bold",
        marginTop: 12,

    },

    value: {

        fontSize: 15,
        marginTop: 4,

    },

    warning: {

        marginTop: 20,
        color: "red",
        fontWeight: "bold",

    },

});