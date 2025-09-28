
# Estrutura do Banco de Dados
## Sistema de Plano de Aquisição TIC

### **Database Management System:** PostgreSQL
### **ORM:** Prisma

---

## 📊 **TABELAS PRINCIPAIS**

### 1. **USERS (Usuários)**
**Tabela:** `users`

| Campo | Tipo | Constraints | Descrição |
|-------|------|-------------|-----------|
| id | String | PK, CUID | Identificador único |
| email | String | UNIQUE, NOT NULL | Email do usuário |
| name | String | NOT NULL | Nome completo |
| password | String | NOT NULL | Senha criptografada |
| role | UserRole | DEFAULT: USER | Papel do usuário |
| department_id | String | FK, NOT NULL | Referência ao departamento |
| is_active | Boolean | DEFAULT: true | Status ativo/inativo |
| last_login | DateTime | NULL | Último acesso |
| email_verified | DateTime | NULL | Data de verificação do email |
| mfa_enabled | Boolean | DEFAULT: false | MFA habilitado |
| mfa_code | String | NULL | Código MFA |
| mfa_code_expires | DateTime | NULL | Expiração do código MFA |
| created_at | DateTime | DEFAULT: now() | Data de criação |
| updated_at | DateTime | AUTO UPDATE | Data de atualização |

**Chaves Estrangeiras:**
- department_id → departments.id

**Relacionamentos:**
- 1:N com requests (solicitações)
- 1:N com accounts (contas de autenticação)
- 1:N com sessions (sessões)
- 1:N com request_history (histórico)
- 1:N com notifications (notificações)
- 1:N com annual_plans (planos anuais)
- N:1 com departments

---

### 2. **DEPARTMENTS (Departamentos)**
**Tabela:** `departments`

| Campo | Tipo | Constraints | Descrição |
|-------|------|-------------|-----------|
| id | String | PK, CUID | Identificador único |
| code | String | UNIQUE, NOT NULL | Código do departamento |
| name | String | UNIQUE, NOT NULL | Nome do departamento |
| parent_id | String | FK, NULL | Departamento pai |
| commander | String | NULL | Comandante/Chefe |
| phone | String | NULL | Telefone |
| address | String | NULL | Endereço |
| city | String | NULL | Cidade |
| state | String | NULL | Estado |
| zip_code | String | NULL | CEP |
| country | String | DEFAULT: 'Brasil' | País |
| annual_budget | Decimal(15,2) | NULL | Orçamento anual |
| observations | String | NULL | Observações |
| is_active | Boolean | DEFAULT: true | Status ativo/inativo |
| created_at | DateTime | DEFAULT: now() | Data de criação |
| updated_at | DateTime | AUTO UPDATE | Data de atualização |

**Chaves Estrangeiras:**
- parent_id → departments.id (auto-relacionamento)

**Relacionamentos:**
- 1:N com users (usuários)
- 1:N com requests (solicitações)
- 1:N com annual_plans (planos anuais)
- 1:N com departments (hierarquia - filhos)
- N:1 com departments (hierarquia - pai)

---

### 3. **REQUESTS (Solicitações)**
**Tabela:** `requests`

| Campo | Tipo | Constraints | Descrição |
|-------|------|-------------|-----------|
| id | String | PK, CUID | Identificador único |
| request_number | String | UNIQUE, NOT NULL | Número da solicitação |
| requester_name | String | NOT NULL | Nome do solicitante |
| user_id | String | FK, NOT NULL | Referência ao usuário |
| department_id | String | FK, NOT NULL | Referência ao departamento |
| status | RequestStatus | DEFAULT: OPEN | Status da solicitação |
| request_date | DateTime | DEFAULT: now() | Data da solicitação |
| total_value | Decimal(15,2) | DEFAULT: 0 | Valor total |
| description | String | NULL | Descrição |
| justification | String | NULL | Justificativa |
| approved_by | String | NULL | Aprovado por |
| approved_at | DateTime | NULL | Data de aprovação |
| rejection_reason | String | NULL | Motivo da rejeição |
| created_at | DateTime | DEFAULT: now() | Data de criação |
| updated_at | DateTime | AUTO UPDATE | Data de atualização |

