import http, { IncomingMessage } from 'http';
import { IPromise, IService, IType, SubscribeService } from './index';
import { ensureSlashAtTheEnd } from './lib/ensureSlashAtTheEnd';
import { deserializeJSON, serializeJSON } from './lib/serializeJSON';

export function HttpServerAsService<
  Service extends IService<any, any, any>,
  FrontendContext = unknown,
  BackendContext = unknown,
>(
  service: Service,
  {
    apiUrl = '/',
    SSE = true,
    serialize = serializeJSON,
    deserialize = deserializeJSON,
    mapFrontendContextToBackend = (value: FrontendContext) =>
      value as unknown as BackendContext,
    mapBackendContextToFronted = (value) => value as unknown as FrontendContext,
    authorizer = () => false,
  }: Partial<{
    apiUrl: string;
    serialize: (value: any) => string;
    deserialize: (value: string) => any;

    mapFrontendContextToBackend: (
      value: FrontendContext,
    ) => IPromise<BackendContext>;

    mapBackendContextToFronted: (
      value: BackendContext,
    ) => IPromise<FrontendContext>;

    authorizer: (
      httpRequest: IncomingMessage,
      context: FrontendContext,
    ) => IPromise<boolean>;

    SSE: boolean;
  }> = {},
) {
  apiUrl = ensureSlashAtTheEnd(apiUrl);

  return http.createServer(async (req, res) => {
    // Helper function to send the response
    function answer<
      Type extends
        | IType
        | Array<IType>
        | ReadonlyArray<IType>
        | { type: number }
        | { type: number }[],
    >(response: Type) {
      res.writeHead(200, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*', // Allow CORS from any domain
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS', // Allow specific HTTP methods
        'Access-Control-Allow-Headers': ['Content-Type', 'X-Typex-Context'], // Allow headers in the request
      });
      res.end(serialize(response));
    }

    // Handle preflight CORS request (OPTIONS)
    if (req.method === 'OPTIONS') {
      res.writeHead(200, {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': ['Content-Type', 'X-Typex-Context'],
      });
      res.end();
      return;
    }

    let context: FrontendContext;
    const contextHeader = req.headers['x-typex-context'];

    if (typeof contextHeader === 'string') {
      context = deserialize(contextHeader);
    } else {
      context = {} as FrontendContext;
    }

    if (await authorizer(req, context)) {
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
          const input = deserialize(body);
          if (input && 'type' in input) {
            // @ts-ignore
            const result = await service(
              input.type,
              input,
              await mapFrontendContextToBackend(context),
            );

            answer(result);
            return;
          }

          if (Array.isArray(input)) {
            const results = await Promise.all(
              input.map(async (input) => {
                try {
                  return {
                    type: 200,
                    data: await service(
                      input.type,
                      input,
                      await mapFrontendContextToBackend(context),
                    ),
                  };
                } catch (error) {
                  return {
                    type: 500,
                    reason: error,
                  };
                }
              }),
            );

            answer(results);
            return;
          }

          answer({ type: 400, request: input });
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
      res.setHeader('Access-Control-Allow-Headers', [
        'Content-Type',
        'X-Typex-Context',
      ]);

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
