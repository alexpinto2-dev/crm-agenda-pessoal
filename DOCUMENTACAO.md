# CRM+ Agenda Pessoal - Documentação

## Visão Geral

O **CRM+ Agenda Pessoal** é um sistema completo de gerenciamento de relacionamento com clientes integrado com agenda pessoal. Ele foi desenvolvido para ajudá-lo a organizar seus clientes, leads, compromissos e interações de forma elegante e profissional.

## Funcionalidades Principais

### 1. Dashboard Principal

O dashboard oferece uma visão geral completa do seu CRM com:

- **Métricas de Clientes**: Total de clientes, clientes ativos e taxa de conversão
- **Compromissos**: Resumo de compromissos do dia e próximos 7 dias
- **Gráficos de Performance**: Distribuição de clientes por status e compromissos por tipo
- **Próximos Compromissos**: Lista dos 5 próximos compromissos agendados

### 2. Gerenciamento de Clientes

Acesse a seção **Clientes** para:

- **Criar Novo Cliente**: Clique em "Novo Cliente" e preencha as informações (nome, email, telefone, empresa, status, notas)
- **Filtrar Clientes**: Use o campo de busca para encontrar por nome ou email, e filtre por status (Lead, Prospect, Cliente, Inativo)
- **Editar Cliente**: Clique no ícone de edição para atualizar informações
- **Deletar Cliente**: Clique no ícone de lixeira para remover um cliente
- **Ver Detalhes**: Clique no cliente para visualizar histórico de interações

### 3. Agenda Integrada

Na seção **Agenda**, você pode:

- **Visualizar Calendário**: Navegue pelos meses com os botões de navegação
- **Criar Compromisso**: Clique em qualquer data ou use "Novo Compromisso" para agendar
- **Tipos de Compromisso**: Reunião, Ligação, Email, Tarefa ou Outro
- **Associar Cliente**: Vincule um compromisso a um cliente específico
- **Visualizar Próximos**: Veja a lista dos próximos compromissos agendados

### 4. Histórico de Interações

Para cada cliente, você pode registrar:

- **Reuniões**: Registre detalhes de reuniões realizadas
- **Ligações**: Documente chamadas telefônicas
- **Emails**: Registre comunicações por email
- **Notas**: Adicione observações gerais sobre o cliente
- **Timeline**: Visualize todas as interações em ordem cronológica

### 5. Assistente Pessoal

O **Assistente Pessoal** é um chat inteligente que pode:

- Listar seus clientes e compromissos
- Responder perguntas sobre o sistema
- Fornecer ações rápidas para tarefas comuns
- Ajudá-lo a navegar pelo CRM

## Guia de Uso Passo a Passo

### Criar um Novo Cliente

1. Vá para a seção **Clientes**
2. Clique em **"Novo Cliente"**
3. Preencha os campos:
   - Nome (obrigatório)
   - Email
   - Telefone
   - Empresa
   - Status (Lead, Prospect, Cliente ou Inativo)
   - Notas
4. Clique em **"Criar Cliente"**

### Agendar um Compromisso

1. Vá para a seção **Agenda**
2. Clique em uma data no calendário ou em **"Novo Compromisso"**
3. Preencha os detalhes:
   - Título (obrigatório)
   - Tipo (Reunião, Ligação, Email, Tarefa, Outro)
   - Data e Hora
   - Local
   - Cliente (opcional)
   - Descrição
4. Clique em **"Criar Compromisso"**

### Registrar uma Interação

1. Vá para **Clientes**
2. Clique em um cliente para ver seus detalhes
3. Na seção **"Histórico de Interações"**, clique em **"Adicionar"**
4. Selecione o tipo de interação (Reunião, Ligação, Email, Nota, Outro)
5. Preencha o título e conteúdo
6. Clique em **"Registrar"**

### Usar o Assistente Pessoal

1. Vá para a seção **Assistente Pessoal**
2. Digite sua solicitação no campo de chat
3. Exemplos de comandos:
   - "Mostre meus clientes"
   - "Quais são meus compromissos?"
   - "Como usar o assistente?"
4. Clique em **"Enviar"** ou pressione Enter

## Design e Interface

### Paleta de Cores

O CRM utiliza uma paleta elegante e profissional:

- **Primária**: Azul (#3B82F6) - Para ações principais e destaques
- **Secundária**: Cinza - Para elementos neutros
- **Sucesso**: Verde - Para status "Cliente" e ações bem-sucedidas
- **Aviso**: Âmbar - Para tarefas e alertas
- **Fundo**: Branco/Cinza claro - Para uma interface limpa

### Tipografia

- **Títulos**: Playfair Display (serif) - Para elegância e sofisticação
- **Corpo**: Inter (sans-serif) - Para legibilidade e clareza

## Dicas de Uso

1. **Mantenha Dados Atualizados**: Atualize regularmente o status dos clientes e registre interações
2. **Use Notas**: Adicione notas detalhadas para lembrar de contextos importantes
3. **Organize Compromissos**: Agende compromissos assim que fizer acordos com clientes
4. **Registre Interações**: Documente todas as interações para manter um histórico completo
5. **Revise Métricas**: Consulte o dashboard regularmente para acompanhar seu progresso

## Estrutura de Dados

### Clientes

- **Nome**: Identificação do cliente
- **Email**: Endereço de email para contato
- **Telefone**: Número de telefone
- **Empresa**: Nome da empresa do cliente
- **Status**: Lead, Prospect, Cliente ou Inativo
- **Notas**: Observações gerais sobre o cliente

### Compromissos

- **Título**: Descrição do compromisso
- **Tipo**: Reunião, Ligação, Email, Tarefa ou Outro
- **Data/Hora**: Quando o compromisso está agendado
- **Local**: Onde o compromisso ocorrerá
- **Cliente**: Cliente associado (opcional)
- **Descrição**: Detalhes adicionais

### Interações

- **Tipo**: Reunião, Ligação, Email, Nota ou Outro
- **Título**: Resumo da interação
- **Conteúdo**: Detalhes completos
- **Data**: Quando a interação ocorreu
- **Cliente**: Cliente envolvido

## Suporte e Ajuda

Para obter ajuda:

1. Use o **Assistente Pessoal** para perguntas rápidas
2. Consulte esta documentação para guias detalhados
3. Explore as diferentes seções do CRM para familiarizar-se com a interface

## Próximas Melhorias

O CRM está em desenvolvimento contínuo. Futuras melhorias incluem:

- Integração com LLM para assistente mais inteligente
- Notificações automáticas de compromissos
- Relatórios avançados e análises
- Exportação de dados
- Integração com email e calendário

---

**Versão**: 1.0.0  
**Última Atualização**: Fevereiro 2026  
**Desenvolvido com**: React, TypeScript, Express, tRPC, Tailwind CSS
