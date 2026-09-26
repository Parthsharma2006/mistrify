"use client";

import React from "react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { Globe } from "lucide-react";
import { motion } from "framer-motion";

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="relative inline-block text-left">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel p-1 rounded-full flex items-center space-x-1 border border-white/10"
      >
        <div className="pl-2 pr-1 text-gray-300">
          <Globe className="w-4 h-4" />
        </div>
        <button
          onClick={() => setLanguage("en")}
          className={`px-3 py-1 text-sm rounded-full transition-colors ${
            language === "en"
              ? "bg-white/20 text-white font-medium"
              : "text-gray-400 hover:text-gray-200"
          }`}
        >
          EN
        </button>
        <button
          onClick={() => setLanguage("hi")}
          className={`px-3 py-1 text-sm rounded-full transition-colors ${
            language === "hi"
              ? "bg-white/20 text-white font-medium"
              : "text-gray-400 hover:text-gray-200"
          }`}
        >
          HI
        </button>
      </motion.div>
    </div>
  );
}
