import { useAuth, useSignIn, useSSO } from "@clerk/clerk-expo";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Text,
  TextInput,
  ToastAndroid,
  TouchableOpacity,
  View,
} from "react-native";

import * as AuthSession from "expo-auth-session";

export default function SignIn() {
  const { signIn, isLoaded, setActive } = useSignIn();
  const { isSignedIn } = useAuth();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = useState("");
  const [code, setCode] = useState("");
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isLoader, setIsLoader] = useState(false);

  const { startSSOFlow } = useSSO();

  useEffect(() => {
    if (isSignedIn) {
      router.replace("/(main)/(home)");
    }
  }, [isSignedIn]);

  const onSendCodePress = async () => {
    if (!isLoaded) {
      return;
    }

    try {
      await signIn.create({
        identifier: emailAddress,
      });
      setIsCodeSent(true);
      Alert.alert(
        "Código enviado",
        "Verifique seu email para o código de acesso."
      );
    } catch (err: any) {
      Alert.alert("Erro", err.errors[0].message);
    }
  };

  const onVerifyCodePress = async () => {
    if (!isLoaded) {
      return;
    }

    try {
      const completeSignIn = await signIn.attemptFirstFactor({
        strategy: "email_code",
        code,
      });
      if (
        completeSignIn.status === "complete" &&
        completeSignIn.createdSessionId
      ) {
        await setActive({ session: completeSignIn.createdSessionId });
        Alert.alert("Sucesso", "Login realizado com sucesso!");
        router.replace("/(main)/(home)");
      } else {
        Alert.alert("Erro", "Falha ao completar o login");
      }
    } catch (err: any) {
      Alert.alert("Erro", err.errors[0].message);
    }
  };

  const onGoogleSignInPress = async () => {
    setIsLoader(true);
    try {
      const { createdSessionId, setActive } = await startSSOFlow({
        strategy: "oauth_google",
        redirectUrl: AuthSession.makeRedirectUri({
          path: "/(auth)/oauth-callback",
          isTripleSlashed: true,
        }),
      });

      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId });
        ToastAndroid.showWithGravity(
          "Login com Google realizado com sucesso!",
          ToastAndroid.BOTTOM,
          50
        );
        router.replace("/(main)/(home)");
      } else {
        Alert.alert("Erro", "Falha no login com Google");
      }
    } catch (err) {
      if (err instanceof Error) {
        Alert.alert("Erro", err.message);
      }
    } finally {
      setIsLoader(false);
    }
  };

  return (
    <View className="flex-1 justify-center items-center p-4 bg-gradient-to-t bg-zinc-900">
      <Text className={`text-2xl font-semibold mb-6 text-white`}>Login</Text>

      {isCodeSent ? (
        <>
          <TextInput
            className={`w-full p-3 mb-4 border text-white border-gray-300 rounded-lg`}
            placeholder="Código de Verificação"
            placeholderTextColor="#ffff"
            value={code}
            onChangeText={(code) => setCode(code)}
            keyboardType="numeric"
          />

          <TouchableOpacity
            className={`w-full bg-green-500 p-3 rounded-lg items-center`}
            onPress={onVerifyCodePress}
          >
            <Text className={`text-white font-bold`}>Verificar Código</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <View className="w-full flex flex-col gap-4">
            <Text className="text-xl text-white">Email</Text>
            <TextInput
              className={`w-full p-3 mb-4 border text-white border-gray-300 rounded-lg`}
              autoCapitalize="none"
              placeholder="Email"
              placeholderTextColor="#ffff"
              value={emailAddress}
              onChangeText={(email) => setEmailAddress(email)}
            />
          </View>

          <TouchableOpacity
            className={`w-full bg-zinc-200 p-3 rounded-3xl items-center mb-4 mt-2`}
            onPress={onSendCodePress}
            disabled={isCodeSent}
          >
            <Text className={`text-black font-bold`}>Enviar Código</Text>
          </TouchableOpacity>
        </>
      )}

      <View className="mt-2 mb-4">
        <Text className="text-white">Ou</Text>
      </View>

      <TouchableOpacity
        className="bg-zinc-300 w-full p-3 mt-2 rounded-3xl"
        onPress={onGoogleSignInPress}
        disabled={isLoader}
      >
        <View className="flex-row justify-center items-center gap-2 ">
          <Image
            source={
              "https://k75mjkjgco.ufs.sh/f/wiGIa3OsPCpWzuXIRyPon6dckLa5ORyXgs3FjENvVYe4Dbmi"
            }
            className="object-contain"
            style={{
              width: 20,
              height: 20,
            }}
          />
          <Text className="text-black font-semibold text-xl">
            {isLoader ? (
              <ActivityIndicator size={20} color="#2563eb" />
            ) : (
              "Login com Google"
            )}
          </Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        className="mt-4 text-center flex items-center gap-2"
        onPress={() => router.replace("/(auth)/sign-up")}
      >
        <Text className="text-white font-semibold text-base">
          Não possui uma conta?
        </Text>
        <Text className="text-blue-600 font-semibold text-base">Register</Text>
      </TouchableOpacity>
    </View>
  );
}
