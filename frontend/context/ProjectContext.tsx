/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { fetchApi } from "@/lib/api";

interface ProjectDetails {
  name: string;
  description: string;
  goal: string;
  audience: string;
  budget: string;
  duration: string;
  channels?: string[];
  frugalMode?: boolean;
  language?: string;
}

interface ProjectContextType {
  projectDetails: ProjectDetails | null;
  setProjectDetails: (details: ProjectDetails) => void;
  competitorData: any;
  setCompetitorData: (data: any) => void;
  strategyData: any;
  setStrategyData: (data: any) => void;
  roadmapData: any;
  setRoadmapData: (data: any) => void;
  creativeData: any;
  setCreativeData: (data: any) => void;
  clearAllData: () => void;
  isLoaded: boolean;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

function safeLoad<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [projectDetails, setProjectDetailsState] = useState<ProjectDetails | null>(() => safeLoad<ProjectDetails>("mv_projectDetails"));
  const [competitorData, setCompetitorDataState] = useState<any>(() => safeLoad<any>("mv_competitorData"));
  const [strategyData, setStrategyDataState] = useState<any>(() => safeLoad<any>("mv_strategyData"));
  const [roadmapData, setRoadmapDataState] = useState<any>(() => safeLoad<any>("mv_roadmapData"));
  const [creativeData, setCreativeDataState] = useState<any>(() => safeLoad<any>("mv_creativeData"));
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    async function loadData() {
      const token = localStorage.getItem("token");
      if (!token) {
        setIsLoaded(true);
        return;
      }
      try {
        const response = await fetchApi("/api/project/state");
        if (response.ok) {
          const data = await response.json();
          if (data.projectDetails) setProjectDetailsState(data.projectDetails);
          if (data.competitorData) setCompetitorDataState(data.competitorData);
          if (data.strategyData) setStrategyDataState(data.strategyData);
          if (data.roadmapData) setRoadmapDataState(data.roadmapData);
          if (data.creativeData) setCreativeDataState(data.creativeData);
          
          // Sync local storage with DB to ensure no desync
          if (data.projectDetails) localStorage.setItem("mv_projectDetails", JSON.stringify(data.projectDetails));
          if (data.competitorData) localStorage.setItem("mv_competitorData", JSON.stringify(data.competitorData));
          if (data.strategyData) localStorage.setItem("mv_strategyData", JSON.stringify(data.strategyData));
          if (data.roadmapData) localStorage.setItem("mv_roadmapData", JSON.stringify(data.roadmapData));
          if (data.creativeData) localStorage.setItem("mv_creativeData", JSON.stringify(data.creativeData));
        }
      } catch (e) {
        console.error("Failed to load project state", e);
      } finally {
        setIsLoaded(true);
      }
    }
    loadData();
  }, []);

  const saveToBackend = async (payload: any) => {
    try {
      await fetchApi("/api/project/update_state", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch (e) {
      console.error("Failed to sync state to backend", e);
    }
  };

  const setProjectDetails = (details: ProjectDetails) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("mv_projectDetails", JSON.stringify(details));
    }
    setProjectDetailsState(details);
    saveToBackend({ projectDetails: details });
  };

  const setCompetitorData = (data: any) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("mv_competitorData", JSON.stringify(data));
    }
    setCompetitorDataState(data);
    saveToBackend({ competitorData: data });
  };

  const setStrategyData = (data: any) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("mv_strategyData", JSON.stringify(data));
    }
    setStrategyDataState(data);
    saveToBackend({ strategyData: data });
  };

  const setRoadmapData = (data: any) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("mv_roadmapData", JSON.stringify(data));
    }
    setRoadmapDataState(data);
    saveToBackend({ roadmapData: data });
  };

  const setCreativeData = (data: any) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("mv_creativeData", JSON.stringify(data));
    }
    setCreativeDataState(data);
    saveToBackend({ creativeData: data });
  };

  const clearAllData = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("mv_projectDetails");
      localStorage.removeItem("mv_competitorData");
      localStorage.removeItem("mv_strategyData");
      localStorage.removeItem("mv_roadmapData");
      localStorage.removeItem("mv_creativeData");
    }
    setProjectDetailsState(null);
    setCompetitorDataState(null);
    setStrategyDataState(null);
    setRoadmapDataState(null);
    setCreativeDataState(null);
  };

  return (
    <ProjectContext.Provider
      value={{
        projectDetails,
        setProjectDetails,
        competitorData,
        setCompetitorData,
        strategyData,
        setStrategyData,
        roadmapData,
        setRoadmapData,
        creativeData,
        setCreativeData,
        clearAllData,
        isLoaded,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error("useProject must be used within a ProjectProvider");
  }
  return context;
}
