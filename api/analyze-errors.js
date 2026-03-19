export const config = { runtime: 'edge' }

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY
  if (!ANTHROPIC_KEY) {
    return new Response(JSON.stringify({ error: 'ANTHROPIC_API_KEY não configurada' }), {
      status: 500, headers: { 'Content-Type': 'application/json' }
    })
  }

  try {
    const body = await req.json()
    const { provaBase64, erros, questaoInicial } = body
    // erros = [{ questao: 42, resposta: 'B', correta: 'D' }, ...]

    if (!provaBase64 || !erros?.length) {
      return new Response(JSON.stringify({ error: 'Dados insuficientes' }), {
        status: 400, headers: { 'Content-Type': 'application/json' }
      })
    }

    const listaErros = erros.map(e => `Q${e.questao} (marcou ${e.resposta || '—'}, correto: ${e.correta})`).join(', ')

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4000,
        messages: [{
          role: 'user',
          content: [
            {
              type: 'document',
              source: { type: 'base64', media_type: 'application/pdf', data: provaBase64 }
            },
            {
              type: 'text',
              text: `Você é um especialista no ENEM. Analise esta prova e categorize os erros do aluno.

O aluno errou as seguintes questões: ${listaErros}

Para cada questão errada, leia o enunciado na prova e identifique:
- A matéria (ex: "Biologia", "Matemática", "História")
- O conteúdo/subárea (ex: "Genética", "Funções", "Brasil República")  
- O tópico específico (ex: "Primeira lei de Mendel", "Função quadrática", "Era Vargas")

Retorne APENAS um JSON no formato:
{
  "erros": [
    {
      "questao": 42,
      "area": "Biologia",
      "disciplina": "Biologia 1 — Citologia e Genética",
      "topico": "Primeira lei de Mendel e Heredogramas",
      "resumo": "Questão sobre herança monohíbrida com dominância completa"
    }
  ]
}

Use exatamente estes nomes de área: "Matemática", "Física", "Química", "Biologia", "História", "Geografia", "Filosofia", "Sociologia", "Língua Portuguesa", "Literatura", "Língua Estrangeira", "Redação", "Artes e Educação Física", "Atualidades".

Retorne apenas o JSON puro, sem markdown, sem explicações.`
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
      return new Response(JSON.stringify({ error: `API error: ${data.error.message}` }), {
        status: 500, headers: { 'Content-Type': 'application/json' }
      })
    }

    const text = data.content?.[0]?.text || '{}'
    const clean = text.replace(/```json|```/g, '').trim()

    let result = {}
    try { result = JSON.parse(clean) }
    catch {
      return new Response(JSON.stringify({ error: 'Não consegui parsear a análise', raw: clean.slice(0, 300) }), {
        status: 500, headers: { 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    })

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { 'Content-Type': 'application/json' }
    })
  }
}
