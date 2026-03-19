# Direction Vestibulares — Mapeamento de Erros

Sistema para vestibulandos mapearem erros em simulados do ENEM.

## Funcionalidades

- **Início**: lista de simulados com aproveitamento, datas e resumo de erros
- **Novo Simulado**: cria um simulado com nome, data e total de questões
- **Detalhe do Simulado**: lista todos os erros com botão para adicionar mais
- **Adicionar Erro**: classifica o erro em Atenção / Interpretação / Conteúdo, com seleção encadeada de Área → Disciplina → Tópico (todos os conteúdos do ENEM pré-cadastrados)
- **Dashboard**: gráficos de tipo de erro, evolução do aproveitamento, top áreas e disciplinas com mais erros, top tópicos mais errados
- **Mapa de Conteúdos**: todas as áreas, disciplinas e tópicos do ENEM com contagem de erros em destaque

## Dados

Os dados são salvos no `localStorage` do navegador — ficam no dispositivo do aluno.

## Como rodar localmente

```bash
npm install
npm run dev
```

Abra http://localhost:5173

## Como fazer deploy na Vercel (recomendado)

1. Crie uma conta em https://vercel.com (grátis)
2. Faça upload do projeto no GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   # Crie um repo no GitHub e siga as instruções para push
   ```
3. Na Vercel, clique em "Add New Project" → importe o repositório
4. Configurações de build:
   - Framework: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. Clique em Deploy — pronto! ✅

## Como fazer deploy na Netlify

1. Rode `npm run build` localmente — gera a pasta `dist/`
2. Acesse https://app.netlify.com
3. Arraste a pasta `dist/` para a área de deploy
4. Site no ar em segundos ✅

## Estrutura do projeto

```
src/
  components/
    Sidebar.jsx       # Menu lateral
    Modal.jsx         # Modal genérico
    AddErroModal.jsx  # Formulário de adicionar erro
  pages/
    Home.jsx          # Página inicial com lista de simulados
    NovoSimulado.jsx  # Formulário de novo simulado
    SimuladoDetail.jsx# Detalhes e erros de um simulado
    Dashboard.jsx     # Análises e gráficos
    Conteudos.jsx     # Mapa de conteúdos do ENEM
  data/
    enemContent.js    # Todos os conteúdos do ENEM (macro e micro)
  hooks/
    useStorage.js     # Hook de localStorage + utilitários
  styles/
    global.css        # Estilos globais
```

## Futuramente: migrar para Supabase

Quando quiser salvar dados na nuvem por aluno, basta:
1. Instalar: `npm install @supabase/supabase-js`
2. Substituir o `useStorage` hook por chamadas ao Supabase
3. Adicionar autenticação com email ou Google
