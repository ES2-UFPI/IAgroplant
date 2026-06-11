import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  View,
  Text,
  Button,
} from "react-native";

export default function HomeScreen({ navigation }: any) {

  async function logout() {

    await AsyncStorage.clear();

    navigation.replace("Login");
  }

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>
        Login realizado com sucesso
      </Text>

      <Button
        title="Logout"
        onPress={logout}
      />
    </View>
  );
}