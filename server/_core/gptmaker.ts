import { ENV } from "./env";

export interface GPTMakerConversationRequest {
  contextId: string; // Client ID in CRM
  prompt: string; // User message
  callbackUrl?: string; // Webhook URL for responses
  chatName?: string; // Client name
  chatPicture?: string; // Client photo URL
  phone?: string; // Client phone
}

export interface GPTMakerConversationResponse {
  success: boolean;
  conversationId?: string;
  message?: string;
  error?: string;
}

export class GPTMakerService {
  private authToken: string;
  private agentId: string;
  private apiUrl: string;

  constructor() {
    this.authToken = ENV.gptmakerAuthToken;
    this.agentId = ENV.gptmakerAgentId;
    this.apiUrl = ENV.gptmakerApiUrl;

    if (!this.authToken || !this.agentId || !this.apiUrl) {
      throw new Error("GPT Maker credentials not configured");
    }
  }

  async sendMessage(request: GPTMakerConversationRequest): Promise<GPTMakerConversationResponse> {
    try {
      const endpoint = `${this.apiUrl}/agent/${this.agentId}/conversation`;

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.authToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contextId: request.contextId,
          prompt: request.prompt,
          callbackUrl: request.callbackUrl,
          chatName: request.chatName,
          chatPicture: request.chatPicture,
          phone: request.phone,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("[GPT Maker] API Error:", errorData);
        return {
          success: false,
          error: `API returned status ${response.status}`,
        };
      }

      const data = await response.json();
      return {
        success: true,
        conversationId: data.conversationId || data.id,
        message: data.message || data.response,
      };
    } catch (error) {
      console.error("[GPT Maker] Error sending message:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  async getConversation(conversationId: string): Promise<any> {
    try {
      const endpoint = `${this.apiUrl}/agent/${this.agentId}/conversation/${conversationId}`;

      const response = await fetch(endpoint, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${this.authToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        console.error("[GPT Maker] Failed to get conversation");
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error("[GPT Maker] Error getting conversation:", error);
      return null;
    }
  }

  validateWebhookSignature(signature: string, payload: string): boolean {
    // Implement signature validation if GPT Maker provides it
    // For now, we'll accept all webhook calls
    return true;
  }

  formatClientContext(clientId: string, clientName: string, phone?: string, photo?: string): Partial<GPTMakerConversationRequest> {
    return {
      contextId: clientId,
      chatName: clientName,
      phone: phone,
      chatPicture: photo,
    };
  }
}

export const gptmakerService = new GPTMakerService();
