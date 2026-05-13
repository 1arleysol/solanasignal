/**
 * AceData Cloud integration
 * Docs: https://docs.acedata.cloud
 * Uses SERP API for news + LLM proxy for analysis
 */

const ACEDATA_BASE = 'https://api.acedata.cloud'
const API_KEY = process.env.ACEDATA_API_KEY!

export interface NewsItem {
  title: string
  snippet: string
  source: string
  date: string
}

export interface SignalResult {
  signal: 'BUY' | 'HOLD' | 'SELL'
  confidence: number
  reasoning: string
  token: string
}

// ─── SERP: fetch real-time news for a token ──────────────────────────────────
export async function searchTokenNews(token: string): Promise<NewsItem[]> {
  const queries = [
    `${token} Solana price prediction today`,
    `${token} DeFi news bullish bearish`,
  ]

  const allResults: NewsItem[] = []

  for (const query of queries) {
    try {
      const res = await fetch(`${ACEDATA_BASE}/serp/google`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          limit: 5,
          country: 'US',
          language: 'en',
        }),
      })

      if (!res.ok) {
        console.error(`AceData SERP error: ${res.status}`)
        continue
      }

      const data = await res.json()
      const organic = data?.organic_results || data?.results || []

      for (const item of organic) {
        allResults.push({
          title: item.title || '',
          snippet: item.snippet || item.description || '',
          source: item.source || item.domain || '',
          date: item.date || new Date().toISOString(),
        })
      }
    } catch (err) {
      console.error('AceData SERP fetch error:', err)
    }
  }

  return allResults.slice(0, 8)
}

// ─── LLM: analyze news and produce trading signal ────────────────────────────
export async function analyzeSignalWithLLM(
  token: string,
  news: NewsItem[]
): Promise<SignalResult> {
  const newsText = news
    .map((n, i) => `${i + 1}. [${n.source}] ${n.title} — ${n.snippet}`)
    .join('\n')

  const prompt = `You are a professional DeFi trading analyst specializing in Solana ecosystem tokens.

Analyze the following recent news articles about ${token} and produce a trading signal.

NEWS ARTICLES:
${newsText}

Based on this news, return ONLY a valid JSON object (no markdown, no explanation) with this exact structure:
{
  "signal": "BUY" | "HOLD" | "SELL",
  "confidence": <integer 60-95>,
  "reasoning": "<2-3 sentence explanation citing specific news>"
}`

  try {
    const res = await fetch(`${ACEDATA_BASE}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        max_tokens: 300,
        temperature: 0.3,
        messages: [
          {
            role: 'system',
            content: 'You are a DeFi analyst. Always respond with valid JSON only, no markdown or extra text.',
          },
          { role: 'user', content: prompt },
        ],
      }),
    })

    if (!res.ok) {
      console.error(`AceData LLM error: ${res.status}`)
      return fallbackSignal(token)
    }

    const data = await res.json()
    const text = data?.choices?.[0]?.message?.content || ''

    const parsed = JSON.parse(text.replace(/```json|```/g, '').trim())
    return {
      signal: parsed.signal,
      confidence: Math.max(60, Math.min(95, parsed.confidence)),
      reasoning: parsed.reasoning,
      token,
    }
  } catch (err) {
    console.error('AceData LLM parse error:', err)
    return fallbackSignal(token)
  }
}

function fallbackSignal(token: string): SignalResult {
  return {
    signal: 'HOLD',
    confidence: 65,
    reasoning: `Unable to fetch live analysis for ${token}. Defaulting to HOLD — monitor position.`,
    token,
  }
}
