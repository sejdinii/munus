import React, { useState, useRef } from "react";
import {
  X,
  Check,
  Bookmark,
  MapPin,
  SlidersHorizontal,
  RotateCcw,
  Briefcase,
  Layers,
  Send,
  User,
  ChevronRight,
  ChevronLeft,
  ShieldCheck,
  Upload,
} from "lucide-react";

// NOTE: Helvetica Now Var via db.onlinewebfonts.com is an unlicensed mirror of a
// commercial Monotype typeface. Fine for a throwaway mockup; replace with a licensed
// webfont (or Inter / Neue Haas Grotesk) before shipping anything real.
const FONT_CSS_URL =
  "https://db.onlinewebfonts.com/c/e66905e07608167a84e6ad52f638c3c6?family=Helvetica+Now+Var";

const BG_URL =
  "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260704_143500_a76b8e64-2c69-4683-80e7-2bb060a921d6.png&w=1280&q=85";

const JOBS = [
  {
    id: 1,
    company: "Helios Mobility",
    initials: "HM",
    role: "Machine Learning Engineer",
    location: "Munich, DE",
    salary: "\u20AC78\u201395k",
    type: "Full-time",
    tags: ["Hybrid", "Visa sponsor"],
    match: 92,
    skills: 5,
  },
  {
    id: 2,
    company: "Nordwind Labs",
    initials: "NL",
    role: "Data Scientist, Growth",
    location: "Berlin, DE",
    salary: "\u20AC70\u201385k",
    type: "Full-time",
    tags: ["Remote", "Series B"],
    match: 87,
    skills: 4,
  },
  {
    id: 3,
    company: "Aperture Analytics",
    initials: "AA",
    role: "AI Product Engineer",
    location: "Remote, EU",
    salary: "\u20AC82\u2013100k",
    type: "Contract",
    tags: ["Remote", "4-day week"],
    match: 84,
    skills: 4,
  },
  {
    id: 4,
    company: "Kestrel Systems",
    initials: "KS",
    role: "MLOps Engineer",
    location: "Amsterdam, NL",
    salary: "\u20AC75\u201390k",
    type: "Full-time",
    tags: ["Hybrid", "Stock options"],
    match: 78,
    skills: 3,
  },
  {
    id: 5,
    company: "Vantage BI",
    initials: "VB",
    role: "Analytics Engineer",
    location: "Leipzig, DE",
    salary: "\u20AC62\u201374k",
    type: "Full-time",
    tags: ["On-site", "Relocation"],
    match: 71,
    skills: 3,
  },
];

const SWIPE_THRESHOLD = 100; // px of horizontal drag needed to commit

const TABS = [
  { id: "deck", label: "Deck", icon: Layers },
  { id: "saved", label: "Favorites", icon: Bookmark },
  { id: "apps", label: "Tracking", icon: Send },
  { id: "profile", label: "Profile", icon: User },
];

const ROLE_CHIPS = ["Data scientist", "ML engineer", "Analytics", "AI product"];
const WHERE_CHIPS = ["Leipzig", "Berlin", "Remote EU", "UAE", "Munich"];
const SALARY_CHIPS = ["\u20AC60\u201375k", "\u20AC75\u201390k", "\u20AC90\u2013110k", "Open"];

// Simulated employer-side signals for the tracker mockup — replace with real events
const statusFor = (i) => (i === 0 ? "Evidence viewed" : i === 1 ? "In review" : "Applied");

const DOCS = {
  2: {
    cv: `ENES
Data Scientist  ·  Leipzig / UAE

NORDWIND LABS  —  Data Scientist, Growth
Role-specific CV  ·  edits stay on this job

EVIDENCE
• Experimentation: A/B and switchback tests on acquisition; +18% activation
• Causal inference on growth loops, not vanity dashboards
• Python, SQL, dbt — production notebooks with a reviewed evidence pack
• German + English; Berlin-remote, Leipzig base, UAE-flexible

SELECTED WORK
Nordwind’s Series B growth stack needs weekly shipping, not quarterly theatre. I pair statistical rigor with product sense — the same 4-skill overlap your posting lists.

Leipzig / UAE. Ready to start.`,
    cover: `Hiring team — Nordwind Labs

I’m Enes, a data scientist between Leipzig and the UAE. I’m writing for Data Scientist, Growth.

Your remote, evidence-first mandate is how I already work: verified experiment logs, not slide-deck metrics. Recent years have been funnel diagnostics, uplift models, and the unglamorous SQL that makes them trustworthy.

This CV and letter are tailored only to Nordwind. Happy to walk through the evidence pack.

Enes`,
  },
  3: {
    cv: `ENES
AI Product Engineer  ·  Leipzig / UAE

APERTURE ANALYTICS  —  AI Product Engineer
Role-specific CV  ·  edits stay on this job

EVIDENCE
• LLM product surfaces: retrieval, eval harnesses, human-in-the-loop
• Analytics engineering (metrics layers, semantic models) under the hood
• 4-day-week compatible delivery: scoped slices, not heroics
• Remote EU; 4 verified skills overlap with this posting

SELECTED WORK
I treat models as product, not research: latency budgets, eval gates, a paper trail. Placeholder evidence from Leipzig / UAE work — customer-facing AI that analytics teams actually adopt.

Contract-ready. EU timezone.`,
    cover: `Aperture Analytics

I’m Enes — data science by training, AI product by practice, Leipzig / UAE by location.

The AI Product Engineer role (Remote, EU · 4-day week) is the shape of work I want: small team, high trust, contract pace. I’ve built the unsexy layer between models and users — evals, fallbacks, the analytics that prove the thing shipped.

This CV and letter are tailored only to Aperture. The rest of my vault stays general.

Enes`,
  },
};

function docsFor(job) {
  if (DOCS[job.id]) return DOCS[job.id];
  return {
    cv: `ENES
Data science  ·  Leipzig / UAE

${job.company.toUpperCase()}  —  ${job.role}
Role-specific CV  ·  edits stay on this job

EVIDENCE
• Verified skills overlap: ${job.skills}
• Evidence match ${job.match}% against this posting
• Leipzig base, UAE-flexible; ${job.location}

A short, tailored extract from the vault — not the general CV.`,
    cover: `Hiring team — ${job.company}

I’m Enes, writing for ${job.role} (${job.location}).

This letter and CV are tailored only to this job. Happy to share the evidence pack behind the ${job.match}% match.

Enes`,
  };
}

