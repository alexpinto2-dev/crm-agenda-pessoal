import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle, Calendar, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function GoogleCalendarSettings() {
  const [isConnected, setIsConnected] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const getAuthUrlMutation = trpc.googleCalendar.getAuthUrl.useQuery();
  const getTokensMutation = trpc.googleCalendar.getTokens.useMutation();
  const syncMutation = trpc.googleCalendar.syncAllAppointments.useMutation();

  const handleConnect = async () => {
    try {
      if (getAuthUrlMutation.data?.authUrl) {
        window.location.href = getAuthUrlMutation.data.authUrl;
      }
    } catch (error) {
      setMessage({ type: "error", text: "Erro ao conectar com Google Calendar" });
    }
  };

  const handleSync = async () => {
    if (!accessToken) {
      setMessage({ type: "error", text: "Você precisa conectar ao Google Calendar primeiro" });
      return;
    }

    setIsSyncing(true);
    try {
      const result = await syncMutation.mutateAsync({ accessToken });
      if (result.success) {
        setMessage({ type: "success", text: "Sincronização concluída com sucesso!" });
      } else {
        setMessage({ type: "error", text: "Erro ao sincronizar compromissos" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Erro ao sincronizar compromissos" });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Google Calendar</h1>
        <p className="text-muted-foreground mt-2">
          Sincronize seus compromissos do CRM com o Google Calendar automaticamente
        </p>
      </div>

      {message && (
        <Alert variant={message.type === "success" ? "default" : "destructive"}>
          {message.type === "success" ? (
            <CheckCircle className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6">
        {/* Connection Status Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Status da Conexão
            </CardTitle>
            <CardDescription>
              Conecte seu Google Calendar para sincronizar compromissos automaticamente
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
              <div className="flex items-center gap-3">
                {isConnected ? (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="font-medium">Conectado ao Google Calendar</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-yellow-600" />
                    <span className="font-medium">Não conectado</span>
                  </div>
                )}
              </div>
              <Button
                onClick={handleConnect}
                variant={isConnected ? "outline" : "default"}
                disabled={getAuthUrlMutation.isLoading}
              >
                {getAuthUrlMutation.isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Conectando...
                  </>
                ) : isConnected ? (
                  "Reconectar"
                ) : (
                  "Conectar"
                )}
              </Button>
            </div>

            <div className="space-y-2 text-sm text-muted-foreground">
              <p>
                Ao conectar, você autoriza o CRM a:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Ler seus compromissos do Google Calendar</li>
                <li>Criar novos compromissos automaticamente</li>
                <li>Atualizar compromissos existentes</li>
                <li>Deletar compromissos quando necessário</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Sync Card */}
        <Card>
          <CardHeader>
            <CardTitle>Sincronização de Compromissos</CardTitle>
            <CardDescription>
              Sincronize todos os seus compromissos com o Google Calendar
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 border rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground mb-4">
                Clique no botão abaixo para sincronizar todos os seus compromissos do CRM com o Google Calendar.
                Isso criará novos eventos e atualizará os existentes.
              </p>
              <Button
                onClick={handleSync}
                disabled={!isConnected || isSyncing}
                className="w-full"
              >
                {isSyncing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sincronizando...
                  </>
                ) : (
                  "Sincronizar Agora"
                )}
              </Button>
            </div>

            <div className="space-y-2 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">Informações de Sincronização:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Sincronização automática a cada 1 hora</li>
                <li>Novos compromissos são criados automaticamente</li>
                <li>Alterações são sincronizadas em tempo real</li>
                <li>Lembretes são configurados automaticamente (15 min e 1 dia antes)</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card>
          <CardHeader>
            <CardTitle>Como Funciona</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="space-y-3">
              <div>
                <h4 className="font-medium mb-1">1. Conectar</h4>
                <p className="text-muted-foreground">
                  Clique em "Conectar" para autorizar o CRM a acessar seu Google Calendar
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-1">2. Sincronizar</h4>
                <p className="text-muted-foreground">
                  Clique em "Sincronizar Agora" para sincronizar todos os seus compromissos
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-1">3. Automático</h4>
                <p className="text-muted-foreground">
                  Todos os novos compromissos criados no CRM serão automaticamente adicionados ao Google Calendar
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
