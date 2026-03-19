export const config = { runtime: 'edge' }

// Lista completa de matérias e conteúdos do sistema
const MATERIAS = {
  "Matemática": {
    "Matemática Básica": ["As quatro operações e Expressões numéricas","Frações e Dízimas periódicas","Sistemas de numeração e Sistema métrico","Raciocínio lógico","Potenciação","Notação científica","Radiciação e Racionalização de denominadores","Produtos notáveis e Fatoração","Equações e Sistemas do primeiro grau","Equações do segundo grau e Equações biquadradas","Critérios de divisibilidade e Números primos","MMC e MDC","Razão e proporção","Regras de 3 e Escalas","Porcentagem","Lucro e Juros simples","Juros compostos"],
    "Matemática 1 — Funções e Álgebra": ["Teoria dos conjuntos","Conjuntos numéricos e Intervalos reais","Progressão aritmética (PA)","Progressão geométrica (PG)","Teoria geral de funções","Função composta e Função inversa","Função constante e Função afim","Função do segundo grau (quadrática)","Função exponencial","Propriedades dos logaritmos","Função logarítmica","Função modular","Matriz e Determinante"],
    "Matemática 2 — Geometria": ["Ângulos","Triângulo equilátero","Semelhança de triângulos","Teorema de Tales","Triângulo retângulo — relações métricas","Triângulo retângulo — relações trigonométricas","Lei dos senos e dos cossenos","Polígonos","Quadriláteros e Hexágonos","Circunferência e Círculo","Geometria de posição","Poliedros","Prismas","Cilindros","Pirâmides e Troncos de pirâmides","Cones e Troncos de cones","Esferas","Sólidos inscritos","Estudo do ponto","Estudo da reta","Estudo da circunferência"],
    "Matemática 3 — Combinatória e Estatística": ["Princípio Fundamental da Contagem (PFC)","Fatorial","Arranjo","Permutação simples e Permutação circular","Combinação","Estatística — Organização e Representação de dados","Estatística — Médias, Medidas de tendência central e de dispersão","Interpretação de gráficos","Probabilidade — Visão geral","Probabilidade da união de eventos","Probabilidade de eventos simultâneos","Probabilidade condicional"]
  },
  "Física": {
    "Física 1 — Mecânica": ["Vetores","Ordem de grandeza e Sistemas de unidades","Movimento uniforme (MRU)","Movimento variado (MRUV)","Lançamento vertical e Queda livre","Lançamento horizontal","Lançamento oblíquo","Movimento circular","Leis de Newton","Máquinas simples (polias)","Força elástica","Força de atrito","Estática de um ponto material","Estática de um corpo extenso e Centro de massa","Dinâmica do movimento circular","Trabalho","Energia mecânica, potência e rendimento","Impulso e quantidade de movimento","Colisões","Movimento Harmônico Simples (MHS)","Leis de Kepler","Lei da Gravitação Universal","Velocidade orbital e Velocidade de escape","Densidade, pressão e Teorema de Stevin","Teorema de Pascal e Prensa hidráulica","Princípio de Arquimedes"],
    "Física 2 — Óptica, Ondas e Termologia": ["Luz e Câmara de orifício","Princípios da óptica geométrica","Espelhos planos","Espelhos esféricos","Refração","Dioptro plano, Ângulo limite e Reflexão total","Prismas","Lentes esféricas","Vergência e Óptica da Visão","Instrumentos ópticos","Ondulatória — Visão geral e Equação fundamental","Fenômenos ondulatórios","Ondas estacionárias em cordas e tubos sonoros","Acústica e Efeito Doppler","Temperatura, Calor e Energia térmica","Escalas termométricas","Dilatação térmica","Calor sensível","Calor latente e Mudança de fase","Propagação do calor","Estudo do gás ideal","Primeira lei da termodinâmica","Ciclos, Máquinas térmicas e Rendimento","Segunda lei da termodinâmica"],
    "Física 3 — Eletromagnetismo e Física Moderna": ["Carga elétrica","Processos de eletrização","Força elétrica — Lei de Coulomb","Campo elétrico e Linhas de força","Potencial elétrico, Trabalho e Energia","Condutor esférico e Capacitância","Corrente e Potência elétrica","Leis de Ohm","Associação de Resistores","Leis de Kirchhoff","Geradores elétricos","Receptores elétricos","Capacitores","Campo magnético","Força Magnética","Indução Eletromagnética — Lei de Lenz","Lei de Faraday","Gerador de corrente alternada e Transformadores","Efeito fotoelétrico","Teoria da relatividade","Física quântica"]
  },
  "Química": {
    "Química 1 — Geral e Inorgânica": ["Modelos atômicos","Distribuição eletrônica","Números quânticos","Classificação periódica","Propriedades periódicas","Ligações químicas","Geometria molecular","Hibridização de orbitais","Polaridade das ligações e das moléculas","Forças intermoleculares","Radioatividade","Propriedades da matéria","Substâncias puras e misturas","Separação de misturas","Tratamento da água e do esgoto","Poluição ambiental, Efeito estufa e Chuvas ácidas","Estudo dos ácidos","Estudo das bases","pH e Indicadores ácido-base","Estudo dos sais","Estudo dos óxidos","Reações inorgânicas","Grandezas químicas e Fórmulas químicas","Balanceamento de reações","Cálculo estequiométrico","Reagente limitante ou em excesso","Pureza e Rendimento","Variáveis de estado e Transformações gasosas","Densidade, Efusão e Difusão de gases","Mistura dos gases"],
    "Química 2 — Físico-Química": ["Entalpia","Lei de Hess","Entalpia de Ligação","Soluções — classificação e solubilidade","Unidades de concentração","Diluição de soluções","Mistura de soluções","Propriedades coligativas","Cinética química — Visão geral","Cinética química — Velocidade média e Lei da velocidade","Equilíbrio químico — Noções e cálculos","Deslocamento de equilíbrio","Equilíbrio iônico e Produto de Solubilidade","pH e pOH","Hidrólise de sais","Soluções tampão e Titulação","Número de oxidação (NOX)","Reações de oxirredução","Pilhas","Eletrólise ígnea","Eletrólise aquosa","Estequiometria da eletrólise"],
    "Química 3 — Orgânica": ["Introdução à Química Orgânica","Classificação das cadeias carbônicas","Hidrocarbonetos","Petróleo","Funções oxigenadas","Funções nitrogenadas","Propriedades físicas e químicas dos compostos orgânicos","Isomeria plana","Isomeria geométrica (cis-trans)","Isomeria óptica","Reações orgânicas de eliminação","Reações orgânicas de substituição","Reações orgânicas de oxidação","Reações orgânicas de adição","Esterificação, Transesterificação e Hidrólise","Polímeros","Biomoléculas"]
  },
  "Biologia": {
    "Biologia 1 — Citologia e Genética": ["Introdução à Biologia e Método Científico","Água e Sais Minerais","Carboidratos","Lipídios e Colesterol","Aminoácidos e Proteínas","Enzimas e Anticorpos","Vitaminas","Ácidos nucleicos","Introdução à citologia e Modelos celulares","Membrana plasmática — Classificação e Fisiologia","Membrana plasmática — Transporte passivo e ativo","Citoplasma — Citoesqueleto e Ribossomos","Citoplasma — Retículo endoplasmático e Complexo de Golgi","Citoplasma — Lisossomos, Peroxissomos, Centríolos e Mitocôndrias","Citoplasma — Plastos, Cloroplastos e Vacúolo","Fotossíntese e Quimiossíntese","Respiração celular","Fermentação","Núcleo celular","Ciclo celular e Etapas da divisão celular","Mitose","Meiose","Gametogênese","Mutações e Anomalias cromossômicas","Código genético","Primeira lei de Mendel e Heredogramas","Segunda lei de Mendel","Polialelia e Genes letais","Interação Gênica","Tipos sanguíneos — Sistema ABO e Fator RH","Herança sexual","Linkage e mapeamento de genes","Engenharia genética, genoma e biotecnologia"],
    "Biologia 2 — Embriologia, Histologia e Fisiologia": ["Fecundação, segmentação e clivagem","Gastrulação, Neurulação e Organogênese","Anexos embrionários","Embriologia humana","Tecido epitelial","Tecido conjuntivo propriamente dito","Tecido adiposo","Tecido cartilaginoso","Tecido ósseo","Tecido sanguíneo","Tecido muscular","Tecido nervoso","Sistema digestório","Sistema respiratório","Sistema cardiovascular","Sistemas linfático e imunológico","Sistema excretor","Sistema endócrino","Sistema nervoso","Sistema sensorial","Sistema reprodutor","Ciclo menstrual","Métodos contraceptivos","Classificação Biológica","Vírus, Príons e Viroses","Reino Monera e Bacterioses","Algas","Protozoários e Protozooses","Reino Fungi e Micoses"],
    "Biologia 3 — Zoologia, Botânica e Ecologia": ["Poríferos","Cnidários","Platelmintos e verminoses","Nematelmintos e verminoses","Anelídeos","Artrópodes","Moluscos","Equinodermos","Peixes","Anfíbios","Répteis","Aves","Mamíferos","Introdução à Botânica","Ciclo reprodutivo dos vegetais","Briófitas e Pteridófitas","Gimnospermas","Angiospermas","Morfologia vegetal — Flor, semente e fruto","Morfologia vegetal — Raiz, caule e folha","Histologia vegetal","Fisiologia e Transpiração vegetal","Hormônios e Movimentos vegetais","Origem da vida","Teorias evolutivas","Genética das populações e Lei de Hardy-Weinberg","Especiação","Evolução dos primatas e humana","Introdução à ecologia","Dinâmica populacional e Potencial biótico","Fluxo de energia e Pirâmides ecológicas","Relações ecológicas","Sucessão ecológica","Ecossistemas e Biomas","Desequilíbrios ecológicos","Ciclos biogeoquímicos"]
  },
  "História": {
    "História Geral": ["Historiografia e Linha do tempo","Pré-História","Egito e Mesopotâmia","Hebreus e Persas","Fenícios e Cretenses","Grécia Antiga","Roma Antiga","Alta Idade Média — Sistema Feudal e Igreja medieval","Idade Média no Oriente e Civilização muçulmana e Cruzadas","Transição feudo-capitalista","Baixa Idade Média","Antigo Regime — Absolutismo e Mercantilismo","Reformas religiosas, Liberalismo e Iluminismo","Civilizações pré-colombianas","Colonização espanhola na América","Colonização inglesa na América","Revoluções Inglesas e Revolução Industrial","Independência dos EUA","Revolução Francesa","Era Napoleônica e Congresso de Viena","Independência da América espanhola","Revoluções liberais de 1830 e 1848","Ideias sociais e políticas do Século XIX","Unificações tardias","Imperialismo","Primeira Guerra Mundial","Revolução Russa","Crise de 1929","Período entre guerras e Totalitarismo","Segunda Guerra Mundial","Revolução Cubana","América Latina no século XX","Descolonização afro-asiática","Revolução chinesa","Guerra Fria","A Nova Ordem Mundial"],
    "História do Brasil": ["Povos indígenas do Brasil","Expansão marítima portuguesa","Período pré-colonial","Início da colonização","Economia açucareira","Pecuária e Drogas do sertão","Ocupação e expansão territorial","Invasões estrangeiras","Economia mineradora","Revoltas nativistas","Movimentos emancipacionistas","Família Real portuguesa no Brasil","Processo de independência do Brasil","Primeiro Reinado","Período Regencial","Segundo Reinado","República da Espada","República Oligárquica","Era Vargas","República Liberal","Regime Militar","Redemocratização","Nova República"]
  },
  "Geografia": {
    "Geografia 1 — Física e Humana": ["Orientação e Coordenadas geográficas","Cartografia","Projeções cartográficas","Fuso horário","Movimentos da Terra e da lua","Dinâmica das placas tectônicas","Dinâmica interna e externa do relevo","Rochas e Estruturas geológicas","Relevo brasileiro","Recursos minerais","Formação e tipos de solo","Recursos hídricos e Bacias hidrográficas do Brasil","Atmosfera e Fatores climáticos","Dinâmica dos ventos e Zonas climáticas da Terra","Fenômenos e mudanças climáticas","Clima do Brasil","Grandes biomas terrestres","Ecossistemas Brasileiros","Problemas ambientais","Conferências Internacionais","Espaço geográfico","Urbanização e Hierarquias urbanas","Problemas sociais e ambientais urbanos","Urbanização do Brasil","Movimentos migratórios","Teorias demográficas","Demografia do Brasil","Estrutura da população","Fatores do desenvolvimento e Indicadores sociais"],
    "Geografia 2 — Regiões e Geopolítica": ["Região Sul","Região Sudeste","Região Norte","Região Nordeste","Região Centro-Oeste","Complexos regionais","Energias renováveis e não renováveis","Revolução Industrial","Modelos produtivos","Classificação das Indústrias","Regiões industriais do Brasil","Transportes","Globalização e Regionalização","Comércio no Brasil","Sistemas agrícolas","Revolução verde, Transgênicos e Agronegócio","Agricultura no Brasil","Nova ordem mundial","Organizações internacionais","Blocos econômicos"]
  },
  "Filosofia": { "Filosofia": ["Origem da filosofia","Pré-Socráticos","Sofistas, Sócrates e Platão","Aristóteles","Filosofia Helenística","Filosofia Medieval","Filosofia Renascentista e Revolução científica","Filosofia Moderna — Introdução","Filosofia Moderna — Racionalismo","Filosofia Moderna — Empirismo","Filosofia Moderna — Iluminismo","Filosofia Moderna — Immanuel Kant","Idealismo Alemão","Escola de Frankfurt","Existencialismo"] },
  "Sociologia": { "Sociologia": ["Surgimento da Sociologia","Comte e o Positivismo","Émile Durkheim","Max Weber","Karl Marx","Sociologia no Brasil","Revolução Industrial e Globalização","Estratificação, Classe e Mobilidade social","Poder, Política e Estado","Direitos, Cidadania e Movimentos sociais","Instituições Sociais","Cultura e Educação","Zygmunt Bauman e a Modernidade Líquida"] },
  "Língua Portuguesa": {
    "Gramática": ["Classes gramaticais","Formação de palavras","Pronomes pessoais","Pronomes possessivos, demonstrativos, indefinidos, interrogativos e relativos","Colocação pronominal","Acentuação","Crase","Pontuação — Visão geral","Vírgula","Novo Acordo Ortográfico","Sujeito e Predicado","Aposto e vocativo","Termos ligados ao verbo","Termos ligados ao nome","Função sintática dos pronomes relativos","Concordância verbal","Concordância nominal","Regência","Orações coordenadas","Orações subordinadas substantivas","Orações subordinadas adjetivas","Orações subordinadas adverbiais","Orações subordinadas reduzidas","A palavra QUE","A palavra SE"],
    "Interpretação e Produção Textual": ["Fatores de contextualização","Tipos e Gêneros textuais","O texto dissertativo-argumentativo","Estratégias argumentativas","Inferências","Coesão, coerência e concisão","Variações linguísticas","Tecnologias da comunicação e informação","Charges e Tirinhas","Gêneros jornalísticos"]
  },
  "Literatura": { "Literatura": ["Figuras de linguagem — aspectos fonético e sintático","Figuras de linguagem — aspecto semântico","Gêneros Literários","Funções da Linguagem","Trovadorismo","Quinhentismo","Barroco","Arcadismo","Romantismo — primeira geração","Romantismo — segunda geração","Romantismo — terceira geração","Romantismo — Prosa","Realismo","Naturalismo","Parnasianismo","Simbolismo","Pré-Modernismo","Vanguardas Europeias","Modernismo — primeira geração","Modernismo — segunda geração","Modernismo — terceira geração","Poesia Concreta","Poesia Marginal","Literatura contemporânea"] },
  "Língua Estrangeira": { "Inglês / Espanhol": ["Objetivos da Leitura e Níveis de Compreensão","Vocabulário","Técnicas de leitura","Inferências","Assuntos Gerais","Charges e Tirinhas","Placas e Anúncios Publicitários","Letras de Músicas","Relato de Pesquisas","Tecnologia","Citações"] },
  "Redação": {
    "Estrutura e Competências": ["Planejamento textual","Estrutura da redação para ENEM","Introdução e apresentação da tese","Desenvolvimento e argumentação","Conclusão e proposta de intervenção"],
    "Temas de Redação": ["Política e Corrupção","Cidadania e Movimentos sociais","Tecnologia, Internet, Mídias sociais e Fake news","Envelhecimento e Previdência social","Saúde pública e Doação de órgãos","Fome, Desigualdade e População de rua","Intolerância, racismo, assédio e preconceito","Bullying e violência nas escolas","Exclusão digital","Consumismo","Culto ao corpo e obesidade","Trabalho e realização","Povos indígenas","Lixo e saneamento","Mobilidade urbana","Educação e Leitura","Guerras e armas de destruição em massa","Suicídio, depressão e solidão","Sistema prisional e violência","Meio ambiente e Mudanças climáticas","Recursos hídricos, Energia e Sustentabilidade","Drogas","Lazer, Esporte e Cultura","Acessibilidade e Inclusão de pessoas com deficiência"]
  },
  "Artes e Educação Física": { "Artes": ["Arte — conceitos, modalidades, estéticas, funções e estados","Arte na Pré-história","Arte na Idade Antiga","Arte na Idade Média","Arte Renascentista","Maneirismo, Barroco e Rococó","Arte Neoclássica e Romântica","Arte Moderna — Impressionismo e outros movimentos","Arte Moderna — Vanguardas europeias","Arte moderna no Brasil","Arte contemporânea","Culturas africana e indígena","Cultura popular","Música","Teatro"] },
  "Atualidades": { "Atualidades": ["Conflitos do século XX","Migrações e Refugiados","A questão da Ucrânia","A questão da Palestina","A crise hídrica","Terrorismo","Conflitos do Século XXI","União Europeia e Brexit","América Latina do Século XXI","Crises econômicas do Século XXI","Crise na Venezuela","Saúde e Problemas ambientais","Internet, Redes sociais e Fake News"] }
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

    const listaErros = erros.map(e => `Q${e.questao}`).join(', ')
    const materiasJSON = JSON.stringify(MATERIAS)

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
              text: `Você é um especialista no ENEM e em vestibulares brasileiros.

Analise esta prova e categorize os erros do aluno nas questões: ${listaErros}

Para cada questão, leia o enunciado e classifique usando EXATAMENTE os valores abaixo:

${materiasJSON}

A estrutura é: { "NomeDaMateria": { "NomeDoConteudo": ["topico1", "topico2", ...] } }

Para cada questão errada, retorne:
- "area": nome exato da matéria (chave do objeto raiz)
- "disciplina": nome exato do conteúdo (chave dentro da matéria)  
- "topico": nome exato do tópico (valor dentro do array)
- "resumo": frase curta descrevendo o assunto da questão (máx 10 palavras)

Retorne APENAS este JSON, sem markdown, sem explicações:
{
  "erros": [
    {
      "questao": 164,
      "area": "Biologia",
      "disciplina": "Biologia 1 — Citologia e Genética",
      "topico": "Primeira lei de Mendel e Heredogramas",
      "resumo": "Herança monohíbrida com dominância completa"
    }
  ]
}`
            }
          ]
        }]
      })
    })

    const rawText = await response.text()
    let data
    try { data = JSON.parse(rawText) }
    catch {
      return new Response(JSON.stringify({ error: 'Resposta inválida', raw: rawText.slice(0, 300) }), {
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
