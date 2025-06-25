# Landing Page Freelancer

Sistema para criação de landing pages personalizadas, com backend para gerenciar pedidos e integração.

## Visão Geral

- **Backend**: API REST em Node.js/Express, hospedada no Render (`https://landing-page-api-ab08.onrender.com`),
  integrada com Supabase para gerenciar pedidos e Nodemailer para relatórios mensais.
- **Funcionalidade**: Clientes enviam pedidos via formulário, a API gera prompts para criar landing pages (planos
  Essencial, Profissional, Premium).
- **Integrações**:
    - Supabase: Banco de dados para pedidos.
    - Nodemailer: Relatórios de pedidos concluídos.
    - node-cron: Agendamento mensal.

## Banco de Dados (Supabase)

- **Tabela**: `pedidos`
- **Colunas**:
    - `id` (text, PK): Timestamp único.
    - `created_at` (timestamptz): Data de criação.
    - `detalhes` (jsonb): Dados do cliente (nome, WhatsApp, cores, etc.).
    - `plano` (text): Essencial, Profissional, Premium.
    - `preco` (numeric): Preço calculado.
    - `status` (text): PENDENTE, EM ANDAMENTO, CONCLUIDA.
    - `prazo_entrega` (date): Prazo estimado.

## Backend

- **Hospedagem**: Render (`https://landing-page-api-ab08.onrender.com`).
- **Rotas**:
    - `POST /pedidos`: Cria um pedido, retorna link WhatsApp para confirmação.
    - `GET /pedidos`: Lista todos os pedidos.
    - `GET /pedidos/:id`: Busca pedido por ID com prompt para Grok.
    - `PUT /pedidos/:id`: Atualiza pedido (restrito a desenvolvedores).
    - `DELETE /pedidos/:id`: Exclui pedido.
- **Cron**: Executa no 1º dia do mês às 00:00, enviando relatório de pedidos concluídos por e-mail e excluindo-os do
  banco.

## Configuração

### Backend

1. Crie a tabela `pedidos` no Supabase:

   ```sql
   CREATE TABLE pedidos (
     id TEXT PRIMARY KEY,
     created_at TIMESTAMPTZ DEFAULT NOW(),
     detalhes JSONB NOT NULL,
     plano TEXT NOT NULL CHECK (plano IN ('Essencial', 'Profissional', 'Premium')),
     preco NUMERIC NOT NULL,
     status TEXT NOT NULL CHECK (status IN ('PENDENTE', 'EM ANDAMENTO', 'CONCLUIDA')),
     prazo_entrega DATE NOT NULL
   );
   ALTER TABLE pedidos ENABLE ROW LEVEL SECURITY;
   CREATE POLICY "Permitir acesso anônimo" ON pedidos FOR ALL USING (true) WITH CHECK (true);
   ```
2. Configure variáveis de ambiente no Render:

   ```
   SUPABASE_URL=seu_supabase_url
   SUPABASE_KEY=seu_supabase_key
   EMAIL_USER=seu_email@gmail.com
   EMAIL_PASS=seu_app_password
   ```
    - Use uma senha de aplicativo do Gmail para `EMAIL_PASS`.
3. Clone o repositório:

   ```bash
   git clone https://github.com/seu-usuario/landing-page-freelancer.git
   cd landing-page-freelancer
   npm install
   ```
4. Faça deploy no Render:
    - Conecte o repositório GitHub.
    - Configure: Runtime=Node, Build=`npm install`, Start=`npm start`, plano Free.
    - Adicione variáveis de ambiente.

## Testes

### Backend

- **Listar pedidos**:

  ```bash
  curl -X GET https://landing-page-api-ab08.onrender.com/pedidos
  ```
- **Criar pedido**:

  ```bash
  curl -X POST https://landing-page-api-ab08.onrender.com/pedidos -H "Content-Type: application/json; charset=utf-8" -d '{"plano":"Premium","detalhes":{"nome":"Ana Costa","whatsapp":"+5511977777777","cores":"roxo e dourado","estilo":"elegante","publicoAlvo":"startups","objetivo":"vender curso online","callToAction":"Inscreva-se agora","redesSociais":"instagram.com/ana","emailIntegracao":"ana@gmail.com","mensagemWhatsApp":"Fale comigo!","breveDescricao":"Cursos de tecnologia","beneficios":"Aprendizado rápido, suporte 24/7","ilustracao":"1 personagem","ilustracaoComplexa":true,"animacoesAvancadas":true,"textoSEO":"Transforme sua carreira!","listaServicos":"Cursos, mentoria","preferenciasAnimacao":"botão pulsante","depoimentos":"Ajustar com cliente"}}'
  ```
- **Buscar pedido**:

  ```bash
  curl -X GET https://landing-page-api-ab08.onrender.com/pedidos/1750642148816
  ```
- Use Insomnia para testes visuais.

## Integração com Grok

- **Prompt**: `GET /pedidos/:id` gera um prompt UTF-8 para criar landing pages (veja `workspace-prompt.txt`).
- **Saída**: Arquivos HTML, CSS, JavaScript na barra lateral da sua IA de preferência.

## Tecnologias

- **Backend**: Node.js, Express, Supabase, Nodemailer, node-cron
- **Hospedagem**: Render (backend)
- **Banco**: Supabase

## Contato

- Desenvolvido por **Douglas Queiroz**.
- E-mail: [dev.queiroz05@gmail.com](mailto:dev.queiroz05@gmail.com)
- GitHub: [github.com/dev-queiroz](https://github.com/dev-queiroz)