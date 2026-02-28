import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { Plus, ChevronLeft, ChevronRight, Trash2, Edit2, Calendar as CalendarIcon, Clock, MapPin } from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay, addMonths, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const appointmentSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  description: z.string().optional(),
  type: z.enum(["meeting", "call", "email", "task", "other"]),
  startTime: z.date(),
  endTime: z.date().optional(),
  location: z.string().optional(),
  clientId: z.number().optional(),
});

type AppointmentFormData = z.infer<typeof appointmentSchema>;

export default function Calendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar");

  const { data: appointments = [], refetch } = trpc.appointments.list.useQuery();
  const { data: clients = [] } = trpc.clients.list.useQuery();
  const createMutation = trpc.appointments.create.useMutation();
  const updateMutation = trpc.appointments.update.useMutation();
  const deleteMutation = trpc.appointments.delete.useMutation();

  const form = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      title: "",
      description: "",
      type: "meeting",
      startTime: selectedDate || new Date(),
      endTime: undefined,
      location: "",
      clientId: undefined,
    },
  });

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const firstDayOfWeek = monthStart.getDay();
  const lastDayOfWeek = monthEnd.getDay();
  const previousMonthDays = Array.from({ length: firstDayOfWeek }, (_, i) => {
    const date = new Date(monthStart);
    date.setDate(date.getDate() - (firstDayOfWeek - i));
    return date;
  });
  const nextMonthDays = Array.from({ length: 6 - lastDayOfWeek }, (_, i) => {
    const date = new Date(monthEnd);
    date.setDate(date.getDate() + i + 1);
    return date;
  });

  const allDays = [...previousMonthDays, ...daysInMonth, ...nextMonthDays];

  const getAppointmentsForDate = (date: Date) => {
    return appointments.filter(a => isSameDay(new Date(a.startTime), date));
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "meeting":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100";
      case "call":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100";
      case "email":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100";
      case "task":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100";
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      meeting: "Reunião",
      call: "Ligação",
      email: "Email",
      task: "Tarefa",
      other: "Outro",
    };
    return labels[type] || type;
  };

  const onSubmit = async (data: AppointmentFormData) => {
    try {
      if (editingId) {
        await updateMutation.mutateAsync({ id: editingId, ...data });
        toast.success("Compromisso atualizado!");
      } else {
        await createMutation.mutateAsync(data);
        toast.success("Compromisso criado!");
      }
      form.reset();
      setIsOpen(false);
      setEditingId(null);
      setSelectedDate(null);
      refetch();
    } catch (error: any) {
      console.error("Erro detalhado ao salvar compromisso:", error);
      toast.error(`Erro ao salvar compromisso: ${error.message || "Erro desconhecido"}`);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Tem certeza que deseja deletar este compromisso?")) {
      try {
        await deleteMutation.mutateAsync({ id });
        toast.success("Compromisso deletado!");
        refetch();
      } catch (error) {
        toast.error("Erro ao deletar compromisso");
      }
    }
  };

  const handleEdit = (appointment: typeof appointments[0]) => {
    form.reset({
      title: appointment.title,
      description: appointment.description || "",
      type: appointment.type as any,
      startTime: new Date(appointment.startTime),
      endTime: appointment.endTime ? new Date(appointment.endTime) : undefined,
      location: appointment.location || "",
      clientId: appointment.clientId || undefined,
    });
    setEditingId(appointment.id);
    setIsOpen(true);
  };

  const upcomingAppointments = appointments
    .filter(a => new Date(a.startTime) >= new Date())
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
    .slice(0, 5);

  const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Agenda</h1>
            <p className="text-muted-foreground">Gerencie seus compromissos e reuniões</p>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { setEditingId(null); form.reset(); }}>
                <Plus className="mr-2 h-4 w-4" />
                Novo Compromisso
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>{editingId ? "Editar Compromisso" : "Novo Compromisso"}</DialogTitle>
                <DialogDescription>
                  {editingId ? "Atualize as informações do compromisso" : "Crie um novo compromisso ou reunião"}
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Título</FormLabel>
                        <FormControl>
                          <Input placeholder="Título do compromisso" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo</FormLabel>
                        <FormControl>
                          <select 
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            {...field}
                          >
                            <option value="meeting">Reunião</option>
                            <option value="call">Ligação</option>
                            <option value="email">Email</option>
                            <option value="task">Tarefa</option>
                            <option value="other">Outro</option>
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="startTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Data/Hora Início</FormLabel>
                        <FormControl>
                          <Input type="datetime-local" {...field} value={field.value instanceof Date && !isNaN(field.value.getTime()) ? format(field.value, "yyyy-MM-dd'T'HH:mm") : ""} onChange={(e) => { const d = new Date(e.target.value); if(!isNaN(d.getTime())) field.onChange(d); }} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Local</FormLabel>
                        <FormControl>
                          <Input placeholder="Local da reunião" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="clientId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cliente (Opcional)</FormLabel>
                        <FormControl>
                          <select 
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            value={field.value?.toString() || "none"}
                            onChange={(e) => field.onChange(e.target.value === "none" ? undefined : parseInt(e.target.value))}
                          >
                            <option value="none">Sem cliente</option>
                            {clients.map(client => (
                              <option key={client.id} value={client.id.toString()}>
                                {client.name}
                              </option>
                            ))}
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descrição</FormLabel>
                        <FormControl>
                          <textarea placeholder="Descrição do compromisso" className="w-full px-3 py-2 border border-input rounded-md" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex gap-2 justify-end">
                    <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                      {editingId ? "Atualizar" : "Criar"} Compromisso
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Tabs */}
        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)} className="w-full">
          <TabsList>
            <TabsTrigger value="calendar">Calendário</TabsTrigger>
            <TabsTrigger value="list">Lista</TabsTrigger>
          </TabsList>

          {/* Vista Calendário */}
          <TabsContent value="calendar" className="space-y-6">
            <Card className="shadow-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{format(currentMonth, "MMMM yyyy", { locale: ptBR })}</CardTitle>
                    <CardDescription>Clique em um dia para criar um compromisso</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setCurrentMonth(new Date())}>
                      Hoje
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Cabeçalho dos dias da semana */}
                <div className="grid grid-cols-7 gap-2 mb-2">
                  {weekDays.map(day => (
                    <div key={day} className="text-center font-semibold text-sm text-muted-foreground py-2">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Grid de dias */}
                <div className="grid grid-cols-7 gap-2">
                  {allDays.map((day, idx) => {
                    const dayAppointments = getAppointmentsForDate(day);
                    const isCurrentMonth = isSameMonth(day, currentMonth);
                    const isDayToday = isToday(day);

                    return (
                      <div
                        key={idx}
                        onClick={() => {
                          setSelectedDate(day);
                          setEditingId(null);
                          form.reset({ ...form.getValues(), startTime: day });
                          setIsOpen(true);
                        }}
                        className={`min-h-[100px] p-2 rounded-lg border-2 cursor-pointer transition-all ${
                          isDayToday
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                            : isCurrentMonth
                            ? "border-border bg-white dark:bg-slate-800 hover:border-blue-300"
                            : "border-border bg-muted/30 opacity-50"
                        }`}
                      >
                        <p className={`text-sm font-semibold mb-1 ${isDayToday ? "text-blue-600 dark:text-blue-400" : ""}`}>
                          {format(day, "d")}
                        </p>
                        <div className="space-y-1">
                          {dayAppointments.slice(0, 2).map((apt) => (
                            <div
                              key={apt.id}
                              className={`text-xs p-1 rounded truncate cursor-pointer hover:opacity-80 ${getTypeColor(apt.type)}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEdit(apt);
                              }}
                            >
                              {apt.title}
                            </div>
                          ))}
                          {dayAppointments.length > 2 && (
                            <p className="text-xs text-muted-foreground">+{dayAppointments.length - 2} mais</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Próximos Compromissos */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Próximos Compromissos</CardTitle>
                <CardDescription>Seus próximos 5 compromissos agendados</CardDescription>
              </CardHeader>
              <CardContent>
                {upcomingAppointments.length === 0 ? (
                  <div className="text-center py-8">
                    <CalendarIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Nenhum compromisso agendado</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {upcomingAppointments.map((apt) => (
                      <div key={apt.id} className="flex items-start justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${getTypeColor(apt.type)}`}>
                              {getTypeLabel(apt.type)}
                            </span>
                            <p className="font-semibold">{apt.title}</p>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {format(new Date(apt.startTime), "dd/MM/yyyy HH:mm")}
                            </div>
                            {apt.location && (
                              <div className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {apt.location}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(apt)}>
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(apt.id)}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Vista Lista */}
          <TabsContent value="list" className="space-y-6">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Todos os Compromissos</CardTitle>
                <CardDescription>Lista completa de seus compromissos</CardDescription>
              </CardHeader>
              <CardContent>
                {appointments.length === 0 ? (
                  <div className="text-center py-8">
                    <CalendarIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Nenhum compromisso criado</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {appointments
                      .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
                      .map((apt) => (
                        <div key={apt.id} className="flex items-start justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className={`px-2 py-1 rounded text-xs font-medium ${getTypeColor(apt.type)}`}>
                                {getTypeLabel(apt.type)}
                              </span>
                              <p className="font-semibold">{apt.title}</p>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {format(new Date(apt.startTime), "dd/MM/yyyy HH:mm")}
                              </div>
                              {apt.location && (
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {apt.location}
                                </div>
                              )}
                            </div>
                            {apt.description && <p className="text-sm text-muted-foreground mt-2">{apt.description}</p>}
                          </div>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm" onClick={() => handleEdit(apt)}>
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDelete(apt.id)}>
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