**Chaves Estrangeiras:**
- user_id → users.id
- department_id → departments.id

**Relacionamentos:**
- N:1 com users
- N:1 com departments
- 1:N com request_items (itens)
- 1:N com request_history (histórico)
- 1:N com notifications (notificações)

---

### 4. **REQUEST_ITEMS (Itens da Solicitação)**
**Tabela:** `request_items`

| Campo | Tipo | Constraints | Descrição |
|-------|------|-------------|-----------|
| id | String | PK, CUID | Identificador único |
| request_id | String | FK, NOT NULL | Referência à solicitação |
| item_name | String | NOT NULL | Nome do item |
| item_type | ItemType | NOT NULL | Tipo do item (enum) |
| item_category | ItemCategory | NOT NULL | Categoria (PRODUCT/SERVICE) |
| acquisition_type | AcquisitionType | NOT NULL | Tipo de aquisição (enum) |
| contract_type_id | String | FK, NULL | Tipo de contrato |
| acquisition_type_master_id | String | FK, NULL | Tipo de aquisição master |
| quantity | Int | NOT NULL | Quantidade |
| unit_value | Decimal(15,2) | NOT NULL | Valor unitário |
| total_value | Decimal(15,2) | NOT NULL | Valor total |
| specifications | String | NULL | Especificações |
| brand | String | NULL | Marca |
| model | String | NULL | Modelo |
| supplier | String | NULL | Fornecedor |
| estimated_delivery | DateTime | NULL | Previsão de entrega |
| created_at | DateTime | DEFAULT: now() | Data de criação |
| updated_at | DateTime | AUTO UPDATE | Data de atualização |

**Chaves Estrangeiras:**
- request_id → requests.id (CASCADE DELETE)
- contract_type_id → contract_types.id
- acquisition_type_master_id → acquisition_types.id

**Relacionamentos:**
- N:1 com requests
- N:1 com contract_types
- N:1 com acquisition_types

---

### 5. **REQUEST_HISTORY (Histórico das Solicitações)**
**Tabela:** `request_history`

| Campo | Tipo | Constraints | Descrição |
|-------|------|-------------|-----------|
| id | String | PK, CUID | Identificador único |
| request_id | String | FK, NOT NULL | Referência à solicitação |
| action | String | NOT NULL | Ação realizada |
| old_status | RequestStatus | NULL | Status anterior |
| new_status | RequestStatus | NULL | Novo status |
| old_value | Decimal(15,2) | NULL | Valor anterior |
| new_value | Decimal(15,2) | NULL | Novo valor |
| comments | String | NULL | Comentários |
| created_by_id | String | FK, NOT NULL | Criado por |
| updated_by_id | String | FK, NULL | Atualizado por |
| created_at | DateTime | DEFAULT: now() | Data de criação |

**Chaves Estrangeiras:**
- request_id → requests.id (CASCADE DELETE)
- created_by_id → users.id
- updated_by_id → users.id

**Relacionamentos:**
- N:1 com requests
- N:1 com users (criado por)
- N:1 com users (atualizado por)

---

### 6. **ANNUAL_PLANS (Planos Anuais)**
**Tabela:** `annual_plans`

| Campo | Tipo | Constraints | Descrição |
|-------|------|-------------|-----------|
| id | String | PK, CUID | Identificador único |
| year | Int | NOT NULL | Ano do plano |
| department_id | String | FK, NOT NULL | Referência ao departamento |
| title | String | NOT NULL | Título do plano |
| description | String | NULL | Descrição |
| total_budget | Decimal(15,2) | NOT NULL | Orçamento total |
| used_budget | Decimal(15,2) | DEFAULT: 0 | Orçamento utilizado |
| status | PlanStatus | DEFAULT: DRAFT | Status do plano |
| is_active | Boolean | DEFAULT: true | Status ativo/inativo |
| created_by_id | String | FK, NOT NULL | Criado por |
| updated_by_id | String | FK, NULL | Atualizado por |
| created_at | DateTime | DEFAULT: now() | Data de criação |
| updated_at | DateTime | AUTO UPDATE | Data de atualização |

