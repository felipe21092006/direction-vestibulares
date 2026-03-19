export const config = { runtime: 'edge' }

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY
  if (!ANTHROPIC_KEY) {
    return new Response(JSON.stringify({ error: 'ANTHROPIC_API_KEY não configurada na Vercel' }), {
      status: 500, headers: { 'Content-Type': 'application/json' }
    })
  }

  try {
    const body = await req.json()
    const { pdfBase64, questaoInicial = 1, totalQuestoes = 90 } = body
    const questaoFinal = questaoInicial + totalQuestoes - 1

    if (!pdfBase64) {
      return new Response(JSON.stringify({ error: 'PDF não recebido' }), {
        status: 400, headers: { 'Content-Type': 'application/json' }
      })
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 3000,
        messages: [{
          role: 'user',
          content: [
            {
              type: 'document',
              source: { type: 'base64', media_type: 'application/pdf', data: pdfBase64 }
            },
            {
              type: 'text',
              text: `Extraia o gabarito deste PDF. As questões vão de ${questaoInicial} até ${questaoFinal}.

Muitos gabaritos (especialmente SAS, Anglo, pH) incluem o conteúdo/matéria de cada questão além da resposta correta.

Retorne APENAS este JSON, sem markdown:
{
  "gabarito": {
    "${questaoInicial}": "A",
    "${questaoInicial + 1}": "B"
  },
  "conteudos": {
    "${questaoInicial}": "Biologia — Genética",
    "${questaoInicial + 1}": "Matemática — Funções"
  }
}

- "gabarito": chave = número da questão, valor = alternativa correta (A/B/C/D/E ou AN se anulada)
- "conteudos": chave = número da questão, valor = matéria e conteúdo exatamente como escrito no gabarito. Se o gabarito NÃO tiver conteúdo, retorne "conteudos" como objeto vazio {}.`
            }
          ]
        }]
      })
    })

    const rawText = await response.text()
    let data
    try { data = JSON.parse(rawText) }
    catch {
      return new Response(JSON.stringify({ error: 'Resposta inválida da API', raw: rawText.slice(0, 300) }), {
        status: 500, headers: { 'Content-Type': 'application/json' }
      })
    }

    if (data.error) {
      return new Response(JSON.stringify({ error: 'API error: ' + data.error.message }), {
        status: 500, headers: { 'Content-Type': 'application/json' }
      })
    }

    const text = data.content?.[0]?.text || '{}'
    const clean = text.replace(/```json|```/g, '').trim()

    let result = {}
    try { result = JSON.parse(clean) }
    catch {
      return new Response(JSON.stringify({ error: 'Não consegui parsear o gabarito', raw: clean.slice(0, 300) }), {
        status: 500, headers: { 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify({
      gabarito: result.gabarito || {},
      conteudos: result.conteudos || {}
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    })

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { 'Content-Type': 'application/json' }
    })
  }
}
