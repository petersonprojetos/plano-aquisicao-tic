
# 🏛️ Sistema de Plano de Aquisição de TIC

Sistema web completo para gestão de solicitações de aquisição de tecnologia da informação e comunicação (TIC) com workflow de aprovação em múltiplos níveis.

## 🚀 Funcionalidades Principais

### 👥 Gestão de Usuários
- **Autenticação** com NextAuth.js
- **Perfis de acesso**: Admin, Manager, User  
- **Controle de permissões** por departamento

### 🏢 Gestão de Departamentos
- **CRUD completo** de departamentos e tipos
- **Estrutura hierárquica** com departamentos pai/filho
- **Importação em massa** via planilhas Excel

### 📋 Sistema de Solicitações
- **Criação de solicitações** com múltiplos itens
- **Workflow de aprovação** em dois níveis (Gestor → Aprovador)
- **Estados**: Rascunho, Pendente, Aprovada, Rejeitada, Concluída
- **Justificativas** obrigatórias para rejeições

### 📊 Dashboard e Relatórios
- **Dashboards personalizados** por perfil de usuário
- **Relatórios de planejamento anual** filtrados por departamento
- **Métricas em tempo real** de solicitações e aprovações

### 🗂️ Gestão de Itens TIC
- **Taxonomia completa** de itens TIC
- **Categorias e tipos** hierárquicos
- **Sistema de exclusões** para itens não permitidos
- **Busca avançada** com filtros múltiplos

## 🛠️ Tecnologias Utilizadas

- **Frontend**: Next.js 14, React 18, TypeScript
- **Estilização**: Tailwind CSS, Radix UI, Shadcn/ui
- **Backend**: Next.js API Routes
- **Banco de Dados**: PostgreSQL com Prisma ORM
- **Autenticação**: NextAuth.js
- **Validação**: Zod, React Hook Form
- **Estados**: Zustand

## 📁 Estrutura do Projeto

```
plano_aquisicao_tic/
├── app/                        # Aplicação Next.js
│   ├── api/                    # API Routes
│   ├── dashboard/              # Páginas do dashboard
│   ├── components/             # Componentes reutilizáveis
│   ├── lib/                    # Utilitários e configurações
│   └── prisma/                 # Schema do banco de dados
├── docs/                       # Documentação
└── README.md                   # Este arquivo
```

## 🚀 Como Executar

### 1. Pré-requisitos
- Node.js 18+ 
- Yarn
- PostgreSQL

### 2. Instalação
```bash
# Clonar o repositório
git clone https://github.com/seu-usuario/plano-aquisicao-tic.git
cd plano-aquisicao-tic/app

# Instalar dependências
yarn install

# Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com suas configurações
```

### 3. Banco de Dados
```bash
# Executar migrações
yarn prisma db push

# Gerar cliente Prisma
yarn prisma generate

# (Opcional) Popular com dados de exemplo
yarn prisma db seed
```

### 4. Executar em Desenvolvimento
```bash
yarn dev
```

Acesse: http://localhost:3000

### 5. Build para Produção
```bash
yarn build
yarn start
```

## 🔧 Configuração

### Variáveis de Ambiente (.env)
```env
# Banco de dados
DATABASE_URL="postgresql://user:password@localhost:5432/plano_tic"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="seu-secret-aqui"

# (Opcional) Configurações adicionais
```

## 👥 Perfis de Usuário

### 👤 **Usuário (USER)**
- Criar e editar próprias solicitações
- Ver apenas dados do seu departamento
- Acompanhar status das solicitações

### 👨‍💼 **Gestor (MANAGER)**  
- Aprovar/rejeitar solicitações do departamento
- Ver relatórios do departamento
- Gerenciar usuários do departamento

### 🔧 **Administrador (ADMIN)**
- Acesso completo ao sistema
- Gestão de departamentos e usuários
- Configurações globais
- Relatórios de todo o sistema

## 📈 Fluxo de Aprovação

1. **Usuário** cria solicitação → Status: `PENDING`
2. **Gestor** aprova → Status: `MANAGER_APPROVED` 
3. **Aprovador** aprova → Status: `APPROVED`
4. Solicitação executada → Status: `COMPLETED`

*Pode ser rejeitada em qualquer etapa com justificativa*

## 📖 Documentação Adicional

- [Instalação Local](docs/INSTALACAO_LOCAL.md)
- [Workflow de Aprovação](docs/WORKFLOW_DUPLO_APROVACAO.md)  
- [Estado Inicial do Sistema](docs/ESTADO_INICIAL_SISTEMA.md)

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 📞 Suporte

Para dúvidas ou suporte, entre em contato através das issues do GitHub.

---

**Desenvolvido com ❤️ usando Next.js e TypeScript**
