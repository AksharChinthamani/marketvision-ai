/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Target, TrendingUp, AlertCircle, Zap, Package, DollarSign, Swords, Trophy, ShieldAlert, Lightbulb } from "lucide-react";
import { motion } from "framer-motion";
import { useProject } from "@/context/ProjectContext";
import { fetchApi } from "@/lib/api";
import { toast } from "sonner";
const defaultMarketShareData = [
  { name: "Jan", "You": 24, "Competitor A": 32, "Competitor B": 18 },
  { name: "Feb", "You": 26, "Competitor A": 30, "Competitor B": 19 },
  { name: "Mar", "You": 29, "Competitor A": 28, "Competitor B": 20 },
  { name: "Apr", "You": 33, "Competitor A": 27, "Competitor B": 22 },
  { name: "May", "You": 35, "Competitor A": 26, "Competitor B": 24 },
];

const defaultSentimentData = [
  { name: "Competitor A", positive: 45, neutral: 35, negative: 20 },
  { name: "Competitor B", positive: 60, neutral: 25, negative: 15 },
];

export default function CompetitorsPage() {
  const { projectDetails, competitorData: analysisData, setCompetitorData: setAnalysisData } = useProject();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (projectDetails && !analysisData && !isAnalyzing && !error) {
      const autoAnalyze = async () => {
        setIsAnalyzing(true);
        setError(null);
        try {
          const response = await fetchApi("/api/ai/analyze-competitors", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            // Use description (product details) not name (business name) for accurate competitor analysis
            body: JSON.stringify({ product: projectDetails.description, budget: projectDetails.budget }),
          });
          const data = await response.json();
          if (!response.ok) throw new Error(data.detail || "Failed to generate competitor analysis");
          setAnalysisData(data.data);
          toast.success("Competitor analysis auto-generated successfully!");
        } catch (err: any) {
          setError(err.message || "An unexpected error occurred.");
          toast.error(err.message || "An unexpected error occurred.");
        } finally {
          setIsAnalyzing(false);
        }
      };
      autoAnalyze();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectDetails, analysisData]);

  const handleAnalyze = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsAnalyzing(true);
    setError(null);
    setAnalysisData(null);

    const formData = new FormData(e.currentTarget);
    const product = formData.get("product") as string;
    const budget = formData.get("budget") as string;

    try {
      const response = await fetchApi("/api/ai/analyze-competitors", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ product, budget }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.detail || "Failed to generate competitor analysis");
      }

      setAnalysisData(data.data);
      toast.success("Competitor analysis generated successfully!");
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
      toast.error(err.message || "An unexpected error occurred.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const marketShareData = analysisData?.market_share_trend || defaultMarketShareData;
  const sentimentData = analysisData?.sentiment || defaultSentimentData;
  
  // Extract dynamic keys for LineChart lines (ignoring 'name' and 'You')
  const competitorKeys = marketShareData.length > 0 
    ? Object.keys(marketShareData[0]).filter(k => k !== 'name' && k !== 'You')
    : ["Competitor A", "Competitor B"];

  const colors = ["#94a3b8", "#f43f5e", "#10b981", "#fbbf24", "#a855f7"];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
           Competitor Intelligence
        </h1>
        <p className="text-muted-foreground mt-1">Real-time analysis of your market landscape based on your product and budget.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-12">
          <Card className="glass-card border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Analysis Parameters</CardTitle>
              <CardDescription>Enter your product description and marketing budget to find real competitors in your bracket.</CardDescription>
            </CardHeader>
            <form onSubmit={handleAnalyze} className="flex flex-col md:flex-row gap-4 px-6 pb-6">
              <div className="flex-1 space-y-2">
                <Label htmlFor="product" className="text-white">Product Description</Label>
                <div className="relative">
                  <Package className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  {/* Use description (what the product is) for accurate competitor analysis */}
                  <Input id="product" name="product" defaultValue={projectDetails?.description || ""} placeholder="e.g. Stainless Steel Water Bottle for outdoor enthusiasts" className="pl-9 bg-black/20 border-white/10 text-white" required />
                </div>
              </div>
              <div className="flex-1 space-y-2">
                <Label htmlFor="budget" className="text-white">Marketing Budget</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input id="budget" name="budget" defaultValue={projectDetails?.budget || ""} placeholder="e.g. 10k" className="pl-9 bg-black/20 border-white/10 text-white" required />
                </div>
              </div>
              <div className="flex items-end">
                <Button type="submit" disabled={isAnalyzing} className="w-full md:w-auto bg-primary hover:bg-primary/90 text-white shadow-[0_0_15px_rgba(79,70,229,0.4)] transition-all">
                  {isAnalyzing ? (
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                      <Zap className="h-4 w-4" />
                    </motion.div>
                  ) : (
                    <><Zap className="mr-2 h-4 w-4" /> Run Deep Analysis</>
                  )}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>

      {error && (
        <Card className="bg-red-500/10 border-red-500/50">
           <CardContent className="p-4 text-center">
             <p className="text-red-400 font-medium">{error}</p>
           </CardContent>
        </Card>
      )}

      {/* Metrics Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
        {isAnalyzing && (
          <div className="absolute inset-0 z-10 bg-background/50 backdrop-blur-sm rounded-xl flex items-center justify-center">
             <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        )}
        <Card className="glass-card border-white/10">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Est. Market Share Growth</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{analysisData?.metrics?.market_share_growth || "+11%"}</div>
            <p className="text-xs text-accent mt-1">Projected with current strategy</p>
          </CardContent>
        </Card>
        <Card className="glass-card border-white/10">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Threat Level</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{analysisData?.metrics?.threat_level || "Moderate"}</div>
            <p className="text-xs text-muted-foreground mt-1">Based on competitor activity</p>
          </CardContent>
        </Card>
        <Card className="glass-card border-white/10">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Win Rate vs Direct Competitors</CardTitle>
            <Target className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{analysisData?.metrics?.win_rate || "68%"}</div>
            <p className="text-xs text-muted-foreground mt-1">Estimated conversion edge</p>
          </CardContent>
        </Card>
      </div>

      {/* Strategy Comparison Section */}
      {analysisData?.comparison && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <h3 className="text-2xl font-semibold text-white flex items-center gap-2">
            <Swords className="h-6 w-6 text-primary" /> Strategy Comparison
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Your Advantage */}
            <Card className="glass-card border-green-500/30 bg-green-500/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-green-400 text-sm flex items-center gap-2">
                  <Trophy className="h-4 w-4" /> Your Advantage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-white/80 leading-relaxed">{analysisData.comparison.your_advantage}</p>
              </CardContent>
            </Card>
            {/* Competitor Advantage */}
            <Card className="glass-card border-red-500/30 bg-red-500/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-red-400 text-sm flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4" /> Competitor Advantage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-white/80 leading-relaxed">{analysisData.comparison.competitor_advantage}</p>
              </CardContent>
            </Card>
            {/* Recommendation */}
            <Card className="glass-card border-blue-500/30 bg-blue-500/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-blue-400 text-sm flex items-center gap-2">
                  <Lightbulb className="h-4 w-4" /> Recommendation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-white/80 leading-relaxed font-medium">{analysisData.comparison.recommendation}</p>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      )}

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative">
        {isAnalyzing && (
          <div className="absolute inset-0 z-10 bg-background/50 backdrop-blur-sm rounded-xl flex items-center justify-center">
          </div>
        )}
        <Card className="glass-card border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Market Share Trend</CardTitle>
            <CardDescription>6-month trailing comparison</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={marketShareData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                <XAxis dataKey="name" stroke="#a1a1aa" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#a1a1aa" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0B0F19', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
                <Line type="monotone" dataKey="You" stroke="#4f46e5" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                {competitorKeys.map((key, i) => (
                  <Line key={key} type="monotone" dataKey={key} stroke={colors[i % colors.length]} strokeWidth={2} dot={false} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Brand Sentiment Analysis</CardTitle>
            <CardDescription>AI-driven sentiment from social channels</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sentimentData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" horizontal={false} />
                <XAxis type="number" stroke="#a1a1aa" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis dataKey="name" type="category" stroke="#a1a1aa" fontSize={12} tickLine={false} axisLine={false} width={100} />
                <Tooltip contentStyle={{ backgroundColor: '#0B0F19', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
                <Bar dataKey="positive" stackId="a" fill="#22c55e" radius={[0, 0, 0, 0]} />
                <Bar dataKey="neutral" stackId="a" fill="#64748b" />
                <Bar dataKey="negative" stackId="a" fill="#ef4444" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Competitor Profiles Section */}
      {analysisData && analysisData.competitors && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 pb-12">
          <h3 className="text-2xl font-semibold text-white">Competitor Deep Dive</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {analysisData.competitors.map((comp: any, idx: number) => (
              <Card key={idx} className="glass-card border-white/10 bg-white/5">
                <CardHeader>
                  <CardTitle className="text-white text-xl">{comp.name}</CardTitle>
                  <CardDescription className="text-muted-foreground">{comp.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-green-400 mb-2">Strengths</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      {comp.strengths.map((s: string, i: number) => <li key={i} className="text-sm text-white/80">{s}</li>)}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-red-400 mb-2">Weaknesses</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      {comp.weaknesses.map((w: string, i: number) => <li key={i} className="text-sm text-white/80">{w}</li>)}
                    </ul>
                  </div>
                  <div className="bg-black/30 p-4 rounded-lg mt-4 border border-white/5">
                    <h4 className="text-sm font-medium text-white mb-2">Estimated Strategy</h4>
                    <p className="text-sm text-muted-foreground">{comp.strategy}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
