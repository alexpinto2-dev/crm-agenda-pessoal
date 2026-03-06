import { Express } from 'express';
import { appRouter } from '../routers';
import { createContext } from './context';

export function registerTelegramWebhook(app: Express) {
  app.post('/api/telegram/webhook', async (req, res) => {
    try {
      const caller = appRouter.createCaller(await createContext({ req, res } as any));
      const result = await caller.telegramHandlers.webhook(req.body);
      res.json(result);
    } catch (error) {
      console.error('Erro ao processar webhook Telegram:', error);
      res.status(500).json({ ok: false, error: 'Internal server error' });
    }
  });
}
