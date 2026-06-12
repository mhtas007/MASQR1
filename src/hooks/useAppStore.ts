import { useSyncExternalStore } from "react";
import { store } from "../store";

export function useAppStore() {
  return useSyncExternalStore(store.subscribe, store.getState);
}
