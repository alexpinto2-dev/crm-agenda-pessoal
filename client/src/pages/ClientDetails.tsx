import { useParams, useLocation } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Plus, Mail, Phone, Building2, MessageSquare, Calendar } from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useState } from "react";

const interactionSchema = z.object({
  type: z.enum(["meeting", "call", "email", "note", "other"]),
  title: z.string().min(1, "Título é obrigatório"),
  content: z.string().min(1, "Conteúdo é obrigatório"),
});

type InteractionFormData = z.infer<typeof interactionSchema>;

export default function ClientDetails() {
  const [, navigate] = useLocation();
  const params = useParams();
  const clientId = params?.id ? parseInt(params.id) : null;
  const [isOpen, setIsOpen] = useState(false);

  if (!clientId) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Cliente não encontrado</p>
        </div>
      </DashboardLayout>
    );
  }

  const { data: client } = trpc.clients.getById.useQuery({ id: clientId });
  const { data: interactions = [], refetch: refetchInteractions } = trpc.interactions.listByClient.useQuery({ clientId });
  const createInteractionMutation = trpc.interactions.create.useMutation();

  const form = useForm<InteractionFormData>({
    resolver: zodResolver(interactionSchema),
    defaultValues: {
      type: "note",
      title: "",
      content: "",
    },
  });

  const onSubmit = async (data: InteractionFormData) => {
    try {
      await createInteractionMutation.mutateAsync({
        clientId,
        ...data,
      });
      toast.success("Interação registrada!");
      form.reset();
      setIsOpen(false);
      refetchInteractions();
    } catch (error) {
      toast.error("Erro ao registrar interação");
    }
  };

  const getInteractionIcon = (type: string) => {
    switch (type) {
      case "meeting":
        return <Calendar className="h-4 w-4" />;
      case "call":
        return <Phone className="h-4 w-4" />;
      case "email":
        return <Mail className="h-4 w-4" />;
      case "note":
        return <MessageSquare className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getInteractionColor = (type: string) => {
    switch (type) {
      case "meeting":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100";
      case "call":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100";
      case "email":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100";
      case "note":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getInteractionLabel = (type: string) => {
    const labels: Record<string, string> = {
      meeting: "Reunião",
      call: "Ligação",
      email: "Email",
      note: "Nota",
      other: "Outro",
    };
    return labels[type] || type;
  };

  if (!client) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => navigate("/clients")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{client.name}</h1>
            <p className="text-muted-foreground">{client.company}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Informações do Cliente */}
          <Card className="lg:col-span-1 shadow-card">
            <CardHeader>
              <CardTitle className="text-lg">Informações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="font-semibold capitalize">{client.status}</p>
              </div>
              {client.email && (
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <a href={`mailto:${client.email}`} className="text-blue-600 hover:underline flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {client.email}
                  </a>
                </div>
              )}
              {client.phone && (
                <div>
                  <p className="text-sm text-muted-foreground">Telefone</p>
                  <a href={`tel:${client.phone}`} className="text-blue-600 hover:underline flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    {client.phone}
                  </a>
                </div>
              )}
              {client.company && (
                <div>
                  <p className="text-sm text-muted-foreground">Empresa</p>
                  <p className="font-semibold flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    {client.company}
                  </p>
                </div>
              )}
              {client.notes && (
                <div>
                  <p className="text-sm text-muted-foreground">Notas</p>
                  <p className="text-sm">{client.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Histórico de Interações */}
          <Card className="lg:col-span-2 shadow-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">Histórico de Interações</CardTitle>
                <CardDescription>Todas as interações com este cliente</CardDescription>
              </div>
              <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Registrar Interação</DialogTitle>
                    <DialogDescription>
                      Registre uma nova interação com o cliente
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                                <SelectItem value="note">Nota</SelectItem>
                                <SelectItem value="other">Outro</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Título</FormLabel>
                            <FormControl>
                              <Input placeholder="Título da interação" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="content"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Conteúdo</FormLabel>
                            <FormControl>
                              <textarea placeholder="Detalhes da interação" className="w-full px-3 py-2 border border-input rounded-md" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="flex gap-2 justify-end">
                        <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                          Cancelar
                        </Button>
                        <Button type="submit" disabled={createInteractionMutation.isPending}>
                          Registrar
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {interactions.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">Nenhuma interação registrada</p>
                ) : (
                  interactions
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .map((interaction) => (
                      <div key={interaction.id} className="p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className={`badge-status ${getInteractionColor(interaction.type)} flex items-center gap-1`}>
                                {getInteractionIcon(interaction.type)}
                                {getInteractionLabel(interaction.type)}
                              </span>
                            </div>
                            <p className="font-semibold">{interaction.title}</p>
                            <p className="text-sm text-muted-foreground mt-1">{interaction.content}</p>
                            <p className="text-xs text-muted-foreground mt-2">
                              {formatDistanceToNow(new Date(interaction.createdAt), { addSuffix: true, locale: ptBR })}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
