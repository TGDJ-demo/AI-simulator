import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Play,
  Pause,
  SkipForward,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Plus,
  X,
  Cpu,
  Layers,
  Zap,
  Shield,
  HardDrive,
  Sparkles,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  WifiOff,
  Server,
  ArrowRight,
  Info,
  Eye,
} from "lucide-react";

// ============================================================================
// 1. BEGINNER JARGON DICTIONARY (Preserves exact terms + plain analogies + SVG)
// ============================================================================
const JARGON_DB = {
  token: {
    term: "Token & Tokenization",
    category: "Input / Billing Unit",
    plain:
      "AI models do not read whole words like humans. Before thinking, the system chops your sentence into tiny puzzle pieces called tokens—roughly 3/4 of a word each.",
    analogy:
      "Like counting LEGO bricks instead of finished houses. Whether you build a small car or a castle, the factory charges you per brick.",
    visualType: "tokens",
  },
  tokens: {
    term: "Tokens & Tokenization",
    category: "Input / Billing Unit",
    plain:
      "Sub-word chunks (~0.75 English words) converted into numbers so a GPU can do math on your text.",
    analogy:
      "Chopping 'Unbelievable' into ['Un', 'believ', 'able']—3 separate numbered puzzle pieces.",
    visualType: "tokens",
  },
  prefill: {
    term: "Prefill Phase",
    category: "Inference Stage 1",
    plain:
      "The 'reading' phase. The AI reads your entire prompt and attached documents all at once in a single massive parallel flash before writing its first word.",
    analogy:
      "Reading an entire 20-page contract in one blink before picking up a pen to write your summary.",
    visualType: "prefill_decode",
  },
  decode: {
    term: "Decode Phase",
    category: "Inference Stage 2",
    plain:
      "The 'writing' phase. After reading your prompt, the AI generates its answer one single token at a time, re-reading its memory for every new word.",
    analogy:
      "Typing an email one letter at a time, where you have to re-read the whole page before typing the next word.",
    visualType: "prefill_decode",
  },
  "kv cache": {
    term: "KV Cache (Key-Value Cache)",
    category: "GPU Memory Optimization",
    plain:
      "Short-term scratchpad memory stored on the GPU. It saves the AI's understanding of words it already read so it doesn't have to re-read your whole conversation from scratch on every new word.",
    analogy:
      "Keeping sticky-note summaries on your desk instead of re-reading a 500-page book every time someone asks a follow-up question.",
    visualType: "vram",
  },
  pagedattention: {
    term: "PagedAttention (vLLM)",
    category: "Memory Architecture",
    plain:
      "A smart memory manager that splits the AI's scratchpad (KV Cache) into tiny non-adjacent blocks—just like a computer's operating system manages RAM—eliminating 60%+ wasted GPU memory.",
    analogy:
      "Instead of forcing a family of 5 to sit in 5 empty seats in a row on a full airplane, you place them in single open seats across the cabin so zero seats go wasted.",
    visualType: "vram",
  },
  ttft: {
    term: "TTFT (Time to First Token)",
    category: "Latency Metric",
    plain:
      "How long you stare at a blinking cursor after hitting Enter before the very first word appears on screen.",
    analogy:
      "The time between ordering at a restaurant and the waiter bringing out your first appetizer.",
    visualType: "prefill_decode",
  },
  itl: {
    term: "ITL / TPOT (Inter-Token Latency)",
    category: "Streaming Speed Metric",
    plain:
      "The tiny pause between each consecutive word as the AI streams its response onto your screen.",
    analogy:
      "How fast a typist's fingers hit the keys once they start typing.",
    visualType: "prefill_decode",
  },
  "continuous batching": {
    term: "Continuous (In-Flight) Batching",
    category: "GPU Scheduling",
    plain:
      "A smart traffic controller for GPUs. The exact millisecond one user's answer finishes, a new waiting user slides into that empty GPU slot—instead of making everyone wait for the slowest person.",
    analogy:
      "A revolving door or express checkout lane vs. a bus that refuses to leave until all 50 passengers finish shopping.",
    visualType: "batching",
  },
  "speculative decoding": {
    term: "Speculative Decoding (EAGLE-3)",
    category: "Speed Breakthrough",
    plain:
      "A tiny, ultra-fast 'junior' AI rapidly guesses the next 4–5 words ahead, and the big 'expert' AI checks and approves all 5 words in one single glance.",
    analogy:
      "A fast intern drafting a paragraph while a senior lawyer approves 5 sentences with one stamp—3x faster with the exact same legal quality.",
    visualType: "speculative",
  },
  quantization: {
    term: "Quantization (FP8 / INT4)",
    category: "Model Compression",
    plain:
      "Shrinking the precision of the AI's numbers (from 16-decimal places down to 8 or 4) so the model takes half the memory and runs twice as fast with almost zero loss in intelligence.",
    analogy:
      "Saving a 100 MB raw photo as a crisp 8 MB image—looks identical to the eye, loads 10x faster.",
    visualType: "quantization",
  },
  "bitnet b1.58": {
    term: "BitNet b1.58 (1.58-Bit Ternary AI)",
    category: "Offline Edge Breakthrough",
    plain:
      "A breakthrough model design where every internal brain connection uses only three simple values: -1, 0, or +1. This replaces heavy multiplication with simple addition, letting big models run offline on a regular laptop CPU.",
    analogy:
      "Replacing complex calculus with simple tally marks (+1, 0, -1) so you can do it on a pocket calculator without a supercomputer.",
    visualType: "quantization",
  },
  "prefix caching": {
    term: "Prefix Caching / RadixAttention",
    category: "Token & Cost Saver",
    plain:
      "If 1,000 employees ask questions using the same 10-page company handbook, the AI memorizes the handbook's KV Cache once and reuses it instantly—cutting cost and wait time by up to 85%.",
    analogy:
      "Pre-boiling a big pot of pasta water in the morning so every order takes 60 seconds instead of 15 minutes.",
    visualType: "vram",
  },
  "semantic cache": {
    term: "Semantic Caching",
    category: "Zero-GPU Shortcut",
    plain:
      "Before waking up an expensive GPU, the gateway checks if someone already asked a question with the same meaning (even if worded differently) and returns the saved answer in 12 milliseconds.",
    analogy:
      "Checking the FAQ board at the front desk before calling an engineer out of a meeting.",
    visualType: "routing",
  },
  reranker: {
    term: "Cross-Encoder Reranker",
    category: "RAG Accuracy & Token Reducer",
    plain:
      "A specialized filter model that reads 50 rough search results and picks only the top 5 most relevant paragraphs to hand to the LLM—cutting token bloat and hallucinations.",
    analogy:
      "A research assistant highlighting the exact 2 paragraphs you need instead of dumping 50 binders on your desk.",
    visualType: "routing",
  },
  rag: {
    term: "RAG (Retrieval-Augmented Generation)",
    category: "Enterprise Grounding",
    plain:
      "Connecting the AI to your live company documents, databases, or CRM at the moment a question is asked so it answers from your facts instead of guessing.",
    analogy:
      "Letting a student take an open-book exam using your company's latest policy manual.",
    visualType: "routing",
  },
  "disaggregated inference": {
    term: "Disaggregated Inference (PD Separation)",
    category: "2026 Cluster Architecture",
    plain:
      "Splitting GPUs into two specialized teams: 'Reader GPUs' optimized for heavy Prefill math, and 'Writer GPUs' optimized for fast Decode streaming—so one user uploading a huge PDF never slows down everyone else.",
    analogy:
      "Separating kitchen prep cooks (chopping vegetables) from line cooks (plating dishes) so a huge catering order doesn't stall dinner service.",
    visualType: "prefill_decode",
  },
  moe: {
    term: "MoE (Mixture of Experts)",
    category: "Model Architecture",
    plain:
      "Instead of waking up a massive 200-billion-parameter brain for every simple word, an MoE model routes each token to only 2 or 3 small specialist sub-networks.",
    analogy:
      "A hospital with 64 specialists on call, where a patient only sees the 2 doctors relevant to their symptoms.",
    visualType: "routing",
  },
  zdr: {
    term: "ZDR (Zero Data Retention) & BYOC",
    category: "Enterprise Security",
    plain:
      "ZDR guarantees your prompts are wiped immediately from memory after answering and never used to train models. BYOC (Bring Your Own Cloud) runs the AI inside your own private AWS/GCP network.",
    analogy:
      "Shredding a confidential document the second you finish reading it, inside your own locked vault.",
    visualType: "routing",
  },
  "vram": {
    term: "GPU VRAM / HBM (High-Bandwidth Memory)",
    category: "Hardware Bottleneck",
    plain:
      "Ultra-fast memory soldered right onto the AI chip (like Nvidia H100's 80GB HBM3). Both the AI's brain (weights) and its active conversation scratchpad (KV Cache) must fit inside VRAM.",
    analogy:
      "The size of a chef's prep counter—no matter how fast the chef chops, if the counter is full, no new orders can start.",
    visualType: "vram",
  },
};

