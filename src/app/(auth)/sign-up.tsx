import { useRouter } from "expo-router";
import { Text, View } from "react-native";

import { GoogleButton } from "@/components/google-button";
import { AuthLink } from "@/components/ui/auth-link";
import { Divider } from "@/components/ui/divider";
import { RNButton } from "@/components/ui/rn-button";
import { RNInput } from "@/components/ui/rn-input";
import { useSignUpFlow } from "@/hooks/use-sign-up";

export default function SignUp() {
  const router = useRouter();

  const {
    emailAddress,
    setEmailAddress,
    userName,
    setUserName,
    code,
    setCode,
    isCodeSent,
    isLoading,
    isGoogleLoading,
    sendCode,
    verifyCode,
    signUpWithGoogle,
  } = useSignUpFlow();

  return (
    <View className="flex-1 justify-center items-center px-6 bg-zinc-900">
      <Text className="text-3xl font-bold mb-8 text-white">Registro</Text>

      <View className="w-full gap-4">
        {isCodeSent ? (
          <>
            <RNInput
              label="Código de Verificação"
              placeholder="Digite o código"
              value={code}
              onChangeText={setCode}
              keyboardType="numeric"
            />
            <RNButton
              variant="success"
              onPress={verifyCode}
              isLoading={isLoading}
            >
              Verificar Código
            </RNButton>
          </>
        ) : (
          <>
            <RNInput
              label="Email"
              placeholder="seu@email.com"
              value={emailAddress}
              onChangeText={setEmailAddress}
              keyboardType="email-address"
            />
            <RNInput
              label="Nome de usuário"
              placeholder="Seu nome"
              value={userName}
              onChangeText={setUserName}
            />
            <RNButton onPress={sendCode} isLoading={isLoading}>
              Enviar Código
            </RNButton>
          </>
        )}

        <Divider />

        <GoogleButton onPress={signUpWithGoogle} isLoading={isGoogleLoading} />

        <AuthLink
          message="Já possui uma conta?"
          linkText="Login"
          onPress={() => router.replace("/(auth)/sign-in")}
        />
      </View>
    </View>
  );
}
