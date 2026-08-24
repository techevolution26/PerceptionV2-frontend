// app/components/TopicsCarousel.jsx
"use client";

import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import Image from "next/image";
import type { Topic } from "../types/models";

interface TopicsCarouselProps {
  topics?: Topic[];
  visible?: boolean;
  onSelect?: (topic: Topic) => void;
}

export default function TopicsCarousel({ topics = [], visible = true, onSelect }: TopicsCarouselProps) {
  const router = useRouter();

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="topics-carousel"
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="w-full border-b border-border-hairline px-4 py-3 md:px-6"
        >
          <div className="flex gap-4 overflow-x-auto no-scrollbar sm:gap-5">
            {topics.length === 0 ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex w-16 flex-shrink-0 flex-col items-center gap-1.5 sm:w-20">
                  <div className="h-16 w-16 animate-pulse rounded-full bg-surface-sunken sm:h-20 sm:w-20" />
                  <div className="h-2.5 w-10 animate-pulse rounded-full bg-surface-sunken" />
                </div>
              ))
            ) : (
              topics.map((topic) => (
                <div
                  key={topic.id}
                  className="flex w-16 flex-shrink-0 flex-col items-center gap-1.5 sm:w-20 md:w-24"
                >
                  <div className="relative aspect-square w-16 overflow-hidden rounded-full border border-border-hairline bg-surface-sunken transition duration-200 hover:border-accent/60 sm:w-20 md:w-24">
                    {topic.image_url ? (
                      <Image
                        src={topic.image_url}
                        alt={topic.name}
                        fill
                        sizes="96px"
                        className="object-cover"
                      />
                    ) : (
                      <div
                        className="flex h-full w-full items-center justify-center px-2 text-center font-medium text-foreground-muted"
                        style={{ fontSize: "clamp(10px, 2vw, 12px)" }}
                      >
                        {topic.name}
                      </div>
                    )}
                    <button
                      onClick={() => {
                        onSelect?.(topic);
                        router.push(`/topics/${topic.id}`);
                      }}
                      title={topic.description ?? undefined}
                      aria-label={`Open ${topic.name} topic`}
                      className="absolute inset-0 z-10 bg-transparent transition hover:bg-foreground/5"
                    />
                  </div>
                  <span
                    className="w-full truncate px-1 text-center font-medium leading-tight text-foreground-muted"
                    style={{ fontSize: "clamp(11px, 2vw, 12px)" }}
                    title={topic.name}
                  >
                    {topic.name}
                  </span>
                </div>
              ))
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
