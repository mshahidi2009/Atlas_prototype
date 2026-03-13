import { useState, useCallback } from "react";

const MODES = [
  { id: "systems", name: "Systems Thinking", icon: "🔭", color: "#6366f1", desc: "Interconnections, feedback loops, emergence", tagline: "See the web beneath the surface." },
  { id: "game", name: "Game Theory", icon: "♜", color: "#ec4899", desc: "Players, incentives, moves & countermoves", tagline: "Every move reshapes the board." },
  { id: "firstprinciples", name: "First Principles", icon: "🔬", color: "#f59e0b", desc: "Break assumptions, rebuild from foundational truths", tagline: "Ignore how it's always been done." },
  { id: "inversion", name: "Inversion", icon: "📐", color: "#14b8a6", desc: "What if the opposite were true?", tagline: "Flip the problem to find the answer." },
  { id: "scenario", name: "Scenario Planning", icon: "🔮", color: "#8b5cf6", desc: "Futures cone — possible, probable, preferred", tagline: "Map the territory before you travel." },
  { id: "leverage", name: "Leverage Points", icon: "⚡", color: "#f97316", desc: "Where small changes create outsized impact", tagline: "Find the fulcrum. Move the world." },
  { id: "mentalmodels", name: "Mental Models", icon: "🧩", color: "#06b6d4", desc: "Relevant frameworks applied to your scenario", tagline: "The right lens changes everything." },
  { id: "emergent", name: "Emergent Strategy", icon: "🌊", color: "#10b981", desc: "Sense & respond, adaptive thinking", tagline: "Strategy that evolves as you move." },
  { id: "divergent", name: "Divergent Thinking", icon: "💡", color: "#a78bfa", desc: "Generate multiple unique solutions to open-ended problems", tagline: "Connecting the unconnected sparks the original." },
  { id: "convergent", name: "Convergent Thinking", icon: "🎯", color: "#f43f5e", desc: "Apply logic to find the single best solution", tagline: "Constraints transform imagination into product." },
  { id: "lateral", name: "Lateral Thinking", icon: "↗️", color: "#84cc16", desc: "Indirect, non-linear problem solving", tagline: "Look sideways to see what logic misses." },
  { id: "systemic", name: "Systemic Thinking", icon: "🌐", color: "#0ea5e9", desc: "How individual parts affect the whole", tagline: "The big picture prevents small-fix disasters." },
  { id: "associative", name: "Associative Thinking", icon: "🔗", color: "#e879f9", desc: "Connect ideas in unexpected ways", tagline: "Mental wandering finds hidden links." },
  { id: "critical", name: "Critical Thinking", icon: "🔍", color: "#fb923c", desc: "Evaluate objectively to make clear judgments", tagline: "Question assumptions — base choices on reality." },
  { id: "analogical", name: "Analogical Thinking", icon: "🏛️", color: "#34d399", desc: "Use solutions from one field to solve problems in another", tagline: "A proven blueprint from an unlikely source." },
  { id: "abductive", name: "Abductive Thinking", icon: "🧭", color: "#fbbf24", desc: "Form likely theories from limited information", tagline: "Move fast when you don't have all the facts." },
  { id: "secondorder", name: "Second-Order Thinking", icon: "⏳", color: "#818cf8", desc: "Consider long-term consequences of decisions", tagline: "Ask 'and then what?' before it's too late." },
  { id: "janusian", name: "Janusian Thinking", icon: "⚖️", color: "#f472b6", desc: "Hold two opposite ideas simultaneously", tagline: "Opposites in tension unlock breakthroughs." },
  { id: "metacognitive", name: "Metacognitive Thinking", icon: "🪞", color: "#2dd4bf", desc: "Awareness and management of your own thought process", tagline: "Understand how you think to think better." },
];

