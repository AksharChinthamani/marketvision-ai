"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";

export default function SplashScreenPage() {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Timer to trigger the fade-out
    const dissolveTimer = setTimeout(() => {
      setIsVisible(false);
    }, 2500); // Wait for 2.5 seconds before dissolving

    return () => clearTimeout(dissolveTimer);
  }, []);

  useEffect(() => {
    // When the splash screen is fully dissolved, perform the routing
    if (!isVisible) {
      const redirectTimer = setTimeout(() => {
        // Check authentication
        const token = localStorage.getItem("token");
        if (token) {
          router.push("/dashboard");
        } else {
          router.push("/login");
        }
      }, 800); // Wait for the fade-out animation to finish (duration ~0.8s)

      return () => clearTimeout(redirectTimer);
    }
  }, [isVisible, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0B0F19] relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[128px] mix-blend-screen" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-[128px] mix-blend-screen" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      </div>

      <AnimatePresence>
        {isVisible && (
          <motion.div
            key="splash-logo"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="z-10 flex flex-col items-center gap-4"
          >
            <motion.div 
              initial={{ rotate: -10 }}
              animate={{ rotate: 0 }}
              transition={{ duration: 1, type: "spring", bounce: 0.5 }}
              className="bg-primary/20 p-4 rounded-2xl glow-border"
            >
              <Sparkles className="h-12 w-12 text-primary" />
            </motion.div>
            <h1 className="font-extrabold text-4xl md:text-6xl tracking-tight text-white drop-shadow-lg">
              MarketVision <span className="text-accent">AI</span>
            </h1>
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="mt-2 text-muted-foreground/80 font-medium tracking-widest uppercase text-sm"
            >
              Loading Intelligence...
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
