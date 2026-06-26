"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Bot, CheckCircle2, ChevronRight, ChevronLeft, Building2, Target, Settings, CheckSquare, Sparkles } from "lucide-react";
import { useProject } from "@/context/ProjectContext";

export default function OnboardingWizard() {
  const router = useRouter();
  const { setProjectDetails } = useProject();
  const [step, setStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    businessName: "",
    industry: "",
    productDesc: "",
    targetAudience: "",
    websiteUrl: "",
    objective: "",
    budget: 50000,
    duration: "30",
    festivalContext: "",
    channels: ["instagram", "google"],
    frugalMode: false,
    language: "english",
  });

  const updateFormData = (field: string, value: string | number | boolean | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const isNextDisabled = () => {
    if (step === 1) {
      return !formData.businessName || !formData.industry || !formData.productDesc || !formData.targetAudience;
    }
    if (step === 2) {
      return !formData.objective || !formData.budget || !formData.duration;
    }
    if (step === 3) {
      return formData.channels.length === 0 || !formData.language;
    }
    return false;
  };

  const handleNext = () => {
    if (step < 4 && !isNextDisabled()) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleGenerate = () => {
    setIsGenerating(true);
    
    // Save to context (also persists to localStorage via updated ProjectContext)
    setProjectDetails({
      name: formData.businessName,
      description: formData.productDesc,
      goal: formData.objective,
      audience: formData.targetAudience,
      budget: formData.budget.toString(),
      duration: `${formData.duration} days`,
      channels: formData.channels,
      frugalMode: formData.frugalMode,
      language: formData.language
    });

    // Mark onboarding as complete so login redirects correctly on next visit
    localStorage.setItem("onboarding_complete", "true");

    // Navigate to dashboard — each feature page will auto-trigger its own API call
    // via useEffect when projectDetails becomes available in context
    router.push("/dashboard");
  };

  const steps = [
    { id: 1, title: "Business Info", icon: Building2 },
    { id: 2, title: "Goals & Budget", icon: Target },
    { id: 3, title: "Preferences", icon: Settings },
    { id: 4, title: "Review", icon: CheckSquare },
  ];

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white flex flex-col md:flex-row">
      {/* Left Sidebar: Progress Stepper */}
      <div className="w-full md:w-64 lg:w-80 border-r border-white/10 bg-black/20 p-6 md:p-8 flex flex-col">
        <div className="flex items-center gap-2 mb-12">
          <Bot className="h-8 w-8 text-primary" />
          <span className="font-bold text-xl tracking-tight">MarketVision <span className="text-accent">AI</span></span>
        </div>
        
        <nav aria-label="Progress">
          <ol role="list" className="overflow-hidden">
            {steps.map((s, index) => (
              <li key={s.id} className={`relative ${index !== steps.length - 1 ? 'pb-10' : ''}`}>
                {index !== steps.length - 1 && (
                  <div className={`absolute left-4 top-4 -ml-px mt-0.5 h-full w-0.5 ${step > s.id ? 'bg-primary' : 'bg-white/10'}`} aria-hidden="true" />
                )}
                <div className="relative flex items-center group">
                  <span className="h-9 flex items-center">
                    <span className={`relative z-10 w-8 h-8 flex items-center justify-center rounded-full border-2 ${
                      step > s.id ? 'bg-primary border-primary' : step === s.id ? 'border-primary bg-[#0B0F19]' : 'border-white/20 bg-[#0B0F19]'
                    }`}>
                      {step > s.id ? (
                        <CheckCircle2 className="w-5 h-5 text-white" />
                      ) : (
                        <s.icon className={`w-4 h-4 ${step === s.id ? 'text-primary' : 'text-muted-foreground'}`} />
                      )}
                    </span>
                  </span>
                  <span className="ml-4 min-w-0 flex flex-col">
                    <span className={`text-sm font-medium ${step >= s.id ? 'text-white' : 'text-muted-foreground'}`}>{s.title}</span>
                  </span>
                </div>
              </li>
            ))}
          </ol>
        </nav>
      </div>

      {/* Center: Main Form Content */}
      <div className="flex-1 flex flex-col relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[150px] mix-blend-screen" />
        </div>

        <div className="flex-1 p-6 md:p-12 overflow-y-auto z-10">
          <div className="max-w-2xl mx-auto w-full h-full flex flex-col">
            
            {isGenerating ? (
              <div className="flex-1 flex flex-col items-center justify-center space-y-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
                  <Bot className="w-20 h-20 text-primary relative z-10 animate-bounce" />
                </div>
                <h2 className="text-3xl font-bold text-center text-gradient">Generating Your AI Marketing Plan</h2>
                <p className="text-muted-foreground text-center max-w-md">
                  Analyzing your business context, aligning goals, and orchestrating multi-agent strategies...
                </p>
                <div className="w-full max-w-xs mt-4">
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-primary"
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 3, ease: "linear" }}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={step}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="flex-1"
                  >
                    {/* Step 1: Business Info */}
                    {step === 1 && (
                      <div className="space-y-6">
                        <div>
                          <h2 className="text-3xl font-bold mb-2">Tell us about your business</h2>
                          <p className="text-muted-foreground">This helps our AI understand your market positioning.</p>
                        </div>
                        <div className="space-y-4">
                          <div className="grid gap-2">
                            <Label htmlFor="businessName">Company Name</Label>
                            <Input id="businessName" value={formData.businessName} onChange={(e) => updateFormData("businessName", e.target.value)} placeholder="Acme Corp" className="bg-white/5 border-white/10" />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                              <Label htmlFor="industry">Industry/Niche</Label>
                              <Input id="industry" value={formData.industry} onChange={(e) => updateFormData("industry", e.target.value)} placeholder="e.g. SaaS, E-commerce" className="bg-white/5 border-white/10" />
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="websiteUrl">Website URL</Label>
                              <Input id="websiteUrl" value={formData.websiteUrl} onChange={(e) => updateFormData("websiteUrl", e.target.value)} placeholder="https://..." className="bg-white/5 border-white/10" />
                            </div>
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="productDesc">Product Description</Label>
                            <Input id="productDesc" value={formData.productDesc} onChange={(e) => updateFormData("productDesc", e.target.value)} placeholder="What do you sell?" className="bg-white/5 border-white/10" />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="targetAudience">Target Audience</Label>
                            <Input id="targetAudience" value={formData.targetAudience} onChange={(e) => updateFormData("targetAudience", e.target.value)} placeholder="Who are your customers?" className="bg-white/5 border-white/10" />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Step 2: Goals & Budget */}
                    {step === 2 && (
                      <div className="space-y-6">
                        <div>
                          <h2 className="text-3xl font-bold mb-2">Define your targets</h2>
                          <p className="text-muted-foreground">What are we trying to achieve with this campaign?</p>
                        </div>
                        <div className="space-y-6">
                          <div className="grid gap-2">
                            <Label>Primary Objective</Label>
                            <select 
                              value={formData.objective} 
                              onChange={(e) => updateFormData("objective", e.target.value)}
                              className="flex h-10 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                            >
                              <option value="" disabled>Select an objective</option>
                              <option value="lead_gen">Lead Generation</option>
                              <option value="brand_awareness">Brand Awareness</option>
                              <option value="sales">Direct Sales / Conversions</option>
                              <option value="app_installs">App Installs</option>
                            </select>
                          </div>
                          <div className="grid gap-4">
                            <div className="flex justify-between">
                              <Label>Monthly Budget (₹)</Label>
                              <span className="text-primary font-bold">₹{formData.budget.toLocaleString('en-IN')}</span>
                            </div>
                            <Slider 
                              value={[formData.budget]} 
                              onValueChange={(val) => updateFormData("budget", Array.isArray(val) ? val[0] : val)} 
                              max={1000000} 
                              step={10000} 
                              className="py-4" 
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label>Duration</Label>
                            <div className="flex gap-4">
                              {["15", "30", "60", "90"].map((days) => (
                                <Button 
                                  key={days} 
                                  variant={formData.duration === days ? "default" : "outline"}
                                  onClick={() => updateFormData("duration", days)}
                                  className={formData.duration === days ? "bg-primary" : "border-white/10 bg-white/5"}
                                >
                                  {days} Days
                                </Button>
                              ))}
                            </div>
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="festivalContext">Festival/Season Context (Optional)</Label>
                            <Input id="festivalContext" value={formData.festivalContext} onChange={(e) => updateFormData("festivalContext", e.target.value)} placeholder="e.g. Diwali Sale, Summer Collection" className="bg-white/5 border-white/10" />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Step 3: Preferences */}
                    {step === 3 && (
                      <div className="space-y-6">
                        <div>
                          <h2 className="text-3xl font-bold mb-2">Campaign Preferences</h2>
                          <p className="text-muted-foreground">Fine-tune how the AI executes your strategy.</p>
                        </div>
                        <div className="space-y-8">
                          <div className="grid gap-4">
                            <Label>Preferred Channels</Label>
                            <div className="grid grid-cols-2 gap-4">
                              {["instagram", "facebook", "google", "linkedin", "twitter", "email", "whatsapp"].map((channel) => (
                                <Card 
                                  key={channel}
                                  className={`cursor-pointer transition-all ${formData.channels.includes(channel) ? "border-primary bg-primary/10" : "border-white/10 bg-white/5"}`}
                                  onClick={() => {
                                    const newChannels = formData.channels.includes(channel) 
                                      ? formData.channels.filter(c => c !== channel)
                                      : [...formData.channels, channel];
                                    updateFormData("channels", newChannels);
                                  }}
                                >
                                  <CardContent className="p-4 flex items-center justify-between">
                                    <span className="capitalize">{channel}</span>
                                    {formData.channels.includes(channel) && <CheckCircle2 className="w-5 h-5 text-primary" />}
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between p-4 border border-white/10 rounded-lg bg-white/5">
                            <div className="space-y-0.5">
                              <Label className="text-base">Frugal Mode</Label>
                              <p className="text-sm text-muted-foreground">Maximize ROI on low budgets. Prioritizes organic & low-CPC channels.</p>
                            </div>
                            <Switch checked={formData.frugalMode} onCheckedChange={(val) => updateFormData("frugalMode", val)} />
                          </div>

                          <div className="grid gap-2">
                            <Label>Primary Language</Label>
                            <select 
                              value={formData.language} 
                              onChange={(e) => updateFormData("language", e.target.value)}
                              className="flex h-10 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                            >
                              <option value="english">English</option>
                              <option value="hindi">Hindi</option>
                              <option value="telugu">Telugu</option>
                              <option value="tamil">Tamil</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Step 4: Review */}
                    {step === 4 && (
                      <div className="space-y-6">
                        <div>
                          <h2 className="text-3xl font-bold mb-2">Review & Generate</h2>
                          <p className="text-muted-foreground">Our AI is ready to orchestrate your campaign.</p>
                        </div>
                        
                        <div className="space-y-4">
                          <div className="p-6 rounded-xl border border-white/10 bg-white/5 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <span className="text-sm text-muted-foreground">Business Name</span>
                                <p className="font-medium">{formData.businessName || "Not provided"}</p>
                              </div>
                              <div>
                                <span className="text-sm text-muted-foreground">Industry</span>
                                <p className="font-medium">{formData.industry || "Not provided"}</p>
                              </div>
                              <div className="col-span-2">
                                <span className="text-sm text-muted-foreground">Product Description</span>
                                <p className="font-medium">{formData.productDesc || "Not provided"}</p>
                              </div>
                              <div className="col-span-2">
                                <span className="text-sm text-muted-foreground">Target Audience</span>
                                <p className="font-medium">{formData.targetAudience || "Not provided"}</p>
                              </div>
                              <div>
                                <span className="text-sm text-muted-foreground">Objective</span>
                                <p className="font-medium capitalize">{formData.objective.replace('_', ' ') || "Not provided"}</p>
                              </div>
                              <div>
                                <span className="text-sm text-muted-foreground">Language</span>
                                <p className="font-medium capitalize">{formData.language || "Not provided"}</p>
                              </div>
                              <div>
                                <span className="text-sm text-muted-foreground">Budget</span>
                                <p className="font-medium text-primary">₹{formData.budget.toLocaleString('en-IN')} / {formData.duration} Days</p>
                              </div>
                              <div>
                                <span className="text-sm text-muted-foreground">Channels</span>
                                <p className="font-medium capitalize">{formData.channels.join(", ") || "None selected"}</p>
                              </div>
                            </div>
                            {formData.frugalMode && (
                              <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-400">
                                <CheckCircle2 className="w-3 h-3 mr-1" /> Frugal Mode Active
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>

                {/* Navigation Buttons */}
                <div className="flex justify-between mt-12 pt-6 border-t border-white/10">
                  <Button
                    variant="outline"
                    onClick={handleBack}
                    disabled={step === 1}
                    className="border-white/10 bg-transparent text-white hover:bg-white/5"
                  >
                    <ChevronLeft className="mr-2 h-4 w-4" /> Back
                  </Button>
                  
                  {step < 4 ? (
                    <Button onClick={handleNext} disabled={isNextDisabled()} className="bg-primary hover:bg-primary/90 text-white shadow-[0_0_15px_rgba(79,70,229,0.4)] disabled:opacity-50 disabled:cursor-not-allowed">
                      Next <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  ) : (
                    <Button onClick={handleGenerate} className="bg-primary hover:bg-primary/90 text-white glow-border">
                      <Sparkles className="mr-2 h-4 w-4" /> Let AI Analyze My Business
                    </Button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
