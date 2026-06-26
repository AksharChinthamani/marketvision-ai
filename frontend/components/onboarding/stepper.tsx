"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface StepperProps {
  steps: { title: string; description: string }[];
  currentStep: number;
}

export function Stepper({ steps, currentStep }: StepperProps) {
  return (
    <div className="w-[300px] shrink-0 border-r border-white/5 bg-background/50 backdrop-blur-xl p-8 hidden md:block">
      <div className="space-y-8">
        {steps.map((step, index) => {
          const isCompleted = currentStep > index;
          const isCurrent = currentStep === index;
          
          return (
            <div key={index} className="flex gap-4 relative">
              {index !== steps.length - 1 && (
                <div 
                  className={cn(
                    "absolute left-4 top-10 bottom-[-2rem] w-[2px]",
                    isCompleted ? "bg-primary" : "bg-white/10"
                  )} 
                />
              )}
              
              <div 
                className={cn(
                  "relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                  isCompleted 
                    ? "border-primary bg-primary text-primary-foreground" 
                    : isCurrent 
                      ? "border-primary bg-background text-primary" 
                      : "border-white/20 bg-background text-muted-foreground"
                )}
              >
                {isCompleted ? <Check className="h-4 w-4" /> : <span>{index + 1}</span>}
              </div>
              
              <div className="flex flex-col">
                <span 
                  className={cn(
                    "text-sm font-semibold tracking-wide",
                    isCurrent || isCompleted ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {step.title}
                </span>
                <span className="text-sm text-muted-foreground mt-1">
                  {step.description}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
