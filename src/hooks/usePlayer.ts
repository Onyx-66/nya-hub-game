import { usePlayerStore } from "@/store/usePlayerStore";

export function usePlayer() {
  return usePlayerStore();
}