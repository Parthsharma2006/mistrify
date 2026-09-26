export async function generateDemandInsights(metrics: any) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("GEMINI_API_KEY is not set");
    return "AI insights are currently unavailable due to missing configuration.";
  }

  const prompt = `You are an AI assistant for a cooperative gig services platform.
Analyze the following platform metrics and provide 3-4 short, actionable SIH (Smart India Hackathon) recommendations for the admin regarding demand forecasting and workforce allocation. Keep it concise, using markdown.

Metrics:
${JSON.stringify(metrics, null, 2)}`;

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      console.error("Gemini API error:", errorData);
      return "Unable to fetch AI insights at this time.";
    }

    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "No insights generated.";
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return "Error generating AI insights.";
  }
}
