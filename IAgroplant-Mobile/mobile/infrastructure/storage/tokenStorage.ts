import AsyncStorage from "@react-native-async-storage/async-storage";

export async function saveTokens(
  accessToken: string,
  refreshToken: string
) {
  await AsyncStorage.setItem(
    "access_token",
    accessToken
  );

  await AsyncStorage.setItem(
    "refresh_token",
    refreshToken
  );
}