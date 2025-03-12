import http, { IncomingMessage } from 'http';
import { IPromise, IService, IType, SubscribeService } from './index';
import { ensureSlashAtTheEnd } from './lib/ensureSlashAtTheEnd';
import { deserializeJSON, serializeJSON } from './lib/serializeJSON';

export function HttpServerAsService<Service extends IService<any, any, any>>(
  service: Service,
  {
    apiUrl = '/',
    SSE = true,
    serialize = serializeJSON,
    deserialize = deserializeJSON,
    mapFrontendContextToBackend = (value) => value,
    mapBackendContextToFronted = (value) => value,
    authorizer = () => false,
  }: Partial<{
    apiUrl: string;
    serialize: (value: any) => string;
    deserialize: (value: string) => any;
    mapFrontendContextToBackend: (value: any) => IPromise<any>;
    mapBackendContextToFronted: (value: any) => IPromise<any>;
    authorizer: (httpRequest: IncomingMessage) => IPromise<boolean>;
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

    if (!(await authorizer(req))) {
      res.writeHead(401, { 'Content-Type': 'text/plain' });
      res.end('Unauthorized');
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
          const request = deserialize(body);
          if (request && 'input' in request) {
            const input = request.input;
            const context = 'context' in request ? request.context : undefined;

            if (input && 'type' in input) {
              // @ts-ignore
              answer(
                await service(
                  input.type,
                  input,
                  await mapFrontendContextToBackend(context),
                ),
              );
              return;
            }
          }
          answer({ type: 400, request });
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

      const unsubscribeService = subscribeService(({ event, context }) => {
        res.write(
          `data: ${serialize({ event, context: mapBackendContextToFronted(context), input: undefined })}\n\n`,
        );
      });

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
