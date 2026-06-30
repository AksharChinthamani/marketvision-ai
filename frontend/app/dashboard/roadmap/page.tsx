/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, Clock, CheckCircle2, PlayCircle, MoreHorizontal, Target, Rocket, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useProject } from "@/context/ProjectContext";
import { fetchApi } from "@/lib/api";
import { toast } from "sonner";

const activeCampaigns = [
  { id: 1, name: "Q3 Enterprise SaaS Launch", status: "Active", progress: 65, duration: "Jul 1 - Sep 30", type: "Multi-channel" },
  { id: 2, name: "Retargeting Flow Optimization", status: "Planning", progress: 25, duration: "Aug 15 - Ongoing", type: "Email & Display" },
  { id: 3, name: "Webinar Series: AI in Tech", status: "Active", progress: 80, duration: "Jun 1 - Aug 30", type: "Content" },
];

export default function RoadmapPage() {
  const router = useRouter();
  const { projectDetails, strategyData, roadmapData, setRoadmapData } = useProject();
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [skipStrategyCheck, setSkipStrategyCheck] = useState(false);

  useEffect(() => {
    if (projectDetails && !roadmapData && !isGenerating && !error) {
      if (!strategyData && !skipStrategyCheck) {
        return;
      }
      const autoGenerate = async () => {
        setIsGenerating(true);
        setError(null);
        try {
          const response = await fetchApi("/api/ai/generate-roadmap", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ campaign_name: projectDetails.name, goal: projectDetails.goal, strategy_data: strategyData }),
          });
          const data = await response.json();
          if (!response.ok) throw new Error(data.detail || "Failed to generate campaign roadmap");
          setRoadmapData(data.data);
          
          await fetchApi("/api/dashboard/campaigns", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title: projectDetails.name || "Auto Generated Campaign",
              status: "active",
              progress: 0,
            }),
          });
          toast.success("Roadmap auto-generated successfully!");
        } catch (err: any) {
          setError(err.message || "An unexpected error occurred.");
          toast.error(err.message || "An unexpected error occurred.");
        } finally {
          setIsGenerating(false);
        }
      };
      autoGenerate();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectDetails, roadmapData, strategyData, skipStrategyCheck]);

  const handleGenerate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsGenerating(true);
    setError(null);
    setRoadmapData(null);

    const formData = new FormData(e.currentTarget);
    const campaign_name = formData.get("campaign_name") as string;
    const goal = formData.get("goal") as string;

    try {
      const response = await fetchApi("/api/ai/generate-roadmap", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ campaign_name, goal, strategy_data: strategyData }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.detail || "Failed to generate campaign roadmap");
      }

      setRoadmapData(data.data);
      
      // Save campaign
      await fetchApi("/api/dashboard/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: campaign_name,
          status: "active",
          progress: 0,
        }),
      });
      
      toast.success("Roadmap generated successfully!");
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
      toast.error(err.message || "An unexpected error occurred.");
    } finally {
      setIsGenerating(false);
    }
  };

  if (!strategyData && !skipStrategyCheck && !roadmapData) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500 max-w-2xl mx-auto py-12">
        <Card className="glass-card border-white/10">
          <CardHeader className="text-center">
            <AlertCircle className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
            <CardTitle className="text-2xl text-white">Missing Strategy Data</CardTitle>
            <CardDescription className="text-base mt-2">
              Generate a Marketing Strategy first. A roadmap needs a clear strategy to be effective.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row gap-4 justify-center mt-4">
            <Button 
              onClick={() => router.push("/dashboard/strategy")}
              className="bg-primary hover:bg-primary/90 text-white"
            >
              Go to Strategy Studio
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setSkipStrategyCheck(true)}
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
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
            <Calendar className="h-8 w-8 text-primary" /> Campaign Roadmap
          </h1>
          <p className="text-muted-foreground mt-1">Plan and manage your 30-60-90 day marketing initiatives.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          <Card className="glass-card border-white/10">
            <CardHeader>
              <CardTitle className="text-white">AI Roadmap Planner</CardTitle>
              <CardDescription>Generate a structured 30-60-90 day execution plan.</CardDescription>
            </CardHeader>
            <form onSubmit={handleGenerate} className="px-6 pb-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="campaign_name" className="text-white">Campaign Name</Label>
                <div className="relative">
                  <Target className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input id="campaign_name" name="campaign_name" defaultValue={projectDetails?.name || ""} placeholder="e.g. Q4 Holiday Sale" className="pl-9 bg-black/20 border-white/10 text-white" required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="goal" className="text-white">Campaign Goal</Label>
                <div className="relative">
                  <Rocket className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input id="goal" name="goal" defaultValue={projectDetails?.goal || ""} placeholder="e.g. Acquire 500 new active users" className="pl-9 bg-black/20 border-white/10 text-white" required />
                </div>
              </div>
              <Button type="submit" disabled={isGenerating} className="w-full bg-primary hover:bg-primary/90 text-white shadow-[0_0_15px_rgba(79,70,229,0.4)] transition-all">
                {isGenerating ? (
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                    <Calendar className="h-4 w-4" />
                  </motion.div>
                ) : (
                  <><Calendar className="mr-2 h-4 w-4" /> Generate 30-60-90 Roadmap</>
                )}
              </Button>
            </form>
          </Card>

          {error && (
            <Card className="bg-red-500/10 border-red-500/50">
               <CardContent className="p-4 text-center">
                 <p className="text-red-400 font-medium">{error}</p>
               </CardContent>
            </Card>
          )}

          {isGenerating && (
            <div className="py-12 flex flex-col items-center justify-center space-y-4">
              <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
              <p className="text-primary font-medium animate-pulse">Structuring your timeline...</p>
            </div>
          )}
          
          <AnimatePresence>
            {roadmapData && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                 {roadmapData.phases?.map((phase: any, index: number) => (
                    <Card key={index} className="glass-card border-white/10 bg-white/5">
                      <CardHeader className="pb-3 border-b border-white/10">
                        <div className="flex items-center gap-2 text-primary">
                          <Clock className="h-5 w-5" />
                          <CardTitle className="text-lg text-white">{phase.phase}</CardTitle>
                        </div>
                        <p className="text-sm text-white/80 font-medium mt-1">Focus: {phase.focus}</p>
                      </CardHeader>
                      <CardContent className="pt-4 space-y-4">
                        <ul className="space-y-2">
                           {phase.milestones?.map((milestone: string, mIdx: number) => (
                              <li key={mIdx} className="flex items-start gap-2 text-sm text-white/90">
                                <CheckCircle2 className="h-4 w-4 text-green-400 mt-0.5 shrink-0" />
                                <span>{milestone}</span>
                              </li>
                           ))}
                        </ul>
                        <div className="p-3 bg-black/20 rounded-md border border-white/5 text-sm text-muted-foreground">
                          {phase.explanation}
                        </div>
                      </CardContent>
                    </Card>
                 ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <Card className="glass-card border-white/10 mt-12">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-white">Active Initiatives Overview</CardTitle>
            <CardDescription>Quick glance at ongoing campaign progress.</CardDescription>
          </div>
          <Button variant="outline" className="border-white/10 text-white hover:bg-white/10">
            View All
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activeCampaigns.map((campaign) => (
              <div key={campaign.id} className="group flex flex-col md:flex-row md:items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 hover:border-primary/50 transition-colors gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {campaign.status === "Completed" ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : campaign.status === "Active" ? (
                      <PlayCircle className="h-4 w-4 text-primary" />
                    ) : (
                      <Clock className="h-4 w-4 text-yellow-500" />
                    )}
                    <h3 className="font-semibold text-white">{campaign.name}</h3>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-medium ${
                      campaign.status === "Completed" ? "bg-green-500/10 text-green-500" :
                      campaign.status === "Active" ? "bg-primary/10 text-primary" :
                      "bg-yellow-500/10 text-yellow-500"
                    }`}>
                      {campaign.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {campaign.duration}</span>
                    <span className="px-1.5 py-0.5 bg-white/5 rounded">{campaign.type}</span>
                  </div>
                </div>
                
                <div className="flex-[0.5] min-w-[200px]">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="text-white font-medium">{campaign.progress}%</span>
                  </div>
                  <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${
                        campaign.progress === 100 ? "bg-green-500" : "bg-primary"
                      }`}
                      style={{ width: `${campaign.progress}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-white hover:bg-white/10 rounded-full">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
