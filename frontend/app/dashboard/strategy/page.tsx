/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, Wand2, Target, Users, ArrowRight, CheckCircle2, Megaphone, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useProject } from "@/context/ProjectContext";
import { fetchApi } from "@/lib/api";

const platformIconMap: Record<string, string> = {
  instagram: "📸",
  google: "🔍",
  twitter: "🐦",
  offline: "🪧",
  youtube: "▶️",
  facebook: "📘",
  linkedin: "💼",
  email: "📧",
  tiktok: "🎵",
};

export default function StrategyStudioPage() {
  const router = useRouter();
  const { projectDetails, competitorData, strategyData, setStrategyData } = useProject();
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDuration, setSelectedDuration] = useState("30 Days");
  const [skipCompetitorCheck, setSkipCompetitorCheck] = useState(false);

  useEffect(() => {
    if (projectDetails && !strategyData && !isGenerating && !error) {
      if (!competitorData && !skipCompetitorCheck) {
        return; // Block auto generation if no competitor data and not skipped
      }
      const autoGenerate = async () => {
        setIsGenerating(true);
        setError(null);
        try {
          const response = await fetchApi("/api/ai/generate-strategy", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
              goal: projectDetails.goal, 
              audience: projectDetails.audience, 
              budget: parseFloat(projectDetails.budget) || null, 
              duration: selectedDuration,
              competitor_data: competitorData 
            }),
          });
          const data = await response.json();
          if (!response.ok) throw new Error(data.detail || "Failed to generate strategy");
          setStrategyData(data.strategy);
        } catch (err: any) {
          setError(err.message || "An unexpected error occurred.");
        } finally {
          setIsGenerating(false);
        }
      };
      autoGenerate();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectDetails, strategyData, competitorData, skipCompetitorCheck]);

  const handleGenerate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsGenerating(true);
    setError(null);
    setStrategyData(null);
    
    const formData = new FormData(e.currentTarget);
    const goal = formData.get("goal") as string;
    const audience = formData.get("audience") as string;
    const budget = formData.get("budget") ? parseFloat(formData.get("budget") as string) : null;

    try {
      const response = await fetchApi("/api/ai/generate-strategy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          goal, 
          audience, 
          budget, 
          duration: selectedDuration,
          competitor_data: competitorData 
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.detail || "Failed to generate strategy");
      }

      setStrategyData(data.strategy);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsGenerating(false);
    }
  };

  if (!competitorData && !skipCompetitorCheck && !strategyData) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500 max-w-2xl mx-auto py-12">
        <Card className="glass-card border-white/10">
          <CardHeader className="text-center">
            <AlertCircle className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
            <CardTitle className="text-2xl text-white">Missing Competitor Data</CardTitle>
            <CardDescription className="text-base mt-2">
              Run Competitor Intelligence first for a sharper, more effective strategy. 
              Our AI uses competitor analysis to find gaps in the market and position your product to win.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row gap-4 justify-center mt-4">
            <Button 
              onClick={() => router.push("/dashboard/competitors")}
              className="bg-primary hover:bg-primary/90 text-white"
            >
              Go to Competitor Intelligence
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setSkipCompetitorCheck(true)}
              className="border-white/10 text-white hover:bg-white/5"
            >
              Generate Anyway
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
          <Wand2 className="h-8 w-8 text-primary" /> Strategy Studio
        </h1>
        <p className="text-muted-foreground mt-1">Generate AI-powered marketing strategies in seconds.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-5">
          <Card className="glass-card border-white/10 h-full">
            <CardHeader>
              <CardTitle className="text-white">Campaign Parameters</CardTitle>
              <CardDescription>Define your goals and let AI build the roadmap.</CardDescription>
            </CardHeader>
            <form onSubmit={handleGenerate}>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="goal" className="text-white">Primary Goal</Label>
                  <div className="relative">
                    <Target className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input id="goal" name="goal" defaultValue={projectDetails?.goal || ""} placeholder="e.g. Increase Q3 SaaS Signups" className="pl-9 bg-black/20 border-white/10 text-white" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="audience" className="text-white">Target Audience</Label>
                  <div className="relative">
                    <Users className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input id="audience" name="audience" defaultValue={projectDetails?.audience || ""} placeholder="e.g. Enterprise IT Managers" className="pl-9 bg-black/20 border-white/10 text-white" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="budget" className="text-white">Budget (Optional)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-muted-foreground text-sm">₹</span>
                    <Input id="budget" name="budget" type="number" defaultValue={projectDetails?.budget || ""} placeholder="50000" className="pl-9 bg-black/20 border-white/10 text-white" />
                  </div>
                </div>
                {/* Duration Button Group Selector */}
                <div className="space-y-2">
                  <Label className="text-white/80">Campaign Duration</Label>
                  <div className="flex gap-3">
                    {["30 Days", "60 Days", "90 Days"].map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setSelectedDuration(d)}
                        className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-all ${
                          selectedDuration === d
                            ? "border-primary bg-primary/20 text-white"
                            : "border-white/20 text-white/50 hover:border-white/40 hover:text-white/70"
                        }`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
                {competitorData && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                    <CheckCircle2 className="h-4 w-4 text-green-400 shrink-0" />
                    <p className="text-xs text-green-400">Competitor intelligence is available and will be used to improve this strategy.</p>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={isGenerating} className="w-full bg-primary hover:bg-primary/90 text-white shadow-[0_0_15px_rgba(79,70,229,0.4)] transition-all">
                  {isGenerating ? (
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                      <Sparkles className="h-4 w-4" />
                    </motion.div>
                  ) : (
                    <><Sparkles className="mr-2 h-4 w-4" /> Generate Strategy</>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>

        <div className="lg:col-span-7">
          <Card className="glass-card border-white/10 h-full relative overflow-hidden">
            {!strategyData && !isGenerating && !error && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 z-10 bg-black/40 backdrop-blur-sm">
                <Wand2 className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
                <h3 className="text-xl font-medium text-white mb-2">Awaiting Input</h3>
                <p className="text-muted-foreground max-w-sm">Fill out the parameters on the left and click generate to build your AI strategy.</p>
              </div>
            )}
            
            {isGenerating && (
              <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-black/40 backdrop-blur-sm">
                <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4" />
                <p className="text-primary font-medium animate-pulse">Analyzing market data & generating roadmap...</p>
              </div>
            )}

            {error && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 z-10 bg-black/40 backdrop-blur-sm">
                 <p className="text-red-400 font-medium mb-4 max-w-md">{error}</p>
                 <Button onClick={() => setError(null)} variant="outline" className="border-white/10 text-white hover:bg-white/5">Dismiss Error</Button>
              </div>
            )}

            <CardHeader>
              <CardTitle className="text-white">AI Generated Strategy</CardTitle>
              <CardDescription>Your optimized multi-channel approach.</CardDescription>
            </CardHeader>
            <CardContent>
              <AnimatePresence>
                {strategyData && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    className="space-y-6"
                  >
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-primary/10 border border-primary/20 p-4 rounded-lg">
                        <div className="text-sm text-muted-foreground mb-1">Expected ROI</div>
                        <div className="text-2xl font-bold text-white">{strategyData.expected_roi}</div>
                      </div>
                      <div className="bg-white/5 border border-white/10 p-4 rounded-lg">
                        <div className="text-sm text-muted-foreground mb-1">Est. Conversion Rate</div>
                        <div className="text-2xl font-bold text-white">{strategyData.est_conversion_rate}</div>
                      </div>
                    </div>

                    {/* Platform-specific Strategy Section */}
                    {strategyData.platforms && strategyData.platforms.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="font-semibold text-white flex items-center gap-2 border-b border-white/10 pb-2">
                          <Megaphone className="h-4 w-4 text-primary" />
                          Platform Strategy Breakdown
                        </h4>
                        <div className="space-y-3 max-h-[280px] overflow-y-auto pr-2 custom-scrollbar">
                          {strategyData.platforms.map((platform: any, index: number) => (
                            <div key={index} className="bg-white/5 border border-white/10 rounded-lg p-4 space-y-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="text-xl">{platformIconMap[platform.icon?.toLowerCase()] || "📣"}</span>
                                  <span className="font-medium text-white">{platform.name}</span>
                                </div>
                                <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium border border-primary/20">
                                  {platform.budget_allocation} of budget
                                </span>
                              </div>
                              <ul className="space-y-1.5 pl-1">
                                {platform.tactics?.map((tactic: string, tIndex: number) => (
                                  <li key={tIndex} className="flex items-start gap-2 text-xs text-muted-foreground">
                                    <CheckCircle2 className="h-3.5 w-3.5 text-green-400 shrink-0 mt-0.5" />
                                    <span>{tactic}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Execution Phases */}
                    <div className="space-y-4 max-h-[280px] overflow-y-auto pr-2 custom-scrollbar">
                      <h4 className="font-semibold text-white border-b border-white/10 pb-2">Execution Phases</h4>
                      {strategyData.phases?.map((phase: any, index: number) => (
                        <div key={index} className="space-y-3">
                          <h4 className="font-medium text-white text-sm">{phase.title}</h4>
                          <ul className="space-y-3">
                            {phase.actions?.map((action: any, aIndex: number) => (
                              <li key={aIndex} className="flex items-start gap-3">
                                <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                                <div>
                                  <p className="text-sm font-medium text-white">{action.name}</p>
                                  <p className="text-xs text-muted-foreground mt-1">{action.details}</p>
                                </div>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>

                    <Button variant="outline" className="w-full border-white/10 text-white hover:bg-white/5" onClick={() => window.location.href = '/dashboard/roadmap'}>
                      Export to Roadmap <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
