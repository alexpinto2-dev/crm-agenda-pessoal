import { useState, useRef, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { Send, Loader2, MessageCircle, Sparkles, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { Streamdown } from "streamdown";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

export default function Assistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Olá! 👋 Sou seu assistente pessoal de CRM. Posso ajudá-lo com:\n\n🗓️ **Agendar compromissos**: \"Agende uma reunião com João amanhã às 14h\"\n👥 **Buscar clientes**: \"Mostre meus clientes ativos\"\n📞 **Registrar interações**: \"Registre uma ligação com a empresa ABC\"\n✅ **Gerenciar tarefas**: \"Crie uma tarefa para follow-up com o cliente X\"\n📊 **Análises**: \"Quantos clientes tenho em cada estágio?\"\n\nComo posso ajudá-lo?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: clients = [] } = trpc.clients.list.useQuery();
  const { data: appointments = [] } = trpc.appointments.list.useQuery();
  const assistantMutation = trpc.system.notifyOwner.useMutation();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const processUserInput = async (userMessage: string) => {
    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: userMessage,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      let assistantResponse = "";
      const lowerInput = userMessage.toLowerCase();

      // Análise de intenção
      if (lowerInput.includes("cliente") && lowerInput.includes("quantos")) {
        // Estatísticas de clientes
        const stats = {
          total: clients.length,
          leads: clients.filter(c => c.status === "lead").length,
          prospects: clients.filter(c => c.status === "prospect").length,
          customers: clients.filter(c => c.status === "customer").length,
          inactive: clients.filter(c => c.status === "inactive").length,
        };
        assistantResponse = `📊 **Estatísticas de Clientes**\n\n- **Total**: ${stats.total} clientes\n- **Leads**: ${stats.leads}\n- **Prospects**: ${stats.prospects}\n- **Clientes**: ${stats.customers}\n- **Inativos**: ${stats.inactive}\n\n**Taxa de Conversão**: ${stats.total > 0 ? ((stats.customers / stats.total) * 100).toFixed(1) : 0}%`;
      } else if (lowerInput.includes("cliente") || lowerInput.includes("lead")) {
        // Listar clientes
        if (clients.length === 0) {
          assistantResponse = "Você não possui clientes registrados ainda. Gostaria de adicionar um novo cliente? Vá para a seção de **Clientes** para criar um novo registro.";
        } else {
          const clientList = clients
            .slice(0, 10)
            .map(c => `- **${c.name}** (${c.status}) - ${c.email || "sem email"}`)
            .join("\n");
          assistantResponse = `👥 **Seus Clientes** (${clients.length} total)\n\n${clientList}${clients.length > 10 ? `\n\n...e mais ${clients.length - 10} clientes.` : ""}`;
        }
      } else if (lowerInput.includes("compromisso") || lowerInput.includes("reunião") || lowerInput.includes("agend")) {
        // Listar compromissos
        if (appointments.length === 0) {
          assistantResponse = "Você não possui compromissos agendados. Gostaria de criar um novo compromisso? Vá para a seção de **Agenda** para agendar.";
        } else {
          const upcomingAppointments = appointments
            .filter(a => new Date(a.startTime) >= new Date())
            .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
            .slice(0, 5)
            .map(a => `- **${a.title}** (${a.type}) - ${new Date(a.startTime).toLocaleDateString("pt-BR", { weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}`);
          
          if (upcomingAppointments.length === 0) {
            assistantResponse = "Você não possui compromissos futuros agendados.";
          } else {
            assistantResponse = `📅 **Próximos Compromissos**\n\n${upcomingAppointments.join("\n")}`;
          }
        }
      } else if (lowerInput.includes("hoje") || lowerInput.includes("hoje")) {
        // Compromissos de hoje
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const todayAppointments = appointments
          .filter(a => {
            const apt = new Date(a.startTime);
            apt.setHours(0, 0, 0, 0);
            return apt.getTime() === today.getTime();
          })
          .map(a => `- **${a.title}** às ${new Date(a.startTime).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`);

        if (todayAppointments.length === 0) {
          assistantResponse = "Você não possui compromissos agendados para hoje. 😊";
        } else {
          assistantResponse = `📆 **Compromissos de Hoje**\n\n${todayAppointments.join("\n")}`;
        }
      } else if (lowerInput.includes("ajuda") || lowerInput.includes("o que você faz")) {
        assistantResponse = "Sou seu assistente inteligente de CRM! Posso ajudá-lo com:\n\n🗓️ **Agendar**: Agende compromissos\n👥 **Clientes**: Veja informações de clientes\n📊 **Análises**: Obtenha estatísticas\n📞 **Interações**: Registre contatos\n✅ **Tarefas**: Gerencie tarefas\n\nTente perguntar algo como:\n- \"Quantos clientes tenho?\"\n- \"Mostre meus compromissos\"\n- \"Quais são meus clientes ativos?\"\n- \"Próximos compromissos\"";
      } else {
        // Resposta padrão para comandos não reconhecidos
        assistantResponse = `Entendi sua mensagem: **"${userMessage}"**\n\nDesculpe, ainda não consigo processar este comando específico. Mas posso ajudá-lo com:\n\n✅ Listar clientes\n✅ Mostrar compromissos\n✅ Estatísticas de clientes\n✅ Compromissos de hoje\n\nTente reformular sua pergunta ou use um dos comandos acima!`;
      }

      // Adicionar resposta do assistente
      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: assistantResponse,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (error) {
      toast.error("Erro ao processar comando");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    processUserInput(input);
  };

  const handleCopyMessage = (content: string, id: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const quickActions = [
    { label: "Meus Clientes", action: "Mostre meus clientes" },
    { label: "Próximos Compromissos", action: "Quais são meus próximos compromissos?" },
    { label: "Compromissos Hoje", action: "Quais compromissos tenho hoje?" },
    { label: "Estatísticas", action: "Quantos clientes tenho em cada estágio?" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Sparkles className="h-8 w-8 text-amber-500" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Assistente Pessoal</h1>
            <p className="text-muted-foreground">Chat inteligente para gerenciar seu CRM</p>
          </div>
        </div>

        {/* Chat Container */}
        <Card className="shadow-card flex flex-col h-[600px]">
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Chat com IA
            </CardTitle>
            <CardDescription>Converse naturalmente para gerenciar seu CRM</CardDescription>
          </CardHeader>

          {/* Messages Area */}
          <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md xl:max-w-lg px-4 py-3 rounded-lg ${
                    message.role === "user"
                      ? "bg-blue-600 text-white rounded-br-none"
                      : "bg-muted text-foreground rounded-bl-none"
                  }`}
                >
                  {message.role === "assistant" ? (
                    <Streamdown>{message.content}</Streamdown>
                  ) : (
                    <p className="text-sm">{message.content}</p>
                  )}
                  <p className={`text-xs mt-2 ${message.role === "user" ? "text-blue-100" : "text-muted-foreground"}`}>
                    {message.timestamp.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                  {message.role === "assistant" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-2 h-6 w-6 p-0"
                      onClick={() => handleCopyMessage(message.content, message.id)}
                    >
                      {copiedId === message.id ? (
                        <Check className="h-3 w-3 text-green-600" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </Button>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted text-foreground px-4 py-3 rounded-lg rounded-bl-none">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </CardContent>

          {/* Quick Actions */}
          {messages.length === 1 && (
            <div className="border-t p-4 space-y-2">
              <p className="text-xs text-muted-foreground font-semibold">Ações Rápidas:</p>
              <div className="grid grid-cols-2 gap-2">
                {quickActions.map((action) => (
                  <Button
                    key={action.action}
                    variant="outline"
                    size="sm"
                    onClick={() => processUserInput(action.action)}
                    className="text-xs"
                  >
                    {action.label}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="border-t p-4">
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <Input
                placeholder="Digite sua mensagem..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isLoading}
                className="flex-1"
              />
              <Button
                type="submit"
                disabled={isLoading || !input.trim()}
                size="icon"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </form>
          </div>
        </Card>

        {/* Informações Úteis */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-lg">💡 Dicas de Uso</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="font-semibold text-sm">Comandos Disponíveis:</p>
              <ul className="text-sm text-muted-foreground space-y-1 mt-2">
                <li>• "Mostre meus clientes" - Lista todos os seus clientes</li>
                <li>• "Quantos clientes tenho?" - Estatísticas por estágio</li>
                <li>• "Próximos compromissos" - Mostra os próximos agendamentos</li>
                <li>• "Compromissos de hoje" - Apenas os de hoje</li>
                <li>• "Ajuda" - Mostra todas as opções disponíveis</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
