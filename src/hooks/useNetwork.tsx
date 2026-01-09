import NetInfo from "@react-native-community/netinfo";
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

type NetworkState = {
  isConnected: boolean;
  isInternetReachable?: boolean | null;
  type?: string;
  details?: any;
};

type NetworkContextType = {
  isConnected: boolean;
  lastChecked: Date | null;
  networkState: NetworkState;
  forceCheck: () => Promise<NetworkState>;
  checkCount: number;
  isChecking: boolean;
};

const NetworkContext = createContext<NetworkContextType>({
  isConnected: true,
  lastChecked: null,
  networkState: { isConnected: true },
  forceCheck: async () => ({ isConnected: true }),
  checkCount: 0,
  isChecking: false,
});

export const useNetwork = () => useContext(NetworkContext);

type NetworkProviderProps = {
  children: ReactNode;
  checkInterval?: number;
  enableAutoCheck?: boolean;
  onConnectionChange?: (isConnected: boolean) => void;
  onCheckComplete?: (state: NetworkState) => void;
};

export const NetworkProvider: React.FC<NetworkProviderProps> = ({
  children,
  checkInterval = 60000,
  enableAutoCheck = true,
  onConnectionChange,
  onCheckComplete,
}) => {
  const [isConnected, setIsConnected] = useState(true);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [networkState, setNetworkState] = useState<NetworkState>({
    isConnected: true,
  });
  const [checkCount, setCheckCount] = useState(0);
  const [isChecking, setIsChecking] = useState(false);

  // Usar 'any' ou 'NodeJS.Timeout' com tipagem condicional
  const intervalRef = useRef<any>(null);
  const isMounted = useRef(true);

  const checkConnection = useCallback(async (): Promise<NetworkState> => {
    if (!isMounted.current) return networkState;

    setIsChecking(true);
    try {
      const state = await NetInfo.fetch();
      const newState = {
        isConnected: state.isConnected ?? false,
        isInternetReachable: state.isInternetReachable,
        type: state.type,
        details: state.details,
      };

      if (isMounted.current) {
        setNetworkState(newState);
        setIsConnected(newState.isConnected);
        setLastChecked(new Date());
        setCheckCount((prev) => prev + 1);

        if (onCheckComplete) {
          onCheckComplete(newState);
        }
        if (onConnectionChange && newState.isConnected !== isConnected) {
          onConnectionChange(newState.isConnected);
        }
      }

      return newState;
    } catch (error) {
      console.error("Erro ao verificar conexão:", error);
      const errorState = {
        isConnected: false,
        isInternetReachable: false,
        type: "unknown",
        details: { error },
      };

      if (isMounted.current) {
        setNetworkState(errorState);
        setIsConnected(false);
        setLastChecked(new Date());
        setCheckCount((prev) => prev + 1);
      }

      return errorState;
    } finally {
      if (isMounted.current) {
        setIsChecking(false);
      }
    }
  }, [isConnected, onCheckComplete, onConnectionChange]);

  const forceCheck = useCallback(async (): Promise<NetworkState> => {
    return await checkConnection();
  }, [checkConnection]);

  useEffect(() => {
    isMounted.current = true;

    // Listener para mudanças em tempo real
    const unsubscribe = NetInfo.addEventListener((state) => {
      if (isMounted.current) {
        const newState = {
          isConnected: state.isConnected ?? false,
          isInternetReachable: state.isInternetReachable,
          type: state.type,
          details: state.details,
        };

        setNetworkState(newState);
        setIsConnected(newState.isConnected);
        setLastChecked(new Date());

        if (onConnectionChange) {
          onConnectionChange(newState.isConnected);
        }
      }
    });

    // Verificação inicial
    checkConnection();

    // Configurar intervalo para verificação periódica
    if (enableAutoCheck) {
      intervalRef.current = setInterval(checkConnection, checkInterval);
    }

    return () => {
      isMounted.current = false;
      unsubscribe();
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [checkInterval, enableAutoCheck, checkConnection, onConnectionChange]);

  return (
    <NetworkContext.Provider
      value={{
        isConnected,
        lastChecked,
        networkState,
        forceCheck,
        checkCount,
        isChecking,
      }}
    >
      {children}
    </NetworkContext.Provider>
  );
};