const css = `
@import url('${FONT_CSS_URL}');

.vf-root, .vf-root * {
  font-family: 'Helvetica Now Var', 'Helvetica Neue', Helvetica, Arial, sans-serif;
  box-sizing: border-box;
}

.vf-root button {
  -webkit-tap-highlight-color: transparent;
}

/* ---------- Liquid glass system ---------- */

.liquid-glass,
.liquid-glass-selected {
  position: relative;
  isolation: isolate;
}

.liquid-glass {
  background: rgba(255, 255, 255, 0.01);
  background-blend-mode: luminosity;
  -webkit-backdrop-filter: blur(4px);
  backdrop-filter: blur(4px);
  box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.1);
}

.liquid-glass-selected {
  background: rgba(255, 255, 255, 0.12);
  background-blend-mode: luminosity;
  -webkit-backdrop-filter: blur(8px);
  backdrop-filter: blur(8px);
  box-shadow: inset 0 1px 2px rgba(255, 255, 255, 0.2);
}

/* Gradient hairline border via mask-composite exclude */
.liquid-glass::before,
.liquid-glass-selected::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  padding: 1.4px;
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  mask-composite: exclude;
  pointer-events: none;
}

.liquid-glass::before {
  background: linear-gradient(180deg,
    rgba(255, 255, 255, 0.45) 0%,
    rgba(255, 255, 255, 0.15) 20%,
    rgba(255, 255, 255, 0)    40%,
    rgba(255, 255, 255, 0)    60%,
    rgba(255, 255, 255, 0.15) 80%,
    rgba(255, 255, 255, 0.45) 100%);
}

.liquid-glass-selected::before {
  background: linear-gradient(180deg,
    rgba(255, 255, 255, 0.6)  0%,
    rgba(255, 255, 255, 0.25) 20%,
    rgba(255, 255, 255, 0)    40%,
    rgba(255, 255, 255, 0)    60%,
    rgba(255, 255, 255, 0.25) 80%,
    rgba(255, 255, 255, 0.6)  100%);
}

/* ---------- Entrance animation ---------- */

.fade-up {
  opacity: 0;
  animation: vfFadeUp 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards;
}

@keyframes vfFadeUp {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}

@media (prefers-reduced-motion: reduce) {
  .fade-up { animation-duration: 0.01s; }
}
`;

const clamp01 = (v) => Math.max(0, Math.min(1, v));

function Tag({ children, selected, onClick }) {
  const hot = !!selected;
  const Comp = onClick ? "button" : "span";
  return (
    <Comp
      type={onClick ? "button" : undefined}
      onClick={onClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "5px 10px",
        borderRadius: 9999,
        fontSize: 11,
        fontWeight: 500,
        color: hot ? "rgba(232,218,130,0.95)" : "rgba(255,255,255,0.75)",
        background: hot ? "rgba(220,200,80,0.18)" : "rgba(255,255,255,0.08)",
        border: hot ? "1px solid rgba(220,200,80,0.5)" : "1px solid rgba(255,255,255,0.15)",
        cursor: onClick ? "pointer" : "default",
        outline: "none",
        appearance: "none",
        WebkitAppearance: "none",
        fontFamily: "inherit",
      }}
    >
      {children}
    </Comp>
  );
}

function JobCardContent({ job, position, total, reveal, animate }) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        padding: 20,
        display: "flex",
        flexDirection: "column",
        opacity: reveal,
        transition: animate ? "opacity 0.35s ease" : "none",
      }}
    >
      {/* Company row */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div
          className="liquid-glass"
          style={{
            width: 44,
            height: 44,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <span style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.9)" }}>
            {job.initials}
          </span>
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,0.85)" }}>
            {job.company}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              marginTop: 2,
              fontSize: 11,
              color: "rgba(255,255,255,0.5)",
            }}
          >
            <MapPin size={11} color="rgba(255,255,255,0.5)" />
            {job.location}
          </div>
        </div>
        <span
          style={{
            marginLeft: "auto",
            fontSize: 11,
            fontWeight: 500,
            color: "rgba(255,255,255,0.4)",
          }}
        >
          {String(position).padStart(2, "0")}/{String(total).padStart(2, "0")}
        </span>
      </div>

      <div style={{ flex: 1 }} />

      {/* Role */}
      <h2
        style={{
          margin: "0 0 6px",
          fontSize: 26,
          fontWeight: 400,
          lineHeight: 1.15,
          letterSpacing: "-0.02em",
          color: "#ffffff",
        }}
      >
        {job.role}
      </h2>
      <div style={{ fontSize: 14, color: "rgba(255,255,255,0.7)" }}>
        {job.salary} &middot; {job.type}
      </div>

      {/* Tags */}
      <div style={{ display: "flex", gap: 6, marginTop: 12, flexWrap: "wrap" }}>
        {job.tags.map((t) => (
          <Tag key={t}>{t}</Tag>
        ))}
      </div>

      {/* Evidence match — the Munus differentiator, not decoration */}
      <div style={{ marginTop: 18 }}>
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
          }}
        >
          <span style={{ fontSize: 11, fontWeight: 500, color: "rgba(255,255,255,0.5)" }}>
            Evidence match
          </span>
          <span style={{ fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,0.9)" }}>
            {job.match}%
          </span>
        </div>
        <div
          style={{
            marginTop: 6,
            height: 4,
            borderRadius: 9999,
            background: "rgba(255,255,255,0.15)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${job.match}%`,
              height: "100%",
              borderRadius: 9999,
              background: "rgba(255,255,255,0.85)",
            }}
          />
        </div>
        <div style={{ marginTop: 6, fontSize: 11, color: "rgba(255,255,255,0.45)" }}>
          {job.skills} verified skills overlap
        </div>
      </div>
    </div>
  );
}

