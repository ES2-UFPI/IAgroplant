import * as ImagePicker from "expo-image-picker";

export async function selectImage() {

    const result =
        await ImagePicker.launchImageLibraryAsync({

            mediaTypes:
                ImagePicker.MediaTypeOptions.Images,

            quality: 0.6,

        });


    if (result.canceled) {

        return null;

    }


    return result.assets[0];

}