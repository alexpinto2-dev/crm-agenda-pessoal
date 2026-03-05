import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Calendar, Users, TrendingUp, Clock } from "lucide-react";
import { formatDistanceToNow, isToday, isBefore, addDays, format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function Dashboard() {
  const { user } = useAuth();
  const { data: clients = [] } = trpc.clients.list.useQuery();
  const { data: appointments = [] } = trpc.appointments.list.useQuery();

  // Calcular métricas
  const totalClients = clients.length;
  const activeClients = clients.filter(c => c.status !== "cliente_desistiu").length;
  const todayAppointments = appointments.filter(a => isToday(new Date(a.startTime)));
  const upcomingAppointments = appointments.filter(a => {
    const date = new Date(a.startTime);
    return !isBefore(date, new Date()) && !isToday(date) && isBefore(date, addDays(new Date(), 7));
  });

  // Dados para gráficos
  const clientsByStatus = [
    { name: "Em Qualificação", value: clients.filter(c => c.status === "em_qualificacao").length, color: "#3B82F6" },
    { name: "Em Negociação", value: clients.filter(c => c.status === "em_negociacao").length, color: "#8B5CF6" },
    { name: "Proposta Enviada", value: clients.filter(c => c.status === "proposta_enviada").length, color: "#F59E0B" },
    { name: "Cliente Fechado", value: clients.filter(c => c.status === "cliente_fechado").length, color: "#10B981" },
    { name: "Cliente Desistiu", value: clients.filter(c => c.status === "cliente_desistiu").length, color: "#EF4444" },
  ];

  const appointmentsByType = [
    { name: "Reuniões", value: appointments.filter(a => a.type === "meeting").length },
    { name: "Ligações", value: appointments.filter(a => a.type === "call").length },
    { name: "Emails", value: appointments.filter(a => a.type === "email").length },
    { name: "Tarefas", value: appointments.filter(a => a.type === "task").length },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-bold tracking-tight">Bem-vindo, {user?.name?.split(" ")[0]}</h1>
          <p className="text-muted-foreground">Aqui está um resumo do seu CRM</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="shadow-card hover:shadow-elegant transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Clientes</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalClients}</div>
              <p className="text-xs text-muted-foreground">{activeClients} ativos</p>
            </CardContent>
          </Card>

          <Card className="shadow-card hover:shadow-elegant transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Compromissos Hoje</CardTitle>
              <Calendar className="h-4 w-4 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{todayAppointments.length}</div>
              <p className="text-xs text-muted-foreground">Agendados para hoje</p>
            </CardContent>
          </Card>

          <Card className="shadow-card hover:shadow-elegant transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Próximos 7 Dias</CardTitle>
              <Clock className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{upcomingAppointments.length}</div>
              <p className="text-xs text-muted-foreground">Compromissos agendados</p>
            </CardContent>
          </Card>

          <Card className="shadow-card hover:shadow-elegant transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {totalClients > 0 ? Math.round((clients.filter(c => c.status === "cliente_fechado").length / totalClients) * 100) : 0}%
              </div>
              <p className="text-xs text-muted-foreground">De leads para clientes</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Clientes por Status */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Clientes por Status</CardTitle>
              <CardDescription>Distribuição dos seus clientes</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={clientsByStatus}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {clientsByStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Compromissos por Tipo */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Compromissos por Tipo</CardTitle>
              <CardDescription>Distribuição dos seus compromissos</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={appointmentsByType}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Próximos Compromissos */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Próximos Compromissos</CardTitle>
            <CardDescription>Seus compromissos dos próximos dias</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {appointments
                .filter(a => !isBefore(new Date(a.startTime), new Date()))
                .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
                .slice(0, 5)
                .map((appointment) => (
                  <div key={appointment.id} className="flex items-start justify-between p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{appointment.title}</p>
                      <div className="flex gap-3 mt-1">
                        <p className="text-xs text-muted-foreground">
                          📅 {format(new Date(appointment.startTime), "dd/MM/yyyy", { locale: ptBR })}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          🕐 {format(new Date(appointment.startTime), "HH:mm")}
                        </p>
                      </div>
                    </div>
                    <span className="badge-status bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
                      {appointment.type}
                    </span>
                  </div>
                ))}
              {appointments.filter(a => !isBefore(new Date(a.startTime), new Date())).length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">Nenhum compromisso agendado</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
