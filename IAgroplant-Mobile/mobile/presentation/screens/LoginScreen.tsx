import React, {
  useState,
} from "react";

import {
  View,
  TextInput,
  Button,
  Alert,
} from "react-native";

import { login } from "../../application/services/AuthService";

import { saveTokens } from "../../infrastructure/storage/tokenStorage";

export default function LoginScreen(
  { navigation }: any
) {

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  async function handleLogin() {

    try {

      const result =
        await login(
          email,
          password
        );

      await saveTokens(
        result.access_token,
        result.refresh_token
      );

      navigation.replace(
        "Home"
      );

    } catch (error: any) {

  console.log(
    "ERRO LOGIN:",
    error
  );

  console.log(
    "RESPOSTA:",
    error?.response?.data
  );

  Alert.alert(
    "Erro",
    JSON.stringify(
      error?.response?.data ||
      error.message
    )
  );

}

  }

  return (

    <View
      style={{
        flex: 1,
        justifyContent: "center",
        padding: 20,
      }}
    >

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        placeholder="Senha"
        value={password}
        secureTextEntry
        onChangeText={setPassword}
      />

      <Button
        title="Entrar"
        onPress={handleLogin}
      />

    </View>

  );

}