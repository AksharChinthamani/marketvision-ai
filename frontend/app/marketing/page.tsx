"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play, Sparkles } from "lucide-react";

export default function MarketingPage() {
  const router = useRouter();
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-[#0B0F19]">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[128px] mix-blend-screen" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-[128px] mix-blend-screen" />
        
        {/* Simple Particle Grid - could be replaced with an actual canvas particle system later */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between p-6 lg:px-12 backdrop-blur-sm border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="bg-primary/20 p-2 rounded-lg glow-border">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <span className="font-bold text-xl tracking-tight text-white">MarketVision <span className="text-accent">AI</span></span>
        </div>
        <div className="flex gap-4 items-center">
          <Link href="/dashboard" className="text-sm font-medium text-muted-foreground hover:text-white hidden md:block transition-colors">
            Dev: Dashboard
          </Link>
          <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-white transition-colors">
            Log in
          </Link>
          <Button onClick={() => router.push('/signup')} className="bg-primary hover:bg-primary/90 text-white shadow-[0_0_15px_rgba(79,70,229,0.4)]">
            Get Started Free
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-4 pt-24 pb-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-accent text-sm font-medium mb-8"
        >
          <Sparkles className="h-4 w-4" />
          <span>Multi-Agent Marketing Orchestration</span>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-5xl md:text-7xl font-extrabold tracking-tight text-white max-w-4xl mb-6"
        >
          Your On-Demand AI <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
            Chief Marketing Officer
          </span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-xl text-muted-foreground max-w-2xl mb-10"
        >
          Real-time strategies. Multi-agent intelligence. Measurable growth. Stop guessing and let AI drive your multi-channel marketing campaigns.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <Button size="lg" onClick={() => router.push('/signup')} className="bg-primary hover:bg-primary/90 text-white px-8 h-12 text-base shadow-[0_0_20px_rgba(79,70,229,0.5)]">
            Get Started Free
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <Button size="lg" variant="outline" className="border-white/10 bg-white/5 hover:bg-white/10 text-white h-12 px-8 text-base backdrop-blur-md">
            <Play className="mr-2 h-5 w-5" />
            Watch 2-min Demo
          </Button>
        </motion.div>

        {/* Trust Logos */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="mt-24 pt-12 border-t border-white/5 w-full max-w-5xl"
        >
          <p className="text-sm font-medium text-muted-foreground mb-8">POWERING GROWTH FOR INNOVATIVE STARTUPS & BRANDS</p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
            {/* Placeholder SVG Logos */}
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-8 flex items-center gap-2 font-bold text-xl tracking-tighter text-white">
                <div className="w-8 h-8 rounded-md bg-white/20" />
                Brand {i}
              </div>
            ))}
          </div>
        </motion.div>
      </main>
    </div>
  );
}
