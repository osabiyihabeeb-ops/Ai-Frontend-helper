export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { prompt } = req.body;

  const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.GROQ_API_KEY}`
    },
    body: JSON.stringify({
      model: "openai/gpt-oss-20b",
     messages: [
  { role: "system", content: "You are an expert Frontend Developer assistant and creative writer. You can generate real working code, marketing text, poems, and novels. If user asks for CODE: return clean, working HTML/CSS/JS code in a code block with comments. If user asks for POEM: return a beautiful complete poem. If user asks for NOVEL/STORY: return an engaging chapter with characters and dialogue. If user asks for TEXT: return headlines, descriptions, captions. Always be interactive and ask a follow-up question at the end. Return your answer as plain text, not JSON." },
  { role: "user", content: prompt }
   ],
      temperature: 0.7,
      max_tokens: 4000
    })
  });

  const data = await groqRes.json();
  return res.status(200).json(data);
}
