# Sistema de Plano de Aquisição TIC

Sistema de gestão para planos de aquisição de tecnologia da informação e comunicação.

## 📋 Pré-requisitos

Para instalar e executar este projeto localmente, você precisa ter instalado:

1. **Node.js** (versão 18 ou superior)
   - Download: https://nodejs.org/
   - Verificar instalação: `node --version`

2. **Yarn** (gerenciador de pacotes)
   - Instalar: `npm install -g yarn`
   - Verificar instalação: `yarn --version`

3. **PostgreSQL** (banco de dados)
   - Download: https://www.postgresql.org/download/
   - Criar um banco de dados para o projeto

## 🚀 Instalação

1. **Clone o projeto** para sua máquina local

2. **Navegue até a pasta do aplicativo:**
   ```bash
   cd plano_aquisicao_tic/app
   ```

3. **Instale as dependências:**
   ```bash
   yarn install
   ```

4. **Configure as variáveis de ambiente:**
   
   Crie um arquivo `.env` na raiz da pasta `app` com o seguinte conteúdo:
   ```env
   # Banco de Dados PostgreSQL
   DATABASE_URL="postgresql://usuario:senha@localhost:5432/nome_do_banco"
   
   # Autenticação NextAuth
   NEXTAUTH_SECRET="sua_chave_secreta_aqui"
   NEXTAUTH_URL="http://localhost:3000"
   ```

   **Importante:** Substitua:
   - `usuario`: seu usuário do PostgreSQL
   - `senha`: sua senha do PostgreSQL  
   - `nome_do_banco`: nome do banco que você criou
   - `sua_chave_secreta_aqui`: uma string aleatória e segura

5. **Configure o banco de dados:**
   ```bash
   # Gerar o cliente Prisma
   npx prisma generate
   
   # Executar as migrações
   npx prisma db push
   
   # (Opcional) Executar o seed para dados iniciais
   yarn prisma db seed
   ```

6. **Execute o projeto em modo de desenvolvimento:**
   ```bash
   yarn dev
   ```

7. **Acesse a aplicação:**
   
   Abra seu navegador e acesse: `http://localhost:3000`

## 🏗️ Build para Produção

Para fazer o build para produção:

```bash
# Build da aplicação
yarn build

# Executar em modo produção
yarn start
```

## 📊 Banco de Dados

O projeto utiliza:
- **PostgreSQL** como banco principal
- **Prisma** como ORM
- **NextAuth** para autenticação

### Estrutura principal:
- Usuários e departamentos
- Itens TIC e categorias
- Solicitações e aprovações
- Histórico de alterações
- Notificações

## 🛠️ Tecnologias Utilizadas

- **Framework:** Next.js 14
- **Linguagem:** TypeScript
- **Banco:** PostgreSQL + Prisma
- **Autenticação:** NextAuth.js
- **Styling:** TailwindCSS
- **UI Components:** Radix UI
- **Formulários:** React Hook Form
- **Charts:** Chart.js, Recharts, Plotly.js

## ⚠️ Solução de Problemas

### Erro de conexão com banco:
- Verifique se o PostgreSQL está rodando
- Confirme se as credenciais no `.env` estão corretas
- Teste a conexão: `npx prisma db pull`

### Erro no Prisma:
- Regenerar cliente: `npx prisma generate`
- Resetar banco (cuidado!): `npx prisma db reset`

### Dependências não encontradas:
- Limpar cache: `yarn cache clean`
- Reinstalar: `rm -rf node_modules && yarn install`

## 📁 Estrutura do Projeto

```
app/
├── app/                 # Rotas e páginas (App Router)
├── components/          # Componentes reutilizáveis
├── lib/                 # Utilitários e configurações
├── prisma/              # Schema e migrações do banco
├── scripts/             # Scripts de automação
├── types/               # Definições de tipos TypeScript
├── .env                 # Variáveis de ambiente
├── package.json         # Dependências e scripts
└── tailwind.config.ts   # Configuração do TailwindCSS
```

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request