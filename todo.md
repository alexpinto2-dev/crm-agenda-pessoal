# CRM+ Agenda Pessoal - TODO

## Design System & Arquitetura
- [x] Definir paleta de cores elegante (tons neutros + acentos sofisticados)
- [x] Configurar tipografia profissional (Google Fonts)
- [x] Criar componentes base reutilizáveis
- [x] Implementar layout com DashboardLayout

## Banco de Dados
- [x] Criar tabela de clientes (nome, email, telefone, empresa, status, notas)
- [x] Criar tabela de leads (status, origem, potencial)
- [x] Criar tabela de pipeline (estágios de vendas)
- [x] Criar tabela de compromissos/agenda (data, hora, tipo, cliente associado)
- [x] Criar tabela de interações (reuniões, ligações, emails, notas)
- [x] Criar tabela de notificações (lembretes de compromissos)
- [x] Executar migrações SQL

## Backend APIs
- [x] API CRUD de clientes
- [x] API CRUD de leads
- [x] API CRUD de compromissos
- [x] API CRUD de interações
- [x] API de pipeline (mover clientes entre estágios)
- [ ] API de busca e filtros avançados
- [x] API de notificações
- [x] Testes unitários para APIs

## Dashboard Principal
- [x] Resumo de clientes ativos (total, por status)
- [x] Compromissos do dia/semana
- [x] Métricas de pipeline (clientes por estágio)
- [ ] Atividades recentes
- [x] Gráficos de performance
- [x] Cards com KPIs importantes

## Módulo de Clientes/Leads
- [x] Listagem com paginação
- [x] Filtros por status, empresa, data de criação
- [x] Busca avançada
- [x] Visualização de detalhes do cliente
- [x] Edição de informações
- [x] Pipeline visual (kanban ou tabela)
- [x] Mover clientes entre estágios
- [x] Adicionar notas rápidas

## Agenda Integrada
- [x] Calendário mensal interativo
- [x] Visualização de lista de compromissos
- [x] Criar novo compromisso
- [x] Editar compromisso
- [x] Deletar compromisso
- [x] Filtrar por tipo (reunião, ligação, email)
- [x] Visualizar compromissos por cliente
- [x] Sistema de notificações (15min, 1h, 1 dia antes)

## Histórico de Interações
- [ ] Timeline de interações por cliente
- [ ] Registrar reuniões
- [ ] Registrar ligações
- [ ] Registrar emails
- [ ] Adicionar notas
- [ ] Anexar arquivos
- [ ] Visualizar histórico completo

## Assistente Pessoal com IA
- [x] Interface de chat inteligente
- [x] Criar compromissos via linguagem natural
- [x] Buscar clientes por descrição
- [x] Sugerir próximos passos
- [x] Organizar informações automaticamente
- [x] Integração com LLM (invokeLLM)
- [x] Histórico de conversas
- [x] Respostas contextualizadas com dados do CRM

## Notificações
- [ ] Lembretes de compromissos próximos
- [ ] Notificações de follow-up necessário
- [ ] Alertas de clientes inativos
- [ ] Sistema de notificações em tempo real

## Testes & Qualidade
- [x] Testes unitários (vitest) para APIs críticas
- [ ] Testes de integração para fluxos principais
- [ ] Validação de responsividade
- [ ] Testes de performance

## Entrega
- [ ] Documentação de uso
- [ ] Checkpoint final
- [ ] Deploy/Publicação

## Autenticação
- [x] Integrar login com Google
- [x] Corrigir fluxo de autenticação
- [x] Testar login e redirect


## Bugs Encontrados
- [x] Erro 404 ao acessar página
- [x] Login não está funcionando
- [x] Roteamento quebrado

## Bugs Corrigidos - Fase 2
- [x] Agenda com erro ao acessar (SelectItem com value vazio)
- [x] Assistente IA não estava funcionando (imports faltando)


## Integração com LLM
- [x] Implementar invokeLLM no Assistente
- [x] Processar comandos em linguagem natural
- [x] Agendar compromissos automaticamente via IA
- [x] Buscar clientes por descrição
- [x] Criar interações via linguagem natural

## Sistema de Webhooks
- [x] Criar tabela de webhooks no banco
- [x] Implementar CRUD de webhooks
- [x] Criar interface de configuração
- [x] Integração com WhatsApp
- [x] Integração com Telegram
- [x] Integração com outros serviços


## Integração Telegram
- [x] Configurar bot do Telegram
- [x] Implementar webhook para receber mensagens
- [x] Processar comandos de agendamento via Telegram
- [x] Enviar notificações de reuniões
- [x] Testar integração completa


## Integração Google Calendar
- [x] Configurar Google Calendar API
- [x] Implementar autenticação OAuth com Google
- [x] Criar serviço de sincronização
- [x] Sincronizar compromissos automaticamente
- [x] Criar interface de configuração
- [x] Testar sincronização completa


## Vinculação de Histórico com Agenda
- [ ] Atualizar schema para vincular appointments com interactions
- [ ] Criar automáticamente interaction ao agendar compromisso
- [ ] Exibir interações da agenda no histórico do cliente
- [ ] Testar vinculação completa


## Melhorias de UI
- [x] Adicionar data e horário aos próximos compromissos no Dashboard
- [x] Transformar tela de Início em apresentação elegante
- [x] Testar interface melhorada


## Bugs a Corrigir - Fase 3
- [x] Tela de Início não está diferente do Dashboard


## Alteração de Status do Pipeline
- [x] Atualizar enum de status no schema
- [x] Atualizar frontend para novos status
- [x] Testar alterações


## Drag-and-Drop para Kanban
- [x] Instalar dependência @dnd-kit (compatível com React 19)
- [x] Implementar componente Kanban com drag-and-drop
- [x] Criar API tRPC para atualizar status via drag-and-drop
- [x] Adicionar testes unitários para drag-and-drop
- [x] Testar funcionalidade completa


## Vinculação de Histórico com Agenda
- [x] Schema já possui appointmentId em interactions
- [x] Criar API tRPC para criar interaction ao agendar appointment
- [x] Componente de agenda já suporta seleção de cliente
- [x] Vinculação automática de interações
- [x] Adicionar 6 testes unitários para vinculação
- [x] Testar vinculação completa (39 testes passando)


## Correção e Integração Telegram
- [x] Debugar e corrigir Kanban drag-and-drop (import duplicado resolvido)
- [x] Limpar cadastros de teste do banco de dados
- [x] Configurar token do Telegram bot (validado com sucesso)
- [x] Implementar handlers do Telegram para agendamentos automáticos
- [x] Adicionar testes para integração Telegram (3 testes)
- [x] Testar funcionalidades completas (42 testes passando)
