"use client";
import { useEffect, useState } from "react";
import NewPerceptionForm from "../components/NewPerceptionForm";
import PerceptionCard from "../components/PerceptionCard";
import Card from "../components/ui/Card";
import type { Topic, Perception } from "../types/models";

export default function PerceptionsPage() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [perceptions, setPerceptions] = useState<Perception[]>([]);
  const [loading, setLoading] = useState(true);
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const res1 = await fetch("/api/topics", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTopics(await res1.json());

      const res2 = await fetch("/api/perceptions", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPerceptions(await res2.json());
      setLoading(false);
    }

    fetchData();
  }, [token]);

  const addPerception = (p: Perception) => setPerceptions([p, ...perceptions]);

  return (
    <main className="mx-auto max-w-2xl space-y-6 p-4 sm:p-6">
      <h1 className="text-xl font-semibold tracking-tight text-foreground">All perceptions</h1>

      <Card className="p-5">
        <NewPerceptionForm topics={topics} onSuccess={addPerception} />
      </Card>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-card bg-surface-sunken" />
          ))}
        </div>
      ) : (
        <ul className="space-y-4">
          {perceptions.map((p) => (
            <li key={p.id}>
              <PerceptionCard perception={p} />
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