**Chaves Estrangeiras:**
- department_id → departments.id
- created_by_id → users.id
- updated_by_id → users.id

**Índices Únicos:**
- UNIQUE(year, department_id)

**Relacionamentos:**
- N:1 com departments
- N:1 com users (criado por)
- N:1 com users (atualizado por)

---

### 7. **NOTIFICATIONS (Notificações)**
**Tabela:** `notifications`

| Campo | Tipo | Constraints | Descrição |
|-------|------|-------------|-----------|
| id | String | PK, CUID | Identificador único |
| user_id | String | FK, NOT NULL | Referência ao usuário |
| request_id | String | FK, NULL | Referência à solicitação |
| type | NotificationType | NOT NULL | Tipo da notificação |
| title | String | NOT NULL | Título |
| message | String | NOT NULL | Mensagem |
| is_read | Boolean | DEFAULT: false | Lida ou não |
| sent_at | DateTime | NULL | Data de envio |
| created_at | DateTime | DEFAULT: now() | Data de criação |

**Chaves Estrangeiras:**
- user_id → users.id
- request_id → requests.id

**Relacionamentos:**
- N:1 com users
- N:1 com requests

---

## 📋 **TABELAS DE CONFIGURAÇÃO E MESTRES**

### 8. **SYSTEM_PARAMETERS (Parâmetros do Sistema)**
**Tabela:** `system_parameters`

| Campo | Tipo | Constraints | Descrição |
|-------|------|-------------|-----------|
| id | String | PK, CUID | Identificador único |
| name | String | UNIQUE, NOT NULL | Nome do parâmetro |
| value | String | NOT NULL | Valor |
| type | ParameterType | NOT NULL | Tipo do parâmetro |
| description | String | NULL | Descrição |
| is_active | Boolean | DEFAULT: true | Status ativo/inativo |
| created_at | DateTime | DEFAULT: now() | Data de criação |
| updated_at | DateTime | AUTO UPDATE | Data de atualização |

---

### 9. **ITEM_CATEGORIES (Categorias de Itens Master)**
**Tabela:** `item_categories`

| Campo | Tipo | Constraints | Descrição |
|-------|------|-------------|-----------|
| id | String | PK, CUID | Identificador único |
| code | String | UNIQUE, NOT NULL | Código da categoria |
| name | String | UNIQUE, NOT NULL | Nome da categoria |
| description | String | NULL | Descrição |
| is_active | Boolean | DEFAULT: true | Status ativo/inativo |
| created_at | DateTime | DEFAULT: now() | Data de criação |
| updated_at | DateTime | AUTO UPDATE | Data de atualização |

**Relacionamentos:**
- 1:N com items

---

### 10. **ITEM_TYPES (Tipos de Itens Master)**
**Tabela:** `item_types`

| Campo | Tipo | Constraints | Descrição |
|-------|------|-------------|-----------|
| id | String | PK, CUID | Identificador único |
| code | String | UNIQUE, NOT NULL | Código do tipo |
| name | String | UNIQUE, NOT NULL | Nome do tipo |
| description | String | NULL | Descrição |
| is_active | Boolean | DEFAULT: true | Status ativo/inativo |
| created_at | DateTime | DEFAULT: now() | Data de criação |
| updated_at | DateTime | AUTO UPDATE | Data de atualização |

**Relacionamentos:**
- 1:N com items

---

### 11. **ITEMS (Itens)**
**Tabela:** `items`

