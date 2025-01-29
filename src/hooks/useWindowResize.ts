import { useEffect } from "react";

export default function useWindowResize(callback: (e: Event) => void) {
  useEffect(() => {
    window.addEventListener("resize", callback);
    return () => window.removeEventListener("resize", callback);
  }, []);
}
