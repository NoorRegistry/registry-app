export interface IGlobalState {
  isAppReady: boolean;
  isAuthenticated: boolean;
  isHeaderScrolled: boolean;
  selectedRegistryId?: string;
}

export interface IGlobalActions {
  signIn: () => void;
  signOut: () => void;
  setIsAppReady: () => void;
  setHeaderScrolled: (isScrolled: boolean) => void;
  setSelectedRegistryId: (id: string) => void;
}
