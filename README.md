# CRM+ Agenda Pessoal

Um sistema elegante e profissional de gerenciamento de relacionamento com clientes (CRM) integrado com agenda pessoal, desenvolvido para ajudá-lo a organizar seu processo de vendas e relacionamento com clientes.

## 🎯 Funcionalidades

### Dashboard Principal
- Resumo de clientes ativos por status
- Métricas de compromissos (hoje e próximos 7 dias)
- Taxa de conversão de leads para clientes
- Gráficos de performance (clientes por status, compromissos por tipo)
- Próximos compromissos agendados

### Gerenciamento de Clientes
- Criar, editar e deletar clientes
- Filtros avançados por status e busca por nome/email
- Visualizar detalhes completos do cliente
- Registrar e visualizar histórico de interações
- Adicionar notas e observações

### Agenda Integrada
- Calendário mensal interativo
- Criar compromissos (reuniões, ligações, emails, tarefas)
- Associar compromissos a clientes
- Visualizar próximos compromissos
- Filtrar por tipo de compromisso

### Histórico de Interações
- Timeline completa de interações por cliente
- Registrar reuniões, ligações, emails e notas
- Visualizar histórico cronológico
- Adicionar detalhes e contexto de cada interação

### Assistente Pessoal
- Chat inteligente para gerenciar o CRM
- Listar clientes e compromissos
- Ações rápidas para tarefas comuns
- Suporte e ajuda integrada

## 🎨 Design

O CRM foi desenvolvido com um design elegante e profissional:

- **Paleta de Cores**: Tons neutros com acentos sofisticados em azul
- **Tipografia**: Playfair Display para títulos (elegância), Inter para corpo (legibilidade)
- **Interface**: Limpa, intuitiva e responsiva
- **Componentes**: Baseados em shadcn/ui para consistência

## 🛠 Stack Tecnológico

### Frontend
- **React 19**: Framework UI moderno
- **TypeScript**: Tipagem estática
- **Tailwind CSS 4**: Styling utilitário
- **tRPC**: Type-safe API calls
- **Recharts**: Gráficos e visualizações
- **React Hook Form**: Gerenciamento de formulários
- **Sonner**: Notificações toast

### Backend
- **Express 4**: Framework web
- **tRPC 11**: RPC type-safe
- **Drizzle ORM**: Gerenciamento de banco de dados
- **MySQL/TiDB**: Banco de dados

### Testes
- **Vitest**: Framework de testes unitários
- **15+ testes** cobrindo APIs críticas

## 📦 Instalação

```bash
# Instalar dependências
pnpm install

# Executar em desenvolvimento
pnpm dev

# Build para produção
pnpm build

# Iniciar servidor de produção
pnpm start

# Executar testes
pnpm test
```

## 📁 Estrutura do Projeto

```
crm-agenda-pessoal/
├── client/                 # Frontend React
│   ├── src/
│   │   ├── pages/         # Páginas do aplicativo
│   │   ├── components/    # Componentes reutilizáveis
│   │   ├── lib/           # Utilitários e configurações
│   │   └── index.css      # Estilos globais
│   └── public/            # Arquivos estáticos
├── server/                 # Backend Express
│   ├── routers.ts         # APIs tRPC
│   ├── db.ts              # Query helpers
│   └── _core/             # Configurações internas
├── drizzle/               # Migrações e schema
├── shared/                # Código compartilhado
└── storage/               # Helpers de armazenamento S3
```

## 🚀 Recursos Principais

### Páginas Implementadas

1. **Home** (`/`) - Página inicial com exemplo
2. **Dashboard** (`/dashboard`) - Visão geral do CRM
3. **Clientes** (`/clients`) - Listagem e gerenciamento de clientes
4. **Detalhes do Cliente** (`/clients/:id`) - Informações e histórico
5. **Agenda** (`/calendar`) - Calendário e compromissos
6. **Assistente Pessoal** (`/assistant`) - Chat inteligente

### APIs Implementadas

- `clients.list` - Listar clientes do usuário
- `clients.create` - Criar novo cliente
- `clients.update` - Atualizar cliente
- `clients.delete` - Deletar cliente
- `clients.getById` - Obter detalhes do cliente
- `appointments.list` - Listar compromissos
- `appointments.create` - Criar compromisso
- `appointments.update` - Atualizar compromisso
- `appointments.delete` - Deletar compromisso
- `interactions.listByClient` - Listar interações de um cliente
- `interactions.create` - Registrar interação
- `pipelineStages.list` - Listar estágios do pipeline
- `notifications.list` - Listar notificações

## 📊 Banco de Dados

### Tabelas Principais

- **users**: Usuários do sistema (autenticação)
- **clients**: Clientes e leads
- **appointments**: Compromissos e agenda
- **interactions**: Histórico de interações
- **pipelineStages**: Estágios do pipeline de vendas
- **notifications**: Notificações do sistema

## 🧪 Testes

O projeto inclui testes unitários abrangentes:

```bash
# Executar testes
pnpm test

# Resultado esperado: 15 testes passando
```

Testes cobrem:
- CRUD de clientes
- CRUD de compromissos
- CRUD de interações
- Pipeline stages
- Notificações

## 📖 Documentação

Consulte o arquivo `DOCUMENTACAO.md` para:
- Guia completo de uso
- Instruções passo a passo
- Dicas de utilização
- Estrutura de dados

## 🔐 Autenticação

O sistema utiliza **Manus OAuth** para autenticação segura:
- Login automático via Manus
- Sessões persistentes
- Contexto de usuário em todas as APIs

## 🌐 Deployment

O projeto está pronto para deploy na plataforma Manus:

1. Crie um checkpoint com `webdev_save_checkpoint`
2. Clique no botão **Publish** na UI de gerenciamento
3. O sistema será automaticamente deployado

## 📝 Licença

MIT

## 👨‍💻 Desenvolvido por

Manus AI Assistant

---

**Versão**: 1.0.0  
**Última Atualização**: Fevereiro 2026  
**Status**: Pronto para Produção ✅
