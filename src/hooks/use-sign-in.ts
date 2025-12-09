// "use client"

import {
  useAuth,
  useSignIn as useClerkSignIn,
  useSSO,
} from "@clerk/clerk-expo";
import * as AuthSession from "expo-auth-session";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, Platform, ToastAndroid } from "react-native";

interface UseSignInReturn {
  emailAddress: string;
  setEmailAddress: (email: string) => void;
  code: string;
  setCode: (code: string) => void;
  isCodeSent: boolean;
  isLoading: boolean;
  isGoogleLoading: boolean;
  sendCode: () => Promise<void>;
  verifyCode: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
}

export function useSignInFlow(): UseSignInReturn {
  const { signIn, isLoaded, setActive } = useClerkSignIn();
  const { isSignedIn } = useAuth();
  const { startSSOFlow } = useSSO();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = useState("");
  const [code, setCode] = useState("");
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const showToast = useCallback((message: string) => {
    if (Platform.OS === "android") {
      ToastAndroid.showWithGravity(
        message,
        ToastAndroid.SHORT,
        ToastAndroid.BOTTOM
      );
    } else {
      Alert.alert("Sucesso", message);
    }
  }, []);

  const handleError = useCallback((err: unknown, fallbackMessage: string) => {
    const message =
      err instanceof Error
        ? err.message
        : ((err as any)?.errors?.[0]?.message ?? fallbackMessage);
    Alert.alert("Erro", message);
  }, []);

  const sendCode = useCallback(async () => {
    if (!isLoaded || !emailAddress.trim()) return;

    setIsLoading(true);
    try {
      await signIn.create({ identifier: emailAddress });
      setIsCodeSent(true);
      Alert.alert(
        "Código enviado",
        "Verifique seu email para o código de acesso."
      );
    } catch (err) {
      handleError(err, "Falha ao enviar código");
    } finally {
      setIsLoading(false);
    }
  }, [isLoaded, emailAddress, signIn, handleError]);

  const verifyCode = useCallback(async () => {
    if (!isLoaded || !code.trim()) return;

    setIsLoading(true);
    try {
      const result = await signIn.attemptFirstFactor({
        strategy: "email_code",
        code,
      });

      if (result.status === "complete" && result.createdSessionId) {
        await setActive({ session: result.createdSessionId });
        showToast("Login realizado com sucesso!");
        router.replace("/(main)/(home)");
      } else {
        Alert.alert("Erro", "Falha ao completar o login");
      }
    } catch (err) {
      handleError(err, "Código inválido");
    } finally {
      setIsLoading(false);
    }
  }, [isLoaded, code, signIn, setActive, router, showToast, handleError]);

  const signInWithGoogle = useCallback(async () => {
    setIsGoogleLoading(true);
    try {
      const { createdSessionId, setActive: setActiveSession } =
        await startSSOFlow({
          strategy: "oauth_google",
          redirectUrl: AuthSession.makeRedirectUri({
            path: "/(auth)/oauth-callback",
            isTripleSlashed: true,
          }),
        });

      if (createdSessionId && setActiveSession) {
        await setActiveSession({ session: createdSessionId });
        showToast("Login com Google realizado com sucesso!");
        router.replace("/(main)/(home)");
      } else {
        Alert.alert("Erro", "Falha no login com Google");
      }
    } catch (err) {
      handleError(err, "Falha no login com Google");
    } finally {
      setIsGoogleLoading(false);
    }
  }, [startSSOFlow, router, showToast, handleError]);

  return {
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
  };
}
