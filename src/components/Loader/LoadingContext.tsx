import React, {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { StyleSheet, View } from "react-native";
import LoadingSpinner from "./customLoader";

// Create Context
const LoadingContext = createContext({
  showLoadingOverlay: () => {},
  hideLoadingOverlay: () => {},
});

// Provider Component
export const LoadingProvider = ({ children }: { children: ReactNode }) => {
  const [visible, setVisible] = useState(false);
  const showLoadingOverlay = useCallback(() => {
    setVisible(true);
  }, []);

  const hideLoadingOverlay = useCallback(() => {
    setVisible(false);
  }, []);

  useEffect(() => {}, [visible]);

  return (
    <LoadingContext.Provider
      value={{
        showLoadingOverlay,
        hideLoadingOverlay,
      }}
    >
      {children}
      <LoadingOverlay visible={visible} />
    </LoadingContext.Provider>
  );
};

// Hook for Using Context
export const useLoadingOverlay = () => useContext(LoadingContext);

// Loading Overlay Component
const LoadingOverlay = ({ visible }: { visible: boolean }) => {
  if (!visible) return null;
  return (
    <View style={styles.overlay}>
      <LoadingSpinner size="large" />
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: "absolute", // Absolute positioning to cover the whole screen
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent black background
    zIndex: 999, // Ensure it's on top of other elements
  },
});