const systemPrompt = `You are a strategic thinking coach for consultants, strategists, and operations professionals.
When given a scenario, problem type, and desired outcome, analyze it through a specific mode of high-level thinking.

Your response MUST do three things:
1. REFRAME the problem clearly — help the user see it in a genuinely new way through this lens
2. EXPAND the solution space — surface options, angles, or possibilities the user likely hasn't considered
3. CONVERGE toward intelligent action — give concrete, prioritized direction for decision-making and execution

CRITICAL FORMATTING RULES — follow exactly, no exceptions:
- Use ONLY these five headers, exactly as written, each on its own line: **Reframe**, **Expanded Solution Space**, **Converge → Action**, **Strategic Question**
- Do NOT use **bold** anywhere else — not inside paragraphs, not as sub-headers, not mid-sentence
- Do NOT create sub-headers or nested headers of any kind
- Do NOT number your bullet points
- Each bullet point must be a complete sentence on a single line starting with •
- Write the Reframe as plain prose sentences with no bold, no colons introducing phrases, no sub-labels
- Write the Strategic Question as a single plain sentence with no bold

Format your response exactly like this:

**Reframe**
2-3 plain prose sentences that recast the problem through this thinking mode. No bold. No sub-labels. Just clear, powerful reframing.

**Expanded Solution Space**
• First possibility or angle as a full sentence.
• Second possibility or angle as a full sentence.
• Third possibility or angle as a full sentence.
• Fourth possibility or angle as a full sentence if relevant.

**Converge → Action**
• First concrete action or decision as a full sentence.
• Second concrete action or decision as a full sentence.
• Third concrete action or decision as a full sentence.

**Strategic Question**
One powerful plain-text question that sharpens thinking and guides the next move.

Keep language sharp, practitioner-grade, and specific to the scenario. No generic advice. No deviations from the format above.`;

const recommendPrompt = `You are a strategic thinking coach. Given a scenario, problem type, and desired outcome, recommend the TOP 3 most relevant thinking modes and explain in one sentence why each fits. These will be automatically analyzed for the user.

Modes: ${MODES.map(m => m.name).join(", ")}

Respond ONLY with valid JSON, no markdown, no backticks:
{"recommendations":[{"name":"Mode Name","reason":"One sentence why"}]}`;

function parseMarkdown(text, color) {
  const accentColor = color || '#0a59db';
  // Only treat **...** as a section header if it appears at the start of a line (possibly after whitespace)
  // Split into lines and process each
  const lines = text.split('\n');
  const processedLines = lines.map(line => {
    const trimmed = line.trim();
    // Line-level bold header: entire line is **Header Text**
    if (/^\*\*([^*]+)\*\*$/.test(trimmed)) {
      const headerText = trimmed.replace(/^\*\*|\*\*$/g, '');
      return `<div style="color:${accentColor};font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:2px;margin-top:18px;margin-bottom:8px">${headerText}</div>`;
    }
    // Bullet point
    if (/^•\s+/.test(trimmed)) {
      const content = trimmed.replace(/^•\s+/, '');
      // Inline bold within bullet (just make it strong, not a header)
      const inlined = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      return `<li style="margin-bottom:8px;padding-left:4px;line-height:1.7">${inlined}</li>`;
    }
    // Empty line
    if (trimmed === '') return '';
    // Regular prose — inline bold becomes <strong>, not a header
    const inlined = trimmed.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    return `<p style="margin:0 0 8px;line-height:1.75">${inlined}</p>`;
  });

  // Wrap consecutive <li> elements in <ul>
  let html = processedLines.join('');
  html = html.replace(/(<li[^>]*>.*?<\/li>)+/gs, match => `<ul style="padding-left:18px;margin:4px 0 10px;list-style:disc">${match}</ul>`);
  return html;
}