function JobRow({ job, right, onClick }) {
  return (
    <div
      className="liquid-glass"
      onClick={onClick}
      role={onClick ? "button" : undefined}
      style={{
        borderRadius: 20,
        padding: 14,
        display: "flex",
        alignItems: "center",
        gap: 12,
        marginBottom: 10,
        flexShrink: 0,
        cursor: onClick ? "pointer" : "default",
      }}
    >
      <div
        className="liquid-glass"
        style={{
          width: 38,
          height: 38,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.9)" }}>
          {job.initials}
        </span>
      </div>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div
          style={{
            fontSize: 14,
            fontWeight: 500,
            color: "#ffffff",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {job.role}
        </div>
        <div style={{ marginTop: 2, fontSize: 11, color: "rgba(255,255,255,0.5)" }}>
          {job.company} &middot; {job.location}
        </div>
      </div>
      {right}
    </div>
  );
}

function EmptyHint({ title, sub }) {
  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "0 16px",
      }}
    >
      <div style={{ fontSize: 15, fontWeight: 500, color: "rgba(255,255,255,0.85)" }}>{title}</div>
      <div style={{ marginTop: 6, fontSize: 12, lineHeight: 1.5, color: "rgba(255,255,255,0.5)" }}>
        {sub}
      </div>
    </div>
  );
}

const iconBtn = {
  border: "none",
  outline: "none",
  appearance: "none",
  WebkitAppearance: "none",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

function GoldGlowButton({ onClick, ariaLabel, children, size = 56 }) {
  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          width: size * 2.7,
          height: size * 2,
          background:
            "radial-gradient(ellipse at center, rgba(220,200,80,0.5) 0%, rgba(180,160,40,0.2) 40%, transparent 70%)",
          pointerEvents: "none",
        }}
      />
      <button
        type="button"
        aria-label={ariaLabel}
        onClick={onClick}
        className="liquid-glass"
        style={{
          ...iconBtn,
          position: "relative",
          width: size,
          height: size,
          borderRadius: 9999,
        }}
      >
        {children}
      </button>
    </div>
  );
}

function ScreenTitle({ kicker, title }) {
  return (
    <div className="fade-up" style={{ animationDelay: "0.05s", marginBottom: 16 }}>
      <p style={{ margin: "0 0 8px", fontSize: 14, color: "rgba(255,255,255,0.6)" }}>{kicker}</p>
      <h1
        style={{
          margin: 0,
          fontSize: 26,
          fontWeight: 400,
          lineHeight: 1.2,
          letterSpacing: "-0.025em",
          color: "#ffffff",
        }}
      >
        {title}
      </h1>
    </div>
  );
}

