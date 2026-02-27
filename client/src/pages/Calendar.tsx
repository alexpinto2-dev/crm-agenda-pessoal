import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { Plus, ChevronLeft, ChevronRight, Trash2, Edit2, Calendar as CalendarIcon } from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay, addMonths, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";

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

  // Preencher com dias do mês anterior e próximo
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
    } catch (error) {
      toast.error("Erro ao salvar compromisso");
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

  const handleNewAppointment = (date: Date) => {
    setSelectedDate(date);
    form.reset({
      title: "",
      description: "",
      type: "meeting",
      startTime: date,
      endTime: undefined,
      location: "",
      clientId: undefined,
    });
    setEditingId(null);
    setIsOpen(true);
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
        return "bg-gray-100 text-gray-800";
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Agenda</h1>
            <p className="text-muted-foreground">Gerencie seus compromissos</p>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleNewAppointment(new Date())}>
                <Plus className="mr-2 h-4 w-4" />
                Novo Compromisso
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>{editingId ? "Editar Compromisso" : "Novo Compromisso"}</DialogTitle>
                <DialogDescription>
                  {editingId ? "Atualize os detalhes do compromisso" : "Crie um novo compromisso"}
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
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="meeting">Reunião</SelectItem>
                            <SelectItem value="call">Ligação</SelectItem>
                            <SelectItem value="email">Email</SelectItem>
                            <SelectItem value="task">Tarefa</SelectItem>
                            <SelectItem value="other">Outro</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="startTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Data e Hora</FormLabel>
                        <FormControl>
                          <Input type="datetime-local" {...field} value={field.value?.toISOString().slice(0, 16)} onChange={(e) => field.onChange(new Date(e.target.value))} />
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
                          <Input placeholder="Local do compromisso" {...field} />
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
                        <Select onValueChange={(v) => field.onChange(v ? parseInt(v) : undefined)} defaultValue={field.value?.toString()}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione um cliente" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {clients.map(client => (
                              <SelectItem key={client.id} value={client.id.toString()}>
                                {client.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
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
                          <textarea placeholder="Detalhes do compromisso" className="w-full px-3 py-2 border border-input rounded-md" {...field} />
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendário */}
          <Card className="lg:col-span-2 shadow-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{format(currentMonth, "MMMM yyyy", { locale: ptBR })}</CardTitle>
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
              <div className="grid grid-cols-7 gap-2">
                {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"].map(day => (
                  <div key={day} className="text-center font-semibold text-sm text-muted-foreground py-2">
                    {day}
                  </div>
                ))}
                {allDays.map((day, idx) => {
                  const dayAppointments = getAppointmentsForDate(day);
                  const isCurrentMonth = isSameMonth(day, currentMonth);
                  const isTodayDate = isToday(day);

                  return (
                    <div
                      key={idx}
                      onClick={() => handleNewAppointment(day)}
                      className={`min-h-24 p-2 border rounded-lg cursor-pointer transition-colors ${
                        isCurrentMonth ? "bg-card hover:bg-muted" : "bg-muted/50 text-muted-foreground"
                      } ${isTodayDate ? "border-blue-500 bg-blue-50 dark:bg-blue-950" : "border-border"}`}
                    >
                      <p className={`text-sm font-semibold ${isTodayDate ? "text-blue-600" : ""}`}>
                        {format(day, "d")}
                      </p>
                      <div className="mt-1 space-y-1">
                        {dayAppointments.slice(0, 2).map(apt => (
                          <div
                            key={apt.id}
                            onClick={(e) => e.stopPropagation()}
                            className={`text-xs p-1 rounded truncate cursor-pointer hover:opacity-80 ${getTypeColor(apt.type)}`}
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
              <CardTitle className="text-lg">Próximos</CardTitle>
              <CardDescription>Compromissos agendados</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {appointments
                  .filter(a => new Date(a.startTime) >= new Date())
                  .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
                  .slice(0, 5)
                  .map(apt => (
                    <div key={apt.id} className="p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{apt.title}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {format(new Date(apt.startTime), "dd/MM HH:mm", { locale: ptBR })}
                          </p>
                        </div>
                        <span className={`badge-status text-xs ${getTypeColor(apt.type)}`}>
                          {getTypeLabel(apt.type)}
                        </span>
                      </div>
                      <div className="flex gap-1 mt-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0"
                          onClick={() => handleDelete(apt.id)}
                        >
                          <Trash2 className="h-3 w-3 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  ))}
                {appointments.filter(a => new Date(a.startTime) >= new Date()).length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">Nenhum compromisso agendado</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
