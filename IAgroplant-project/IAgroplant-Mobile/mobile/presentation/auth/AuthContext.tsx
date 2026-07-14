import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import AsyncStorage from "@react-native-async-storage/async-storage";

import { login } from "../../application/services/AuthService";
import { profileService } from "../../application/services/profileService";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  isLoading: boolean;
  signIn: (
    email: string,
    password: string
  ) => Promise<void>;
  signOut: () => Promise<void>;
  updateRole: (
    role: string
  ) => Promise<void>;
};

const STORAGE_KEY =
  "@iagroplant/auth-user";

const TOKEN_KEY =
  "@iagroplant/auth-token";

const REFRESH_TOKEN_KEY =
  "@iagroplant/auth-refresh-token";

const AuthContext =
  createContext<AuthContextValue | undefined>(
    undefined
  );

export function AuthProvider({

  children,

}: {

  children: React.ReactNode;

}) {

  const [

    user,

    setUser,

  ] = useState<AuthUser | null>(null);

  const [

    isLoading,

    setIsLoading,

  ] = useState(true);

  useEffect(() => {

    let mounted = true;

    async function loadUser() {

      try {

        const storedUser =
          await AsyncStorage.getItem(
            STORAGE_KEY
          );

        if (

          mounted &&

          storedUser

        ) {

          setUser(
            JSON.parse(storedUser)
          );

        }

      }

      finally {

        if (mounted) {

          setIsLoading(false);

        }

      }

    }

    loadUser();

    return () => {

      mounted = false;

    };

  }, []);

  const value =
    useMemo<AuthContextValue>(() => ({

      user,

      isLoading,

      signIn: async (

        email,

        password

      ) => {

        console.log("========== LOGIN ==========");

        const response =
          await login(

            email
              .trim()
              .toLowerCase(),

            password,

          );

        console.log(response);

        if (

          !response ||

          !response.access_token

        ) {

          throw new Error(
            "Token não recebido."
          );

        }

        await AsyncStorage.setItem(

          TOKEN_KEY,

          response.access_token,

        );

        if (

          response.refresh_token

        ) {

          await AsyncStorage.setItem(

            REFRESH_TOKEN_KEY,

            response.refresh_token,

          );

        }

        console.log(
          "Token salvo."
        );

        const profile =
          await profileService.getMe();

        console.log(
          "Perfil:"
        );

        console.log(
          profile
        );

        const authUser: AuthUser = {

          id: profile.id,

          name: profile.name,

          email: profile.email,

          role: profile.role,

        };

        setUser(
          authUser
        );

        await AsyncStorage.setItem(

          STORAGE_KEY,

          JSON.stringify(
            authUser
          ),

        );

        console.log(
          "Login concluído."
        );

      },

      signOut: async () => {

        setUser(null);

        await AsyncStorage.removeItem(
          STORAGE_KEY
        );

        await AsyncStorage.removeItem(
          TOKEN_KEY
        );

        await AsyncStorage.removeItem(
          REFRESH_TOKEN_KEY
        );

      },

      updateRole: async (

        role

      ) => {

        const storedUser =
          user ??
          JSON.parse(
            (await AsyncStorage.getItem(
              STORAGE_KEY
            )) || "null"
          );

        if (!storedUser) {

          return;

        }

        const updated = {

          ...storedUser,

          role,

        };

        setUser(
          updated
        );

        await AsyncStorage.setItem(

          STORAGE_KEY,

          JSON.stringify(
            updated
          ),

        );

      },

    }),

    [

      user,

      isLoading,

    ]

  );

  return (

    <AuthContext.Provider

      value={value}

    >

      {children}

    </AuthContext.Provider>

  );

}

export function useAuth() {

  const context =
    useContext(AuthContext);

  if (!context) {

    throw new Error(
      "useAuth must be used within AuthProvider"
    );

  }

  return context;

}
