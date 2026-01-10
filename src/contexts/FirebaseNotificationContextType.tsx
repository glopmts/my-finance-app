import React, { createContext, ReactNode, useContext } from "react";
import { useFirebaseNotifications } from "../hooks/useFirebaseNotifications";

interface FirebaseNotificationContextType {
  // Tokens
  token: string | null;
  fcmToken: string | null;
  isFirebaseReady: boolean;

  // Métodos Firebase
  subscribeToTopic: (topicName: string) => Promise<boolean>;
  unsubscribeFromTopic: (topicName: string) => Promise<boolean>;
  sendToTopic: (topicName: string, message: any) => Promise<boolean>;

  // Métodos originais
  savePushToken: (token: string) => Promise<boolean>;
  checkStatus: () => Promise<any>;
  clearToken: () => Promise<void>;
}

const FirebaseNotificationContext = createContext<
  FirebaseNotificationContextType | undefined
>(undefined);

export const useFirebaseNotificationContext = () => {
  const context = useContext(FirebaseNotificationContext);
  if (!context) {
    throw new Error(
      "useFirebaseNotificationContext must be used within FirebaseNotificationProvider"
    );
  }
  return context;
};

interface FirebaseNotificationProviderProps {
  children: ReactNode;
}

export const FirebaseNotificationProvider: React.FC<
  FirebaseNotificationProviderProps
> = ({ children }) => {
  const notifications = useFirebaseNotifications();

  return (
    <FirebaseNotificationContext.Provider value={notifications}>
      {children}
    </FirebaseNotificationContext.Provider>
  );
};
