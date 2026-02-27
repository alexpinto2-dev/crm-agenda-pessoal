import { useState, useRef, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { Send, Loader2, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { Streamdown } from "streamdown";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function Assistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Olá! Sou seu assistente pessoal de CRM. Posso ajudá-lo a:\n\n- **Criar compromissos**: \"Agende uma reunião com João amanhã às 14h\"\n- **Buscar clientes**: \"Mostre meus clientes ativos\"\n- **Registrar interações**: \"Registre uma ligação com a empresa ABC\"\n- **Gerenciar tarefas**: \"Crie uma tarefa para follow-up com o cliente X\"\n\nComo posso ajudá-lo?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: clients = [] } = trpc.clients.list.useQuery();
  const { data: appointments = [] } = trpc.appointments.list.useQuery();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const processUserInput = async (userMessage: string) => {
    // Adicionar mensagem do usuário
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
      // Simular resposta do assistente com base no input
      let assistantResponse = "";

      // Detectar intenção do usuário
      const lowerInput = userMessage.toLowerCase();

      if (lowerInput.includes("cliente") || lowerInput.includes("lead")) {
        // Listar clientes
        if (clients.length === 0) {
          assistantResponse = "Você não possui clientes registrados ainda. Gostaria de adicionar um novo cliente?";
        } else {
          const clientList = clients
            .slice(0, 5)
            .map(c => `- **${c.name}** (${c.status}) - ${c.email || "sem email"}`)
            .join("\n");
          assistantResponse = `Aqui estão seus clientes:\n\n${clientList}\n\n${clients.length > 5 ? `...e mais ${clients.length - 5} clientes.` : ""}`;
        }
      } else if (lowerInput.includes("compromisso") || lowerInput.includes("reunião") || lowerInput.includes("agend")) {
        // Listar compromissos
        if (appointments.length === 0) {
          assistantResponse = "Você não possui compromissos agendados. Gostaria de criar um novo compromisso?";
        } else {
          const upcomingAppointments = appointments
            .filter(a => new Date(a.startTime) >= new Date())
            .slice(0, 5)
            .map(a => `- **${a.title}** (${a.type}) - ${new Date(a.startTime).toLocaleDateString("pt-BR")}`)
            .join("\n");
          assistantResponse = `Aqui estão seus próximos compromissos:\n\n${upcomingAppointments || "Nenhum compromisso agendado."}`;
        }
      } else if (lowerInput.includes("criar") || lowerInput.includes("novo") || lowerInput.includes("adicionar")) {
        assistantResponse = "Para criar um novo item:\n\n- **Cliente**: Vá para a seção de Clientes e clique em \"Novo Cliente\"\n- **Compromisso**: Vá para a Agenda e clique em \"Novo Compromisso\"\n- **Interação**: Abra um cliente e clique em \"Adicionar Interação\"\n\nVocê gostaria de fazer algo específico?";
      } else if (lowerInput.includes("ajuda") || lowerInput.includes("help")) {
        assistantResponse = "Posso ajudá-lo com:\n\n- 📋 **Listar clientes e compromissos**\n- 📅 **Gerenciar agenda**\n- 👤 **Registrar interações com clientes**\n- 📊 **Visualizar métricas do CRM**\n- 🔍 **Buscar informações**\n\nDigite uma solicitação e farei o meu melhor para ajudá-lo!";
      } else {
        assistantResponse = `Entendi sua solicitação: \"${userMessage}\"\n\nAtualmente, estou em desenvolvimento para processar comandos mais complexos. Você pode:\n\n- Usar a navegação do CRM para gerenciar clientes, compromissos e interações\n- Fazer perguntas sobre seus dados (clientes, compromissos, etc.)\n- Pedir ajuda sobre como usar o sistema\n\nComo posso ajudá-lo?`;
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
      toast.error("Erro ao processar sua mensagem");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = () => {
    if (input.trim()) {
      processUserInput(input);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 h-full flex flex-col">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Assistente Pessoal</h1>
          <p className="text-muted-foreground">Chat inteligente para gerenciar seu CRM</p>
        </div>

        {/* Chat Container */}
        <Card className="shadow-card flex-1 flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Chat com Assistente
            </CardTitle>
            <CardDescription>
              Converse comigo para gerenciar clientes, compromissos e interações
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                      message.role === "user"
                        ? "bg-blue-600 text-white rounded-br-none"
                        : "bg-muted text-foreground rounded-bl-none border border-border"
                    }`}
                  >
                    {message.role === "assistant" ? (
                      <Streamdown className="text-sm">{message.content}</Streamdown>
                    ) : (
                      <p className="text-sm">{message.content}</p>
                    )}
                    <p className={`text-xs mt-1 ${message.role === "user" ? "text-blue-100" : "text-muted-foreground"}`}>
                      {message.timestamp.toLocaleTimeString("pt-BR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-muted text-foreground px-4 py-3 rounded-lg rounded-bl-none border border-border flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Pensando...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="flex gap-2">
              <Input
                placeholder="Digite sua mensagem..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter" && !isLoading) {
                    handleSendMessage();
                  }
                }}
                disabled={isLoading}
                className="flex-1"
              />
              <Button
                onClick={handleSendMessage}
                disabled={isLoading || !input.trim()}
                size="icon"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-sm">Ações Rápidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => processUserInput("Mostre meus clientes")}
                disabled={isLoading}
              >
                Meus Clientes
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => processUserInput("Quais são meus compromissos?")}
                disabled={isLoading}
              >
                Compromissos
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => processUserInput("Como usar o assistente?")}
                disabled={isLoading}
              >
                Ajuda
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setMessages([messages[0]])}
                disabled={isLoading}
              >
                Limpar Chat
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
