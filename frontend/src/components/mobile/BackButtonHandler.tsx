"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

export function BackButtonHandler() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    let listener: any = null;

    const setupListener = async () => {
      try {
        const { App: CapApp } = await import("@capacitor/app");
        listener = await CapApp.addListener("backButton", ({ canGoBack }: { canGoBack: boolean }) => {
          const rootPaths = ["/customer", "/worker", "/admin", "/login", "/"];
          if (rootPaths.includes(pathname || "")) {
            CapApp.minimizeApp();
          } else {
            router.back();
          }
        });
      } catch (error) {
        console.warn("Capacitor App plugin not available", error);
      }
    };

    setupListener();

    return () => {
      if (listener && typeof listener.remove === "function") {
        listener.remove();
      }
    };
  }, [router, pathname]);

  return null;
}
