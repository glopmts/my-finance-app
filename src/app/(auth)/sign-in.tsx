import { useAuth } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { Text, View } from "react-native";

import { GoogleButton } from "@/components/google-button";
import { AuthLink } from "@/components/ui/auth-link";
import { Divider } from "@/components/ui/divider";
import { RNButton } from "@/components/ui/rn-button";
import { RNInput } from "@/components/ui/rn-input";
import { useSignInFlow } from "@/hooks/use-sign-in";

export default function SignIn() {
  const { isSignedIn } = useAuth();
  const router = useRouter();

  const {
    emailAddress,
    setEmailAddress,
    code,
    setCode,
    isCodeSent,
    isLoading,
    isGoogleLoading,
    sendCode,
    verifyCode,
    signInWithGoogle,
  } = useSignInFlow();

  useEffect(() => {
    if (isSignedIn) {
      router.replace("/(main)/(home)");
    }
  }, [isSignedIn, router]);

  return (
    <View className="flex-1 justify-center items-center px-6 bg-zinc-900">
      <Text className="text-3xl font-bold mb-8 text-white">Login</Text>

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
            <RNButton onPress={sendCode} isLoading={isLoading}>
              Enviar Código
            </RNButton>
          </>
        )}

        <Divider />

        <GoogleButton onPress={signInWithGoogle} isLoading={isGoogleLoading} />

        <AuthLink
          message="Não possui uma conta?"
          linkText="Registrar"
          onPress={() => router.replace("/(auth)/sign-up")}
        />
      </View>
    </View>
  );
}
