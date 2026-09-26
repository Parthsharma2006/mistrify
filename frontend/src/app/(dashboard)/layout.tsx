"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Users, LogOut, ChevronRight, Shield,
} from "lucide-react";
import { useEffect } from "react";
import NotificationBell from "@/components/NotificationBell";
import { BottomNav } from "@/components/mobile/BottomNav";
import { BackButtonHandler } from "@/components/mobile/BackButtonHandler";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-teal-950 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-10 h-10 border-3 border-teal-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!session) return null;

  const user = session.user;
  const role = user?.role;

  // Additional client-side role check
  const allowedPath = {
    CUSTOMER: "/customer",
    WORKER: "/worker",
    ADMIN: "/admin",
  }[role];

  if (allowedPath && !pathname.startsWith(allowedPath)) {
    router.push(allowedPath);
    return null;
  }

  return (
    <div className="min-h-screen text-white">
      <BackButtonHandler />
      
      {/* Main content */}
      <main className="h-[100dvh] overflow-y-auto pt-[env(safe-area-inset-top)] pb-[calc(80px+env(safe-area-inset-bottom))] custom-scrollbar">
        {children}
      </main>

      <BottomNav />
    </div>
  );
}
