"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";

interface AppHeaderProps {
  title: string;
  showBack?: boolean;
  children?: React.ReactNode;
}

export function AppHeader({ title, showBack, children }: AppHeaderProps) {
  const router = useRouter();

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/95 backdrop-blur-2xl border-b border-white/10 pt-safe h-[calc(56px+env(safe-area-inset-top))]">
      <div className="flex items-center justify-between h-[56px] px-4">
        <div className="w-10 flex items-center justify-start">
          {showBack && (
            <button
              onClick={() => router.back()}
              className="p-2 -ml-2 rounded-full hover:bg-white/10 active:bg-white/20 transition-colors"
            >
              <ChevronLeft className="w-6 h-6 text-white" />
            </button>
          )}
        </div>
        <h1 className="text-[17px] font-bold text-white flex-1 text-center truncate">
          {title}
        </h1>
        <div className="w-10 flex items-center justify-end">
          {children}
        </div>
      </div>
    </div>
  );
}
