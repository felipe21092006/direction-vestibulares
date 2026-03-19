export const config = { runtime: 'edge' }

const AREAS_DIA1 = ['Língua Portuguesa','Literatura','Língua Estrangeira','Artes e Educação Física','História','Geografia','Filosofia','Sociologia','Atualidades','Redação']
const AREAS_DIA2 = ['Matemática','Física','Química','Biologia']

const CONTEUDOS = {
  'Língua Portuguesa': ['Gramática','Interpretação e Produção Textual'],
  'Literatura': ['Literatura'],
  'Língua Estrangeira': ['Inglês / Espanhol'],
  'Artes e Educação Física': ['Artes','Educação Física'],
  'História': ['História Geral','História do Brasil'],
  'Geografia': ['Geografia 1 — Física e Humana','Geografia 2 — Regiões e Geopolítica'],
  'Filosofia': ['Filosofia'],
  'Sociologia': ['Sociologia'],
  'Atualidades': ['Atualidades'],
  'Redação': ['Estrutura e Competências','Temas de Redação'],
  'Matemática': ['Matemática Básica','Matemática 1 — Funções e Álgebra','Matemática 2 — Geometria','Matemática 3 — Combinatória e Estatística'],
  'Física': ['Física 1 — Mecânica','Física 2 — Óptica, Ondas e Termologia','Física 3 — Eletromagnetismo e Física Moderna'],
  'Química': ['Química 1 — Geral e Inorgânica','Química 2 — Físico-Química','Química 3 — Orgânica'],
  'Biologia': ['Biologia 1 — Citologia e Genética','Biologia 2 — Embriologia, Histologia e Fisiologia','Biologia 3 — Zoologia, Botânica e Ecologia'],
}

