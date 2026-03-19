export const config = { runtime: 'edge' }

const ESTRUTURA = {
  'Matemática': { 'Matemática Básica': ['Porcentagem','Juros','Razão e proporção','Regra de 3','Equações do 1° grau','Equações do 2° grau','MMC e MDC'], 'Matemática 1 — Funções e Álgebra': ['PA','PG','Função afim','Função quadrática','Função exponencial','Função logarítmica','Função modular','Matrizes e Determinantes'], 'Matemática 2 — Geometria': ['Semelhança de triângulos','Trigonometria','Lei dos senos e cossenos','Geometria plana','Prismas','Cilindros','Pirâmides','Cones','Esferas','Geometria analítica'], 'Matemática 3 — Combinatória e Estatística': ['Combinação','Arranjo','Permutação','Probabilidade','Estatística descritiva','Interpretação de gráficos'] },
  'Física': { 'Física 1 — Mecânica': ['MRU','MRUV','Lançamentos','Leis de Newton','Trabalho e energia','Impulso e momento','Gravitação','Hidrostática'], 'Física 2 — Óptica, Ondas e Termologia': ['Espelhos','Lentes','Refração','Ondulatória','Temperatura e calor','Dilatação','Gás ideal','Termodinâmica'], 'Física 3 — Eletromagnetismo e Física Moderna': ['Eletrostática','Campo elétrico','Corrente elétrica','Leis de Ohm','Resistores','Campo magnético','Indução eletromagnética','Efeito fotoelétrico'] },
  'Química': { 'Química 1 — Geral e Inorgânica': ['Modelos atômicos','Tabela periódica','Ligações químicas','Radioatividade','Separação de misturas','Ácidos e bases','pH','Sais e óxidos','Estequiometria','Gases'], 'Química 2 — Físico-Química': ['Termoquímica','Soluções','Cinética química','Equilíbrio químico','Pilhas','Eletrólise'], 'Química 3 — Orgânica': ['Hidrocarbonetos','Funções oxigenadas','Funções nitrogenadas','Isomeria','Reações orgânicas','Polímeros','Biomoléculas'] },
  'Biologia': { 'Biologia 1 — Citologia e Genética': ['Membrana plasmática','Fotossíntese','Respiração celular','Mitose','Meiose','1ª lei de Mendel','2ª lei de Mendel','Grupos sanguíneos','Herança sexual','DNA e RNA','Biotecnologia'], 'Biologia 2 — Embriologia, Histologia e Fisiologia': ['Tecidos','Sistema digestório','Sistema respiratório','Sistema cardiovascular','Sistema imunológico','Sistema nervoso','Vírus','Bactérias','Fungos'], 'Biologia 3 — Zoologia, Botânica e Ecologia': ['Invertebrados','Vertebrados','Botânica','Ecossistemas','Cadeias alimentares','Relações ecológicas','Biomas','Evolução','Ciclos biogeoquímicos'] },
  'Língua Portuguesa': { 'Gramática': ['Concordância verbal','Concordância nominal','Regência','Crase','Pontuação','Colocação pronominal','Orações'], 'Interpretação e Produção Textual': ['Interpretação de textos','Gêneros textuais','Inferências','Coesão e coerência','Variações linguísticas'] },
  'Literatura': { 'Literatura': ['Figuras de linguagem','Trovadorismo','Barroco','Arcadismo','Romantismo','Realismo','Modernismo','Literatura contemporânea'] },
  'Língua Estrangeira': { 'Inglês / Espanhol': ['Interpretação de texto','Vocabulário contextual','Inferências'] },
  'História': { 'História Geral': ['Grécia e Roma','Idade Média','Renascimento','Revoluções','Imperialismo','Guerras Mundiais','Guerra Fria'], 'História do Brasil': ['Brasil Colônia','Brasil Império','República Oligárquica','Era Vargas','Ditadura Militar','Redemocratização'] },
  'Geografia': { 'Geografia 1 — Física e Humana': ['Cartografia','Clima e biomas','Relevo','Urbanização','Migrações','Questões ambientais'], 'Geografia 2 — Regiões e Geopolítica': ['Regiões brasileiras','Industrialização','Agricultura','Globalização','Blocos econômicos'] },
  'Filosofia': { 'Filosofia': ['Pré-Socráticos','Platão e Aristóteles','Filosofia Moderna','Iluminismo','Marx','Existencialismo','Ética'] },
  'Sociologia': { 'Sociologia': ['Durkheim','Weber','Marx','Estratificação social','Movimentos sociais','Globalização','Cultura'] },
}

export default async function handler(req) {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 })

  const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY
  if (!ANTHROPIC_KEY) return new Response(JSON.stringify({ error: 'API key não configurada' }), { status: 500, headers: { 'Content-Type': 'application/json' } })

  try {
    const body = await req.json()
    const { erros, conteudosDoGabarito } = body
    // conteudosDoGabarito = { "91": "Biologia — Genética", "92": "Matemática — Funções" }

    if (!erros?.length) return new Response(JSON.stringify({ error: 'Sem erros' }), { status: 400, headers: { 'Content-Type': 'application/json' } })

    // Se não tem conteúdos do gabarito, retorna sem categorização
    const temConteudos = conteudosDoGabarito && Object.keys(conteudosDoGabarito).length > 0
    if (!temConteudos) {
      return new Response(JSON.stringify({
        erros: erros.map(e => ({ questao: e.questao, area: '', disciplina: '', topico: '', resumo: '' }))
      }), { status: 200, headers: { 'Content-Type': 'application/json' } })
    }

    // Monta lista de erros com conteúdo do gabarito
    const listaErros = erros.map(e => {
      const cont = conteudosDoGabarito[String(e.questao)] || conteudosDoGabarito[e.questao] || ''
      return 'Q' + e.questao + (cont ? ': "' + cont + '"' : '')
    }).join('\n')

    const estruturaStr = JSON.stringify(ESTRUTURA)

    const prompt = 'Mapeie cada questão para a estrutura do sistema usando os conteúdos fornecidos.\n\nESTRUTURA DO SISTEMA:\n' + estruturaStr + '\n\nQUESTÕES COM CONTEÚDO DO GABARITO:\n' + listaErros + '\n\nRetorne JSON puro sem markdown:\n{"erros":[{"questao":91,"area":"Biologia","disciplina":"Biologia 1 — Citologia e Genética","topico":"1ª lei de Mendel","resumo":"genética mendeliana"}]}'

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': ANTHROPIC_KEY, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 2000,
        messages: [{ role: 'user', content: prompt }]
      })
    })

    const rawText = await response.text()
    let data
    try { data = JSON.parse(rawText) } catch {
      return new Response(JSON.stringify({ error: 'Resposta inválida', raw: rawText.slice(0, 200) }), { status: 500, headers: { 'Content-Type': 'application/json' } })
    }

    if (data.error) return new Response(JSON.stringify({ error: 'API: ' + data.error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } })

    const text = data.content?.[0]?.text || '{}'
    const clean = text.replace(/```json|```/g, '').trim()

    let result = {}
    try { result = JSON.parse(clean) } catch {
      return new Response(JSON.stringify({ error: 'Parse error', raw: clean.slice(0, 200) }), { status: 500, headers: { 'Content-Type': 'application/json' } })
    }

    return new Response(JSON.stringify(result), { status: 200, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } })

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { 'Content-Type': 'application/json' } })
  }
}