function Onboarding({
  step,
  setStep,
  cvDropped,
  setCvDropped,
  roles,
  setRoles,
  wheres,
  setWheres,
  salary,
  setSalary,
  onDone,
  onBack,
}) {
  const toggle = (set, value) => {
    set((prev) => {
      const next = new Set(prev);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return next;
    });
  };

  const canContinue = step === 1 ? cvDropped : roles.size > 0 && wheres.size > 0 && !!salary;

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
      <ScreenTitle
        kicker={step === 1 ? "Step 1 of 2" : "Step 2 of 2"}
        title={step === 1 ? "Start with your CV" : "What are you looking for?"}
      />

      <div
        className="fade-up"
        style={{
          animationDelay: "0.15s",
          flex: 1,
          minHeight: 0,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {step === 1 && (
          <>
            <p style={{ margin: "0 0 16px", fontSize: 13, lineHeight: 1.5, color: "rgba(255,255,255,0.55)" }}>
              We’ll tailor every application from this file. Nothing is sent until you apply from a favorite.
            </p>
            <button
              type="button"
              onClick={() => setCvDropped(true)}
              className="liquid-glass"
              style={{
                ...iconBtn,
                width: "100%",
                borderRadius: 24,
                padding: 8,
                flexDirection: "column",
              }}
            >
              <div
                style={{
                  width: "100%",
                  borderRadius: 18,
                  border: "1.5px dashed rgba(255,255,255,0.35)",
                  padding: "36px 16px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                }}
              >
                <div
                  className={cvDropped ? "liquid-glass-selected" : "liquid-glass"}
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 12,
                  }}
                >
                  {cvDropped ? (
                    <Check size={20} color="#ffffff" />
                  ) : (
                    <Upload size={20} color="rgba(255,255,255,0.8)" />
                  )}
                </div>
                <div style={{ fontSize: 15, fontWeight: 500, color: "#ffffff" }}>
                  {cvDropped ? "Enes_CV.pdf" : "Drop your CV here"}
                </div>
                <div style={{ marginTop: 4, fontSize: 12, color: "rgba(255,255,255,0.5)" }}>
                  {cvDropped ? "Tap to replace  ·  PDF or DOCX" : "PDF or DOCX  ·  tap to add"}
                </div>
              </div>
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 11, fontWeight: 500, color: "rgba(255,255,255,0.5)", marginBottom: 8 }}>
                Role
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {ROLE_CHIPS.map((c) => (
                  <Tag key={c} selected={roles.has(c)} onClick={() => toggle(setRoles, c)}>
                    {c}
                  </Tag>
                ))}
              </div>
            </div>
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 11, fontWeight: 500, color: "rgba(255,255,255,0.5)", marginBottom: 8 }}>
                Where
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {WHERE_CHIPS.map((c) => (
                  <Tag key={c} selected={wheres.has(c)} onClick={() => toggle(setWheres, c)}>
                    {c}
                  </Tag>
                ))}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 500, color: "rgba(255,255,255,0.5)", marginBottom: 8 }}>
                Salary
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {SALARY_CHIPS.map((c) => (
                  <Tag key={c} selected={salary === c} onClick={() => setSalary(c)}>
                    {c}
                  </Tag>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      <div style={{ flexShrink: 0, marginTop: 14, display: "flex", gap: 10, alignItems: "center" }}>
        {step === 2 && (
          <button
            type="button"
            onClick={() => setStep(1)}
            className="liquid-glass"
            style={{ ...iconBtn, width: 48, height: 48, borderRadius: "50%", flexShrink: 0 }}
            aria-label="Back"
          >
            <ChevronLeft size={18} color="rgba(255,255,255,0.85)" />
          </button>
        )}
        {step === 1 && (
          <button
            type="button"
            onClick={onBack}
            className="liquid-glass"
            style={{ ...iconBtn, width: 48, height: 48, borderRadius: "50%", flexShrink: 0 }}
            aria-label="Close onboarding"
          >
            <X size={18} color="rgba(255,255,255,0.85)" />
          </button>
        )}
        <div style={{ position: "relative", flex: 1, display: "flex", alignItems: "center" }}>
          {canContinue && (
            <div
              style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                transform: "translate(-50%, -50%)",
                width: "100%",
                height: 80,
                background:
                  "radial-gradient(ellipse at center, rgba(220,200,80,0.45) 0%, rgba(180,160,40,0.15) 45%, transparent 70%)",
                pointerEvents: "none",
              }}
            />
          )}
          <button
            type="button"
            disabled={!canContinue}
            onClick={() => {
              if (step === 1) setStep(2);
              else onDone();
            }}
            className="liquid-glass"
            style={{
              ...iconBtn,
              position: "relative",
              flex: 1,
              height: 48,
              borderRadius: 9999,
              opacity: canContinue ? 1 : 0.45,
              cursor: canContinue ? "pointer" : "default",
            }}
          >
            <span style={{ fontSize: 14, fontWeight: 500, color: "#ffffff" }}>Continue</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function FavoriteDetail({ job, onApply, notes, onNote }) {
  const [docTab, setDocTab] = useState("cv");
  const [prompt, setPrompt] = useState("");
  const docs = docsFor(job);
  const body = docTab === "cv" ? docs.cv : docs.cover;
  const note = (notes[job.id] && notes[job.id][docTab]) || "";

  const send = () => {
    const text = prompt.trim();
    if (!text) return;
    onNote(job.id, docTab, text);
    setPrompt("");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
      <div className="fade-up" style={{ animationDelay: "0.05s", marginBottom: 12, flexShrink: 0 }}>
        <p style={{ margin: "0 0 4px", fontSize: 13, color: "rgba(255,255,255,0.6)" }}>{job.company}</p>
        <h1
          style={{
            margin: 0,
            fontSize: 22,
            fontWeight: 400,
            lineHeight: 1.2,
            letterSpacing: "-0.025em",
            color: "#ffffff",
          }}
        >
          {job.role}
        </h1>
      </div>

      <div
        className="fade-up liquid-glass"
        style={{
          animationDelay: "0.12s",
          borderRadius: 9999,
          padding: 4,
          display: "flex",
          flexShrink: 0,
          marginBottom: 12,
        }}
      >
        {[
          { id: "cv", label: "CV" },
          { id: "cover", label: "Cover letter" },
        ].map((tabItem) => {
          const active = docTab === tabItem.id;
          return (
            <button
              key={tabItem.id}
              type="button"
              onClick={() => {
                setDocTab(tabItem.id);
                setPrompt("");
              }}
              className={active ? "liquid-glass-selected" : ""}
              style={{
                ...iconBtn,
                flex: 1,
                height: 36,
                borderRadius: 9999,
                background: active ? undefined : "transparent",
              }}
            >
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 500,
                  color: active ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.5)",
                }}
              >
                {tabItem.label}
              </span>
            </button>
          );
        })}
      </div>

      <div
        className="fade-up"
        style={{
          animationDelay: "0.2s",
          flex: 1,
          minHeight: 0,
          borderRadius: 16,
          background: "#f3ead8",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.7), 0 8px 24px rgba(0,0,0,0.18)",
          padding: "16px 16px 14px",
          overflowY: "auto",
          marginBottom: 10,
        }}
      >
        <pre
          style={{
            margin: 0,
            whiteSpace: "pre-wrap",
            fontFamily: "'Helvetica Now Var', 'Helvetica Neue', Helvetica, Arial, sans-serif",
            fontSize: 11,
            lineHeight: 1.55,
            color: "#2c2618",
            letterSpacing: "0.01em",
          }}
        >
          {body}
        </pre>
        {note ? (
          <div
            style={{
              marginTop: 12,
              paddingTop: 10,
              borderTop: "1px solid rgba(44,38,24,0.15)",
              fontSize: 11,
              fontStyle: "italic",
              lineHeight: 1.45,
              color: "#6a5a28",
            }}
          >
            Note for this job: {note}
          </div>
        ) : null}
      </div>

      <div
        style={{
          flexShrink: 0,
          fontSize: 11,
          color: "rgba(255,255,255,0.45)",
          marginBottom: 8,
          textAlign: "center",
        }}
      >
        Edits apply only to this job.
      </div>

      <div
        className="liquid-glass"
        style={{
          flexShrink: 0,
          borderRadius: 9999,
          padding: "4px 4px 4px 14px",
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 12,
        }}
      >
        <input
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") send();
          }}
          placeholder={docTab === "cv" ? "Change the CV…" : "Change the cover letter…"}
          style={{
            flex: 1,
            minWidth: 0,
            background: "transparent",
            border: "none",
            outline: "none",
            color: "#ffffff",
            fontSize: 13,
            fontFamily: "inherit",
            padding: "8px 0",
          }}
        />
        <button
          type="button"
          aria-label="Send edit"
          onClick={send}
          className="liquid-glass"
          style={{ ...iconBtn, width: 36, height: 36, borderRadius: "50%", flexShrink: 0 }}
        >
          <Send size={14} color="rgba(220,200,80,0.9)" />
        </button>
      </div>

      <div
        style={{
          position: "relative",
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            width: "100%",
            height: 90,
            background:
              "radial-gradient(ellipse at center, rgba(220,200,80,0.5) 0%, rgba(180,160,40,0.2) 40%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
        <button
          type="button"
          onClick={() => onApply(job)}
          className="liquid-glass"
          style={{
            ...iconBtn,
            position: "relative",
            width: "100%",
            height: 52,
            borderRadius: 9999,
            gap: 8,
          }}
        >
          <Check size={18} color="#ffffff" />
          <span style={{ fontSize: 15, fontWeight: 500, color: "#ffffff" }}>Apply</span>
        </button>
      </div>
    </div>
  );
}

