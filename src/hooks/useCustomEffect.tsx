import { useEffect } from "react";

export const useCustomEffect = (callback: () => void, deps: any[]) => {
  useEffect(() => callback(), [deps]);
};