// Helper to match highlighted text to our dictionary
function lookupJargon(rawText) {
  if (!rawText) return null;
  const clean = rawText.trim().toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "");
  if (!clean || clean.length < 2 || clean.length > 45) return null;

  if (JARGON_DB[clean]) return JARGON_DB[clean];

  // Partial / keyword match
  const keys = Object.keys(JARGON_DB);
  for (const k of keys) {
    if (clean.includes(k) || k.includes(clean)) {
      return JARGON_DB[k];
    }
  }
  return null;
}

// ============================================================================
// 2. ANIMATED MINI-VISUALIZERS (Inside Callout Cards & Stage Drill-Downs)
// ============================================================================
function MiniAnimatedVisual({ type }) {
  if (type === "tokens") {
    const pieces = [
      { txt: "Sum", id: "14820" },
      { txt: "mar", id: "3912" },
      { txt: "ize", id: "554" },
      { txt: " Q3", id: "9041" },
      { txt: " churn", id: "41822" },
      { txt: " risk", id: "7819" },
    ];
    return (
      <div className="bg-slate-950 rounded-lg p-3 border border-slate-800 mt-2">
        <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-2 flex justify-between">
          <span>Live Tokenizer Animation</span>
          <span className="text-emerald-400">6 Tokens = ~4.5 Words</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {pieces.map((p, idx) => (
            <div
              key={idx}
              style={{ animationDelay: `${idx * 180}ms` }}
              className="animate-pulse bg-slate-900 border border-cyan-500/40 rounded px-2 py-1 text-center"
            >
              <div className="text-xs font-bold text-white font-mono">{p.txt}</div>
              <div className="text-[9px] text-cyan-400 font-mono">#{p.id}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (type === "prefill_decode") {
    return (
      <div className="bg-slate-950 rounded-lg p-3 border border-slate-800 mt-2">
        <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-2">
          Prefill (1 Parallel Flash) → Decode (1-by-1 Stream)
        </div>
        <svg viewBox="0 0 360 74" className="w-full h-auto">
          {/* Prefill Block */}
          <rect x="4" y="10" width="120" height="52" rx="6" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.5" />
          <text x="64" y="28" fill="#38bdf8" fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
            PREFILL (ALL AT ONCE)
          </text>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <rect
              key={i}
              x={14 + i * 17}
              y="36"
              width="13"
              height="16"
              rx="2"
              fill="#38bdf8"
              opacity="0.85"
            >
              <animate attributeName="opacity" values="0.3;1;0.3" dur="1.4s" repeatCount="indefinite" />
            </rect>
          ))}

          {/* Arrow */}
          <path d="M 130 36 L 156 36" stroke="#94a3b8" strokeWidth="2" strokeDasharray="3 2" />
          <polygon points="156,32 164,36 156,40" fill="#94a3b8" />

          {/* Decode Stream */}
          <rect x="170" y="10" width="186" height="52" rx="6" fill="#0f172a" stroke="#34d399" strokeWidth="1.5" />
          <text x="263" y="28" fill="#34d399" fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
            DECODE (1 TOKEN / STEP)
          </text>
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <rect key={i} x={180 + i * 24} y="36" width="18" height="16" rx="2" fill="#34d399" opacity="0.2">
              <animate
                attributeName="opacity"
                values="0.15;1;1;0.15"
                dur="2.8s"
                begin={`${i * 0.35}s`}
                repeatCount="indefinite"
              />
            </rect>
          ))}
        </svg>
      </div>
    );
  }

  if (type === "vram") {
    return (
      <div className="bg-slate-950 rounded-lg p-3 border border-slate-800 mt-2">
        <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-2 flex justify-between">
          <span>GPU VRAM: Vanilla Fragmented vs. PagedAttention</span>
          <span className="text-emerald-400">96% Packed</span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
          <div className="p-2 rounded bg-slate-900 border border-rose-500/30">
            <div className="text-rose-400 mb-1">Vanilla (62% Wasted)</div>
            <div className="grid grid-cols-6 gap-1">
              {[1, 1, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0].map((v, i) => (
                <div
                  key={i}
                  className={`h-3.5 rounded-sm ${v ? "bg-rose-500" : "bg-slate-800 border border-dashed border-rose-500/40"}`}
                />
              ))}
            </div>
          </div>
          <div className="p-2 rounded bg-slate-900 border border-emerald-500/30">
            <div className="text-emerald-400 mb-1">PagedAttention (4% Waste)</div>
            <div className="grid grid-cols-6 gap-1">
              {[1, 1, 2, 2, 2, 3, 3, 1, 4, 4, 2, 0].map((v, i) => (
                <div
                  key={i}
                  className={`h-3.5 rounded-sm transition-all ${
                    v === 1
                      ? "bg-emerald-400"
                      : v === 2
                      ? "bg-cyan-400"
                      : v === 3
                      ? "bg-indigo-400"
                      : v === 4
                      ? "bg-amber-400"
                      : "bg-slate-800"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (type === "batching") {
    return (
      <div className="bg-slate-950 rounded-lg p-3 border border-slate-800 mt-2">
        <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-2">
          Continuous Batching: Zero-Idle Conveyor
        </div>
        <svg viewBox="0 0 360 66" className="w-full h-auto">
          <text x="4" y="14" fill="#94a3b8" fontSize="9" fontFamily="monospace">GPU SLOT 1</text>
          <rect x="75" y="4" width="90" height="14" rx="3" fill="#34d399" />
          <rect x="170" y="4" width="140" height="14" rx="3" fill="#38bdf8">
            <animate attributeName="opacity" values="0.5;1;0.5" dur="1.6s" repeatCount="indefinite" />
          </rect>
          <text x="240" y="14" fill="#0f172a" fontSize="8" fontWeight="bold" textAnchor="middle" fontFamily="monospace">NEW USER INJECTED</text>

          <text x="4" y="36" fill="#94a3b8" fontSize="9" fontFamily="monospace">GPU SLOT 2</text>
          <rect x="75" y="26" width="235" height="14" rx="3" fill="#818cf8" />

          <text x="4" y="58" fill="#94a3b8" fontSize="9" fontFamily="monospace">GPU SLOT 3</text>
          <rect x="75" y="48" width="55" height="14" rx="3" fill="#fbbf24" />
          <rect x="135" y="48" width="80" height="14" rx="3" fill="#34d399" />
          <rect x="220" y="48" width="90" height="14" rx="3" fill="#f472b6" />
        </svg>
      </div>
    );
  }

  if (type === "speculative") {
    return (
      <div className="bg-slate-950 rounded-lg p-3 border border-slate-800 mt-2">
        <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1.5">
          Speculative Decoding: Draft 4 Tokens → Verify in 1 Pass
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          {["Churn", "rose", "by", "14%"].map((w, i) => (
            <span
              key={i}
              className="px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-400 text-emerald-300 text-xs font-mono animate-bounce"
              style={{ animationDelay: `${i * 120}ms` }}
            >
              ✓ {w}
            </span>
          ))}
          <span className="px-2 py-0.5 rounded bg-rose-500/20 border border-rose-400 text-rose-300 text-xs font-mono line-through">
            ✗ last
          </span>
        </div>
      </div>
    );
  }

  // Default / Quantization / Routing
  return (
    <div className="bg-slate-950 rounded-lg p-3 border border-slate-800 mt-2">
      <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1.5">
        Precision &amp; Routing Compression
      </div>
      <div className="flex items-center justify-between text-xs font-mono">
        <div className="px-2.5 py-1 rounded bg-slate-900 border border-slate-700 text-slate-300">
          FP16: 140 GB VRAM
        </div>
        <ArrowRight className="w-4 h-4 text-cyan-400 animate-pulse" />
        <div className="px-2.5 py-1 rounded bg-cyan-950 border border-cyan-500 text-cyan-300 font-bold">
          FP8 / BitNet: 18–70 GB
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 3. PIPELINE STAGE DEFINITIONS (Vanilla vs 2026 Optimized vs Offline Edge)
// ============================================================================
const STAGES = [
  {
    id: 0,
    code: "01",
    title: "Gateway & Semantic Cache",
    shortDesc: "Auth, Guardrails & Cache Lookup",
    keywords: ["Semantic Cache", "ZDR", "RAG"],
    vanilla: {
      label: "Direct API Pass-Through",
      latency: "+45 ms",
      tokens: "100% Full Tokens",
      summary:
        "Every single prompt—even identical FAQs—goes straight to the GPU. No PII redaction, no semantic cache, and prompts may be logged by third-party vendors.",
      painPoint: "40% of enterprise queries are near-duplicates, burning millions of wasted tokens.",
    },
    optimized: {
      label: "Smart Gateway + Semantic Cache + ZDR",
      latency: "12 ms (Cache Hit)",
      tokens: "-38% Tokens Saved",
      summary:
        "Vector similarity checks if a semantically identical query was answered recently. Enforces Zero Data Retention (ZDR) and strips PII before inference.",
      breakthrough: "Redis/Vector Semantic Caching + Gateway Guardrails deflect ~35–40% of GPU calls.",
    },
    offline: {
      label: "Local Air-Gapped Loopback (localhost)",
      latency: "2 ms (Zero Network)",
      tokens: "100% On-Device",
      summary:
        "Zero cloud calls. Runs completely offline inside the laptop/workstation runtime (Ollama / llama.cpp) with strict physical air-gap privacy.",
      breakthrough: "100% data sovereignty—zero external internet packets leave the machine.",
    },
    newsFact:
      "2025–2026 Enterprise Trend: AI Gateways evolved from simple API proxies into 'FinOps & Governance Firewalls' enforcing ZDR, PII masking, and semantic caching across multi-model fleets.",
    visualType: "routing",
  },
  {
    id: 1,
    code: "02",
    title: "RAG & Context Compression",
    shortDesc: "Hybrid Search + Cross-Encoder Reranker",
    keywords: ["RAG", "Reranker", "Token"],
    vanilla: {
      label: "Top-50 Raw Chunk Dump",
      latency: "+320 ms",
      tokens: "18,500 Input Tokens",
      summary:
        "Dumps 50 raw vector search chunks into the prompt hoping the model finds the answer—causing 'Context Rot' and massive token bills.",
      painPoint: "Paying for 18,500 noisy input tokens when only 1,200 tokens actually contain the answer.",
    },
    optimized: {
      label: "Hybrid BM25 + Reranker + Prompt Compression",
      latency: "+95 ms",
      tokens: "2,400 Input Tokens (-87%)",
      summary:
        "Combines keyword + vector search, then uses a Cross-Encoder Reranker to keep only the top-4 paragraphs and prunes filler words.",
      breakthrough: "Rerankers + LLMLingua-2 style compression slash prompt size by 80%+ while boosting accuracy.",
    },
    offline: {
      label: "Local SQLite-VSS / LanceDB Embedded RAG",
      latency: "+40 ms",
      tokens: "1,800 Input Tokens",
      summary:
        "Queries an encrypted local vector index stored directly on the user's NVMe SSD, keeping context tight enough to fit inside a 8K–16K local window.",
      breakthrough: "Embedded single-file vector databases eliminate cloud Pinecone/Weaviate dependencies.",
    },
    newsFact:
      "Fun Fact: Stanford's 'Lost in the Middle' research proved that stuffing 100K tokens into a prompt actually drops LLM accuracy by >20% compared to a clean, reranked 3K context.",
    visualType: "tokens",
  },
  {
    id: 2,
    code: "03",
    title: "Complexity Model Router",
    shortDesc: "Right-Sizing Model Intelligence",
    keywords: ["MoE", "Quantization", "Token"],
    vanilla: {
      label: "Monolithic Flagship Model for Everything",
      latency: "1x Baseline Cost",
      tokens: "70B–405B Dense Model",
      summary:
        "Sends simple classification, JSON extraction, and complex reasoning all to the largest, most expensive frontier model.",
      painPoint: "Using a $15/1M-token frontier model to extract a date from an email.",
    },
    optimized: {
      label: "Trained Router → 8B / MoE / Frontier Tiering",
      latency: "-55% Blended Cost",
      tokens: "70% Small · 30% Frontier",
      summary:
        "A lightweight classifier scores prompt difficulty in 5ms: 70% route to a fast 8B or sparse MoE model; only hard multi-step reasoning hits the frontier model.",
      breakthrough: "Sparse Mixture-of-Experts (MoE) activates only ~10–15% of parameters per token.",
    },
    offline: {
      label: "Quantized 7B–14B GGUF / BitNet Local Model",
      latency: "Local NPU / CPU",
      tokens: "4-Bit / 1.58-Bit Weights",
      summary:
        "Runs a specialized small language model (SLM) quantized to 4-bit GGUF or 1.58-bit ternary weights directly on local hardware.",
      breakthrough: "2026 SLMs (7B–14B) match 2023 GPT-4 class benchmarks on domain tasks at 1/30th the size.",
    },
    newsFact:
      "Industry News: Production AI teams now treat models like cloud instance types—blending 3–4 models behind a router cuts blended token spend by 50–70% with zero eval drop.",
    visualType: "quantization",
  },
  {
    id: 3,
    code: "04",
    title: "Scheduler & Batching Engine",
    shortDesc: "Queueing Requests onto GPU Silicon",
    keywords: ["Continuous Batching", "VRAM"],
    vanilla: {
      label: "Static Batching ('The Convoy Effect')",
      latency: "+950 ms Queue Wait",
      tokens: "38% GPU Utilization",
      summary:
        "Groups 8 requests together and locks the batch until the longest answer finishes. If 7 users finish in 1 second and 1 takes 15 seconds, 7 GPU slots sit idle.",
      painPoint: "62% of expensive H100 GPU compute cycles burn idle waiting on stragglers.",
    },
    optimized: {
      label: "Continuous (In-Flight) Iteration Batching",
      latency: "18 ms Queue Wait",
      tokens: "89% GPU Utilization",
      summary:
        "Schedules at the single-token iteration level: the instant any request hits an End-of-Sequence token, it exits and a waiting user slides into the batch.",
      breakthrough: "Continuous batching + chunked prefill boosts cluster throughput by 4x–8x.",
    },
    offline: {
      label: "Single-User Priority Stream (Batch = 1)",
      latency: "0 ms Queue Wait",
      tokens: "100% Dedicated to You",
      summary:
        "No multi-tenant queue at all. Your local CPU/GPU dedicates 100% of its memory bandwidth exclusively to your single active prompt.",
      breakthrough: "Zero noisy-neighbor contention—consistent latency even on airplane Wi-Fi.",
    },
    newsFact:
      "Fun Fact: Continuous batching (pioneered in Orca and popularized by vLLM) was the single biggest software breakthrough that made commercial LLM APIs economically viable.",
    visualType: "batching",
  },
  {
    id: 4,
    code: "05",
    title: "Prefill Phase (Input Reading)",
    shortDesc: "Parallel Attention & TTFT",
    keywords: ["Prefill", "TTFT", "Prefix Caching"],
    vanilla: {
      label: "Full Recomputation Every Turn",
      latency: "2,800 ms TTFT",
      tokens: "Re-reads 100% Context",
      summary:
        "Computes matrix multiplications across the entire system prompt, chat history, and documents from scratch on every single message.",
      painPoint: "Compute-bound bottleneck: a 30K-token prompt freezes the GPU for seconds before outputting 1 word.",
    },
    optimized: {
      label: "Radix Prefix Caching + Chunked Prefill",
      latency: "145 ms TTFT (-95%)",
      tokens: "85% Prefix Cache Hit",
      summary:
        "Matches the static system prompt and RAG prefix in a Radix Tree and skips prefill math completely—jumping straight to generating the first token.",
      breakthrough: "Prefix caching slashes TTFT by up to 90% and discounts cached input tokens by 50–90%.",
    },
    offline: {
      label: "Prompt Cache Saved to Local SSD / RAM",
      latency: "210 ms TTFT",
      tokens: "Session State Persisted",
      summary:
        "llama.cpp saves the evaluated KV state of your local workspace/project files to RAM so follow-up questions start immediately.",
      breakthrough: "Persistent session state makes local coding assistants feel instantaneous.",
    },
    newsFact:
      "Key Distinction: Prefill is COMPUTE-BOUND (limited by GPU Tensor Core FLOPs), whereas Decode is MEMORY-BANDWIDTH BOUND (limited by how fast VRAM feeds weights to the chip).",
    visualType: "prefill_decode",
  },
  {
    id: 5,
    code: "06",
    title: "KV Cache & VRAM Management",
    shortDesc: "Attention Memory Allocation",
    keywords: ["KV Cache", "PagedAttention", "VRAM"],
    vanilla: {
      label: "Contiguous Pre-Allocated VRAM",
      latency: "Max 12 Concurrent Users",
      tokens: "62% VRAM Wasted",
      summary:
        "Reserves a giant contiguous block of GPU VRAM for each user's maximum possible context length—even if they only type 20 words.",
      painPoint: "GPU runs Out-Of-Memory (OOM) while over half of its VRAM sits empty due to fragmentation.",
    },
    optimized: {
      label: "PagedAttention + FP8 KV Quantization",
      latency: "Max 96 Concurrent Users (8x)",
      tokens: "<4% VRAM Waste",
      summary:
        "Divides KV Cache into non-contiguous 16-token memory pages (like OS virtual memory) and compresses KV tensors to FP8.",
      breakthrough: "PagedAttention + Grouped-Query Attention (GQA) unlocks 8x higher concurrency per GPU.",
    },
    offline: {
      label: "Q4_0 / Q8_0 Quantized KV Cache in Unified RAM",
      latency: "Fits in 6.4 GB RAM",
      tokens: "Apple Silicon / CPU UMA",
      summary:
        "Quantizes the KV Cache itself to 4-bit/8-bit inside Unified Memory Architecture (UMA), allowing a 32K context window on a standard 16GB laptop.",
      breakthrough: "Unified Memory lets integrated GPUs/NPUs read system RAM without slow PCIe copies.",
    },
    newsFact:
      "Fun Fact: For a 70B model serving long 64K contexts, the KV Cache per user can grow larger than the entire model's weights—making memory management the #1 scaling lever.",
    visualType: "vram",
  },
  {
    id: 6,
    code: "07",
    title: "Decode Phase (Token Streaming)",
    shortDesc: "Autoregressive Generation & ITL",
    keywords: ["Decode", "ITL", "Speculative Decoding"],
    vanilla: {
      label: "1-Token-at-a-Time FP16 Loop",
      latency: "42 ms ITL (24 tok/sec)",
      tokens: "1 Full Weight Read / Token",
      summary:
        "Reads all 140 GB of FP16 model weights from VRAM just to emit a single token—repeating this hundreds of times sequentially.",
      painPoint: "Painfully slow streaming speed on long code blocks or multi-step agent plans.",
    },
    optimized: {
      label: "EAGLE-3 Speculative Decoding + FP8",
      latency: "11 ms ITL (91 tok/sec · 3.8x)",
      tokens: "4–5 Tokens Verified / Pass",
      summary:
        "A lightweight draft head predicts 5 tokens ahead; the target model verifies all 5 in one parallel pass while FP8 halves memory bandwidth.",
      breakthrough: "Speculative decoding yields 2.5x–4x faster streaming with mathematically identical outputs.",
    },
    offline: {
      label: "BitNet b1.58 Ternary Add-Only Kernel",
      latency: "16 ms ITL (62 tok/sec on CPU)",
      tokens: "Zero Float Multiplications",
      summary:
        "Replaces floating-point matrix multiplication with fast integer additions using ternary {-1, 0, +1} weights—running smoothly on everyday CPUs.",
      breakthrough: "Microsoft BitNet b1.58 cuts energy consumption by up to 71% on CPU edge inference.",
    },
    newsFact:
      "2025–2026 Breakthrough: Speculative decoding with Multi-Token Prediction (MTP) heads built directly into frontier models (like DeepSeek & EAGLE-3) eliminated the need to host a separate draft model.",
    visualType: "speculative",
  },
  {
    id: 7,
    code: "08",
    title: "Compute & Silicon Topology",
    shortDesc: "Cluster Separation vs. Edge Silicon",
    keywords: ["Disaggregated Inference", "BitNet b1.58", "VRAM"],
    vanilla: {
      label: "Colocated Monolithic GPU Node",
      latency: "Jittery p99 Tail Latency",
      tokens: "Prefill Stalls Decode",
      summary:
        "Prefill and Decode run on the exact same GPU. Whenever one user submits a large document, everyone else's token stream freezes.",
      painPoint: "Impossible to meet strict 99.9% p95/p99 latency SLAs under bursty enterprise traffic.",
    },
    optimized: {
      label: "Disaggregated Prefill / Decode (NVLink + RDMA)",
      latency: "Rock-Solid 180ms p95 SLO",
      tokens: "Independent Pool Scaling",
      summary:
        "Separates compute-heavy Prefill GPUs from bandwidth-heavy Decode GPUs, transferring the KV Cache across ultra-fast NVLink/InfiniBand fabrics.",
      breakthrough: "Disaggregated inference lets operators scale reader and writer GPUs independently.",
    },
    offline: {
      label: "On-Device NPU / AVX-512 / Metal GPU",
      latency: "100% Offline · $0.00 / Token",
      tokens: "6.4 GB Total Footprint",
      summary:
        "Executes natively on Apple Metal, Qualcomm Hexagon NPU, or Intel/AMD AVX-512 instructions—working in submarines, hospitals, and flights.",
      breakthrough: "Zero marginal API cost and total resilience against cloud outages.",
    },
    newsFact:
      "Industry Shift: Fireworks AI, NVIDIA Dynamo, and vLLM v1 standardized Disaggregated Inference across H200/B200 clusters to eliminate tail-latency spikes at scale.",
    visualType: "prefill_decode",
  },
];

// ============================================================================
// 4. MAIN INTERACTIVE SIMULATOR COMPONENT
// ============================================================================
export default function AIInferenceSimulator() {
  const [mode, setMode] = useState("optimized"); // 'vanilla' | 'optimized' | 'offline'
  const [activeStep, setActiveStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1); // 0.5, 1, 2
  const [zoom, setZoom] = useState(100); // 80 to 135
  const [drawerStage, setDrawerStage] = useState(null); // stage object when '+' clicked
  const [selectedJargon, setSelectedJargon] = useState(null); // { data, x, y }
  const [promptText, setPromptText] = useState(
    "Analyze Q3 enterprise churn from CRM logs and draft an executive retention plan."
  );

  const containerRef = useRef(null);

  // Playback loop for "1-Go" animated walkthrough
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setActiveStep((prev) => {
        if (prev >= STAGES.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, 1800 / speed);
    return () => clearInterval(interval);
  }, [isPlaying, speed]);

  // Ctrl + Wheel Zoom support
  useEffect(() => {
    const onWheel = (e) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        setZoom((z) => Math.min(135, Math.max(80, z - Math.sign(e.deltaY) * 8)));
      }
    };
    window.addEventListener("wheel", onWheel, { passive: false });
    return () => window.removeEventListener("wheel", onWheel);
  }, []);

  // Text selection listener -> triggers Beginner Jargon Callout
  const handleTextSelection = () => {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed) return;
    const text = sel.toString();
    const match = lookupJargon(text);
    if (match) {
      const range = sel.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      setSelectedJargon({
        data: match,
        highlighted: text.trim(),
        x: Math.min(window.innerWidth - 390, Math.max(16, rect.left)),
        y: Math.min(window.innerHeight - 340, Math.max(70, rect.bottom + 10)),
      });
    }
  };

  // Manual click on any Jargon pill
  const openJargonPill = (keyword, e) => {
    e?.stopPropagation();
    const match = lookupJargon(keyword);
    if (!match) return;
    const rect = e?.currentTarget?.getBoundingClientRect();
    setSelectedJargon({
      data: match,
      highlighted: keyword,
      x: rect ? Math.min(window.innerWidth - 390, Math.max(16, rect.left)) : 40,
      y: rect ? Math.min(window.innerHeight - 340, Math.max(80, rect.bottom + 8)) : 120,
    });
  };

  // Live Telemetry HUD numbers based on selected architecture mode & current step
  const telemetry = useMemo(() => {
    const progressFactor = (activeStep + 1) / STAGES.length;
    if (mode === "vanilla") {
      return {
        era: "2022–2023 Naive Stack",
        ttft: `${Math.round(2800 * progressFactor)} ms`,
        itl: "42.0 ms (24 tok/s)",
        vram: "78.4 / 80 GB (62% Fragmented)",
        gpuUtil: "38%",
        costTask: "$0.0624 / task",
        badgeColor: "text-rose-400 border-rose-500/40 bg-rose-950/50",
      };
    }
    if (mode === "offline") {
      return {
        era: "2026 Offline Edge (BitNet b1.58 / GGUF)",
        ttft: `${Math.round(210 * progressFactor)} ms`,
        itl: "16.0 ms (62 tok/s · CPU/NPU)",
        vram: "6.4 / 16 GB Unified RAM",
        gpuUtil: "100% Local (Air-Gapped)",
        costTask: "$0.0000 / task (Offline)",
        badgeColor: "text-amber-300 border-amber-500/40 bg-amber-950/50",
      };
    }
    return {
      era: "2026 Production Cloud Stack",
      ttft: `${Math.round(145 * progressFactor)} ms`,
      itl: "11.0 ms (91 tok/s · EAGLE-3)",
      vram: "44.2 / 80 GB (96% Packed)",
      gpuUtil: "89%",
      costTask: "$0.0041 / task (-93%)",
      badgeColor: "text-emerald-400 border-emerald-500/40 bg-emerald-950/50",
    };
  }, [mode, activeStep]);

  const currentStage = STAGES[activeStep];
  const stageModeData = currentStage[mode];

  const handleRunOneGo = () => {
    setActiveStep(0);
    setIsPlaying(true);
  };

  return (
    <div
      ref={containerRef}
      onMouseUp={handleTextSelection}
      className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-400 selection:text-slate-950 pb-16"
    >
      {/* ================================================================== */}
      {/* TOP COMMAND HEADER & TELEMETRY HUD                                 */}
      {/* ================================================================== */}
      <header className="sticky top-0 z-30 bg-slate-950/95 backdrop-blur border-b border-slate-800 px-5 py-3.5">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-widest text-cyan-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Interactive AI Systems &amp; Inference Visualizer</span>
            </div>
            <h1 className="text-lg md:text-xl font-extrabold text-white tracking-tight">
              Inside an AI Prompt: Vanilla vs. 2026 Cloud vs. Offline Edge
            </h1>
          </div>

          {/* Architecture Mode Switcher */}
          <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setMode("vanilla")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                mode === "vanilla"
                  ? "bg-rose-600 text-white shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              Vanilla AI (Naive)
            </button>
            <button
              onClick={() => setMode("optimized")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                mode === "optimized"
                  ? "bg-emerald-600 text-white shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              2026 Production Stack
            </button>
            <button
              onClick={() => setMode("offline")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                mode === "offline"
                  ? "bg-amber-600 text-white shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <WifiOff className="w-3.5 h-3.5" />
              Offline Edge (1-Bit)
            </button>
          </div>
        </div>

        {/* Live Telemetry Bar */}
        <div className="max-w-7xl mx-auto mt-3 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-xs font-mono">
          <div className={`px-3 py-1.5 rounded-lg border ${telemetry.badgeColor}`}>
            <div className="text-[9px] uppercase opacity-75">Active Stack</div>
            <div className="font-bold truncate">{telemetry.era}</div>
          </div>
          <div className="bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-lg">
            <div className="text-[9px] text-slate-400 uppercase">TTFT (First Word)</div>
            <div className="font-bold text-white">{telemetry.ttft}</div>
          </div>
          <div className="bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-lg">
            <div className="text-[9px] text-slate-400 uppercase">ITL / Stream Speed</div>
            <div className="font-bold text-cyan-300">{telemetry.itl}</div>
          </div>
          <div className="bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-lg">
            <div className="text-[9px] text-slate-400 uppercase">Memory / VRAM</div>
            <div className="font-bold text-indigo-300 truncate">{telemetry.vram}</div>
          </div>
          <div className="bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-lg">
            <div className="text-[9px] text-slate-400 uppercase">Compute Utilization</div>
            <div className="font-bold text-emerald-300">{telemetry.gpuUtil}</div>
          </div>
          <div className="bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-lg">
            <div className="text-[9px] text-slate-400 uppercase">Cost / Successful Task</div>
            <div className="font-bold text-amber-300">{telemetry.costTask}</div>
          </div>
        </div>
      </header>

      {/* ================================================================== */}
      {/* BEGINNER HELPER BANNER (Highlight any word OR click pills)         */}
      {/* ================================================================== */}
      <div className="max-w-7xl mx-auto px-5 mt-4">
        <div className="bg-gradient-to-r from-cyan-950/60 via-slate-900 to-indigo-950/60 border border-cyan-500/30 rounded-xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 text-xs text-slate-200">
            <BookOpen className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>
              <strong className="text-cyan-300">Beginner Mode Active:</strong> Highlight{" "}
              <span className="underline decoration-cyan-400 decoration-dotted font-semibold">
                any technical word
              </span>{" "}
              on this page with your cursor—or click a term below—to pop up a plain-English explanation, analogy &amp; animation:
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {["Token", "Prefill", "KV Cache", "PagedAttention", "Decode", "Speculative Decoding", "BitNet b1.58"].map(
              (kw) => (
                <button
                  key={kw}
                  onClick={(e) => openJargonPill(kw, e)}
                  className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-slate-950 hover:bg-cyan-950 text-cyan-300 border border-cyan-500/40 transition cursor-pointer"
                >
                  {kw} ?
                </button>
              )
            )}
          </div>
        </div>
      </div>

      {/* ================================================================== */}
      {/* PROMPT INPUT & PLAYBACK / ZOOM CONTROLS                            */}
      {/* ================================================================== */}
      <div className="max-w-7xl mx-auto px-5 mt-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* Prompt Box */}
          <div className="flex-1">
            <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1">
              Live User Prompt (Edit or Fire in 1-Go)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-cyan-400"
              />
              <button
                onClick={handleRunOneGo}
                className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold text-xs uppercase tracking-wider flex items-center gap-1.5 shrink-0 shadow-lg shadow-cyan-500/20 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                Run 1-Go
              </button>
            </div>
          </div>

          {/* Step & Zoom Toolbar */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold flex items-center gap-1.5 border border-slate-700"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5 text-amber-400" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
              {isPlaying ? "Pause" : "Resume"}
            </button>
            <button
              onClick={() => {
                setIsPlaying(false);
                setActiveStep((s) => (s + 1) % STAGES.length);
              }}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold flex items-center gap-1.5 border border-slate-700"
            >
              <SkipForward className="w-3.5 h-3.5 text-cyan-400" />
              Next Step
            </button>
            <button
              onClick={() => {
                setIsPlaying(false);
                setActiveStep(0);
              }}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700"
              title="Reset to Step 1"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-300" />
            </button>

            {/* Speed Selector */}
            <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-1 text-[11px] font-mono">
              {[0.5, 1, 2].map((sp) => (
                <button
                  key={sp}
                  onClick={() => setSpeed(sp)}
                  className={`px-2 py-1 rounded-lg ${
                    speed === sp ? "bg-slate-800 text-cyan-300 font-bold" : "text-slate-500"
                  }`}
                >
                  {sp}x
                </button>
              ))}
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded-xl px-2 py-1">
              <button
                onClick={() => setZoom((z) => Math.max(80, z - 10))}
                className="p-1 hover:text-cyan-400"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-[11px] font-mono w-10 text-center text-slate-300">{zoom}%</span>
              <button
                onClick={() => setZoom((z) => Math.min(135, z + 10))}
                className="p-1 hover:text-cyan-400"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ================================================================== */}
      {/* ANIMATED 8-STAGE PIPELINE CANVAS (ZOOMABLE + '+' DRILL-DOWN)       */}
      {/* ================================================================== */}
      <div className="max-w-7xl mx-auto px-5 mt-6 overflow-x-auto">
        <div
          style={{ transform: `scale(${zoom / 100})`, transformOrigin: "top left" }}
          className="transition-transform duration-200 min-w-[980px]"
        >
          {/* Animated SVG Flow Track Connecting All 8 Stages */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 relative">
            <div className="flex items-center justify-between mb-3">
              <div className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Eye className="w-4 h-4 text-cyan-400" />
                <span>
                  Step {activeStep + 1} of 8: <strong className="text-white">{currentStage.title}</strong> — Click any{" "}
                  <span className="inline-flex items-center justify-center w-4 h-4 rounded bg-cyan-500 text-slate-950 font-black text-[11px]">
                    +
                  </span>{" "}
                  icon to zoom deep inside that engine stage
                </span>
              </div>
              <div className="text-[11px] font-mono text-slate-400">
                Tip: Ctrl + Scroll to Zoom Canvas
              </div>
            </div>

            {/* Animated Signal Rail SVG */}
            <svg viewBox="0 0 1120 42" className="w-full h-9 mb-2">
              <line
                x1="60"
                y1="21"
                x2="1060"
                y2="21"
                stroke="#1e293b"
                strokeWidth="4"
                strokeLinecap="round"
              />
              {/* Animated Flowing Packet Stream */}
              <line
                x1="60"
                y1="21"
                x2={60 + (activeStep / (STAGES.length - 1)) * 1000}
                y2="21"
                stroke={mode === "vanilla" ? "#f43f5e" : mode === "offline" ? "#f59e0b" : "#22d3ee"}
                strokeWidth="4"
                strokeDasharray="10 6"
                strokeLinecap="round"
              >
                <animate attributeName="stroke-dashoffset" from="32" to="0" dur="0.9s" repeatCount="indefinite" />
              </line>

              {/* Glowing Active Pulse Packet */}
              <circle
                cx={60 + (activeStep / (STAGES.length - 1)) * 1000}
                cy="21"
                r="8"
                fill={mode === "vanilla" ? "#fb7185" : mode === "offline" ? "#fbbf24" : "#22d3ee"}
              >
                <animate attributeName="r" values="6;11;6" dur="1.1s" repeatCount="indefinite" />
              </circle>

              {/* Stage Milestone Dots */}
              {STAGES.map((st, idx) => {
                const cx = 60 + (idx / (STAGES.length - 1)) * 1000;
                const done = idx <= activeStep;
                return (
                  <g
                    key={st.id}
                    onClick={() => {
                      setIsPlaying(false);
                      setActiveStep(idx);
                    }}
                    className="cursor-pointer"
                  >
                    <circle
                      cx={cx}
                      cy="21"
                      r="11"
                      fill={done ? "#0f172a" : "#020617"}
                      stroke={
                        idx === activeStep
                          ? "#22d3ee"
                          : done
                          ? "#34d399"
                          : "#334155"
                      }
                      strokeWidth="2.5"
                    />
                    <text
                      x={cx}
                      y="25"
                      fill="#ffffff"
                      fontSize="9"
                      fontWeight="bold"
                      fontFamily="monospace"
                      textAnchor="middle"
                    >
                      {st.code}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* 8 Interactive Stage Cards Grid */}
            <div className="grid grid-cols-4 gap-3.5 mt-2">
              {STAGES.map((st, idx) => {
                const isActive = idx === activeStep;
                const isVisited = idx < activeStep;
                const info = st[mode];
                return (
                  <div
                    key={st.id}
                    onClick={() => {
                      setIsPlaying(false);
                      setActiveStep(idx);
                    }}
                    className={`rounded-xl p-3.5 border transition-all cursor-pointer relative flex flex-col justify-between ${
                      isActive
                        ? "bg-slate-900 border-cyan-400 ring-2 ring-cyan-400/30 shadow-lg shadow-cyan-500/10 scale-[1.01]"
                        : isVisited
                        ? "bg-slate-900/80 border-emerald-500/40 opacity-95"
                        : "bg-slate-950/80 border-slate-800 opacity-70 hover:opacity-100"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span
                          className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                            isActive
                              ? "bg-cyan-400 text-slate-950"
                              : isVisited
                              ? "bg-emerald-500/20 text-emerald-300"
                              : "bg-slate-800 text-slate-400"
                          }`}
                        >
                          STAGE {st.code}
                        </span>

                        {/* '+' DRILL-DOWN ZOOM BUTTON */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveStep(idx);
                            setDrawerStage(st);
                          }}
                          title="Drill down into deep technical & beginner view"
                          className="w-6 h-6 rounded-lg bg-slate-800 hover:bg-cyan-400 hover:text-slate-950 text-cyan-300 border border-slate-700 flex items-center justify-center transition cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5 stroke-[2.75]" />
                        </button>
                      </div>

                      <h3 className="text-sm font-extrabold text-white leading-snug">
                        {st.title}
                      </h3>
                      <p className="text-[11px] text-slate-400 mt-0.5">{info.label}</p>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-800/80">
                      <div className="flex items-center justify-between text-[11px] font-mono mb-2">
                        <span className="text-slate-400">{info.latency}</span>
                        <span
                          className={
                            mode === "vanilla"
                              ? "text-rose-400 font-bold"
                              : mode === "offline"
                              ? "text-amber-300 font-bold"
                              : "text-emerald-400 font-bold"
                          }
                        >
                          {info.tokens}
                        </span>
                      </div>

                      {/* Clickable Jargon Pills on each Card */}
                      <div className="flex flex-wrap gap-1">
                        {st.keywords.map((kw) => (
                          <button
                            key={kw}
                            onClick={(e) => openJargonPill(kw, e)}
                            className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-950 hover:bg-cyan-950 text-cyan-300/90 border border-slate-700/80 underline decoration-dotted"
                          >
                            {kw}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ================================================================== */}
      {/* ACTIVE STAGE LIVE IMAGINATION STAGE & VANILLA VS MODERN CALLOUTS   */}
      {/* ================================================================== */}
      <div className="max-w-7xl mx-auto px-5 mt-6 grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left 7 Cols: Live Animated Imagination Theater for Current Step */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-bold">
                Stage {currentStage.code} Live Action · {currentStage.title}
              </span>
              <button
                onClick={() => setDrawerStage(currentStage)}
                className="text-xs font-bold px-3 py-1 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/40 flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Deep Drill-Down &amp; News
              </button>
            </div>

            <h2 className="text-xl font-extrabold text-white">{stageModeData.label}</h2>
            <p className="text-sm text-slate-300 mt-2 leading-relaxed">{stageModeData.summary}</p>

            {/* Animated Visual for this stage */}
            <div className="mt-3">
              <MiniAnimatedVisual type={currentStage.visualType} />
            </div>
          </div>

          {/* Bottleneck vs Breakthrough Callout Box */}
          <div className="mt-4">
            {mode === "vanilla" ? (
              <div className="bg-rose-950/40 border border-rose-500/40 rounded-xl p-3.5 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-rose-300">
                    Why Vanilla AI Struggled Here
                  </div>
                  <p className="text-xs text-rose-100/90 mt-0.5">{stageModeData.painPoint}</p>
                </div>
              </div>
            ) : (
              <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-xl p-3.5 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                    Engineering Breakthrough Applied
                  </div>
                  <p className="text-xs text-emerald-100/90 mt-0.5">{stageModeData.breakthrough}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right 5 Cols: Industry News, Fun Facts & Offline Edge Breakthroughs */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <div className="text-xs font-mono uppercase tracking-wider text-amber-400 font-bold flex items-center gap-1.5 mb-2">
              <Sparkles className="w-4 h-4" />
              <span>Industry News &amp; Engineering Fun Fact</span>
            </div>
            <p className="text-sm text-slate-200 leading-relaxed bg-slate-950/80 border border-slate-800 rounded-xl p-3.5">
              {currentStage.newsFact}
            </p>

            <div className="mt-4">
              <div className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-2">
                Click Any Term to Translate for Beginners
              </div>
              <div className="flex flex-wrap gap-1.5">
                {Object.keys(JARGON_DB)
                  .slice(0, 14)
                  .map((k) => (
                    <button
                      key={k}
                      onClick={(e) => openJargonPill(k, e)}
                      className="text-xs font-mono px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-cyan-950 text-cyan-300 border border-slate-800 hover:border-cyan-500/50 transition cursor-pointer"
                    >
                      {JARGON_DB[k].term.split("(")[0].trim()}
                    </button>
                  ))}
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Mode: {mode.toUpperCase()}</span>
            <button
              onClick={() => setMode(mode === "vanilla" ? "optimized" : mode === "optimized" ? "offline" : "vanilla")}
              className="text-cyan-400 hover:underline font-bold cursor-pointer"
            >
              Compare Next Architecture →
            </button>
          </div>
        </div>
      </div>

      {/* ================================================================== */}
      {/* FLOATING BEGINNER JARGON POPOVER (Triggered by Word Selection)     */}
      {/* ================================================================== */}
      {selectedJargon && (
        <div
          style={{ left: selectedJargon.x, top: selectedJargon.y }}
          className="fixed z-50 w-[370px] max-w-[92vw] bg-slate-900 border-2 border-cyan-400 rounded-2xl shadow-2xl shadow-black/80 p-4 animate-in fade-in duration-150"
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold">
                {selectedJargon.data.category}
              </span>
              <h4 className="text-base font-extrabold text-white mt-1">
                {selectedJargon.data.term}
              </h4>
            </div>
            <button
              onClick={() => setSelectedJargon(null)}
              className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-slate-200 mt-2 leading-relaxed">
            {selectedJargon.data.plain}
          </p>

          <div className="mt-2.5 bg-amber-950/40 border border-amber-500/30 rounded-xl p-2.5 text-xs text-amber-100">
            <strong className="text-amber-300">Mental Picture: </strong>
            {selectedJargon.data.analogy}
          </div>

          <MiniAnimatedVisual type={selectedJargon.data.visualType} />
        </div>
      )}

      {/* ================================================================== */}
      {/* '+' STAGE DEEP DRILL-DOWN MODAL DRAWER                             */}
      {/* ================================================================== */}
      {drawerStage && (
        <div
          onClick={() => setDrawerStage(null)}
          className="fixed inset-0 z-40 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-900 border border-slate-700 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <div className="text-xs font-mono uppercase tracking-wider text-cyan-400">
                  Deep Architecture Drill-Down · Stage {drawerStage.code}
                </div>
                <h2 className="text-2xl font-black text-white mt-0.5">{drawerStage.title}</h2>
              </div>
              <button
                onClick={() => setDrawerStage(null)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 3-Era Side-by-Side Comparison */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
              <div className="bg-rose-950/25 border border-rose-500/40 rounded-xl p-3.5">
                <div className="text-[10px] font-mono uppercase font-bold text-rose-400">
                  1. Vanilla AI (Naive)
                </div>
                <div className="text-sm font-bold text-white mt-1">{drawerStage.vanilla.label}</div>
                <div className="text-xs font-mono text-rose-300 mt-1">
                  {drawerStage.vanilla.latency} · {drawerStage.vanilla.tokens}
                </div>
                <p className="text-xs text-slate-300 mt-2">{drawerStage.vanilla.summary}</p>
              </div>

              <div className="bg-emerald-950/25 border border-emerald-500/40 rounded-xl p-3.5">
                <div className="text-[10px] font-mono uppercase font-bold text-emerald-400">
                  2. 2026 Production Cloud
                </div>
                <div className="text-sm font-bold text-white mt-1">{drawerStage.optimized.label}</div>
                <div className="text-xs font-mono text-emerald-300 mt-1">
                  {drawerStage.optimized.latency} · {drawerStage.optimized.tokens}
                </div>
                <p className="text-xs text-slate-300 mt-2">{drawerStage.optimized.summary}</p>
              </div>

              <div className="bg-amber-950/25 border border-amber-500/40 rounded-xl p-3.5">
                <div className="text-[10px] font-mono uppercase font-bold text-amber-400">
                  3. Offline Local Edge
                </div>
                <div className="text-sm font-bold text-white mt-1">{drawerStage.offline.label}</div>
                <div className="text-xs font-mono text-amber-300 mt-1">
                  {drawerStage.offline.latency} · {drawerStage.offline.tokens}
                </div>
                <p className="text-xs text-slate-300 mt-2">{drawerStage.offline.summary}</p>
              </div>
            </div>

            {/* Interactive Animation Inside Drawer */}
            <div className="mt-4">
              <MiniAnimatedVisual type={drawerStage.visualType} />
            </div>

            {/* Plain-English Jargon Breakdown for this Stage */}
            <div className="mt-5">
              <div className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-bold mb-2">
                Key Industry Terms in This Stage (Beginner Translation)
              </div>
              <div className="space-y-2.5">
                {drawerStage.keywords.map((kw) => {
                  const item = lookupJargon(kw);
                  if (!item) return null;
                  return (
                    <div key={kw} className="bg-slate-950 border border-slate-800 rounded-xl p-3">
                      <div className="text-sm font-bold text-white">{item.term}</div>
                      <p className="text-xs text-slate-300 mt-1">{item.plain}</p>
                      <p className="text-xs text-amber-300/90 mt-1">
                        <strong>Analogy:</strong> {item.analogy}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* News & Fun Fact */}
            <div className="mt-4 bg-indigo-950/40 border border-indigo-500/30 rounded-xl p-3.5 text-xs text-indigo-100">
              <strong className="text-indigo-300 uppercase font-mono">News &amp; Fun Fact: </strong>
              {drawerStage.newsFact}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
