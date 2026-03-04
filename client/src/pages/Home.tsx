import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { ArrowRight, BarChart3, Calendar, Users, MessageSquare, LogOut, Chrome, Zap, Globe, CheckCircle2, Sparkles } from "lucide-react";
import { useEffect } from "react";
import { getLoginUrl } from "@/const";

export default function Home() {
  const { user, isAuthenticated, logout, loading } = useAuth();
  const [, navigate] = useLocation();

  // Não redirecionar automaticamente - deixar usuário ver a tela de Início

  // Mostrar tela de carregamento
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center px-4">
        <div className="max-w-4xl w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Features */}
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                  <Sparkles className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-600 dark:text-blue-400">Gerenciamento Inteligente</span>
                </div>
                <h1 className="text-5xl lg:text-6xl font-bold tracking-tight">
                  CRM+ Agenda Pessoal
                </h1>
                <p className="text-xl text-muted-foreground max-w-lg">
                  Transforme seu relacionamento com clientes em oportunidades de crescimento
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Gerenciar Clientes & Leads</h3>
                    <p className="text-sm text-muted-foreground">Pipeline visual com Kanban, filtros avançados e histórico completo de interações</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Agenda Integrada</h3>
                    <p className="text-sm text-muted-foreground">Calendário interativo com sincronização automática ao Google Calendar</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Assistente IA</h3>
                    <p className="text-sm text-muted-foreground">Chat inteligente para agendar compromissos e organizar clientes por linguagem natural</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Integrações Poderosas</h3>
                    <p className="text-sm text-muted-foreground">Telegram, Webhooks, Google Calendar e muito mais</p>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <Button
                  size="lg"
                  onClick={() => window.location.href = getLoginUrl()}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg"
                >
                  <Chrome className="mr-2 h-5 w-5" />
                  Começar Agora com Google
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <p className="text-xs text-muted-foreground text-center mt-3">
                  Sem cartão de crédito. Acesso instantâneo.
                </p>
              </div>
            </div>

            {/* Right Side - Showcase */}
            <div className="hidden lg:block space-y-4">
              {/* Dashboard Preview Card */}
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-elegant p-6 space-y-4 border border-border/50">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                  <h3 className="font-semibold">Dashboard Inteligente</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <span className="text-sm">Total de Clientes</span>
                    <span className="font-bold text-lg">47</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <span className="text-sm">Compromissos Hoje</span>
                    <span className="font-bold text-lg">4</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <span className="text-sm">Taxa de Conversão</span>
                    <span className="font-bold text-lg">28%</span>
                  </div>
                </div>
              </div>

              {/* Features Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 dark:from-blue-500/20 dark:to-blue-600/20 rounded-lg p-4 border border-blue-200/50 dark:border-blue-800/50">
                  <Calendar className="h-5 w-5 text-blue-600 mb-2" />
                  <p className="text-sm font-medium">Agenda Sincronizada</p>
                  <p className="text-xs text-muted-foreground">Com Google Calendar</p>
                </div>

                <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 dark:from-purple-500/20 dark:to-purple-600/20 rounded-lg p-4 border border-purple-200/50 dark:border-purple-800/50">
                  <MessageSquare className="h-5 w-5 text-purple-600 mb-2" />
                  <p className="text-sm font-medium">Assistente IA</p>
                  <p className="text-xs text-muted-foreground">Linguagem Natural</p>
                </div>

                <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 dark:from-green-500/20 dark:to-green-600/20 rounded-lg p-4 border border-green-200/50 dark:border-green-800/50">
                  <Zap className="h-5 w-5 text-green-600 mb-2" />
                  <p className="text-sm font-medium">Webhooks</p>
                  <p className="text-xs text-muted-foreground">Telegram & Mais</p>
                </div>

                <div className="bg-gradient-to-br from-amber-500/10 to-amber-600/10 dark:from-amber-500/20 dark:to-amber-600/20 rounded-lg p-4 border border-amber-200/50 dark:border-amber-800/50">
                  <Globe className="h-5 w-5 text-amber-600 mb-2" />
                  <p className="text-sm font-medium">Integrações</p>
                  <p className="text-xs text-muted-foreground">APIs Completas</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 shadow-card border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">CRM+ Agenda Pessoal</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">Bem-vindo, {user?.name?.split(" ")[0]}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={logout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-12">
          {/* Welcome Section */}
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-bold tracking-tight">Bem-vindo ao seu CRM</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Escolha uma seção abaixo para começar a gerenciar seus clientes, compromissos e interações
            </p>
          </div>

          {/* Navigation Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Dashboard Card */}
            <div
              onClick={() => navigate("/dashboard")}
              className="bg-white dark:bg-slate-800 rounded-xl shadow-card hover:shadow-elegant transition-all cursor-pointer p-6 space-y-4 group"
            >
              <div className="bg-blue-100 dark:bg-blue-900 rounded-lg p-3 w-fit group-hover:scale-110 transition-transform">
                <BarChart3 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Dashboard</h3>
                <p className="text-sm text-muted-foreground">Visualize métricas e KPIs do seu CRM</p>
              </div>
              <div className="pt-2">
                <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-blue-600 transition-colors" />
              </div>
            </div>

            {/* Clients Card */}
            <div
              onClick={() => navigate("/clients")}
              className="bg-white dark:bg-slate-800 rounded-xl shadow-card hover:shadow-elegant transition-all cursor-pointer p-6 space-y-4 group"
            >
              <div className="bg-green-100 dark:bg-green-900 rounded-lg p-3 w-fit group-hover:scale-110 transition-transform">
                <Users className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Clientes</h3>
                <p className="text-sm text-muted-foreground">Gerenciar clientes e leads</p>
              </div>
              <div className="pt-2">
                <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-green-600 transition-colors" />
              </div>
            </div>

            {/* Calendar Card */}
            <div
              onClick={() => navigate("/calendar")}
              className="bg-white dark:bg-slate-800 rounded-xl shadow-card hover:shadow-elegant transition-all cursor-pointer p-6 space-y-4 group"
            >
              <div className="bg-purple-100 dark:bg-purple-900 rounded-lg p-3 w-fit group-hover:scale-110 transition-transform">
                <Calendar className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Agenda</h3>
                <p className="text-sm text-muted-foreground">Calendário e compromissos</p>
              </div>
              <div className="pt-2">
                <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-purple-600 transition-colors" />
              </div>
            </div>

            {/* Assistant Card */}
            <div
              onClick={() => navigate("/assistant")}
              className="bg-white dark:bg-slate-800 rounded-xl shadow-card hover:shadow-elegant transition-all cursor-pointer p-6 space-y-4 group"
            >
              <div className="bg-amber-100 dark:bg-amber-900 rounded-lg p-3 w-fit group-hover:scale-110 transition-transform">
                <MessageSquare className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Assistente</h3>
                <p className="text-sm text-muted-foreground">Chat inteligente para seu CRM</p>
              </div>
              <div className="pt-2">
                <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-amber-600 transition-colors" />
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-card p-8">
            <h3 className="text-lg font-semibold mb-6">Começar</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Passo 1</p>
                <p className="font-semibold">Adicione seus clientes</p>
                <p className="text-sm text-muted-foreground">Vá para Clientes e crie novos registros</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Passo 2</p>
                <p className="font-semibold">Agende compromissos</p>
                <p className="text-sm text-muted-foreground">Use a Agenda para organizar reuniões</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Passo 3</p>
                <p className="font-semibold">Acompanhe o progresso</p>
                <p className="text-sm text-muted-foreground">Monitore métricas no Dashboard</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
