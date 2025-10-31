import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function generateMovieRecommendations(userQuery: string, streamingServices: string[]): Promise<Array<{ title: string; year?: number; reason: string }>> {
  if (!process.env.ANTHROPIC_API_KEY) return [];
  try {
    const servicesText = streamingServices.length > 0 ? ` available on ${streamingServices.join(', ')} in the UK` : '';
    const prompt = `User query: "${userQuery}"

Generate 10-12 movie recommendations${servicesText}. Prioritize:
1. Arthouse, international, and lesser-known films (60-70% of recommendations)
2. Hidden gems and critically acclaimed but underappreciated films
3. A mix of mainstream and arthouse to ensure diversity
4. Films that match any specific criteria mentioned (ratings, runtime, genres, directors, actors, themes)

Return ONLY a JSON array of objects with this exact structure:
[
  {"title": "Movie Title", "year": 2020, "reason": "One sentence explaining why the user might like this film based on their query. Be specific about what makes it special - cinematography, themes, performances, or unique storytelling."}
]

Requirements:
- Return ONLY valid JSON, no markdown, no explanations
- Match the user's preferences from their query (actors, directors, genres, themes, ratings, runtime, etc.)
- Include diverse recommendations (mix of genres, eras, countries)
- Prefer arthouse, international, and lesser-known films over blockbusters
- Reasons should be specific, insightful, and avoid spoilers
- If year is unknown, omit it
- Prioritize quality films that the user may not have discovered yet`;

    const res = await client.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 2000,
      system: "You are a movie recommendation expert. Always return valid JSON only.",
      messages: [
        { role: "user", content: prompt },
      ],
    });
    
    const text = res.content[0].type === "text" ? res.content[0].text.trim() : null;
    if (!text) return [];
    
    // Extract JSON from response (handle markdown code blocks if present)
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    const jsonText = jsonMatch ? jsonMatch[0] : text;
    
    try {
      const recommendations = JSON.parse(jsonText);
      return Array.isArray(recommendations) ? recommendations : [];
    } catch (e) {
      console.error('Failed to parse AI recommendations:', e, 'Response:', text);
      return [];
    }
  } catch (error) {
    console.error('Failed to generate AI recommendations:', error);
    return [];
  }
}

export async function generateReason(userContext: string, movieTitle: string, movieOverview: string) {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  try {
    const prompt = `User context: ${userContext}\nMovie: ${movieTitle}\nOverview: ${movieOverview}\nExplain in one sentence why this user might like the movie. Avoid spoilers.`;
    const res = await client.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 60,
      system: "You are a concise movie recommender.",
      messages: [
        { role: "user", content: prompt },
      ],
    });
    const text = res.content[0].type === "text" ? res.content[0].text.trim() : null;
    return text || null;
  } catch (error) {
    console.error('Failed to generate AI reason:', error);
    return null;
  }
}


