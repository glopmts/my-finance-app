// "use client"

import { useSignUp as useClerkSignUp, useOAuth } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, Platform, ToastAndroid } from "react-native";
import { API_BASE_URL } from "../../lib/api-from-url";

interface UseSignUpReturn {
  emailAddress: string;
  setEmailAddress: (email: string) => void;
  userName: string;
  setUserName: (name: string) => void;
  code: string;
  setCode: (code: string) => void;
  isCodeSent: boolean;
  isLoading: boolean;
  isGoogleLoading: boolean;
  sendCode: () => Promise<void>;
  verifyCode: () => Promise<void>;
  signUpWithGoogle: () => Promise<void>;
}

export function useSignUpFlow(): UseSignUpReturn {
  const { signUp, isLoaded, setActive } = useClerkSignUp();
  const { startOAuthFlow } = useOAuth({ strategy: "oauth_google" });
  const router = useRouter();

  const [emailAddress, setEmailAddress] = useState("");
  const [userName, setUserName] = useState("");
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

  const createUserInBackend = useCallback(
    async (clerkId: string, email: string, name: string) => {
      const res = await fetch(`${API_BASE_URL}/auth/creater`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clerkId, email, name }),
      });

      if (!res.ok) {
        throw new Error(`Erro ao criar usuário: ${res.status}`);
      }
    },
    []
  );

  const sendCode = useCallback(async () => {
    if (!isLoaded || !emailAddress.trim()) return;

    setIsLoading(true);
    try {
      await signUp.create({ emailAddress });
      await signUp.prepareEmailAddressVerification();
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
  }, [isLoaded, emailAddress, signUp, handleError]);

  const verifyCode = useCallback(async () => {
    if (!isLoaded || !code.trim()) return;

    setIsLoading(true);
    try {
      const result = await signUp.attemptEmailAddressVerification({ code });

      if (result.status === "complete" && result.createdSessionId) {
        await setActive({ session: result.createdSessionId });
        await createUserInBackend(
          result.createdUserId!,
          emailAddress,
          userName
        );
        showToast("Registro realizado com sucesso!");
        router.push("/(main)/(home)");
      } else {
        Alert.alert("Erro", "Falha ao verificar o código.");
      }
    } catch (err) {
      handleError(err, "Código inválido");
    } finally {
      setIsLoading(false);
    }
  }, [
    isLoaded,
    code,
    signUp,
    setActive,
    emailAddress,
    userName,
    createUserInBackend,
    router,
    showToast,
    handleError,
  ]);

  const signUpWithGoogle = useCallback(async () => {
    setIsGoogleLoading(true);
    try {
      const { createdSessionId, setActive: setActiveSession } =
        await startOAuthFlow();

      if (createdSessionId && setActiveSession) {
        await setActiveSession({ session: createdSessionId });
        showToast("Login com Google realizado com sucesso!");
        router.push("/(main)/(home)");
      }
    } catch (err) {
      handleError(err, "Falha no login com Google");
    } finally {
      setIsGoogleLoading(false);
    }
  }, [startOAuthFlow, router, showToast, handleError]);

  return {
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
  };
}
