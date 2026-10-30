"use client";

import React from "react";
import { ProjectDetail } from "@/types";
import { GitCommit, Tag, Clock, Rocket, Calendar } from "lucide-react";

interface TimelineProps {
  project: ProjectDetail;
}

export function TimelineView({ project }: TimelineProps) {
  const commits = project.repoSnapshot?.commits || [];
  const releases = project.repoSnapshot?.releases || [];

  // Merge commits and releases into a single unified timeline
  const events = [
    ...releases.map((r) => ({
      type: "release" as const,
      date: new Date(r.publishedAt).getTime(),
      title: r.name || r.tagName,
      desc: r.body,
      tag: r.tagName,
      url: r.url,
    })),
    ...commits.map((c) => ({
      type: "commit" as const,
      date: new Date(c.date).getTime(),
      title: c.message,
      desc: `Committed by ${c.author} (${c.shortSha})`,
      tag: c.shortSha,
      url: c.url,
    })),
  ].sort((a, b) => b.date - a.date);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-vault-border space-y-2">
        <div className="flex items-center gap-2 text-vault-accent">
          <Clock className="w-5 h-5" />
          <h3 className="font-display font-bold text-lg text-white">Chronological Engineering Timeline</h3>
        </div>
        <p className="text-xs sm:text-sm text-vault-muted leading-relaxed font-sans">
          Audit trail of releases, major architectural commits, performance optimizations, and tagged milestones.
        </p>
      </div>

      {/* Visual Timeline Track */}
      <div className="relative pl-6 sm:pl-8 border-l border-vault-border/80 space-y-8 my-6">
        {events.length === 0 ? (
          <div className="p-8 text-center text-xs font-mono text-vault-muted glass-panel rounded-xl">
            No historical timeline events recorded.
          </div>
        ) : (
          events.map((evt, idx) => (
            <div key={idx} className="relative group">
              {/* Timeline Node Dot */}
              <div
                className={`absolute -left-[31px] sm:-left-[39px] top-1.5 w-4 h-4 rounded-full border-2 transition-transform duration-300 group-hover:scale-125 ${
                  evt.type === "release"
                    ? "bg-vault-emerald border-vault-emerald/40 shadow-neon-emerald"
                    : "bg-vault-surface border-vault-accent"
                }`}
              />

              {/* Event Card */}
              <div className="glass-panel p-5 rounded-xl border border-vault-border/80 group-hover:border-vault-borderHover transition-all space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {evt.type === "release" ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-vault-emerald/15 text-vault-emerald border border-vault-emerald/30">
                        RELEASE {evt.tag}
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-vault-surface border border-vault-border text-vault-accent">
                        COMMIT {evt.tag}
                      </span>
                    )}
                    <h4 className="text-xs sm:text-sm font-semibold text-white">
                      {evt.title}
                    </h4>
                  </div>

                  <span className="text-[11px] font-mono text-vault-muted">
                    {new Date(evt.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>

                <p className="text-xs text-vault-muted font-mono leading-relaxed whitespace-pre-wrap">
                  {evt.desc}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
