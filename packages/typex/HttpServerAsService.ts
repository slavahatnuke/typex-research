import http from 'http';
import { IService, IType, SubscribeService } from './index';
import { ensureSlashAtTheEnd } from './lib/ensureSlashAtTheEnd';

export function HttpServerAsService<Service extends IService<any, any, any>>(
  service: Service,
  {
    apiUrl = '/',
    SSE = true,
    serialize = (value: any): string => JSON.stringify(value),
  }: Partial<{
    apiUrl: string;
    serialize: (value: any) => string;
    SSE: boolean;
  }> = {},
) {
  apiUrl = ensureSlashAtTheEnd(apiUrl);

  return http.createServer(async (req, res) => {
    // Helper function to send the response
    function answer<Type extends IType | { type: number }>(response: Type) {
      res.writeHead(200, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*', // Allow CORS from any domain
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS', // Allow specific HTTP methods
        'Access-Control-Allow-Headers': 'Content-Type', // Allow headers in the request
      });
      res.end(serialize(response));
    }

    // Handle preflight CORS request (OPTIONS)
    if (req.method === 'OPTIONS') {
      res.writeHead(200, {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      });
      res.end();
      return;
    }

    // Handle POST request at the API URL
    if (req.method === 'POST' && req.url === apiUrl) {
      let body = '';

      req.on('data', (chunk) => {
        body += chunk;
      });

      req.on('end', async () => {
        try {
          const request = JSON.parse(body);
          if (request && 'type' in request) {
            // @ts-ignore
            answer(await service(request.type, request));
          } else {
            answer({ type: 400, request });
          }
        } catch (error) {
          console.error(error);
          answer({ type: 500, reason: error });
        }
      });
    } else if (SSE && req.method === 'GET' && req.url === `${apiUrl}SSE`) {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader(
        'Access-Control-Allow-Methods',
        'GET, POST, PUT, DELETE, OPTIONS',
      );
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

      const subscribeService = SubscribeService(service);

      const unsubscribeService = subscribeService(
        ({ event, context, input }) => {
          res.write(`data: ${serialize({ event, context, input })}\n\n`);
        },
      );

      req.on('close', () => {
        unsubscribeService();
        res.end();
      });
      // health
    } else if (req.url === `${apiUrl}health`) {
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end('OK');
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
    }
  });
}
