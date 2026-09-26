"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Users, User, Phone, Mail, Lock, Eye, EyeOff,
  MapPin, Globe, AlertCircle, Loader2, CheckCircle2, ArrowLeft, Crosshair
} from "lucide-react";
import { Geolocation } from '@capacitor/geolocation';
import { useLanguage } from '@/lib/i18n/LanguageContext';

const translations: Record<string, Record<string, string>> = {
  "hi": {
    "Create Account": "खाता बनाएं",
    "Register as a customer": "ग्राहक के रूप में पंजीकरण करें",
    "Register as a worker": "वर्कर के रूप में पंजीकरण करें",
    "Language": "भाषा",
    "Full Name *": "पूरा नाम *",
    "Enter your full name": "अपना पूरा नाम दर्ज करें",
    "Mobile Number *": "मोबाइल नंबर *",
    "10-digit mobile number": "10-अंकीय मोबाइल नंबर",
    "Email (Optional)": "ईमेल (वैकल्पिक)",
    "Password *": "पासवर्ड *",
    "Confirm Password *": "पासवर्ड की पुष्टि करें *",
    "Next Step": "अगला कदम",
    "Address": "पता",
    "Your address": "आपका पता",
    "Auto-Detect via GPS": "GPS के माध्यम से स्वतः पता लगाएं",
    "City": "शहर",
    "State": "राज्य",
    "Pincode": "पिनकोड",
    "Back": "पीछे",
    "Create Account Btn": "खाता बनाएं",
    "Already have an account?": "क्या आपके पास पहले से खाता है?",
    "Sign in": "साइन इन करें",
    "Select Category": "श्रेणी चुनें",
    "Years of Experience": "अनुभव के वर्ष",
    "Cooperative Society (Optional)": "सहकारी समिति (वैकल्पिक)"
  },
  "mr": {
    "Create Account": "खाते तयार करा",
    "Register as a customer": "ग्राहक म्हणून नोंदणी करा",
    "Register as a worker": "कामगार म्हणून नोंदणी करा",
    "Language": "भाषा",
    "Full Name *": "पूर्ण नाव *",
    "Enter your full name": "तुमचे पूर्ण नाव प्रविष्ट करा",
    "Mobile Number *": "मोबाईल नंबर *",
    "10-digit mobile number": "10-अंकी मोबाईल नंबर",
    "Email (Optional)": "ईमेल (पर्यायी)",
    "Password *": "पासवर्ड *",
    "Confirm Password *": "पासवर्डची पुष्टी करा *",
    "Next Step": "पुढील पायरी",
    "Address": "पत्ता",
    "Your address": "तुमचा पत्ता",
    "Auto-Detect via GPS": "GPS द्वारे स्वयंचलित शोधा",
    "City": "शहर",
    "State": "राज्य",
    "Pincode": "पिनकोड",
    "Back": "मागे",
    "Create Account Btn": "खाते तयार करा",
    "Already have an account?": "तुमचे आधीपासून खाते आहे का?",
    "Sign in": "साइन इन करा",
    "Select Category": "श्रेणी निवडा",
    "Years of Experience": "अनुभवाची वर्षे",
    "Cooperative Society (Optional)": "सहकारी संस्था (पर्यायी)"
  },
  "gu": {
    "Create Account": "ખાતું બનાવો",
    "Register as a customer": "ગ્રાહક તરીકે નોંધણી કરો",
    "Register as a worker": "વર્કર તરીકે નોંધણી કરો",
    "Language": "ભાષા",
    "Full Name *": "પૂરું નામ *",
    "Enter your full name": "તમારું પૂરું નામ દાખલ કરો",
    "Mobile Number *": "મોબાઇલ નંબર *",
    "10-digit mobile number": "10-અંકનો મોબાઇલ નંબર",
    "Email (Optional)": "ઇમેઇલ (વૈકલ્પિક)",
    "Password *": "પાસવર્ડ *",
    "Confirm Password *": "પાસવર્ડની પુષ્ટિ કરો *",
    "Next Step": "આગળનું પગલું",
    "Address": "સરનામું",
    "Your address": "તમારું સરનામું",
    "Auto-Detect via GPS": "GPS દ્વારા સ્વચાલિત શોધો",
    "City": "શહેર",
    "State": "રાજ્ય",
    "Pincode": "પિનકોડ",
    "Back": "પાછળ",
    "Create Account Btn": "ખાતું બનાવો",
    "Already have an account?": "શું તમારી પાસે પહેલેથી જ ખાતું છે?",
    "Sign in": "સાઇન ઇન કરો",
    "Select Category": "શ્રેણી પસંદ કરો",
    "Years of Experience": "અનુભવના વર્ષો",
    "Cooperative Society (Optional)": "સહકારી મંડળી (વૈકલ્પિક)"
  },
  "ta": {
    "Create Account": "கணக்கை உருவாக்கு",
    "Register as a customer": "வாடிக்கையாளராக பதிவு செய்",
    "Register as a worker": "தொழிலாளராக பதிவு செய்",
    "Language": "மொழி",
    "Full Name *": "முழு பெயர் *",
    "Enter your full name": "உங்கள் முழு பெயரை உள்ளிடவும்",
    "Mobile Number *": "மொபைல் எண் *",
    "10-digit mobile number": "10 இலக்க மொபைல் எண்",
    "Email (Optional)": "மின்னஞ்சல் (விருப்பம்)",
    "Password *": "கடவுச்சொல் *",
    "Confirm Password *": "கடவுச்சொல்லை உறுதிப்படுத்து *",
    "Next Step": "அடுத்த படி",
    "Address": "முகவரி",
    "Your address": "உங்கள் முகவரி",
    "Auto-Detect via GPS": "ஜிபிஎஸ் மூலம் தானாக கண்டறி",
    "City": "நகரம்",
    "State": "மாநிலம்",
    "Pincode": "அஞ்சல் குறியீடு",
    "Back": "பின்னால்",
    "Create Account Btn": "கணக்கை உருவாக்கு",
    "Already have an account?": "ஏற்கனவே கணக்கு உள்ளதா?",
    "Sign in": "உள்நுழைய",
    "Select Category": "வகையைத் தேர்ந்தெடு",
    "Years of Experience": "அனுபவ ஆண்டுகள்",
    "Cooperative Society (Optional)": "கூட்டுறவு சங்கம் (விருப்பம்)"
  }
};

