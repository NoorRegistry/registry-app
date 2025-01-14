export interface IGlobalState {
  isAppReady: boolean;
  isAuthenticated: boolean;
  selectedRegistryId?: string;
}

export interface IGlobalActions {
  signIn: () => void;
  signOut: () => void;
  setIsAppReady: () => void;
  setSelectedRegistryId: (id: string) => void;
}
