import * as QuickActions from "expo-quick-actions";
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import { Platform } from "react-native";

import { RouterAction } from "expo-quick-actions/router";

export const useQuickActions = () => {
  const router = useRouter();

  React.useEffect(() => {
    QuickActions.setItems<RouterAction<"/(main)/(home)/transactions" | "/">>([
      {
        title: "Nova transação",
        icon: Platform.select({
          ios: "symbol:",
          android: "transaction_icone_one",
        }),
        id: "transaction",
        params: {
          href: "/(main)/(home)/transactions",
        },
      },
    ]);
  }, []);

  useEffect(() => {
    const sub = QuickActions.addListener((action) => {
      if (!action) return;

      if (action.id === "transaction") {
        router.push("/(main)/(home)/transactions");
      }
    });

    return () => sub.remove();
  }, [router]);
};
