"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, ThumbsUp, ThumbsDown, Minus, TrendingUp } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from "recharts";

const sentimentData = [
  { name: "Positive", value: 65, color: "#22c55e" },
  { name: "Neutral", value: 20, color: "#64748b" },
  { name: "Negative", value: 15, color: "#ef4444" },
];

const feedbackItems = [
  { id: 1, text: "The new analytics dashboard is incredibly fast and intuitive. Saved our team hours.", sentiment: "positive", source: "Twitter" },
  { id: 2, text: "Still waiting for the API docs to be updated. It's blocking our integration.", sentiment: "negative", source: "Support Ticket" },
  { id: 3, text: "Pricing seems fair, but I wish there was a mid-tier option between Pro and Enterprise.", sentiment: "neutral", source: "G2 Review" },
  { id: 4, text: "Best customer support I've ever experienced. Resolved my issue in 5 minutes!", sentiment: "positive", source: "Email" },
];

export default function VoCPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
            <MessageSquare className="h-8 w-8 text-primary" /> Voice of Customer
          </h1>
          <p className="text-muted-foreground mt-1">AI-aggregated customer sentiment and feedback.</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 text-white">
          Generate Insights Report
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="glass-card border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Overall Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">8.4<span className="text-sm text-muted-foreground font-normal">/10</span></div>
            <p className="text-xs text-green-500 mt-1 flex items-center"><TrendingUp className="h-3 w-3 mr-1" /> +0.2 from last month</p>
          </CardContent>
        </Card>
        <Card className="glass-card border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Mentions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">1,248</div>
            <p className="text-xs text-green-500 mt-1 flex items-center"><TrendingUp className="h-3 w-3 mr-1" /> +12% from last month</p>
          </CardContent>
        </Card>
        <Card className="glass-card border-white/10 md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Top Keyword Extract</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 mt-2">
              <span className="bg-primary/20 text-primary px-3 py-1 rounded-full text-sm font-medium">Fast (142)</span>
              <span className="bg-white/10 text-white px-3 py-1 rounded-full text-sm font-medium">Integration (89)</span>
              <span className="bg-red-500/20 text-red-500 px-3 py-1 rounded-full text-sm font-medium">Docs (45)</span>
              <span className="bg-white/10 text-white px-3 py-1 rounded-full text-sm font-medium">Pricing (32)</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="glass-card border-white/10 lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-white">Sentiment Distribution</CardTitle>
            <CardDescription>Based on 1,248 recent interactions</CardDescription>
          </CardHeader>
          <CardContent className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sentimentData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {sentimentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#0B0F19', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/10 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-white">Recent Feedback Stream</CardTitle>
            <CardDescription>Real-time mentions from across the web</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {feedbackItems.map((item) => (
                <div key={item.id} className="p-4 rounded-xl bg-white/5 border border-white/10 flex gap-4 items-start">
                  <div className="mt-1">
                    {item.sentiment === "positive" ? <ThumbsUp className="h-5 w-5 text-green-500" /> :
                     item.sentiment === "negative" ? <ThumbsDown className="h-5 w-5 text-red-500" /> :
                     <Minus className="h-5 w-5 text-slate-400" />}
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm text-white leading-relaxed">&quot;{item.text}&quot;</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs font-medium px-2 py-0.5 bg-white/10 rounded-md text-muted-foreground">{item.source}</span>
                      <span className="text-xs text-muted-foreground">2 hours ago</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="ghost" className="w-full mt-4 text-muted-foreground hover:text-white hover:bg-white/5">
              View All Feedback
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
