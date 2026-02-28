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