export default function App() {
  const [scenario, setScenario] = useState("");
  const [problemType, setProblemType] = useState("");
  const [desiredOutcome, setDesiredOutcome] = useState("");
  const [view, setView] = useState("input");
  const [recommendations, setRecommendations] = useState([]);
  const [loadingRecs, setLoadingRecs] = useState(false);
  const [activeMode, setActiveMode] = useState(null);
  const [modeInsights, setModeInsights] = useState({});
  const [loadingMode, setLoadingMode] = useState(null);
  const [layout, setLayout] = useState("carousel");
  const [carouselIdx, setCarouselIdx] = useState(0);
  const [sessionLog, setSessionLog] = useState([]);
  const [topThree, setTopThree] = useState([]);
  const [saved, setSaved] = useState({}); // modeId -> true
  const [savedPanelOpen, setSavedPanelOpen] = useState(false);
  const [decisionInput, setDecisionInput] = useState("");
  const [decisionLoading, setDecisionLoading] = useState(false);
  const [decisionOutput, setDecisionOutput] = useState("");

  const callClaude = useCallback(async (messages, sys) => {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1200, system: sys, messages }),
    });
    if (!res.ok) throw new Error(`API error ${res.status}`);
    const data = await res.json();
    return data.content?.map(b => b.text || "").join("") || "";
  }, []);

  const analyzeMode = useCallback(async (mode, sc, pt, dout, existingInsights) => {
    if (existingInsights[mode.id]) return null;
    const context = `Scenario: ${sc}${pt ? `\nProblem Type: ${pt}` : ""}${dout ? `\nDesired Outcome: ${dout}` : ""}`;
    const text = await callClaude([{ role: "user", content: `${context}\n\nAnalyze this through the lens of: ${mode.name}\n${mode.desc}` }], systemPrompt);
    return { modeId: mode.id, text };
  }, [callClaude]);

  const handleSubmit = async () => {
    if (!scenario.trim()) return;
    setLoadingRecs(true);
    setView("explore");
    setModeInsights({});
    setSessionLog([]);
    setTopThree([]);
    setSaved({});
    setDecisionOutput("");

    try {
      const context = `Scenario: ${scenario}${problemType ? `\nProblem Type: ${problemType}` : ""}${desiredOutcome ? `\nDesired Outcome: ${desiredOutcome}` : ""}`;
      const raw = await callClaude([{ role: "user", content: context }], recommendPrompt);
      const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
      const recs = parsed.recommendations?.slice(0, 3) || [];
      setRecommendations(recs);
      const top3 = recs.map(r => MODES.find(m => m.name === r.name)).filter(Boolean);
      setTopThree(top3);
      if (top3[0]) { setActiveMode(top3[0]); setCarouselIdx(MODES.indexOf(top3[0])); }
      setLoadingRecs(false);

      const results = await Promise.all(top3.map(m => analyzeMode(m, scenario, problemType, desiredOutcome, {}).catch(() => null)));
      const newInsights = {};
      const newLog = [];
      results.forEach((r, i) => {
        if (r) {
          newInsights[r.modeId] = r.text;
          newLog.push({ modeId: r.modeId, modeName: top3[i].name, icon: top3[i].icon, content: r.text, color: top3[i].color });
        }
      });
      setModeInsights(newInsights);
      setSessionLog(newLog);
    } catch (e) {
      console.error(e);
      setLoadingRecs(false);
    }
  };

  const exploreMode = async (mode) => {
    setActiveMode(mode);
    setCarouselIdx(MODES.indexOf(mode));
    if (modeInsights[mode.id]) return;
    setLoadingMode(mode.id);
    try {
      const result = await analyzeMode(mode, scenario, problemType, desiredOutcome, modeInsights);
      if (result) {
        setModeInsights(prev => ({ ...prev, [result.modeId]: result.text }));
        setSessionLog(prev => prev.find(e => e.modeId === mode.id) ? prev : [...prev, { modeId: mode.id, modeName: mode.name, icon: mode.icon, content: result.text, color: mode.color }]);
      }
    } catch {
      setModeInsights(prev => ({ ...prev, [mode.id]: "Error loading insights. Please try again." }));
    }
    setLoadingMode(null);
  };

  const toggleSave = (mode) => {
    setSaved(prev => {
      const next = { ...prev };
      if (next[mode.id]) { delete next[mode.id]; } else { next[mode.id] = true; setSavedPanelOpen(true); }
      return next;
    });
  };

  const handleDecisionSupport = async () => {
    if (!decisionInput.trim() && Object.keys(saved).length === 0) return;
    setDecisionLoading(true);
    setDecisionOutput("");
    const savedModes = MODES.filter(m => saved[m.id]);
    const savedInsights = savedModes.map(m => `[${m.name}]\n${modeInsights[m.id] || ""}`).join("\n\n");
    const prompt = `You are a strategic decision coach. The user has explored multiple thinking modes and starred the most relevant analyses. Now help them move to decision and execution.

Original Scenario: ${scenario}
${problemType ? `Problem Type: ${problemType}` : ""}
${desiredOutcome ? `Desired Outcome: ${desiredOutcome}` : ""}

Starred Analyses:
${savedInsights || "None starred yet."}

User's decision note: ${decisionInput || "No note provided."}

Synthesize the starred insights and provide:

**Decision Synthesis**
[2-3 sentences that integrate the starred perspectives into a coherent strategic position]

**Top 3 Actions to Take Now**
• [Action 1 — specific and executable]
• [Action 2 — specific and executable]
• [Action 3 — specific and executable]

**Key Risk to Watch**
[One critical risk or blind spot to monitor]

**Your Next Move**
[One sentence: the single most important thing to do in the next 48 hours]`;

    try {
      const text = await callClaude([{ role: "user", content: prompt }], "You are a sharp, practitioner-grade strategic advisor. Be direct, specific, and actionable. No fluff.");
      setDecisionOutput(text);
    } catch { setDecisionOutput("Error generating decision support. Please try again."); }
    setDecisionLoading(false);
  };

  const exportSession = () => {
    const savedModes = MODES.filter(m => saved[m.id]);
    const lines = ["PERSPECTIVE PARTNER — SESSION EXPORT", `Scenario: ${scenario}`, problemType ? `Problem Type: ${problemType}` : "", desiredOutcome ? `Desired Outcome: ${desiredOutcome}` : "", `Date: ${new Date().toLocaleDateString()}`, "", "TOP 3 RECOMMENDED MODES:", ...recommendations.map(r => `• ${r.name}: ${r.reason}`), "", "STARRED ANALYSES:", ...savedModes.map(m => [`\n${"─".repeat(40)}`, `${m.icon} ${m.name}`, "─".repeat(40), (modeInsights[m.id] || "").replace(/\*\*/g, "")].join("\n")), decisionOutput ? ["\n" + "═".repeat(40), "DECISION & EXECUTION SUPPORT", "═".repeat(40), decisionOutput.replace(/\*\*/g, "")].join("\n") : ""];
    const blob = new Blob([lines.filter(Boolean).join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "perspective-partner.txt"; a.click();
    URL.revokeObjectURL(url);
  };

  const savedCount = Object.keys(saved).length;
  const topThreeIds = new Set(topThree.map(m => m.id));
  const otherModes = MODES.filter(m => !topThreeIds.has(m.id));
  const currentMode = MODES[carouselIdx];

  const renderInsight = (mode) => {
    if (!mode) return null;
    const insight = modeInsights[mode.id];
    const isLoading = loadingMode === mode.id || (loadingRecs && topThreeIds.has(mode.id) && !insight);
    const isTop = topThreeIds.has(mode.id);
    const isSaved = saved[mode.id];

    return (
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
          <span style={{ fontSize: 32 }}>{mode.icon}</span>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: "#fff" }}>{mode.name}</div>
              {isTop && <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: `${mode.color}33`, color: mode.color, border: `1px solid ${mode.color}55`, textTransform: "uppercase", letterSpacing: 1 }}>Top Pick</span>}
            </div>
            <div style={{ fontSize: 13, color: "#94a3b8" }}>{mode.tagline}</div>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {insight && (
              <button onClick={() => toggleSave(mode)}
                title={isSaved ? "Remove from saved" : "Save this analysis"}
                style={{ padding: "7px 14px", borderRadius: 8, background: isSaved ? `${mode.color}33` : "#1e293b", border: `1px solid ${isSaved ? mode.color : "#334155"}`, color: isSaved ? mode.color : "#64748b", cursor: "pointer", fontSize: 13, fontWeight: 700, transition: "all .15s", display: "flex", alignItems: "center", gap: 5 }}>
                {isSaved ? "★ Saved" : "☆ Save"}
              </button>
            )}
            {!insight && !isLoading && (
              <button onClick={() => exploreMode(mode)}
                style={{ padding: "8px 18px", borderRadius: 8, background: mode.color, border: "none", color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 13 }}>
                Analyze →
              </button>
            )}
          </div>
        </div>

        {isLoading && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10, padding: 24, background: "rgba(255,255,255,0.04)", borderRadius: 12 }}>
            <div style={{ fontSize: 12, color: mode.color, fontWeight: 600, marginBottom: 4 }}>Analyzing through {mode.name}...</div>
            {[80, 60, 90, 50, 70].map((w, i) => (
              <div key={i} style={{ height: 12, borderRadius: 6, background: `linear-gradient(90deg,${mode.color}44,${mode.color}11)`, width: `${w}%`, animation: "pulse 1.5s infinite", animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
        )}

        {insight && (
          <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 12, padding: "20px 24px", border: `1px solid ${mode.color}44`, lineHeight: 1.75, color: "#cbd5e1", fontSize: 14 }}
            dangerouslySetInnerHTML={{ __html: parseMarkdown(insight, mode.color) }} />
        )}

        {!insight && !isLoading && (
          <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 12, padding: 32, textAlign: "center", border: "1px dashed #334155", color: "#64748b" }}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>{mode.icon}</div>
            <div style={{ fontSize: 14 }}>Click "Analyze →" to explore this scenario through {mode.name}</div>
          </div>
        )}
        <style>{`@keyframes pulse{0%,100%{opacity:.4}50%{opacity:1}}`}</style>
      </div>
    );
  };

  // INPUT SCREEN
  if (view === "input") {
    return (
      <div style={{ minHeight: "100vh", background: "#0a0f1e", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: "'Inter',system-ui,sans-serif" }}>
        <div style={{ maxWidth: 640, width: "100%", textAlign: "center" }}>
          <div style={{ fontSize: 17, letterSpacing: 4, color: "#0a59db", fontWeight: 600, marginBottom: 16, textTransform: "uppercase" }}>Perspective Partner</div>
          <h1 style={{ fontSize: "clamp(22px,3.8vw,38px)", fontWeight: 800, color: "#f1f5f9", margin: "0 0 12px", lineHeight: 1.15 }}>
            Think Through Any Problem<br />
            <span style={{ background: "linear-gradient(135deg,#0d9488,#0a59db)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>From Every Angle</span>
          </h1>
          <p style={{ color: "#64748b", fontSize: 16, marginBottom: 32, lineHeight: 1.6 }}>
            Analyze complex problems or strategies using 19 modes of high-level thinking.
          </p>
          <textarea value={scenario} onChange={e => setScenario(e.target.value)}
            placeholder="Describe your scenario, challenge, or strategic question..."
            style={{ width: "100%", minHeight: 140, background: "#111827", border: "1px solid #1e293b", borderRadius: 16, padding: "18px 20px", color: "#f1f5f9", fontSize: 15, fontFamily: "inherit", resize: "vertical", outline: "none", lineHeight: 1.6, boxSizing: "border-box" }} />
          <div style={{ marginTop: 12, textAlign: "left" }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: 1.5, display: "block", marginBottom: 6 }}>Problem Type</label>
            <select value={problemType} onChange={e => setProblemType(e.target.value)}
              style={{ width: "100%", background: "#111827", border: "1px solid #1e293b", borderRadius: 10, padding: "12px 16px", color: problemType ? "#f1f5f9" : "#64748b", fontSize: 14, fontFamily: "inherit", outline: "none", cursor: "pointer", appearance: "none", backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2364748b' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 14px center", boxSizing: "border-box" }}>
              <option value="">Select a problem type...</option>
              {["Strategy Decision","Business Problem","Product Ideation or Development","Product Innovation","Customer Experience","Customer Program","Career / Personal Development Question","Startup Idea","Systems Design / Systems Maturity Problem","Negotiation / Competitive Scenario","Organizational Challenge","Competitive Differentiation","Hypercompetition (intense / rapid / changing competition)"].map(o => <option key={o} value={o} style={{ background: "#111827" }}>{o}</option>)}
            </select>
          </div>
          <div style={{ marginTop: 12, textAlign: "left" }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: 1.5, display: "block", marginBottom: 6 }}>Desired Outcome</label>
            <input type="text" maxLength={100} value={desiredOutcome} onChange={e => setDesiredOutcome(e.target.value)}
              placeholder="What does success look like? (100 characters max)"
              style={{ width: "100%", background: "#111827", border: "1px solid #1e293b", borderRadius: 10, padding: "12px 16px", color: "#f1f5f9", fontSize: 14, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }} />
            <div style={{ textAlign: "right", fontSize: 11, color: desiredOutcome.length > 90 ? "#f59e0b" : "#475569", marginTop: 4 }}>{desiredOutcome.length}/100</div>
          </div>
          <button onClick={handleSubmit} disabled={!scenario.trim()}
            style={{ marginTop: 16, padding: "14px 40px", borderRadius: 12, background: scenario.trim() ? "linear-gradient(135deg,#0d9488,#0a59db)" : "#1e293b", border: "none", color: scenario.trim() ? "#fff" : "#475569", fontWeight: 700, fontSize: 15, cursor: scenario.trim() ? "pointer" : "default", width: "100%", transition: "all .2s" }}>
            Analyze My Scenario →
          </button>
          <div style={{ marginTop: 48, display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            {MODES.slice(0, 7).map(m => <span key={m.id} style={{ padding: "6px 12px", borderRadius: 20, background: `${m.color}18`, border: `1px solid ${m.color}33`, color: m.color, fontSize: 12, fontWeight: 600 }}>{m.icon} {m.name}</span>)}
            <span style={{ padding: "6px 12px", borderRadius: 20, background: "#1e293b", color: "#475569", fontSize: 12, fontWeight: 600 }}>+12 more</span>
          </div>
        </div>
      </div>
    );
  }

  // EXPLORE SCREEN
  return (
    <div style={{ minHeight: "100vh", background: "#0a0f1e", fontFamily: "'Inter',system-ui,sans-serif", color: "#f1f5f9", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div style={{ borderBottom: "1px solid #1e293b", padding: "14px 24px", display: "flex", alignItems: "center", gap: 16, background: "#0d1424", flexShrink: 0 }}>
        <button onClick={() => setView("input")} style={{ background: "none", border: "none", color: "#0a59db", fontWeight: 700, cursor: "pointer", fontSize: 13, padding: 0, whiteSpace: "nowrap" }}>← New Scenario</button>
        <div style={{ flex: 1, fontSize: 13, color: "#64748b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          <span style={{ color: "#94a3b8" }}>Scenario: </span>{scenario}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => setLayout(l => l === "carousel" ? "sidebar" : "carousel")}
            style={{ padding: "6px 14px", borderRadius: 8, background: "#1e293b", border: "1px solid #334155", color: "#94a3b8", fontSize: 12, cursor: "pointer", fontWeight: 600 }}>
            {layout === "carousel" ? "⊞ Sidebar" : "◎ Carousel"}
          </button>
          {savedCount > 0 && (
            <button onClick={() => setSavedPanelOpen(o => !o)}
              style={{ padding: "6px 14px", borderRadius: 8, background: savedPanelOpen ? "#0a59db" : "#1e293b", border: "1px solid #0a59db", color: savedPanelOpen ? "#fff" : "#0a59db", fontSize: 12, cursor: "pointer", fontWeight: 700 }}>
              ★ Saved ({savedCount})
            </button>
          )}
          {sessionLog.length > 0 && (
            <button onClick={exportSession} style={{ padding: "6px 14px", borderRadius: 8, background: "#1e293b", border: "1px solid #334155", color: "#94a3b8", fontSize: 12, cursor: "pointer", fontWeight: 600 }}>↓ Export</button>
          )}
        </div>
      </div>

      {/* Recommendations Banner */}
      <div style={{ padding: "16px 24px", borderBottom: "1px solid #1e293b", background: "#0d1424", flexShrink: 0 }}>
        <div style={{ fontSize: 11, color: "#475569", fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, marginBottom: 10 }}>
          {loadingRecs ? "🧠 Identifying best thinking modes for your scenario..." : "✦ Top 3 Recommended Modes — Auto-Analyzed for You"}
        </div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-start" }}>
          {loadingRecs ? [1,2,3].map(i => <div key={i} style={{ height: 70, borderRadius: 12, background: "#1e293b", width: 210, animation: "pulse 1.5s infinite", animationDelay: `${i*0.15}s` }} />) :
            recommendations.map((r, i) => {
              const m = MODES.find(m => m.name === r.name);
              if (!m) return null;
              const isActive = activeMode?.id === m.id;
              return (
                <button key={m.id} onClick={() => exploreMode(m)}
                  style={{ padding: "10px 16px", borderRadius: 12, background: isActive ? `${m.color}33` : "#1a2235", border: `1px solid ${m.color}${isActive ? "99" : "44"}`, color: "#f1f5f9", fontSize: 13, cursor: "pointer", textAlign: "left", maxWidth: 260, transition: "all .15s" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                    <span style={{ fontSize: 16 }}>{m.icon}</span>
                    <span style={{ fontWeight: 700, color: m.color }}>{m.name}</span>
                    <span style={{ marginLeft: "auto", fontSize: 10, color: "#475569" }}>#{i+1}</span>
                  </div>
                  <div style={{ fontSize: 11, color: "#64748b", lineHeight: 1.4 }}>{r.reason}</div>
                </button>
              );
            })
          }
          {!loadingRecs && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", alignSelf: "center" }}>
              <span style={{ fontSize: 11, color: "#334155", fontWeight: 600 }}>+ Explore:</span>
              {otherModes.slice(0, 4).map(m => (
                <button key={m.id} onClick={() => exploreMode(m)}
                  style={{ padding: "4px 10px", borderRadius: 20, background: `${m.color}15`, border: `1px solid ${m.color}33`, color: m.color, fontSize: 11, fontWeight: 600, cursor: "pointer" }}>
                  {m.icon} {m.name}
                </button>
              ))}
            </div>
          )}
        </div>
        <style>{`@keyframes pulse{0%,100%{opacity:.4}50%{opacity:1}}`}</style>
      </div>

      {/* Main area with optional saved panel */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Content */}
        <div style={{ flex: 1, overflow: "auto" }}>
          {layout === "sidebar" ? (
            <div style={{ display: "flex", height: "100%" }}>
              <div style={{ width: 230, borderRight: "1px solid #1e293b", overflowY: "auto", background: "#0d1424", flexShrink: 0 }}>
                {topThree.length > 0 && <div style={{ padding: "12px 16px 4px", fontSize: 10, color: "#475569", fontWeight: 700, textTransform: "uppercase", letterSpacing: 2 }}>Top Picks</div>}
                {[...topThree, ...otherModes].map(m => (
                  <button key={m.id} onClick={() => exploreMode(m)}
                    style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "10px 16px", background: activeMode?.id === m.id ? `${m.color}22` : "none", border: "none", borderLeft: activeMode?.id === m.id ? `3px solid ${m.color}` : "3px solid transparent", color: activeMode?.id === m.id ? "#fff" : "#64748b", cursor: "pointer", fontSize: 13, textAlign: "left" }}>
                    <span style={{ fontSize: 16 }}>{m.icon}</span>
                    <span style={{ fontWeight: activeMode?.id === m.id ? 700 : 400, flex: 1 }}>{m.name}</span>
                    {saved[m.id] && <span style={{ color: "#f59e0b", fontSize: 12 }}>★</span>}
                    {modeInsights[m.id] && !saved[m.id] && <span style={{ width: 6, height: 6, borderRadius: "50%", background: m.color, flexShrink: 0 }} />}
                  </button>
                ))}
              </div>
              <div style={{ flex: 1, overflowY: "auto", padding: 32 }}>
                {activeMode ? renderInsight(activeMode) : <div style={{ textAlign: "center", paddingTop: 80, color: "#475569" }}><div style={{ fontSize: 48, marginBottom: 16 }}>🧠</div><div>Select a thinking mode to begin</div></div>}
              </div>
            </div>
          ) : (
            <div style={{ padding: 24, maxWidth: 860, margin: "0 auto" }}>
              {/* Mode strip */}
              <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 16, scrollbarWidth: "none" }}>
                {MODES.map((m, i) => (
                  <button key={m.id} onClick={() => exploreMode(m)}
                    style={{ flexShrink: 0, padding: "8px 14px", borderRadius: 10, background: carouselIdx === i ? m.color : `${m.color}18`, border: `1px solid ${carouselIdx === i ? m.color : m.color + "44"}`, color: carouselIdx === i ? "#fff" : m.color, fontSize: 12, fontWeight: 700, cursor: "pointer", position: "relative" }}>
                    {m.icon} {m.name}
                    {saved[m.id] && <span style={{ position: "absolute", top: -4, right: -4, fontSize: 10 }}>★</span>}
                    {modeInsights[m.id] && !saved[m.id] && <span style={{ position: "absolute", top: -4, right: -4, width: 7, height: 7, borderRadius: "50%", background: m.color, border: "2px solid #0a0f1e" }} />}
                  </button>
                ))}
              </div>

              {/* Card */}
              <div style={{ background: "#0d1424", borderRadius: 20, padding: 32, border: `1px solid ${currentMode.color}33`, minHeight: 380, display: "flex", flexDirection: "column", gap: 16, position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: 0, right: 0, width: 280, height: 280, borderRadius: "50%", background: `radial-gradient(circle,${currentMode.color}12,transparent 70%)`, pointerEvents: "none" }} />
                {renderInsight(currentMode)}
              </div>

              {/* Nav */}
              <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 16, marginTop: 16 }}>
                <button onClick={() => { const n = (carouselIdx - 1 + MODES.length) % MODES.length; setCarouselIdx(n); setActiveMode(MODES[n]); }}
                  style={{ padding: "8px 20px", borderRadius: 8, background: "#1e293b", border: "1px solid #334155", color: "#94a3b8", cursor: "pointer", fontSize: 13 }}>← Prev</button>
                <span style={{ fontSize: 13, color: "#475569" }}>{carouselIdx + 1} / {MODES.length}</span>
                <button onClick={() => { const n = (carouselIdx + 1) % MODES.length; setCarouselIdx(n); setActiveMode(MODES[n]); }}
                  style={{ padding: "8px 20px", borderRadius: 8, background: "#1e293b", border: "1px solid #334155", color: "#94a3b8", cursor: "pointer", fontSize: 13 }}>Next →</button>
              </div>

              {/* Decision / Execution Support Box */}
              <div style={{ marginTop: 24, borderRadius: 16, border: "1px solid #1e3a5f", background: "linear-gradient(135deg,#0d1f38,#0a1628)", padding: 24 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                  <span style={{ fontSize: 20 }}>🎯</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15, color: "#f1f5f9" }}>Decision & Execution Support</div>
                    <div style={{ fontSize: 12, color: "#475569" }}>Star the analyses you find most useful, then synthesize them into a clear action plan.</div>
                  </div>
                  {savedCount > 0 && <span style={{ marginLeft: "auto", fontSize: 12, color: "#f59e0b", fontWeight: 700 }}>★ {savedCount} saved</span>}
                </div>
                <textarea
                  value={decisionInput}
                  onChange={e => setDecisionInput(e.target.value)}
                  placeholder="Optional: add a note about your decision context, constraints, or what you need help deciding..."
                  style={{ width: "100%", minHeight: 72, background: "#0a0f1e", border: "1px solid #1e293b", borderRadius: 10, padding: "12px 16px", color: "#f1f5f9", fontSize: 13, fontFamily: "inherit", resize: "vertical", outline: "none", boxSizing: "border-box", lineHeight: 1.6 }}
                />
                <button onClick={handleDecisionSupport} disabled={decisionLoading}
                  style={{ marginTop: 10, padding: "10px 24px", borderRadius: 10, background: savedCount > 0 ? "linear-gradient(135deg,#0d9488,#0a59db)" : "#1e293b", border: "none", color: savedCount > 0 ? "#fff" : "#475569", fontWeight: 700, fontSize: 14, cursor: savedCount > 0 ? "pointer" : "default", width: "100%" }}>
                  {decisionLoading ? "Synthesizing..." : "→ Synthesize Your Selected Analyses"}
                </button>
                {decisionOutput && (
                  <div style={{ marginTop: 16, background: "rgba(255,255,255,0.04)", borderRadius: 12, padding: "20px 24px", border: "1px solid #0a59db44", lineHeight: 1.75, color: "#cbd5e1", fontSize: 14 }}
                    dangerouslySetInnerHTML={{ __html: parseMarkdown(decisionOutput, "#0a59db") }} />
                )}
              </div>
            </div>
          )}
        </div>

        {/* Saved Panel */}
        {savedPanelOpen && savedCount > 0 && (
          <div style={{ width: 300, borderLeft: "1px solid #1e293b", background: "#0d1424", overflowY: "auto", flexShrink: 0, padding: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: "#f1f5f9" }}>★ Saved Analyses</div>
              <button onClick={() => setSavedPanelOpen(false)} style={{ background: "none", border: "none", color: "#475569", cursor: "pointer", fontSize: 18, lineHeight: 1 }}>×</button>
            </div>
            <div style={{ fontSize: 11, color: "#475569", marginBottom: 16, lineHeight: 1.5 }}>Your starred analyses are collected here. Use them as inputs for Decision & Execution Support below.</div>
            {MODES.filter(m => saved[m.id]).map(m => (
              <div key={m.id} style={{ marginBottom: 16, borderRadius: 12, border: `1px solid ${m.color}44`, overflow: "hidden" }}>
                <div style={{ padding: "10px 14px", background: `${m.color}22`, display: "flex", alignItems: "center", gap: 8 }}>
                  <span>{m.icon}</span>
                  <span style={{ fontWeight: 700, fontSize: 13, color: m.color, flex: 1 }}>{m.name}</span>
                  <button onClick={() => toggleSave(m)} style={{ background: "none", border: "none", color: "#475569", cursor: "pointer", fontSize: 14 }} title="Remove">×</button>
                </div>
                {modeInsights[m.id] && (
                  <div style={{ padding: "10px 14px", fontSize: 12, color: "#94a3b8", lineHeight: 1.6, maxHeight: 160, overflow: "hidden", position: "relative" }}>
                    <div dangerouslySetInnerHTML={{ __html: parseMarkdown(modeInsights[m.id].slice(0, 300) + "...", m.color) }} />
                    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 40, background: "linear-gradient(transparent,#0d1424)" }} />
                  </div>
                )}
                <button onClick={() => { setActiveMode(m); setCarouselIdx(MODES.indexOf(m)); }}
                  style={{ width: "100%", padding: "8px", background: "none", border: "none", borderTop: `1px solid ${m.color}22`, color: m.color, fontSize: 11, cursor: "pointer", fontWeight: 600 }}>
                  View Full Analysis →
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