function ApplyConfirm({ job, onFavorites, onDeck }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        flex: 1,
        minHeight: 0,
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "0 8px",
      }}
    >
      <div style={{ position: "relative", marginBottom: 18 }}>
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            width: 150,
            height: 110,
            background:
              "radial-gradient(ellipse at center, rgba(220,200,80,0.5) 0%, rgba(180,160,40,0.2) 40%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
        <div
          className="liquid-glass"
          style={{
            position: "relative",
            width: 64,
            height: 64,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Check size={26} color="#ffffff" />
        </div>
      </div>
      <div style={{ fontSize: 20, fontWeight: 400, color: "#ffffff", letterSpacing: "-0.02em" }}>
        Applied to {job.company}
      </div>
      <div style={{ marginTop: 6, fontSize: 13, color: "rgba(255,255,255,0.55)" }}>{job.role}</div>
      <div style={{ marginTop: 28, width: "100%", display: "flex", flexDirection: "column", gap: 10 }}>
        <button
          type="button"
          onClick={onFavorites}
          className="liquid-glass-selected"
          style={{ ...iconBtn, width: "100%", height: 48, borderRadius: 9999 }}
        >
          <span style={{ fontSize: 14, fontWeight: 500, color: "#ffffff" }}>Back to Favorites</span>
        </button>
        <button
          type="button"
          onClick={onDeck}
          className="liquid-glass"
          style={{ ...iconBtn, width: "100%", height: 48, borderRadius: 9999 }}
        >
          <span style={{ fontSize: 14, fontWeight: 500, color: "rgba(255,255,255,0.85)" }}>
            Keep swiping
          </span>
        </button>
      </div>
    </div>
  );
}