const TOPICOS = {
  'Matemática Básica': ['As quatro operações e Expressões numéricas','Frações e Dízimas periódicas','Potenciação','Notação científica','Radiciação','Produtos notáveis e Fatoração','Equações do 1° grau','Equações do 2° grau','MMC e MDC','Razão e proporção','Regras de 3 e Escalas','Porcentagem','Juros simples','Juros compostos'],
  'Matemática 1 — Funções e Álgebra': ['Teoria dos conjuntos','Conjuntos numéricos','PA','PG','Funções — conceito','Função afim','Função quadrática','Função exponencial','Logaritmos','Função logarítmica','Função modular','Matrizes e Determinantes'],
  'Matemática 2 — Geometria': ['Semelhança de triângulos','Teorema de Tales','Trigonometria no triângulo retângulo','Lei dos senos e cossenos','Polígonos','Circunferência e Círculo','Prismas','Cilindros','Pirâmides','Cones','Esferas','Geometria analítica — ponto e reta','Geometria analítica — circunferência'],
  'Matemática 3 — Combinatória e Estatística': ['PFC','Permutação','Arranjo','Combinação','Estatística descritiva','Interpretação de gráficos','Probabilidade','Probabilidade condicional'],
  'Física 1 — Mecânica': ['MRU','MRUV','Lançamentos','Movimento circular','Leis de Newton','Força elástica','Força de atrito','Trabalho e energia','Impulso e momento','Gravitação','Hidrostática — Stevin','Princípio de Arquimedes'],
  'Física 2 — Óptica, Ondas e Termologia': ['Espelhos planos','Espelhos esféricos','Refração','Lentes esféricas','Ondulatória','Acústica e Doppler','Temperatura e calor','Dilatação térmica','Calor sensível','Calor latente','Gás ideal','1ª lei da termodinâmica','2ª lei da termodinâmica'],
  'Física 3 — Eletromagnetismo e Física Moderna': ['Eletrostática','Campo elétrico','Potencial elétrico','Corrente elétrica','Leis de Ohm','Resistores','Capacitores','Campo magnético','Força magnética','Indução eletromagnética','Efeito fotoelétrico','Relatividade','Física quântica'],
  'Química 1 — Geral e Inorgânica': ['Modelos atômicos','Tabela periódica','Ligações químicas','Geometria molecular','Radioatividade','Misturas e separação','Ácidos e bases','pH','Sais e óxidos','Estequiometria','Gases'],
  'Química 2 — Físico-Química': ['Termoquímica','Soluções','Cinética química','Equilíbrio químico','Eletroquímica — pilhas','Eletrólise'],
  'Química 3 — Orgânica': ['Hidrocarbonetos','Funções oxigenadas','Funções nitrogenadas','Isomeria','Reações orgânicas','Polímeros','Biomoléculas'],
  'Biologia 1 — Citologia e Genética': ['Membrana plasmática','Citoplasma','Fotossíntese','Respiração celular','Mitose','Meiose','1ª lei de Mendel','2ª lei de Mendel','Polialelia','Grupos sanguíneos','Herança sexual','DNA e RNA','Biotecnologia'],
  'Biologia 2 — Embriologia, Histologia e Fisiologia': ['Embriologia','Tecidos','Sistema digestório','Sistema respiratório','Sistema cardiovascular','Sistema imunológico','Sistema excretor','Sistema endócrino','Sistema nervoso','Sistema reprodutor','Vírus e viroses','Bactérias','Fungos'],
  'Biologia 3 — Zoologia, Botânica e Ecologia': ['Invertebrados','Vertebrados','Botânica','Ecossistemas','Cadeias alimentares','Relações ecológicas','Biomas','Evolução','Ciclos biogeoquímicos'],
  'Gramática': ['Concordância verbal','Concordância nominal','Regência','Crase','Pontuação','Colocação pronominal','Orações subordinadas','Orações coordenadas'],
  'Interpretação e Produção Textual': ['Interpretação de textos','Gêneros textuais','Inferências','Coesão e coerência','Variações linguísticas','Charges e Tirinhas'],
  'Literatura': ['Figuras de linguagem','Trovadorismo','Barroco','Arcadismo','Romantismo','Realismo','Modernismo','Literatura contemporânea'],
  'Inglês / Espanhol': ['Interpretação de texto','Vocabulário contextual','Inferências'],
  'História Geral': ['Grécia e Roma','Idade Média','Renascimento','Revoluções (Francesa, Industrial, Russa)','Imperialismo','1ª e 2ª Guerra Mundial','Guerra Fria','Nova Ordem Mundial'],
  'História do Brasil': ['Brasil Colônia','Brasil Império','República Oligárquica','Era Vargas','Ditadura Militar','Redemocratização'],
  'Geografia 1 — Física e Humana': ['Cartografia','Clima e biomas','Relevo e hidrografia','Urbanização','Migrações','Questões ambientais'],
  'Geografia 2 — Regiões e Geopolítica': ['Regiões brasileiras','Industrialização','Agricultura','Globalização','Blocos econômicos'],
  'Filosofia': ['Pré-Socráticos','Platão e Aristóteles','Filosofia Moderna','Iluminismo','Marx','Existencialismo','Ética e moral'],
  'Sociologia': ['Durkheim','Weber','Marx','Estratificação social','Movimentos sociais','Globalização','Cultura'],
  'Atualidades': ['Conflitos internacionais','Meio ambiente','Tecnologia e sociedade','Democracia'],
  'Estrutura e Competências': ['C1 — Domínio da língua','C2 — Compreensão da proposta','C3 — Argumentação','C4 — Coesão','C5 — Proposta de intervenção'],
  'Temas de Redação': ['Direitos humanos','Meio ambiente','Tecnologia','Saúde pública','Desigualdade social','Educação'],
  'Artes': ['Arte na história','Movimentos artísticos','Arte brasileira'],
  'Educação Física': ['Esporte e sociedade','Saúde e corpo'],
}

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
    const { provaBase64, erros } = body

    if (!provaBase64 || !erros?.length) {
      return new Response(JSON.stringify({ error: 'Dados insuficientes' }), {
        status: 400, headers: { 'Content-Type': 'application/json' }
      })
    }

    // Detecta dia pela numeração das questões
    const primeiraQ = erros[0]?.questao || 1
    const isDia2 = primeiraQ > 90
    const areas = isDia2 ? AREAS_DIA2 : AREAS_DIA1

    const listaErros = erros.map(e => 'Q' + e.questao).join(', ')
    const areasStr = areas.join(', ')
    const conteudosStr = areas.map(a => a + ': [' + (CONTEUDOS[a] || []).join(' | ') + ']').join('\n')
    const topicosStr = areas.flatMap(a => (CONTEUDOS[a] || []).map(c => c + ': [' + (TOPICOS[c] || []).join(' | ') + ']')).join('\n')

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2000,
        messages: [{
          role: 'user',
          content: [
            {
              type: 'document',
              source: { type: 'base64', media_type: 'application/pdf', data: provaBase64 }
            },
            {
              type: 'text',
              text: 'Categorize os erros do ENEM nas questoes: ' + listaErros + '\n\nAREAS POSSIVEIS: ' + areasStr + '\n\nCONTEUDOS POR AREA:\n' + conteudosStr + '\n\nTOPICOS POR CONTEUDO:\n' + topicosStr + '\n\nRetorne JSON puro:\n{"erros":[{"questao":1,"area":"Biologia","disciplina":"Biologia 1 — Citologia e Genética","topico":"Mitose","resumo":"divisao celular"}]}'
            }
          ]
        }]
      })
    })

    const rawText = await response.text()
    let data
    try { data = JSON.parse(rawText) } catch {
      return new Response(JSON.stringify({ error: 'Resposta invalida', raw: rawText.slice(0, 200) }), {
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
    try { result = JSON.parse(clean) } catch {
      return new Response(JSON.stringify({ error: 'Parse error', raw: clean.slice(0, 200) }), {
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
