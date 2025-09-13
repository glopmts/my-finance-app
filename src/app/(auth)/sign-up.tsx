import { useOAuth, useSignUp } from "@clerk/clerk-expo";
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
import { API_BASE_URL } from "../../lib/api-from-url";

export default function SignIn() {
  const { signUp, isLoaded, setActive } = useSignUp();
  const { startOAuthFlow } = useOAuth({ strategy: "oauth_google" });
  const router = useRouter();

  const [emailAddress, setEmailAddress] = useState("");
  const [nameUser, setName] = useState("");
  const [code, setCode] = useState("");
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isLoader, setIsLoader] = useState(false);

  const onSendCodePress = async () => {
    if (!isLoaded) {
      return;
    }

    try {
      await signUp.create({
        emailAddress,
      });
      await signUp.prepareEmailAddressVerification();
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
      const completeSignIn = await signUp.attemptEmailAddressVerification({
        code,
      });

      if (completeSignIn.status === "complete") {
        await setActive({ session: completeSignIn.createdSessionId });
        const clerkId = completeSignIn.createdUserId;

        const res = await fetch(`${API_BASE_URL}/auth/creater`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            clerkId: clerkId,
            email: emailAddress,
            name: nameUser,
          }),
        });

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        Alert.alert("Sucesso", "Login realizado com sucesso!");
        router.push("/(main)/(home)/index");
      } else {
        Alert.alert("Erro", "Falha ao verificar o código.");
      }
    } catch (err: any) {
      Alert.alert("Erro", err.errors[0].message);
    }
  };

  const onGoogleSignInPress = async () => {
    setIsLoader(true);
    try {
      const { createdSessionId, setActive } = await startOAuthFlow();

      if (createdSessionId) {
        setActive ? { session: createdSessionId } : "";
        ToastAndroid.showWithGravity(
          "Login com Google realizado com sucesso!",
          ToastAndroid.BOTTOM,
          50
        );
        router.push("/(main)");
      } else {
        router.push("/(main)");
      }
    } catch (err) {
      if (err instanceof Error) {
        Alert.alert("Erro", err.message);
        setIsLoader(false);
      }
    } finally {
      setIsLoader(false);
    }
  };

  useEffect(() => {
    if (router.canGoBack()) {
      router.replace("/(auth)/sign-in");
    }
  }, []);

  return (
    <View className="flex-1 justify-center items-center p-4 bg-gradient-to-t bg-zinc-900">
      <Text className="text-2xl font-semibold mb-6 text-white">Registro</Text>

      {isCodeSent ? (
        <>
          <TextInput
            className="w-full p-3 mb-4 border text-white border-gray-300 rounded-lg"
            placeholder="Código de Verificação"
            placeholderTextColor="#fffc"
            value={code}
            onChangeText={(code) => setCode(code)}
            keyboardType="numeric"
          />

          <TouchableOpacity
            className="w-full bg-green-500 p-3 rounded-lg items-center"
            onPress={onVerifyCodePress}
          >
            <Text className="text-white font-bold">Verificar Código</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <TextInput
            className={`w-full p-3 text-white mb-4 border border-gray-300 rounded-lg`}
            placeholderTextColor="#ffff"
            autoCapitalize="none"
            placeholder="Email"
            value={emailAddress}
            onChangeText={(email) => setEmailAddress(email)}
          />

          <TextInput
            className={`w-full p-3 text-white mb-4 mt-4 border border-gray-300 rounded-lg`}
            placeholderTextColor="#ffff"
            autoCapitalize="none"
            placeholder="Nome de usuario"
            value={nameUser}
            onChangeText={(name) => setName(name)}
          />

          <TouchableOpacity
            className="w-full bg-zinc-200 p-3 rounded-3xl items-center mb-4"
            onPress={onSendCodePress}
          >
            <Text className="text-black font-bold">Enviar Código</Text>
          </TouchableOpacity>
        </>
      )}

      <View className="mt-2 mb-4">
        <Text style={{ color: "#ffff" }}>Ou</Text>
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
            style={{ width: 20, height: 20 }}
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
        onPress={() => router.replace("/(auth)/sign-in")}
      >
        <Text className="text-white font-semibold text-base">
          Já possui uma conta?
        </Text>
        <Text className="text-blue-600 font-semibold text-base">Login</Text>
      </TouchableOpacity>
    </View>
  );
}
