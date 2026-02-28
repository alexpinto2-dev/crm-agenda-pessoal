import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { Send, Loader2, MessageCircle, Sparkles, Home } from "lucide-react";
import { toast } from "sonner";
import { Streamdown } from "streamdown";
import { Link } from "wouter";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function ExternalAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Olá! 👋 Sou seu assistente de agendamento rápido.\n\nPosso agendar reuniões e cadastrar clientes para você via chat.\n\nExemplo: \"Agende uma reunião com o João amanhã às 10h\" ou \"Cadastre o cliente Maria com email maria@email.com\".",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const aiMutation = trpc.ai.chat.useMutation({
    onSuccess: (data) => {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: "assistant",
        content: data.content,
        timestamp: new Date(),
      }]);
    },
    onError: (err) => {
      toast.error("Erro ao falar com a IA: " + err.message);
    }
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || aiMutation.isPending) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMsg]);
    aiMutation.mutate({ 
      message: input,
      history: messages.map(m => ({ role: m.role, content: m.content }))
    });
    setInput("");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-amber-500" />
            <h1 className="text-xl font-bold">Assistente CRM Rápido</h1>
          </div>
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2">
              <Home className="h-4 w-4" />
              Voltar ao CRM
            </Button>
          </Link>
        </div>

        <Card className="shadow-lg flex flex-col h-[70vh]">
          <CardHeader className="border-b bg-white">
            <CardTitle className="flex items-center gap-2 text-lg">
              <MessageCircle className="h-5 w-5 text-blue-500" />
              Agendamento por Voz/Texto
            </CardTitle>
            <CardDescription>O que você digitar aqui será agendado no sistema.</CardDescription>
          </CardHeader>

          <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] px-4 py-3 rounded-2xl ${
                    message.role === "user"
                      ? "bg-blue-600 text-white rounded-br-none shadow-md"
                      : "bg-white text-slate-800 rounded-bl-none shadow-sm border border-slate-100"
                  }`}
                >
                  <div className="prose prose-sm max-w-none prose-slate">
                    <Streamdown>{message.content}</Streamdown>
                  </div>
                  <p className={`text-[10px] mt-1 opacity-70 ${message.role === "user" ? "text-right" : "text-left"}`}>
                    {message.timestamp.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            ))}
            {aiMutation.isPending && (
              <div className="flex justify-start">
                <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-none shadow-sm border border-slate-100">
                  <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </CardContent>

          <div className="p-4 bg-white border-t">
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <Input
                placeholder="Ex: Agende reunião com João amanhã às 14h..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={aiMutation.isPending}
                className="flex-1 bg-slate-50 border-none focus-visible:ring-1 focus-visible:ring-blue-400"
              />
              <Button
                type="submit"
                disabled={aiMutation.isPending || !input.trim()}
                className="bg-blue-600 hover:bg-blue-700 shadow-sm"
              >
                {aiMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </form>
          </div>
        </Card>
      </div>
    </div>
  );
}
