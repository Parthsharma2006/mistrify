"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Home,
  Calendar,
  AlertTriangle,
  User,
  Briefcase,
  ClipboardList,
  Wallet,
  LayoutDashboard,
  ShieldCheck,
  MapPin,
  Receipt,
} from "lucide-react";
import { useMemo } from "react";

export function BottomNav() {
  const pathname = usePathname();

  const tabs = useMemo(() => {
    if (pathname?.startsWith("/worker")) {
      return [
        { href: "/worker", icon: Briefcase, label: "Home" },
        { href: "/worker/track", icon: MapPin, label: "Track" },
        { href: "/worker/orders", icon: ClipboardList, label: "Orders" },
        { href: "/worker/profile", icon: User, label: "Profile" },
      ];
    } else if (pathname?.startsWith("/admin")) {
      return [
        { href: "/admin", icon: LayoutDashboard, label: "Overview" },
        { href: "/admin/verification", icon: ShieldCheck, label: "Verify" },
        { href: "/admin/zones", icon: MapPin, label: "Zones" },
        { href: "/admin/transactions", icon: Receipt, label: "Finance" },
      ];
    } else {
      return [
        { href: "/customer", icon: Home, label: "Home" },
        { href: "/customer/track", icon: MapPin, label: "Track" },
        { href: "/customer/bookings", icon: ClipboardList, label: "Orders" },
        { href: "/customer/profile", icon: User, label: "Profile" },
      ];
    }
  }, [pathname]);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#07070f]/85 backdrop-blur-3xl border-t border-violet-500/8 shadow-[0_-8px_40px_rgba(0,0,0,0.5)] pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-around h-[68px] px-1">
        {tabs.map((tab) => {
          const actualIsActive = pathname === tab.href;
          const isSos = tab.label === "SOS";

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="relative flex flex-col items-center justify-center w-full h-full min-h-[44px]"
            >
              <div className="relative z-10 flex flex-col items-center justify-center px-3 py-1.5 rounded-xl">
                {actualIsActive && (
                  <motion.div
                    layoutId="activeTabBg"
                    className={`absolute inset-0 rounded-2xl ${
                      isSos
                        ? "bg-red-500/12 border border-red-500/20"
                        : "bg-violet-500/10 border border-violet-400/15 shadow-[0_0_15px_rgba(139,92,246,0.1)]"
                    }`}
                    transition={{ type: "spring" as const, stiffness: 400, damping: 22, mass: 0.8 }}
                  />
                )}
                <motion.div
                  animate={{ scale: actualIsActive ? 1.15 : 1, y: actualIsActive ? -2 : 0 }}
                  whileTap={{ scale: 0.85 }}
                  transition={{ type: "spring" as const, stiffness: 500, damping: 20 }}
                  className={`relative z-10 ${
                    actualIsActive
                      ? isSos
                        ? "text-red-400"
                        : "text-violet-300 drop-shadow-[0_0_8px_rgba(167,139,250,0.6)]"
                      : "text-white/25"
                  }`}
                >
                  <tab.icon className="w-[21px] h-[21px]" />
                </motion.div>
                <motion.span
                  animate={{ opacity: actualIsActive ? 1 : 0.4 }}
                  className={`relative z-10 text-[9px] font-bold mt-1 tracking-[0.1em] uppercase ${
                    actualIsActive
                      ? isSos
                        ? "text-red-300"
                        : "text-violet-200"
                      : "text-white/25"
                  }`}
                >
                  {tab.label}
                </motion.span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
