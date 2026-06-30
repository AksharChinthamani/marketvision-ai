/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, Target, Activity, Users, Lightbulb, BarChart3, Plus, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useProject } from "@/context/ProjectContext";
import { useRouter } from "next/navigation";
import { fetchApi } from "@/lib/api";
import { toast } from "sonner";

export default function DashboardHomePage() {
  const { projectDetails, strategyData, competitorData, creativeData, roadmapData, clearAllData } = useProject();
  const router = useRouter();
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [isLoadingRecs, setIsLoadingRecs] = useState(true);
  const [recError, setRecError] = useState(false);

  const metrics = [
    { title: "Active Campaigns", value: "3", icon: Activity, trend: "+1 this week" },
    { title: "Total Reach", value: "124.5K", icon: Users, trend: "+12.5% vs last month" },
    { title: "Conversion Rate", value: "3.2%", icon: Target, trend: "+0.4% vs last month" },
    { title: "Avg. CPC", value: "₹14.50", icon: BarChart3, trend: "-₹2.10 vs last month" },
  ];

  const performanceData = [
    { date: "Mon", reach: 4000, conversions: 240 },
    { date: "Tue", reach: 3000, conversions: 139 },
    { date: "Wed", reach: 2000, conversions: 980 },
    { date: "Thu", reach: 2780, conversions: 390 },
    { date: "Fri", reach: 1890, conversions: 480 },
    { date: "Sat", reach: 2390, conversions: 380 },
    { date: "Sun", reach: 3490, conversions: 430 },
  ];

  const fetchRecommendations = async () => {
    setIsLoadingRecs(true);
    setRecError(false);
    try {
      const safeMetrics = metrics.map(({ title, value, trend }) => ({ title, value, trend }));
      
      const response = await fetchApi("/api/ai/generate-dashboard-recommendations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ metrics: safeMetrics, performance: performanceData }),
      });
      
      const data = await response.json();
      if (response.ok && data.data?.recommendations) {
        setRecommendations(data.data.recommendations);
      } else {
        setRecError(true);
        toast.error("Failed to generate recommendations");
      }
    } catch (err) {
      console.error("Failed to fetch recommendations", err);
      setRecError(true);
      toast.error("Failed to fetch recommendations");
    } finally {
      setIsLoadingRecs(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount

  const handleAddNewProject = () => {
    // Clear all existing project data so the user can start fresh
    clearAllData();
    localStorage.removeItem("mv_projectDetails");
    localStorage.removeItem("mv_strategyData");
    localStorage.removeItem("mv_competitorData");
    localStorage.removeItem("mv_roadmapData");
    localStorage.removeItem("mv_creativeData");
    localStorage.setItem("onboarding_complete", "false");
    router.push("/onboarding");
  };

  const featureStatuses = [
    { label: "Strategy Studio", data: strategyData },
    { label: "Competitor Intelligence", data: competitorData },
    { label: "Creative Lab", data: creativeData },
    { label: "Roadmap", data: roadmapData },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Project: <span className="text-primary">{projectDetails ? projectDetails.name : "Your Project"}</span>
          </h1>
          <p className="text-muted-foreground mt-1">Here&apos;s how your current advertising campaign is performing.</p>
        </div>
        <Button onClick={handleAddNewProject} className="bg-primary hover:bg-primary/90 text-white shadow-[0_0_15px_rgba(79,70,229,0.4)]">
          <Plus className="mr-2 h-4 w-4" /> Add New Project
        </Button>
      </div>

      {/* Project Overview Card */}
      {projectDetails && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <Card className="glass-card border-white/10 bg-white/5">
            <CardHeader>
              <CardTitle className="text-white text-lg">📋 Project Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-white/80 text-sm leading-relaxed">{projectDetails.description}</p>
              <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
                <span className="text-muted-foreground">
                  💰 Budget: <span className="text-white font-medium">₹{Number(projectDetails.budget).toLocaleString("en-IN")}</span>
                </span>
                <span className="text-muted-foreground">
                  ⏱ Timeline: <span className="text-white font-medium">{projectDetails.duration}</span>
                </span>
                <span className="text-muted-foreground">
                  🎯 Goal: <span className="text-white font-medium capitalize">{projectDetails.goal.replace("_", " ")}</span>
                </span>
                {projectDetails.audience && (
                  <span className="text-muted-foreground">
                    👥 Audience: <span className="text-white font-medium">{projectDetails.audience}</span>
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                {featureStatuses.map(({ label, data }) => (
                  <span
                    key={label}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                      data
                        ? "bg-green-500/20 text-green-400 border border-green-500/30"
                        : "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                    }`}
                  >
                    {data ? "✓" : "⏳"} {label}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, i) => (
          <motion.div
            key={metric.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
          >
            <Card className="glass-card border-white/10 hover:border-primary/50 transition-colors">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {metric.title}
                </CardTitle>
                <metric.icon className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{metric.value}</div>
                <p className="text-xs text-accent mt-1 flex items-center">
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                  {metric.trend}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Performance Graph */}
      <Card className="glass-card border-white/10">
        <CardHeader>
          <CardTitle className="text-xl text-white flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Project Performance (Last 7 Days)
          </CardTitle>
          <CardDescription>Reach vs Conversions over time to track how well your project is going.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={performanceData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorReach" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorConversions" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#0B0F19", borderColor: "rgba(255,255,255,0.1)", borderRadius: "8px" }}
                  itemStyle={{ color: "#fff" }}
                />
                <Area type="monotone" dataKey="reach" stroke="#4f46e5" fillOpacity={1} fill="url(#colorReach)" name="Total Reach" />
                <Area type="monotone" dataKey="conversions" stroke="#10b981" fillOpacity={1} fill="url(#colorConversions)" name="Conversions" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Active Roadmap */}
        <Card className="lg:col-span-2 glass-card border-white/10">
          <CardHeader>
            <CardTitle className="text-xl text-white">Active Roadmap</CardTitle>
            <CardDescription>Current initiatives and their progress.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {roadmapData && roadmapData.phases ? (
              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {roadmapData.phases.map((phase: any, index: number) => (
                  <div key={index} className="bg-white/5 border border-white/10 p-4 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-medium bg-primary/10 text-primary">
                          Phase {index + 1}
                        </span>
                        <h4 className="font-semibold text-white">{phase.phase}</h4>
                      </div>
                      <p className="text-sm text-muted-foreground">{phase.focus}</p>
                    </div>
                    <div className="md:text-right flex flex-col justify-center">
                      <div className="text-sm font-medium text-white mb-1">
                        {phase.milestones ? `${phase.milestones.length} Milestones` : 'Planning'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-white/5 border border-white/10 p-4 rounded-lg flex flex-col items-center justify-center text-center py-8">
                  <p className="text-muted-foreground mb-4">No AI roadmap generated for this project yet.</p>
                  <Button variant="outline" className="border-primary/50 text-primary hover:bg-primary/10" onClick={() => window.location.href='/dashboard/roadmap'}>
                    Generate Roadmap
                  </Button>
                </div>
              </div>
            )}
            <Button variant="outline" className="w-full mt-4 border-white/10 text-white hover:bg-white/5" onClick={() => window.location.href='/dashboard/roadmap'}>
              View Full Roadmap
            </Button>
          </CardContent>
        </Card>

        {/* AI Recommendations */}
        <Card className="glass-card border-white/10 glow-border">
          <CardHeader>
            <CardTitle className="text-xl text-white flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-accent" />
              AI Recommendations
            </CardTitle>
            <CardDescription>Insights generated from your latest data.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoadingRecs ? (
              <div className="flex flex-col items-center justify-center py-8 space-y-3">
                <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                <p className="text-sm text-muted-foreground animate-pulse">Generating insights...</p>
              </div>
            ) : recError ? (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <p className="text-sm text-red-400 mb-3">AI service error. Could not fetch recommendations.</p>
                <Button variant="outline" size="sm" onClick={fetchRecommendations} className="border-red-500/50 text-red-400 hover:bg-red-500/10">
                  Retry
                </Button>
              </div>
            ) : recommendations.length > 0 ? (
              recommendations.map((rec, idx) => (
                <div key={idx} className={idx === 0 ? "bg-primary/10 border border-primary/20 p-4 rounded-lg space-y-2" : "bg-white/5 border border-white/10 p-4 rounded-lg space-y-2"}>
                  <h4 className="font-medium text-white text-sm">{rec.title}</h4>
                  <p className="text-xs text-muted-foreground">{rec.description}</p>
                  <Button size="sm" variant={idx === 0 ? "default" : "outline"} className={idx === 0 ? "w-full mt-2 bg-primary hover:bg-primary/90 text-white" : "w-full mt-2 border-white/10 text-white hover:bg-white/5"}>
                    Apply Change
                  </Button>
                </div>
              ))
            ) : (
              <div className="text-sm text-muted-foreground text-center py-4">No recommendations available at this time.</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
