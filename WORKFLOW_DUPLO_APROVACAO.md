
# 📋 Novo Workflow de Dupla Aprovação

## ✨ Resumo das Mudanças Implementadas

Foi implementado um novo sistema de workflow com **dois níveis de aprovação** para as solicitações:

### 🔄 Fluxo de Trabalho

1. **Usuário cria solicitação** → Status: `PENDING_MANAGER_APPROVAL`
2. **Gestor do departamento analisa** → Pode: Aprovar, Rejeitar ou Devolver para ajuste
3. **Se aprovado pelo gestor** → Status: `PENDING_APPROVAL` 
4. **Aprovador final analisa** → Pode: Aprovar, Rejeitar ou Devolver para o departamento
5. **Se aprovado pelo aprovador** → Status: `APPROVED`

### 🏗️ Mudanças no Banco de Dados

#### **Novos Campos na Tabela `requests`:**
- `managerStatus`: Status do workflow do gestor (PENDING, APPROVED, REJECTED, RETURNED)
- `approverStatus`: Status do workflow do aprovador (PENDING, APPROVED, REJECTED, RETURNED)
- `managerApprovedBy`: Nome do gestor que aprovou
- `managerApprovedAt`: Data de aprovação pelo gestor
- `managerRejectionReason`: Motivo de rejeição pelo gestor

#### **Novos Enums:**
- `ManagerStatus`: PENDING, APPROVED, REJECTED, RETURNED
- `ApproverStatus`: PENDING, APPROVED, REJECTED, RETURNED
- `RequestStatus`: Adicionado `PENDING_MANAGER_APPROVAL`

### 🔗 Novas APIs Implementadas

#### **Para Gestores:**
- `POST /api/requests/[id]/manager-approve`: Aprovar solicitação como gestor
- `POST /api/requests/[id]/manager-reject`: Rejeitar solicitação como gestor
- `POST /api/requests/[id]/manager-return`: Devolver para ajuste como gestor

#### **Para Aprovadores:**
- `POST /api/dashboard/approver/summary`: Resumo para aprovadores
- `POST /api/dashboard/approver/pending`: Solicitações aguardando aprovação final
- `POST /api/dashboard/approver/all`: Todas as solicitações (com filtros)

#### **APIs Atualizadas:**
- `/api/requests/[id]/approve`: Agora exclusiva para aprovadores finais
- `/api/requests/[id]/reject`: Agora exclusiva para aprovadores finais
- `/api/requests/[id]/return`: Agora exclusiva para aprovadores finais
- `/api/dashboard/manager/*`: Atualizadas para o novo workflow

### 👥 Permissões por Perfil

#### **MANAGER (Gestor)**
- **Dashboard**: Dados apenas do seu departamento
- **Pode ver**: Solicitações do seu departamento em todos os status
- **Pode aprovar**: Solicitações `PENDING_MANAGER_APPROVAL` do seu departamento
- **Pode rejeitar/devolver**: Solicitações do seu departamento antes da aprovação final

#### **APPROVER (Aprovador)**
- **Dashboard**: Dados de todos os departamentos
- **Pode ver**: Todas as solicitações de todos os departamentos
- **Pode aprovar**: Solicitações `PENDING_APPROVAL` (já aprovadas pelo gestor)
- **Pode rejeitar/devolver**: Solicitações aguardando aprovação final

#### **USER (Usuário)**
- **Dashboard**: Apenas suas próprias solicitações
- **Pode criar**: Novas solicitações (ficam `PENDING_MANAGER_APPROVAL`)
- **Pode editar**: Solicitações devolvidas para ajuste

### 📊 Dashboards Atualizados

#### **Dashboard do Gestor:**
- `pendingManagerApproval`: Solicitações aguardando aprovação do gestor
- `pendingFinalApproval`: Solicitações aguardando aprovação final
- **Escopo**: Apenas departamento do gestor

#### **Dashboard do Aprovador:**
- `pendingManagerApproval`: Total de solicitações aguardando gestores
- `pendingFinalApproval`: Solicitações prontas para aprovação final
- `departmentsWithPending`: Departamentos com solicitações pendentes
- **Escopo**: Todos os departamentos

### 🔄 Estados das Solicitações

| Status Geral | Status Gestor | Status Aprovador | Descrição |
|--------------|---------------|------------------|-----------|
| `PENDING_MANAGER_APPROVAL` | `PENDING` | `PENDING` | Aguardando aprovação do gestor |
| `PENDING_APPROVAL` | `APPROVED` | `PENDING` | Aprovada pelo gestor, aguardando aprovação final |
| `APPROVED` | `APPROVED` | `APPROVED` | Totalmente aprovada |
| `REJECTED` | `REJECTED` | `PENDING` | Rejeitada pelo gestor |
| `REJECTED` | `APPROVED` | `REJECTED` | Rejeitada pelo aprovador |
| `OPEN` | `PENDING` | `PENDING` | Devolvida para ajustes |

### 📝 Histórico e Notificações

- **Histórico detalhado**: Cada ação gera entrada no histórico com identificação clara do responsável
- **Notificações específicas**: Usuários recebem notificações diferenciadas para cada etapa
- **Rastreabilidade completa**: Possível saber quando e quem aprovou em cada nível

### 🚀 Benefícios Implementados

1. **Controle de acesso granular**: Cada perfil vê apenas o que é relevante
2. **Workflow sequencial**: Garante que a aprovação siga a hierarquia correta
3. **Visibilidade total**: Aprovadores veem o status de todos os departamentos
4. **Flexibilidade**: Possibilidade de devolução em qualquer nível
5. **Auditoria completa**: Rastreamento detalhado de todas as ações

## ✅ Status da Implementação

- ✅ Schema do banco atualizado
- ✅ APIs implementadas e testadas  
- ✅ Migrações aplicadas
- ✅ Seed data atualizado
- ✅ Validação de permissões implementada
- ✅ Build da aplicação bem-sucedido

**A aplicação está pronta para uso com o novo workflow de dupla aprovação!**
