import { useState, useEffect } from "react";
import "./App.css";

export default function App() {
  const [name, setName] = useState(() => localStorage.getItem("aiUser") || "");
  const [tempName, setTempName] = useState("");
  const [prompt, setPrompt] = useState("");
  const [aiType, setAiType] = useState("hero");
  const [aiResult, setAiResult] = useState("");
  const [aiImages, setAiImages] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [history, setHistory] = useState(() => JSON.parse(localStorage.getItem("aiHistory") || "[]"));

  useEffect(() => { localStorage.setItem("aiUser", name); }, [name]);
  useEffect(() => { localStorage.setItem("aiHistory", JSON.stringify(history)); }, [history]);

  const handleGenerateAI = async () => {
  // REAL AI TEXT - Free Pollinations AI (like OpenAI)
    setIsGenerating(true);
    setAiResult("");
    setAiImages([]);

    const fullPrompt = aiType === "hero"
      ? `Write a catchy hero headline and 1 sentence description for a website about: ${prompt}. Personalize it for ${name}.`
      : aiType === "card"
      ? `Write 3 short card titles and descriptions for a website about: ${prompt}. For user ${name}.`
      : aiType === "form"
      ? `Write a friendly call-to-action and form heading for a website about: ${prompt}. For user ${name}.`
      : `Give 5 creative website ideas for: ${prompt}. For user ${name}.`;

    try {
   const res = await fetch("/api/generate", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ prompt: fullPrompt })
});
   const data = await res.json();
   const text = data.choices?.[0]?.message?.content;
      if (!text) throw new Error(data.error?.message || "No result"); 
      setAiResult(text + "\n\n✅ Online AI Mode - Powered by Groq (like OpenAI) - Free for you!");
      setHistory([{ prompt, type: aiType, result: text.slice(0, 200), time: new Date().toLocaleTimeString() }, ...history].slice(0, 5));
    } catch (e) {
      setAiResult("❌ API Error: " + e.message + "\nCheck your Gemini key is correct.");
    }

    // Images - Use Unsplash (no limit, no refusal) instead of Pollinations
    const q = prompt.toLowerCase().includes("barber") ? "barbershop,haircut" : prompt.toLowerCase().includes("food") ? "food,restaurant" : prompt.toLowerCase().includes("fashion") ? "fashion,clothes" : "business,website,design";
    setAiImages([
      `https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=600`,
      `https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600`,
      `https://images.unsplash.com/photo-1445205170230-053b83016050?w=600`,
    ]);
    setIsGenerating(false);
  };

  const copyResult = () => { navigator.clipboard.writeText(aiResult); alert("Copied!"); };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return alert("Fill all fields");
    setSubmitted(true);
  };

  if (!name) {
    return (
      <div className="welcome">
        <h1>🤖 AI Frontend Helper</h1>
        <p>Enter your name to personalize your experience:</p>
        <input placeholder="Your Name" value={tempName} onChange={e => setTempName(e.target.value)} />
        <button onClick={() => tempName && setName(tempName)}>Continue →</button>
      </div>
    );
  }

  return (
    <div className="app">
      <nav className="navbar">
        <b>🤖 AI Helper</b>
        <div className="nav-links"><span>Home</span><span>Generator</span><span>History</span></div>
        <button onClick={() => { setName(""); localStorage.removeItem("aiUser"); }}>Hi, {name} • Logout</button>
      </nav>

      <header className="hero">
        <p className="badge">Welcome back, {name} 👋</p>
        <h1>Hi {name}, Let's Build Something Beautiful</h1>
        <p>Type any business idea and AI will write the text + generate images for you.</p>
        <button onClick={() => document.getElementById("ai-box").scrollIntoView({ behavior: "smooth" })}>✨ Start Generating</button>
      </header>

      <section id="ai-box" className="ai-box">
        <h2>✨ Real AI Generator (OpenAI + DALL-E Style)</h2>
        <p>Example: <i onClick={() => setPrompt("Barber shop in Ibadan")} style={{ color: "#7c3aed", cursor: "pointer" }}>Barber shop in Ibadan</i> • <i onClick={() => setPrompt("Food delivery app")} style={{ color: "#7c3aed", cursor: "pointer" }}>Food delivery app</i> • <i onClick={() => setPrompt("Fashion store")} style={{ color: "#7c3aed", cursor: "pointer" }}>Fashion store</i></p>

        <input className="big-input" placeholder={`e.g. Barber shop for ${name}...`} value={prompt} onChange={e => setPrompt(e.target.value)} />

        <div className="ai-controls">
          <select value={aiType} onChange={e => setAiType(e.target.value)}>
            <option value="hero">Hero Section</option>
            <option value="card">Cards / Services</option>
            <option value="form">CTA / Form Text</option>
            <option value="idea">Website Ideas</option>
          </select>
          <button onClick={handleGenerateAI} disabled={isGenerating}>{isGenerating ? "AI is thinking..." : "Generate with AI →"}</button>
        </div>

        {isGenerating && <p className="loading">🤖 AI is generating for {name}... please wait 5-10 sec</p>}

        {aiResult && (
          <div className="ai-result">
            <b>💡 AI Result for {name}:</b>
            <p style={{ whiteSpace: "pre-wrap" }}>{aiResult}</p>
            <button onClick={copyResult}>📋 Copy Text</button>
            <button onClick={handleGenerateAI} style={{ marginLeft: 8 }}>🔄 Regenerate</button>
          </div>
        )}

        {aiImages.length > 0 && (
          <div className="ai-images">
            <p><b>🎨 AI Generated Images:</b></p>
            {aiImages.map((src, i) => (
              <div key={i} style={{ display: "inline-block", width: "32%", marginRight: "1%" }}>
                <img src={src} alt="AI generated" style={{ width: "100%", height: 140, objectFit: "cover", borderRadius: 10 }} />
                <a href={src} download target="_blank" rel="noreferrer"><button style={{ width: "100%", marginTop: 4 }}>Download</button></a>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="history">
        <h3>� history - Last 5 Generations for {name}</h3>
        {history.length === 0 && <p>No history yet. Generate something!</p>}
        {history.map((h, i) => (
          <div key={i} className="history-item"><b>{h.type}:</b> {h.prompt} <span>({h.time})</span><p>{h.result}...</p></div>
        ))}
        {history.length > 0 && <button onClick={() => setHistory([])}>Clear History</button>}
      </section>

      <section className="form-section">
        <h2>📩 Contact - Personalized for {name}</h2>
        {submitted ? <div className="success">✅ Thanks {form.name}! We will reply to {form.email} soon.</div> : (
          <form onSubmit={handleSubmit}>
            <input placeholder="Your Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            <input placeholder="Email" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            <textarea placeholder={`Hi, I am ${name} and I want...`} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} />
            <button type="submit">Send Message</button>
          </form>
        )}
      </section>

      <footer>© 2026 AI Frontend Helper • Real AI via Pollinations • For {name}</footer>
    </div>
  );
}