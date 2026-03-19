export const config = { runtime: 'edge' }

export default async function handler(req) {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 })

  const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY
  if (!ANTHROPIC_KEY) return new Response(JSON.stringify({ error: 'ANTHROPIC_API_KEY não configurada' }), { status: 500, headers: { 'Content-Type': 'application/json' } })

  try {
    const body = await req.json()
    const { pdfBase64, questaoInicial = 1, totalQuestoes = 90 } = body
    const questaoFinal = questaoInicial + totalQuestoes - 1

    if (!pdfBase64) return new Response(JSON.stringify({ error: 'PDF não recebido' }), { status: 400, headers: { 'Content-Type': 'application/json' } })

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': ANTHROPIC_KEY, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2000,
        messages: [{
          role: 'user',
          content: [
            { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: pdfBase64 } },
            { type: 'text', text: `Extraia APENAS as alternativas corretas do gabarito. Questões ${questaoInicial} até ${questaoFinal}.

Retorne APENAS este JSON sem markdown:
{"${questaoInicial}":"A","${questaoInicial+1}":"B"}

Chave = número da questão, valor = letra correta (A/B/C/D/E) ou AN se anulada. Nada mais.` }
          ]
        }]
      })
    })

    const rawText = await response.text()
    let data
    try { data = JSON.parse(rawText) } catch {
      return new Response(JSON.stringify({ error: 'Resposta inválida', raw: rawText.slice(0, 200) }), { status: 500, headers: { 'Content-Type': 'application/json' } })
    }

    if (data.error) return new Response(JSON.stringify({ error: 'API error: ' + data.error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } })

    const text = data.content?.[0]?.text || '{}'
    const clean = text.replace(/```json|```/g, '').trim()

    let gabarito = {}
    try { gabarito = JSON.parse(clean) } catch {
      return new Response(JSON.stringify({ error: 'Parse error', raw: clean.slice(0, 200) }), { status: 500, headers: { 'Content-Type': 'application/json' } })
    }

    return new Response(JSON.stringify({ gabarito }), { status: 200, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } })

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { 'Content-Type': 'application/json' } })
  }
}
