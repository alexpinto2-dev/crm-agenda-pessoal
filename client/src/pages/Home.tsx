import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { ArrowRight, BarChart3, Calendar, Users, MessageSquare, LogOut, Chrome } from "lucide-react";
import { useEffect } from "react";

export default function Home() {
  const { user, isAuthenticated, logout } = useAuth();
  const [, navigate] = useLocation();

  // Redirecionar para dashboard se autenticado
  useEffect(() => {
    if (isAuthenticated && user) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, user, navigate]);

  if (!isAuthenticated) {
    const handleGoogleLogin = () => {
      // Usar o fluxo OAuth padrão da Manus
      window.location.href = "/api/oauth/login";
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center px-4">
        <div className="max-w-2xl w-full text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl font-bold tracking-tight">CRM+ Agenda Pessoal</h1>
            <p className="text-xl text-muted-foreground">
              Gerencie seus clientes, leads e compromissos de forma elegante e profissional
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-elegant p-8 space-y-6">
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">Bem-vindo ao CRM+ Agenda Pessoal</h2>
              <p className="text-muted-foreground">
                Faça login para acessar seu sistema de gerenciamento de relacionamento com clientes integrado com agenda pessoal.
              </p>
            </div>

            <div className="space-y-3">
              <Button
                size="lg"
                onClick={handleGoogleLogin}
                className="w-full bg-white dark:bg-slate-700 text-foreground border border-border hover:bg-gray-50 dark:hover:bg-slate-600"
              >
                <Chrome className="mr-2 h-5 w-5" />
                Entrar com Google
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>

              <p className="text-xs text-muted-foreground">
                Você será redirecionado para autenticação segura
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-8">
            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-card">
              <Users className="h-8 w-8 text-blue-600 mb-3" />
              <h3 className="font-semibold mb-2">Gerenciar Clientes</h3>
              <p className="text-sm text-muted-foreground">Organize seus clientes e leads com filtros avançados</p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-card">
              <Calendar className="h-8 w-8 text-green-600 mb-3" />
              <h3 className="font-semibold mb-2">Agenda Integrada</h3>
              <p className="text-sm text-muted-foreground">Calendário interativo para seus compromissos</p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-card">
              <BarChart3 className="h-8 w-8 text-purple-600 mb-3" />
              <h3 className="font-semibold mb-2">Dashboard Analytics</h3>
              <p className="text-sm text-muted-foreground">Visualize métricas e performance em tempo real</p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-card">
              <MessageSquare className="h-8 w-8 text-amber-600 mb-3" />
              <h3 className="font-semibold mb-2">Assistente IA</h3>
              <p className="text-sm text-muted-foreground">Chat inteligente para gerenciar seu CRM</p>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-sm text-blue-900 dark:text-blue-100">
              💡 <strong>Dica:</strong> Use sua conta Google para fazer login de forma rápida e segura
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 shadow-card border-b border-border">
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
