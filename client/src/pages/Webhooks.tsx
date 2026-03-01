import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { Plus, Trash2, Edit2, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const webhookSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  url: z.string().url("URL inválida"),
  service: z.enum(["whatsapp", "telegram", "slack", "discord", "custom"]),
  isActive: z.number().default(1),
  events: z.string().optional(),
  headers: z.string().optional(),
});

type WebhookFormData = z.infer<typeof webhookSchema>;

export default function Webhooks() {
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const { data: webhooksList = [], refetch } = trpc.webhooks.list.useQuery();
  const createMutation = trpc.webhooks.create.useMutation();
  const updateMutation = trpc.webhooks.update.useMutation();
  const deleteMutation = trpc.webhooks.delete.useMutation();

  const form = useForm({
    resolver: zodResolver(webhookSchema),
    defaultValues: {
      name: "",
      url: "",
      service: "custom" as const,
      isActive: 1,
      events: "",
      headers: "",
    },
  });

  const onSubmit = async (data: WebhookFormData) => {
    try {
      if (editingId) {
        await updateMutation.mutateAsync({ id: editingId, ...data });
        toast.success("Webhook atualizado!");
      } else {
        await createMutation.mutateAsync(data);
        toast.success("Webhook criado!");
      }
      form.reset();
      setIsOpen(false);
      setEditingId(null);
      refetch();
    } catch (error) {
      toast.error("Erro ao salvar webhook");
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Tem certeza que deseja deletar este webhook?")) {
      try {
        await deleteMutation.mutateAsync({ id });
        toast.success("Webhook deletado!");
        refetch();
      } catch (error) {
        toast.error("Erro ao deletar webhook");
      }
    }
  };

  const handleEdit = (webhook: typeof webhooksList[0]) => {
    form.reset({
      name: webhook.name,
      url: webhook.url,
      service: webhook.service as any,
      isActive: webhook.isActive || 1,
      events: webhook.events || "",
      headers: webhook.headers || "",
    });
    setEditingId(webhook.id);
    setIsOpen(true);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getServiceColor = (service: string) => {
    switch (service) {
      case "whatsapp":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100";
      case "telegram":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100";
      case "slack":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100";
      case "discord":
        return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-100";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100";
    }
  };

  const getServiceLabel = (service: string) => {
    const labels: Record<string, string> = {
      whatsapp: "WhatsApp",
      telegram: "Telegram",
      slack: "Slack",
      discord: "Discord",
      custom: "Personalizado",
    };
    return labels[service] || service;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Webhooks</h1>
            <p className="text-muted-foreground">Integre com WhatsApp, Telegram, Slack e outros serviços</p>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { setEditingId(null); form.reset(); }}>
                <Plus className="mr-2 h-4 w-4" />
                Novo Webhook
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>{editingId ? "Editar Webhook" : "Novo Webhook"}</DialogTitle>
                <DialogDescription>
                  {editingId ? "Atualize as informações do webhook" : "Crie um novo webhook para integração"}
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Notificações WhatsApp" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="service"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Serviço</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="whatsapp">WhatsApp</SelectItem>
                            <SelectItem value="telegram">Telegram</SelectItem>
                            <SelectItem value="slack">Slack</SelectItem>
                            <SelectItem value="discord">Discord</SelectItem>
                            <SelectItem value="custom">Personalizado</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>URL do Webhook</FormLabel>
                        <FormControl>
                          <Input placeholder="https://..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="events"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Eventos (JSON)</FormLabel>
                        <FormControl>
                          <textarea 
                            placeholder='["appointment_created", "appointment_updated"]' 
                            className="w-full px-3 py-2 border border-input rounded-md text-sm"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="headers"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Headers Customizados (JSON)</FormLabel>
                        <FormControl>
                          <textarea 
                            placeholder='{"Authorization": "Bearer token"}' 
                            className="w-full px-3 py-2 border border-input rounded-md text-sm"
                            {...field} 
                          />
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
                      {editingId ? "Atualizar" : "Criar"} Webhook
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Webhooks List */}
        <div className="grid gap-4">
          {webhooksList.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">Nenhum webhook configurado. Crie um novo para começar.</p>
              </CardContent>
            </Card>
          ) : (
            webhooksList.map((webhook) => (
              <Card key={webhook.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <CardTitle>{webhook.name}</CardTitle>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getServiceColor(webhook.service)}`}>
                          {getServiceLabel(webhook.service)}
                        </span>
                        {webhook.isActive ? (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                            Ativo
                          </span>
                        ) : (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100">
                            Inativo
                          </span>
                        )}
                      </div>
                      <CardDescription>{webhook.url}</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(webhook.url, `url-${webhook.id}`)}
                      >
                        {copiedId === `url-${webhook.id}` ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(webhook)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(webhook.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                {(webhook.events || webhook.headers) && (
                  <CardContent className="space-y-2 text-sm">
                    {webhook.events && (
                      <div>
                        <p className="font-medium text-muted-foreground">Eventos:</p>
                        <p className="text-xs font-mono bg-muted p-2 rounded">{webhook.events}</p>
                      </div>
                    )}
                    {webhook.headers && (
                      <div>
                        <p className="font-medium text-muted-foreground">Headers:</p>
                        <p className="text-xs font-mono bg-muted p-2 rounded">{webhook.headers}</p>
                      </div>
                    )}
                  </CardContent>
                )}
              </Card>
            ))
          )}
        </div>

        {/* Documentation */}
        <Card>
          <CardHeader>
            <CardTitle>Como Usar Webhooks</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div>
              <p className="font-medium mb-2">WhatsApp:</p>
              <p className="text-muted-foreground">Use a API do WhatsApp Business ou integradores como Twilio para receber e enviar mensagens.</p>
            </div>
            <div>
              <p className="font-medium mb-2">Telegram:</p>
              <p className="text-muted-foreground">Configure o bot do Telegram para receber atualizações de compromissos e clientes.</p>
            </div>
            <div>
              <p className="font-medium mb-2">Slack:</p>
              <p className="text-muted-foreground">Receba notificações de novos compromissos e atualizações de clientes no Slack.</p>
            </div>
            <div>
              <p className="font-medium mb-2">Discord:</p>
              <p className="text-muted-foreground">Integre com Discord para notificações em tempo real do seu CRM.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