| Campo | Tipo | Constraints | Descrição |
|-------|------|-------------|-----------|
| id | String | PK, CUID | Identificador único |
| code | String | UNIQUE, NOT NULL | Código do item |
| description | String | NOT NULL | Descrição |
| category_id | String | FK, NOT NULL | Referência à categoria |
| type_id | String | FK, NOT NULL | Referência ao tipo |
| specifications | String | NULL | Especificações |
| brand | String | NULL | Marca |
| model | String | NULL | Modelo |
| is_active | Boolean | DEFAULT: true | Status ativo/inativo |
| created_at | DateTime | DEFAULT: now() | Data de criação |
| updated_at | DateTime | AUTO UPDATE | Data de atualização |

**Chaves Estrangeiras:**
- category_id → item_categories.id
- type_id → item_types.id

**Relacionamentos:**
- N:1 com item_categories
- N:1 com item_types

---

### 12. **CONTRACT_TYPES (Tipos de Contrato)**
**Tabela:** `contract_types`

| Campo | Tipo | Constraints | Descrição |
|-------|------|-------------|-----------|
| id | String | PK, CUID | Identificador único |
| code | String | UNIQUE, NOT NULL | Código do tipo |
| name | String | UNIQUE, NOT NULL | Nome do tipo |
| description | String | NULL | Descrição |
| is_active | Boolean | DEFAULT: true | Status ativo/inativo |
| created_at | DateTime | DEFAULT: now() | Data de criação |
| updated_at | DateTime | AUTO UPDATE | Data de atualização |

**Relacionamentos:**
- 1:N com request_items

---

### 13. **ACQUISITION_TYPES (Tipos de Aquisição Master)**
**Tabela:** `acquisition_types`

| Campo | Tipo | Constraints | Descrição |
|-------|------|-------------|-----------|
| id | String | PK, CUID | Identificador único |
| code | String | UNIQUE, NOT NULL | Código do tipo |
| name | String | UNIQUE, NOT NULL | Nome do tipo |
| description | String | NULL | Descrição |
| is_active | Boolean | DEFAULT: true | Status ativo/inativo |
| created_at | DateTime | DEFAULT: now() | Data de criação |
| updated_at | DateTime | AUTO UPDATE | Data de atualização |

**Relacionamentos:**
- 1:N com request_items

---

## 🔐 **TABELAS DE AUTENTICAÇÃO (NextAuth)**

### 14. **ACCOUNTS (Contas)**
**Tabela:** `accounts`

| Campo | Tipo | Constraints | Descrição |
|-------|------|-------------|-----------|
| id | String | PK, CUID | Identificador único |
| user_id | String | FK, NOT NULL | Referência ao usuário |
| type | String | NOT NULL | Tipo da conta |
| provider | String | NOT NULL | Provedor |
| provider_account_id | String | NOT NULL | ID da conta no provedor |
| refresh_token | Text | NULL | Token de refresh |
| access_token | Text | NULL | Token de acesso |
| expires_at | Int | NULL | Expiração |
| token_type | String | NULL | Tipo do token |
| scope | String | NULL | Escopo |
| id_token | Text | NULL | Token ID |
| session_state | String | NULL | Estado da sessão |

**Chaves Estrangeiras:**
- user_id → users.id (CASCADE DELETE)

**Índices Únicos:**
- UNIQUE(provider, provider_account_id)

---

### 15. **SESSIONS (Sessões)**
**Tabela:** `sessions`

| Campo | Tipo | Constraints | Descrição |
|-------|------|-------------|-----------|
| id | String | PK, CUID | Identificador único |
| session_token | String | UNIQUE, NOT NULL | Token da sessão |
| user_id | String | FK, NOT NULL | Referência ao usuário |
| expires | DateTime | NOT NULL | Data de expiração |

**Chaves Estrangeiras:**
- user_id → users.id (CASCADE DELETE)

---

### 16. **VERIFICATIONTOKENS (Tokens de Verificação)**
**Tabela:** `verificationtokens`

| Campo | Tipo | Constraints | Descrição |
|-------|------|-------------|-----------|
| identifier | String | NOT NULL | Identificador |
| token | String | NOT NULL | Token |
| expires | DateTime | NOT NULL | Data de expiração |

