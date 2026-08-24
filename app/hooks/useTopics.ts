// app/hooks/useTopics.ts
"use client";
import { useState, useEffect } from "react";
import type { Topic, TopicsResponse } from "../types/models";

interface UseTopicsResult {
  topics: Topic[];
  loading: boolean;
}

export default function useTopics(): UseTopicsResult {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cached = localStorage.getItem("topicsCache");
    if (cached) {
      try {
        const parsed: Topic[] = JSON.parse(cached);
        setTopics(parsed);
        setLoading(false);
      } catch {
        localStorage.removeItem("topicsCache");
      }
    }

    fetch("/api/topics", {
      headers: { Accept: "application/json" },
    })
      .then((res) => res.json())
      .then((data: Topic[] | TopicsResponse) => {
        const list = Array.isArray(data) ? data : data.topics;
        setTopics(list);
        localStorage.setItem("topicsCache", JSON.stringify(list));
      })
      .catch((err) => console.error("Failed to fetch topics:", err))
      .finally(() => setLoading(false));
  }, []);

  return { topics, loading };
}
