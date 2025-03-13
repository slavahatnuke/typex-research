import http, { IncomingMessage } from 'http';
import {
  IBus,
  InMemoryBus,
  IPromise,
  IService,
  IServiceEvent,
  IType,
  SubscribeService,
} from './index';
import { ensureSlashAtTheEnd } from './lib/ensureSlashAtTheEnd';
import { deserializeJSON, serializeJSON } from './lib/serializeJSON';

const _identity = Symbol('_identity');

export function HttpServerAsService<
  Service extends IService<any, any, any>,
  FrontendContext extends Record<any, any> = Record<any, any>,
  BackendContext extends Record<any, any> = Record<any, any>,
>(
  service: Service,
  {
    apiUrl = '/',
    SSE = true,
    serialize = serializeJSON,
    deserialize = deserializeJSON,
    mapFrontendContextToBackend = (value: FrontendContext) =>
      value && value instanceof Object
        ? (value as unknown as BackendContext)
        : ({} as BackendContext),
    mapBackendContextToFronted = (value) => value as unknown as FrontendContext,
    authorizer = () => false,
    identifier = (context: BackendContext) => 'default',
    fanOut = InMemoryBus<IServiceEvent<any>>(),
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

    identifier: (context: BackendContext) => IPromise<string>;
    fanOut: IBus<IServiceEvent<any>>;
    SSE: boolean;
  }> = {},
) {
  apiUrl = ensureSlashAtTheEnd(apiUrl);

  const subscribeService = SubscribeService(service);
  const unsubscribeService = subscribeService(fanOut.publish);

  const server = http.createServer(async (req, res) => {
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

    async function getBackendContext() {
      const backendContext = await mapFrontendContextToBackend(context);
      // @ts-ignore
      backendContext[_identity] = await identifier(backendContext);
      return backendContext;
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
              await getBackendContext(),
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
                      await getBackendContext(),
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
          console.error(error, body);
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

      const backendContext = await getBackendContext();
      const unsubscribeFanOut = fanOut.subscribe(({ event, context }) => {
        if (
          // @ts-ignore
          context[_identity] &&
          // @ts-ignore
          backendContext[_identity] &&
          // @ts-ignore
          context[_identity] === backendContext[_identity]
        ) {
          res.write(
            `data: ${serialize({
              event,
              context: mapBackendContextToFronted(
                context as unknown as BackendContext,
              ),
              input: undefined,
            })}\n\n`,
          );
        }
      });

      req.on('close', () => {
        unsubscribeFanOut();
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

  server.on('close', () => {
    unsubscribeService();
  });

  return server;
}
