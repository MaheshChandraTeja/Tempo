import React, {
    createContext,
    useContext,
    useMemo,
    useReducer,
    type Dispatch,
    type PropsWithChildren,
} from 'react';

export type AppBootStatus = 'idle' | 'booting' | 'ready' | 'error';

export type AppState = Readonly<{
  bootStatus: AppBootStatus;
  lastError: string | null;
}>;

export type AppAction =
  | Readonly<{ type: 'APP/BOOT_START' }>
  | Readonly<{ type: 'APP/BOOT_SUCCESS' }>
  | Readonly<{ type: 'APP/BOOT_ERROR'; payload: string }>
  | Readonly<{ type: 'APP/CLEAR_ERROR' }>;

type StoreContextValue = Readonly<{
  state: AppState;
  dispatch: Dispatch<AppAction>;
}>;

const initialState: AppState = Object.freeze({
  bootStatus: 'idle',
  lastError: null,
});

const StoreContext = createContext<StoreContextValue | undefined>(undefined);

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'APP/BOOT_START':
      return {
        ...state,
        bootStatus: 'booting',
        lastError: null,
      };

    case 'APP/BOOT_SUCCESS':
      return {
        ...state,
        bootStatus: 'ready',
        lastError: null,
      };

    case 'APP/BOOT_ERROR':
      return {
        ...state,
        bootStatus: 'error',
        lastError: action.payload,
      };

    case 'APP/CLEAR_ERROR':
      return {
        ...state,
        lastError: null,
      };

    default: {
      const exhaustiveCheck: never = action;
      return exhaustiveCheck;
    }
  }
}

export function StoreProvider({
  children,
}: PropsWithChildren): React.JSX.Element {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const value = useMemo<StoreContextValue>(
    () =>
      Object.freeze({
        state,
        dispatch,
      }),
    [state],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useAppStore(): StoreContextValue {
  const context = useContext(StoreContext);

  if (!context) {
    throw new Error('useAppStore must be used within a StoreProvider.');
  }

  return context;
}