export default function MunusSwipeMockup() {
  const [deckIndex, setDeckIndex] = useState(0);
  const [drag, setDrag] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [fly, setFly] = useState(null); // { x, y, rot } while a card exits
  const [applied, setApplied] = useState([1]);
  const [saved, setSaved] = useState(() => new Set([2, 3]));
  const [tab, setTab] = useState("deck");
  // Seeded completed so Deck / Favorites / Tracking work on first paint.
  const [onboarding, setOnboarding] = useState(false);
  const [onbStep, setOnbStep] = useState(1);
  const [cvDropped, setCvDropped] = useState(true);
  const [roles, setRoles] = useState(() => new Set(["Data scientist"]));
  const [wheres, setWheres] = useState(() => new Set(["Leipzig", "UAE"]));
  const [salary, setSalary] = useState("\u20AC75\u201390k");
  const [onbReturn, setOnbReturn] = useState("deck");
  const [detailId, setDetailId] = useState(null);
  const [docNotes, setDocNotes] = useState({});
  const [appliedConfirm, setAppliedConfirm] = useState(null);

  const startRef = useRef({ x: 0, y: 0 });

  const topJob = JOBS[deckIndex];
  const visible = JOBS.slice(deckIndex, deckIndex + 3);

  const fx = fly ? fly.x : drag.x;
  const fy = fly ? fly.y : drag.y;
  const rot = fly ? fly.rot : drag.x * 0.06;
  const saveOpacity = clamp01(fx / SWIPE_THRESHOLD);
  const passOpacity = clamp01(-fx / SWIPE_THRESHOLD);
  // Back-card text stays hidden until its turn: the next card's content fades in
  // with drag progress and locks to fully visible while the top card flies out.
  const nextReveal = fly ? 1 : clamp01(Math.abs(drag.x) / SWIPE_THRESHOLD);

  const launch = (dir) => {
    if (fly || !topJob) return;
    if (dir > 0) {
      setSaved((prev) => {
        const next = new Set(prev);
        next.add(topJob.id);
        return next;
      });
    }
    setDragging(false);
    setFly({ x: dir * 520, y: drag.y, rot: dir * 22 });
    window.setTimeout(() => {
      setDeckIndex((i) => i + 1);
      setDrag({ x: 0, y: 0 });
      setFly(null);
    }, 450);
  };

  const onPointerDown = (e) => {
    if (fly || !topJob) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    startRef.current = { x: e.clientX - drag.x, y: e.clientY - drag.y };
    setDragging(true);
  };

  const onPointerMove = (e) => {
    if (!dragging || fly) return;
    setDrag({
      x: e.clientX - startRef.current.x,
      y: e.clientY - startRef.current.y,
    });
  };

  const onPointerUp = () => {
    if (!dragging) return;
    setDragging(false);
    if (drag.x > SWIPE_THRESHOLD) launch(1);
    else if (drag.x < -SWIPE_THRESHOLD) launch(-1);
    else setDrag({ x: 0, y: 0 });
  };

  const toggleSave = () => {
    if (!topJob) return;
    setSaved((prev) => {
      const next = new Set(prev);
      if (next.has(topJob.id)) next.delete(topJob.id);
      else next.add(topJob.id);
      return next;
    });
  };

  const resetDeck = () => {
    setDeckIndex(0);
    setApplied([]);
    setSaved(new Set());
    setDrag({ x: 0, y: 0 });
    setFly(null);
    setDetailId(null);
    setAppliedConfirm(null);
  };

  const openOnboarding = (step, returnTab) => {
    setOnbReturn(returnTab || "profile");
    setOnbStep(step);
    setOnboarding(true);
    setDetailId(null);
    setAppliedConfirm(null);
  };

  const applyFromFavorite = (job) => {
    setApplied((a) => (a.includes(job.id) ? a : [...a, job.id]));
    setSaved((prev) => {
      const next = new Set(prev);
      next.delete(job.id);
      return next;
    });
    setDetailId(null);
    setAppliedConfirm(job);
  };

  const isSaved = topJob ? saved.has(topJob.id) : false;
  const gold = "rgba(220,200,80,0.9)";

  const savedJobs = JOBS.filter((j) => saved.has(j.id));
  const appliedJobs = applied.map((id) => JOBS.find((j) => j.id === id)).filter(Boolean);
  const detailJob = detailId != null ? JOBS.find((j) => j.id === detailId) : null;

  const overlay = onboarding ? "onboarding" : appliedConfirm ? "confirm" : detailJob ? "detail" : "tabs";
  const showTabs = overlay === "tabs";

  return (
    <div
      className="vf-root"
      style={{
        minHeight: "100vh",
        width: "100%",
        background: "#ffffff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "48px 24px",
      }}
    >
      <style>{css}</style>

      {/* ---------- Phone frame ---------- */}
      <div
        style={{
          position: "relative",
          width: 375,
          height: 780,
          flexShrink: 0,
          borderRadius: 52,
          background: "#8a9aaa",
          overflow: "hidden",
          boxShadow:
            "inset 0 0 0 2px rgba(255,255,255,0.08), 0 0 0 1px rgba(0,0,0,0.6), 0 0 0 10px #1a1a1e, 0 0 0 11px rgba(255,255,255,0.06), 0 0 60px rgba(0,0,0,0.5)",
        }}
      >
        {/* Background image (falls back to #8a9aaa if blocked) */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `url("${BG_URL}")`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "blur(12px)",
            transform: "scale(1.1)",
          }}
        />
        {/* #8a9aaa @ 30% overlay */}
        <div
          style={{ position: "absolute", inset: 0, background: "rgba(138, 154, 170, 0.3)" }}
        />

        {/* Dynamic Island */}
        <div
          style={{
            position: "absolute",
            top: 12,
            left: "50%",
            transform: "translateX(-50%)",
            width: 120,
            height: 32,
            borderRadius: 9999,
            background: "#000000",
            zIndex: 50,
          }}
        />

        {/* ---------- Screen content ---------- */}
        <div
          style={{
            position: "relative",
            zIndex: 10,
            height: "100%",
            display: "flex",
            flexDirection: "column",
            padding: "56px 24px 24px",
          }}
        >
          {/* Header row */}
          <div
            className="fade-up"
            style={{
              animationDelay: "0.1s",
              marginBottom: 18,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div
              className="liquid-glass"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "10px 12px",
                borderRadius: 9999,
              }}
            >
              <Briefcase size={12} color="rgba(255,255,255,0.8)" />
              <span style={{ fontSize: 12, fontWeight: 500, color: "rgba(255,255,255,0.9)" }}>
                Munus
              </span>
            </div>
            {overlay === "tabs" ? (
            <button
              type="button"
              aria-label="Filters"
              className="liquid-glass"
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                border: "none",
                outline: "none",
                appearance: "none",
                WebkitAppearance: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <SlidersHorizontal size={14} color="rgba(255,255,255,0.8)" />
            </button>
            ) : (
            <button
              type="button"
              aria-label="Back"
              onClick={() => {
                if (overlay === "onboarding") {
                  if (onbStep === 2) setOnbStep(1);
                  else {
                    setOnboarding(false);
                    setTab(onbReturn);
                  }
                } else if (overlay === "confirm") {
                  setAppliedConfirm(null);
                  setTab("saved");
                } else if (overlay === "detail") {
                  setDetailId(null);
                }
              }}
              className="liquid-glass"
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                border: "none",
                outline: "none",
                appearance: "none",
                WebkitAppearance: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ChevronLeft size={16} color="rgba(255,255,255,0.8)" />
            </button>
            )}
          </div>

          {overlay === "onboarding" && (
            <Onboarding
              step={onbStep}
              setStep={setOnbStep}
              cvDropped={cvDropped}
              setCvDropped={setCvDropped}
              roles={roles}
              setRoles={setRoles}
              wheres={wheres}
              setWheres={setWheres}
              salary={salary}
              setSalary={setSalary}
              onDone={() => {
                setOnboarding(false);
                setTab("deck");
              }}
              onBack={() => {
                setOnboarding(false);
                setTab(onbReturn);
              }}
            />
          )}

          {overlay === "confirm" && (
            <ApplyConfirm
              job={appliedConfirm}
              onFavorites={() => {
                setAppliedConfirm(null);
                setTab("saved");
              }}
              onDeck={() => {
                setAppliedConfirm(null);
                setTab("deck");
              }}
            />
          )}

          {overlay === "detail" && (
            <FavoriteDetail
              job={detailJob}
              onApply={applyFromFavorite}
              notes={docNotes}
              onNote={(jobId, kind, text) =>
                setDocNotes((prev) => ({
                  ...prev,
                  [jobId]: { ...(prev[jobId] || {}), [kind]: text },
                }))
              }
            />
          )}

          {/* ---------- Deck tab ---------- */}
          {showTabs && tab === "deck" && (
            <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
          {/* Title */}
          <div className="fade-up" style={{ animationDelay: "0.22s", marginBottom: 20 }}>
            <p style={{ margin: "0 0 8px", fontSize: 14, color: "rgba(255,255,255,0.6)" }}>
              Ranked by your verified evidence
            </p>
            <h1
              style={{
                margin: 0,
                fontSize: 26,
                fontWeight: 400,
                lineHeight: 1.2,
                letterSpacing: "-0.025em",
                color: "#ffffff",
              }}
            >
              Today&rsquo;s matches
            </h1>
          </div>

          {/* Card deck */}
          <div
            className="fade-up"
            style={{
              animationDelay: "0.38s",
              flex: 1,
              position: "relative",
              marginBottom: 20,
            }}
          >
            {visible.length === 0 && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div
                  className="liquid-glass"
                  style={{
                    width: "100%",
                    borderRadius: 32,
                    padding: "28px 24px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    textAlign: "center",
                  }}
                >
                  <div
                    className="liquid-glass"
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: 14,
                    }}
                  >
                    <Briefcase size={20} color="rgba(255,255,255,0.8)" />
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 500, color: "#ffffff" }}>
                    That&rsquo;s every match for today
                  </div>
                  <div style={{ marginTop: 6, fontSize: 13, color: "rgba(255,255,255,0.6)" }}>
                    {applied.length} applied &middot; {saved.size} saved
                  </div>
                  <button
                    type="button"
                    onClick={resetDeck}
                    className="liquid-glass"
                    style={{
                      marginTop: 18,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "10px 16px",
                      borderRadius: 9999,
                      border: "none",
                      outline: "none",
                      appearance: "none",
                      WebkitAppearance: "none",
                      cursor: "pointer",
                    }}
                  >
                    <RotateCcw size={14} color="rgba(255,255,255,0.85)" />
                    <span
                      style={{ fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,0.85)" }}
                    >
                      Reset deck
                    </span>
                  </button>
                </div>
              </div>
            )}

            {visible
              .map((job, pos) => {
                const isTop = pos === 0;
                const stackTransform = `translateY(${pos * 14}px) scale(${1 - pos * 0.05})`;
                const topTransform = `translate(${fx}px, ${fy}px) rotate(${rot}deg)`;
                return (
                  <div
                    key={job.id}
                    onPointerDown={isTop ? onPointerDown : undefined}
                    onPointerMove={isTop ? onPointerMove : undefined}
                    onPointerUp={isTop ? onPointerUp : undefined}
                    onPointerCancel={isTop ? onPointerUp : undefined}
                    className={isTop ? "liquid-glass-selected" : "liquid-glass"}
                    style={{
                      position: "absolute",
                      inset: 0,
                      borderRadius: 32,
                      zIndex: 20 - pos,
                      transform: isTop ? topTransform : stackTransform,
                      opacity: isTop && fly ? 0 : 1,
                      transition: isTop
                        ? dragging
                          ? "none"
                          : "transform 0.45s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.45s ease"
                        : "transform 0.4s cubic-bezier(0.22, 1, 0.36, 1)",
                      cursor: isTop ? (dragging ? "grabbing" : "grab") : "default",
                      touchAction: isTop ? "none" : "auto",
                      pointerEvents: isTop ? "auto" : "none",
                      userSelect: "none",
                      WebkitUserSelect: "none",
                    }}
                  >
                    <JobCardContent
                      job={job}
                      position={deckIndex + pos + 1}
                      total={JOBS.length}
                      reveal={pos === 0 ? 1 : pos === 1 ? nextReveal : 0}
                      animate={!dragging}
                    />

                    {isTop && (
                      <>
                        <div
                          style={{
                            position: "absolute",
                            top: 22,
                            left: 20,
                            transform: "rotate(-12deg)",
                            border: "2.5px solid rgba(134, 220, 150, 0.95)",
                            color: "rgba(134, 220, 150, 0.95)",
                            padding: "4px 12px",
                            borderRadius: 10,
                            fontSize: 22,
                            fontWeight: 700,
                            letterSpacing: "0.15em",
                            opacity: saveOpacity,
                            pointerEvents: "none",
                          }}
                        >
                          SAVE
                        </div>
                        <div
                          style={{
                            position: "absolute",
                            top: 22,
                            right: 20,
                            transform: "rotate(12deg)",
                            border: "2.5px solid rgba(255, 130, 130, 0.95)",
                            color: "rgba(255, 130, 130, 0.95)",
                            padding: "4px 12px",
                            borderRadius: 10,
                            fontSize: 22,
                            fontWeight: 700,
                            letterSpacing: "0.15em",
                            opacity: passOpacity,
                            pointerEvents: "none",
                          }}
                        >
                          PASS
                        </div>
                      </>
                    )}
                  </div>
                );
              })
              .reverse()}
          </div>

          {/* Action buttons */}
          {topJob && (
            <>
              <div
                className="fade-up"
                style={{
                  animationDelay: "0.6s",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 20,
                }}
              >
                <button
                  type="button"
                  aria-label="Pass"
                  onClick={() => launch(-1)}
                  className="liquid-glass"
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: "50%",
                    border: "none",
                    outline: "none",
                    appearance: "none",
                    WebkitAppearance: "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <X size={22} color="rgba(255,255,255,0.9)" />
                </button>

                <button
                  type="button"
                  aria-label="Saved"
                  aria-pressed={isSaved}
                  onClick={toggleSave}
                  className="liquid-glass"
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: "50%",
                    border: "none",
                    outline: "none",
                    appearance: "none",
                    WebkitAppearance: "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Bookmark
                    size={18}
                    color={isSaved ? gold : "rgba(255,255,255,0.7)"}
                    fill={isSaved ? gold : "none"}
                  />
                </button>

                <GoldGlowButton ariaLabel="Save" onClick={() => launch(1)}>
                  <Check size={22} color="#ffffff" />
                </GoldGlowButton>
              </div>

              <div
                className="fade-up"
                style={{
                  animationDelay: "0.75s",
                  marginTop: 12,
                  textAlign: "center",
                  fontSize: 11,
                  color: "rgba(255,255,255,0.4)",
                }}
              >
                Swipe right to save &middot; left to pass
              </div>
            </>
          )}
            </div>
          )}

          {/* ---------- Favorites tab — same state the Bookmark action writes ---------- */}
          {showTabs && tab === "saved" && (
            <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
              <div className="fade-up" style={{ animationDelay: "0.05s", marginBottom: 16 }}>
                <p style={{ margin: "0 0 8px", fontSize: 14, color: "rgba(255,255,255,0.6)" }}>
                  Saved from the deck
                </p>
                <h1
                  style={{
                    margin: 0,
                    fontSize: 26,
                    fontWeight: 400,
                    lineHeight: 1.2,
                    letterSpacing: "-0.025em",
                    color: "#ffffff",
                  }}
                >
                  Favorites
                </h1>
              </div>
              <div
                className="fade-up"
                style={{
                  animationDelay: "0.15s",
                  flex: 1,
                  minHeight: 0,
                  overflowY: "auto",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {savedJobs.length === 0 ? (
                  <EmptyHint
                    title="Nothing saved yet"
                    sub="Swipe right on a match to keep it here. Apply from the job, after you tailor the CV."
                  />
                ) : (
                  savedJobs.map((job) => (
                    <JobRow
                      key={job.id}
                      job={job}
                      onClick={() => setDetailId(job.id)}
                      right={
                        <span
                          style={{
                            flexShrink: 0,
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                            fontSize: 13,
                            fontWeight: 500,
                            color: "rgba(255,255,255,0.9)",
                          }}
                        >
                          {job.match}%
                          <ChevronRight size={14} color="rgba(255,255,255,0.4)" />
                        </span>
                      }
                    />
                  ))
                )}
              </div>
            </div>
          )}

          {/* ---------- Tracking tab ---------- */}
          {showTabs && tab === "apps" && (
            <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
              <div className="fade-up" style={{ animationDelay: "0.05s", marginBottom: 16 }}>
                <p style={{ margin: "0 0 8px", fontSize: 14, color: "rgba(255,255,255,0.6)" }}>
                  Employer-side signals
                </p>
                <h1
                  style={{
                    margin: 0,
                    fontSize: 26,
                    fontWeight: 400,
                    lineHeight: 1.2,
                    letterSpacing: "-0.025em",
                    color: "#ffffff",
                  }}
                >
                  Tracking
                </h1>
              </div>
              <div
                className="fade-up"
                style={{
                  animationDelay: "0.15s",
                  flex: 1,
                  minHeight: 0,
                  overflowY: "auto",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {appliedJobs.length === 0 ? (
                  <EmptyHint
                    title="No applications yet"
                    sub="Open a favorite, tailor the CV or cover letter, then apply."
                  />
                ) : (
                  appliedJobs.map((job, i) => {
                    const status = statusFor(i);
                    const hot = status !== "Applied";
                    return (
                      <JobRow
                        key={job.id}
                        job={job}
                        right={
                          <span
                            style={{
                              flexShrink: 0,
                              fontSize: 10,
                              fontWeight: 600,
                              letterSpacing: "0.04em",
                              textTransform: "uppercase",
                              padding: "4px 8px",
                              borderRadius: 9999,
                              background: hot
                                ? "rgba(220,200,80,0.18)"
                                : "rgba(255,255,255,0.08)",
                              border: hot
                                ? "1px solid rgba(220,200,80,0.5)"
                                : "1px solid rgba(255,255,255,0.15)",
                              color: hot ? "rgba(232,218,130,0.95)" : "rgba(255,255,255,0.7)",
                            }}
                          >
                            {status}
                          </span>
                        }
                      />
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* ---------- Profile tab ---------- */}
          {showTabs && tab === "profile" && (
            <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
              <div className="fade-up" style={{ animationDelay: "0.05s", marginBottom: 16 }}>
                <p style={{ margin: "0 0 8px", fontSize: 14, color: "rgba(255,255,255,0.6)" }}>
                  Evidence-verified account
                </p>
                <h1
                  style={{
                    margin: 0,
                    fontSize: 26,
                    fontWeight: 400,
                    lineHeight: 1.2,
                    letterSpacing: "-0.025em",
                    color: "#ffffff",
                  }}
                >
                  Profile
                </h1>
              </div>
              <div
                className="fade-up"
                style={{
                  animationDelay: "0.15s",
                  flex: 1,
                  minHeight: 0,
                  overflowY: "auto",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <div
                  className="liquid-glass"
                  style={{ borderRadius: 24, padding: 18, marginBottom: 12, flexShrink: 0 }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div
                      className="liquid-glass"
                      style={{
                        width: 52,
                        height: 52,
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <span
                        style={{ fontSize: 16, fontWeight: 600, color: "rgba(255,255,255,0.9)" }}
                      >
                        E
                      </span>
                    </div>
                    <div>
                      <div style={{ fontSize: 17, fontWeight: 500, color: "#ffffff" }}>Enes</div>
                      <div style={{ marginTop: 2, fontSize: 12, color: "rgba(255,255,255,0.55)" }}>
                        Data science &middot; Leipzig / UAE
                      </div>
                    </div>
                  </div>
                  <div style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 6 }}>
                    <ShieldCheck size={14} color="rgba(220,200,80,0.9)" />
                    <span style={{ fontSize: 12, color: "rgba(255,255,255,0.75)" }}>
                      12 skills verified &middot; 3 evidence sources
                    </span>
                  </div>
                  <div style={{ marginTop: 12 }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "baseline",
                      }}
                    >
                      <span
                        style={{ fontSize: 11, fontWeight: 500, color: "rgba(255,255,255,0.5)" }}
                      >
                        Profile strength
                      </span>
                      <span
                        style={{ fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,0.9)" }}
                      >
                        82%
                      </span>
                    </div>
                    <div
                      style={{
                        marginTop: 6,
                        height: 4,
                        borderRadius: 9999,
                        background: "rgba(255,255,255,0.15)",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          width: "82%",
                          height: "100%",
                          borderRadius: 9999,
                          background: "rgba(255,255,255,0.85)",
                        }}
                      />
                    </div>
                  </div>
                </div>
                {[
                  { label: "Verified CV", action: null },
                  { label: "Evidence vault", action: null },
                  { label: "Job preferences", action: () => openOnboarding(2, "profile") },
                  { label: "Replay onboarding", action: () => openOnboarding(1, "profile") },
                ].map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={item.action || undefined}
                    className="liquid-glass"
                    style={{
                      width: "100%",
                      borderRadius: 20,
                      padding: "14px 16px",
                      marginBottom: 10,
                      border: "none",
                      outline: "none",
                      appearance: "none",
                      WebkitAppearance: "none",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      flexShrink: 0,
                    }}
                  >
                    <span style={{ fontSize: 14, fontWeight: 500, color: "rgba(255,255,255,0.9)" }}>
                      {item.label}
                    </span>
                    <ChevronRight size={16} color="rgba(255,255,255,0.4)" />
                  </button>
                ))}
                {(roles.size > 0 || wheres.size > 0) && (
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 4 }}>
                    {[...roles, ...wheres, salary].filter(Boolean).map((c) => (
                      <Tag key={c}>{c}</Tag>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ---------- Tab bar ---------- */}
          {showTabs && (
          <div
            className="fade-up liquid-glass"
            style={{
              animationDelay: "0.5s",
              marginTop: 14,
              borderRadius: 9999,
              padding: 6,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexShrink: 0,
            }}
          >
            {TABS.map((t) => {
              const active = tab === t.id;
              const Icon = t.icon;
              const count =
                t.id === "saved" ? saved.size : t.id === "apps" ? applied.length : 0;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTab(t.id)}
                  aria-pressed={active}
                  className={active ? "liquid-glass-selected" : ""}
                  style={{
                    position: "relative",
                    flex: 1,
                    height: 48,
                    borderRadius: 9999,
                    border: "none",
                    outline: "none",
                    appearance: "none",
                    WebkitAppearance: "none",
                    cursor: "pointer",
                    background: active ? undefined : "transparent",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 3,
                  }}
                >
                  <Icon size={18} color={active ? "#ffffff" : "rgba(255,255,255,0.45)"} />
                  <span
                    style={{
                      fontSize: 9,
                      fontWeight: 500,
                      letterSpacing: "0.02em",
                      color: active ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.45)",
                    }}
                  >
                    {t.label}
                  </span>
                  {count > 0 && (
                    <span
                      style={{
                        position: "absolute",
                        top: 5,
                        left: "calc(50% + 6px)",
                        minWidth: 14,
                        height: 14,
                        padding: "0 4px",
                        borderRadius: 9999,
                        background: "rgba(220,200,80,0.9)",
                        color: "#1a1a1e",
                        fontSize: 9,
                        fontWeight: 700,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          )}
        </div>
      </div>
    </div>
  );
}
