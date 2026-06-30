/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Palette, Type, CheckCircle2, Image as ImageIcon, Target, RefreshCw, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useProject } from "@/context/ProjectContext";
import { fetchApi } from "@/lib/api";
import { toast } from "sonner";

export default function CreativeLabPage() {
  const router = useRouter();
  const { projectDetails, strategyData, creativeData, setCreativeData } = useProject();
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageLoaded, setImageLoaded] = useState<boolean[]>([]);
  const [imageError, setImageError] = useState<boolean[]>([]);
  const [skipStrategyCheck, setSkipStrategyCheck] = useState(false);
  const [imageUrls, setImageUrls] = useState<Record<number, string>>({});

  // Reset image states when creativeData changes
  useEffect(() => {
    if (creativeData?.image_prompts) {
      setImageLoaded(new Array(creativeData.image_prompts.length).fill(false));
      setImageError(new Array(creativeData.image_prompts.length).fill(false));
      
      // Fetch authenticated images as blobs
      creativeData.image_prompts.forEach(async (prompt: string, index: number) => {
        try {
          const response = await fetchApi(`/api/ai/proxy-image?prompt=${encodeURIComponent(prompt)}&seed=${(creativeData._seed || 0) + index}`);
          if (!response.ok) throw new Error("Image proxy failed");
          const blob = await response.blob();
          setImageUrls((prev) => ({ ...prev, [index]: URL.createObjectURL(blob) }));
        } catch (e) {
          setImageError((prev) => {
            const updated = [...prev];
            updated[index] = true;
            return updated;
          });
        }
      });
    }
  }, [creativeData?.image_prompts, creativeData?._seed]);

  useEffect(() => {
    if (projectDetails && !creativeData && !isGenerating && !error) {
      if (!strategyData && !skipStrategyCheck) {
        return;
      }
      const autoGenerate = async () => {
        setIsGenerating(true);
        setError(null);
        try {
          const response = await fetchApi("/api/ai/generate-creative", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
              product_name: projectDetails.name, 
              description: `${projectDetails.description}. Campaign goal: ${projectDetails.goal.replace("_", " ")}. Target audience: ${projectDetails.audience}.`,
              strategy_context: strategyData || null,
            }),
          });
          const data = await response.json();
          if (!response.ok) throw new Error(data.detail || "Failed to generate creative assets");
          setCreativeData(data.data);
          toast.success("Creative assets auto-generated successfully!");
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
  }, [projectDetails, creativeData, strategyData, skipStrategyCheck]);

  const handleGenerate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsGenerating(true);
    setError(null);
    setCreativeData(null);

    const formData = new FormData(e.currentTarget);
    const product_name = formData.get("product_name") as string;
    const description = formData.get("description") as string;

    try {
      const response = await fetchApi("/api/ai/generate-creative", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ product_name, description, strategy_context: strategyData || null }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.detail || "Failed to generate creative assets");
      }

      setCreativeData(data.data);
      toast.success("Creative assets generated successfully!");
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
      toast.error(err.message || "An unexpected error occurred.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegenerateImages = () => {
    if (!creativeData) return;
    setImageLoaded(new Array(creativeData.image_prompts.length).fill(false));
    setImageError(new Array(creativeData.image_prompts.length).fill(false));
    setImageUrls({}); // Clear old blobs
    setCreativeData({ ...creativeData, _seed: Date.now() });
  };

  const handleImageLoad = (index: number) => {
    setImageLoaded(prev => {
      const updated = [...prev];
      updated[index] = true;
      return updated;
    });
  };

  if (!strategyData && !skipStrategyCheck && !creativeData) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500 max-w-2xl mx-auto py-12">
        <Card className="glass-card border-white/10">
          <CardHeader className="text-center">
            <AlertCircle className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
            <CardTitle className="text-2xl text-white">Missing Strategy Data</CardTitle>
            <CardDescription className="text-base mt-2">
              Generate a Marketing Strategy first. The Creative Lab uses your strategy to tailor taglines and imagery specifically to your chosen platforms and budget.
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
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
           <Palette className="h-8 w-8 text-primary" /> Creative Lab
        </h1>
        <p className="text-muted-foreground mt-1">Generate AI-powered taglines, statements, and marketing imagery.</p>
      </div>

      <Card className="glass-card border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Product Details</CardTitle>
          <CardDescription>Tell us about what you&apos;re advertising to generate tailored assets.</CardDescription>
        </CardHeader>
        <form onSubmit={handleGenerate}>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="product_name" className="text-white">Product / Company Name</Label>
              <Input id="product_name" name="product_name" defaultValue={projectDetails?.name || ""} placeholder="e.g. AquaFlow" className="bg-black/20 border-white/10 text-white" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description" className="text-white">Context / Description</Label>
              <Textarea 
                id="description" 
                name="description" 
                defaultValue={
                  projectDetails
                    ? `${projectDetails.description}. Campaign goal: ${projectDetails.goal.replace("_", " ")}. Target audience: ${projectDetails.audience}.`
                    : ""
                }
                placeholder="e.g. A sustainable, self-cleaning water bottle for hikers and outdoor enthusiasts." 
                className="bg-black/20 border-white/10 text-white min-h-[100px]" 
                required 
              />
            </div>
          </CardContent>
          <div className="px-6 pb-6">
            <Button type="submit" disabled={isGenerating} className="w-full bg-primary hover:bg-primary/90 text-white shadow-[0_0_15px_rgba(79,70,229,0.4)] transition-all">
              {isGenerating ? (
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                  <Sparkles className="h-4 w-4" />
                </motion.div>
              ) : (
                <><Sparkles className="mr-2 h-4 w-4" /> Generate Creative Assets</>
              )}
            </Button>
          </div>
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
          <p className="text-primary font-medium animate-pulse">Brewing creative magic...</p>
        </div>
      )}

      <AnimatePresence>
        {creativeData && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="space-y-8"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Taglines */}
              <Card className="glass-card border-white/10 bg-white/5">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Type className="h-5 w-5 text-primary" /> Memorable Taglines
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-4">
                    {creativeData.taglines.map((tagline: string, index: number) => (
                      <li key={index} className="flex items-start gap-3 bg-black/20 p-3 rounded-lg border border-white/5">
                        <CheckCircle2 className="h-5 w-5 text-green-400 shrink-0 mt-0.5" />
                        <span className="text-white font-medium">{tagline}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Value Propositions */}
              <Card className="glass-card border-white/10 bg-white/5">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" /> Value Propositions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-4">
                    {creativeData.statements.map((statement: string, index: number) => (
                      <li key={index} className="flex items-start gap-3 bg-black/20 p-3 rounded-lg border border-white/5">
                        <Sparkles className="h-5 w-5 text-yellow-400 shrink-0 mt-0.5" />
                        <span className="text-white/90 text-sm leading-relaxed">{statement}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Generated Images */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-semibold text-white flex items-center gap-2">
                  <ImageIcon className="h-6 w-6 text-primary" /> Generated Marketing Imagery
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRegenerateImages}
                  className="border-white/10 text-white hover:bg-white/5 gap-2"
                >
                  <RefreshCw className="h-4 w-4" /> Regenerate Images
                </Button>
              </div>
              <p className="text-muted-foreground text-sm">
                These images are generated in real-time based on AI-crafted prompts tailored to your product.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {creativeData.image_prompts.map((prompt: string, index: number) => (
                  <Card key={index} className="glass-card border-white/10 overflow-hidden bg-black/40">
                    <div className="aspect-square relative bg-black/60 flex items-center justify-center overflow-hidden">
                      {/* Loading skeleton */}
                      {!imageLoaded[index] && !imageError[index] && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-10">
                          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                          <p className="text-xs text-muted-foreground">Generating image...</p>
                        </div>
                      )}
                      {/* Error state */}
                      {imageError[index] && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4 z-10">
                          <ImageIcon className="h-8 w-8 text-muted-foreground/50" />
                          <p className="text-xs text-muted-foreground text-center">Image generation failed. Try regenerating.</p>
                        </div>
                      )}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      {imageUrls[index] && (
                        <img 
                          src={imageUrls[index]}
                          alt={prompt}
                          className={`w-full h-full object-cover hover:scale-105 transition-all duration-500 ${imageLoaded[index] ? 'opacity-100' : 'opacity-0'}`}
                          loading="lazy"
                          onLoad={() => handleImageLoad(index)}
                        />
                      )}
                    </div>
                    <CardContent className="p-4">
                      <p className="text-xs text-muted-foreground line-clamp-3" title={prompt}>
                        <span className="font-semibold text-white/70">Prompt:</span> {prompt}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