**Índices Únicos:**
- UNIQUE(identifier, token)

---

## 🔢 **ENUMS (Enumeradores)**

### **UserRole (Papel do Usuário)**
```sql
USER, MANAGER, ADMIN
```

### **RequestStatus (Status da Solicitação)**
```sql
OPEN, PENDING_APPROVAL, APPROVED, IN_ANALYSIS, 
IN_PROGRESS, AWAITING_DELIVERY, COMPLETED, 
CANCELLED, REJECTED
```

### **ItemType (Tipo de Item)**
```sql
COMPUTER, NOTEBOOK, PRINTER, PERIPHERALS, 
MONITOR, UPS, NETWORK_INSTALLATION, SOFTWARE, 
MAINTENANCE, OTHER
```

### **ItemCategory (Categoria do Item)**
```sql
PRODUCT, SERVICE
```

### **AcquisitionType (Tipo de Aquisição)**
```sql
PURCHASE, RENTAL, RENEWAL
```

### **NotificationType (Tipo de Notificação)**
```sql
REQUEST_CREATED, REQUEST_APPROVED, REQUEST_REJECTED, 
STATUS_CHANGED, BUDGET_ALERT
```

### **PlanStatus (Status do Plano)**
```sql
DRAFT, ACTIVE, COMPLETED, CANCELLED
```

### **ParameterType (Tipo de Parâmetro)**
```sql
STRING, NUMBER, BOOLEAN, COLOR, IMAGE, JSON
```

---

## 🔗 **DIAGRAMA DE RELACIONAMENTOS**

```
USERS (1) ←→ (N) REQUESTS
USERS (1) ←→ (N) ACCOUNTS
USERS (1) ←→ (N) SESSIONS
USERS (1) ←→ (N) REQUEST_HISTORY
USERS (1) ←→ (N) NOTIFICATIONS
USERS (1) ←→ (N) ANNUAL_PLANS
USERS (N) ←→ (1) DEPARTMENTS

DEPARTMENTS (1) ←→ (N) DEPARTMENTS (hierarquia)
DEPARTMENTS (1) ←→ (N) USERS
DEPARTMENTS (1) ←→ (N) REQUESTS
DEPARTMENTS (1) ←→ (N) ANNUAL_PLANS

REQUESTS (1) ←→ (N) REQUEST_ITEMS
REQUESTS (1) ←→ (N) REQUEST_HISTORY
REQUESTS (1) ←→ (N) NOTIFICATIONS
REQUESTS (N) ←→ (1) USERS
REQUESTS (N) ←→ (1) DEPARTMENTS

REQUEST_ITEMS (N) ←→ (1) REQUESTS
REQUEST_ITEMS (N) ←→ (1) CONTRACT_TYPES
REQUEST_ITEMS (N) ←→ (1) ACQUISITION_TYPES

ITEM_CATEGORIES (1) ←→ (N) ITEMS
ITEM_TYPES (1) ←→ (N) ITEMS
```

---

## 📈 **ESTATÍSTICAS DO BANCO**

- **Total de Tabelas:** 16
- **Tabelas Principais:** 7
- **Tabelas Master/Configuração:** 6
- **Tabelas de Autenticação:** 3
- **Total de Enums:** 8
- **Relacionamentos 1:N:** 25+
- **Auto-relacionamentos:** 1 (departments)
- **Chaves Estrangeiras:** 20+
- **Índices Únicos:** 15+

---

**Observações:**
- Todas as chaves primárias são do tipo CUID (Collision Resistant Unique ID)
- Campos monetários usam DECIMAL(15,2) para precisão
- Campos de data/hora incluem created_at e updated_at para auditoria
- Soft delete implementado com campo is_active
- Relacionamentos com CASCADE DELETE onde apropriado
- Suporte a hierarquia de departamentos
- Histórico completo de mudanças nas solicitações
- Sistema de notificações integrado
