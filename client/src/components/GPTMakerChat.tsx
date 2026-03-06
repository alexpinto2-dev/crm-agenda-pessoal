import React, { useState, useEffect, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Loader2, Send } from "lucide-react";

interface GPTMakerChatProps {
  clientId: number;
  clientName: string;
}

export function GPTMakerChat({ clientId, clientName }: GPTMakerChatProps) {
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: messages, isLoading: messagesLoading, refetch } = trpc.gptmaker.listMessages.useQuery(
    { clientId },
    { enabled: !!clientId }
  );

  const sendMessageMutation = trpc.gptmaker.sendMessage.useMutation({
    onSuccess: () => {
      setMessage("");
      setIsLoading(false);
      refetch();
    },
    onError: (error) => {
      console.error("Error sending message:", error);
      setIsLoading(false);
    },
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    setIsLoading(true);
    await sendMessageMutation.mutateAsync({
      clientId,
      message: message.trim(),
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full bg-background rounded-lg border border-border">
      {/* Header */}
      <div className="p-4 border-b border-border bg-card">
        <h3 className="font-semibold text-card-foreground">Assistente Alex</h3>
        <p className="text-sm text-muted-foreground">Conversa com {clientName}</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messagesLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : messages && messages.length > 0 ? (
          messages.map((msg) => (
            <div key={msg.id} className="space-y-2">
              {/* User message */}
              <div className="flex justify-end">
                <div className="bg-primary text-primary-foreground rounded-lg px-4 py-2 max-w-xs">
                  <p className="text-sm">{msg.userMessage}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {new Date(msg.createdAt).toLocaleTimeString()}
                  </p>
                </div>
              </div>

              {/* Agent response */}
              {msg.agentResponse && (
                <div className="flex justify-start">
                  <div className="bg-muted text-muted-foreground rounded-lg px-4 py-2 max-w-xs">
                    <p className="text-sm">{msg.agentResponse}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {new Date(msg.updatedAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              )}

              {/* Loading state */}
              {msg.status === "sent" && !msg.agentResponse && (
                <div className="flex justify-start">
                  <div className="bg-muted text-muted-foreground rounded-lg px-4 py-2">
                    <div className="flex items-center space-x-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <p className="text-sm">Aguardando resposta...</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Error state */}
              {msg.status === "error" && (
                <div className="flex justify-start">
                  <div className="bg-destructive/10 text-destructive rounded-lg px-4 py-2">
                    <p className="text-sm">Erro: {msg.error}</p>
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <p className="text-sm">Nenhuma mensagem ainda. Comece uma conversa!</p>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border bg-card">
        <div className="flex gap-2">
          <Input
            placeholder="Digite sua mensagem..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            onClick={handleSendMessage}
            disabled={isLoading || !message.trim()}
            size="icon"
            className="shrink-0"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