export default function CustomerRegisterPage() {
  const router = useRouter();
  const { language, setLanguage } = useLanguage();
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const t = (text: string) => (translations[language] && translations[language][text]) ? translations[language][text] : text;
  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    email: "",
    password: "",
    confirmPassword: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    preferredLanguage: language || 'en',
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Client-side validation
  
  const handleGetLocation = async () => {
    setLocating(true);
    try {
      await Geolocation.requestPermissions();
      const position = await Geolocation.getCurrentPosition();
      
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`, {
            headers: { 'Accept-Language': 'en' }
          });
          const data = await res.json();
          if (data && data.display_name) {
            setFormData(prev => ({ ...prev, address: data.display_name, city: data.address.city || data.address.town || data.address.state_district || '', state: data.address.state || '', pincode: data.address.postcode || '' }));
          } else {
            setFormData(prev => ({ ...prev, address: `GPS Coordinates: ${lat.toFixed(4)}, ${lon.toFixed(4)}` }));
          }
        } catch (err) {
          setFormData(prev => ({ ...prev, address: `GPS Coordinates: ${lat.toFixed(4)}, ${lon.toFixed(4)}` }));
        }
  
    } catch (e) {
      console.error(e);
      alert("Failed to get location.");
    } finally {
      setLocating(false);
    }
  };

  const validateStep1 = () => {
    const errors: Record<string, string> = {};
    if (formData.name.length < 2) errors.name = "Name must be at least 2 characters";
    if (!/^[0-9]{10,15}$/.test(formData.mobile.replace(/[+\-\s]/g, ''))) errors.mobile = "Enter valid 10-digit mobile number";
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.email = "Enter a valid email";
    if (formData.password.length < 6) errors.password = "Password must be at least 6 characters";
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) errors.password = "Need uppercase, lowercase, and number";
    if (formData.password !== formData.confirmPassword) errors.confirmPassword = "Passwords do not match";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (validateStep1()) setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register/customer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Registration failed");
        if (data.errors) {
          const errs: Record<string, string> = {};
          for (const [key, val] of Object.entries(data.errors)) {
            errs[key] = (val as string[])[0];
          }
          setFieldErrors(errs);
          setStep(1);
        }
        return;
      }

      // Auto-login after registration
      const { signIn } = await import("next-auth/react");
      const result = await signIn("credentials", {
        mobile: formData.mobile,
        password: formData.password,
        role: "CUSTOMER",
        redirect: false,
      });

      if (result?.error) {
        router.push("/login");
      } else {
        router.push("/customer");
        router.refresh();
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  // Suppress unused var warning
  useEffect(() => {}, []);

  const inputClasses = "w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all";
  const errorInputClasses = "w-full pl-10 pr-4 py-3 rounded-xl bg-red-500/5 border border-red-500/30 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all";

  return (
    <div className="min-h-[100dvh] bg-gradient-to-br from-[#07070f] via-[#0f0a1e] to-[#130d24] grid place-items-center p-4 py-[max(env(safe-area-inset-top,2rem),2rem)] overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg"
      >
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
          <div className="flex flex-col items-start gap-4 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-violet-500 flex items-center justify-center shadow-[0_0_20px_rgba(139,92,246,0.3)]">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight">{t("Create Account")}</h1>
              <p className="text-sm text-gray-400">{t("Register as a customer")}</p>
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="flex gap-2 mb-8">
          <div className={`h-1.5 flex-1 rounded-full transition-all ${step >= 1 ? 'bg-amber-500' : 'bg-white/10'}`} />
          <div className={`h-1.5 flex-1 rounded-full transition-all ${step >= 2 ? 'bg-amber-500' : 'bg-white/10'}`} />
        </div>

        {error && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 p-4 mb-6 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {step === 1 && (
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
                <div>
                    <label className="text-sm font-medium text-gray-300 mb-2 block">{t('Language')}</label>
                    <div className="relative">
                      <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <select value={formData.preferredLanguage} onChange={(e) => { setFormData({ ...formData, preferredLanguage: e.target.value }); setLanguage(e.target.value as any); }}
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all appearance-none">
                        <option value="en" className="bg-slate-900">English</option>
                        <option value="hi" className="bg-slate-900">Hindi (हिंदी)</option>
                        <option value="mr" className="bg-slate-900">Marathi (मराठी)</option>
                        <option value="gu" className="bg-slate-900">Gujarati (ગુજરાતી)</option>
                        <option value="ta" className="bg-slate-900">Tamil (தமிழ்)</option>
                      </select>
                    </div>
                  </div>
              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">{t("Full Name *")}</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder={t("Enter your full name")} className={fieldErrors.name ? errorInputClasses : inputClasses} />
                </div>
                {fieldErrors.name && <p className="text-red-400 text-xs mt-1">{fieldErrors.name}</p>}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">{t("Mobile Number *")}</label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input type="tel" required value={formData.mobile} onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    placeholder={t("10-digit mobile number")} className={fieldErrors.mobile ? errorInputClasses : inputClasses} />
                </div>
                {fieldErrors.mobile && <p className="text-red-400 text-xs mt-1">{fieldErrors.mobile}</p>}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">{t("Email (Optional)")}</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="your@email.com" className={fieldErrors.email ? errorInputClasses : inputClasses} />
                </div>
                {fieldErrors.email && <p className="text-red-400 text-xs mt-1">{fieldErrors.email}</p>}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">{t("Password *")}</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input type={showPassword ? "text" : "password"} required value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Min 6 chars, uppercase, lowercase, number" className={fieldErrors.password ? errorInputClasses : inputClasses} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {fieldErrors.password && <p className="text-red-400 text-xs mt-1">{fieldErrors.password}</p>}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">{t("Confirm Password *")}</label>
                <div className="relative">
                  <CheckCircle2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input type="password" required value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    placeholder="Confirm your password" className={fieldErrors.confirmPassword ? errorInputClasses : inputClasses} />
                </div>
                {fieldErrors.confirmPassword && <p className="text-red-400 text-xs mt-1">{fieldErrors.confirmPassword}</p>}
              </div>

              <button type="button" onClick={handleNext}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-violet-500 text-white font-semibold hover:from-amber-400 hover:to-violet-400 transition-all shadow-lg shadow-amber-500/25">
                Next Step
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">{t("Address")}</label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-3 w-4 h-4 text-gray-500" />
                  <textarea value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder={t("Your address")} rows={2}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all resize-none" />
                </div>
                  <button type="button" onClick={handleGetLocation} disabled={locating} className="mt-2 w-full py-2.5 rounded-xl bg-violet-500/10 text-violet-400 font-bold border border-violet-500/30 hover:bg-violet-500/20 transition-colors flex items-center justify-center text-sm">
                    {locating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Crosshair className="w-4 h-4 mr-2" />}
                    Auto-Detect via GPS
                  </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">{t("City")}</label>
                  <input type="text" value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder={t("City")} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">{t("State")}</label>
                  <input type="text" value={formData.state} onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    placeholder={t("State")} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">{t("Pincode")}</label>
                  <input type="text" value={formData.pincode} onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                    placeholder="6-digit pincode" maxLength={6}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">Language</label>
                  <div className="relative">
                    <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <select value={formData.preferredLanguage} onChange={(e) => { setFormData({ ...formData, preferredLanguage: e.target.value }); setLanguage(e.target.value as any); }}
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all appearance-none">
                      <option value="en" className="bg-slate-900">English</option>
                      <option value="hi" className="bg-slate-900">Hindi (हिंदी)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(1)}
                  className="flex-1 py-3.5 rounded-xl border border-white/10 text-white font-semibold hover:bg-white/5 transition-all">
                  Back
                </button>
                <button type="submit" disabled={loading}
                  className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-violet-500 text-white font-semibold hover:from-amber-400 hover:to-violet-400 transition-all shadow-lg shadow-amber-500/25 disabled:opacity-50 flex items-center justify-center gap-2">
                  {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating...</> : t("Create Account")}
                </button>
              </div>
            </motion.div>
          )}
        </form>

        <p className="mt-6 text-center text-gray-400 text-sm">{t("Already have an account?")} <Link href="/login" className="text-amber-400 hover:text-teal-300 font-medium">{t("Sign in")}</Link>
        </p>
      </motion.div>
    </div>
  );
}
