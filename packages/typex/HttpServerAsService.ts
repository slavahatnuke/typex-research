import http from 'http';
import { IService, IType } from './index';

export function HttpServerAsService(
  service: IService<IType>,
  { apiUrl = '/' }: Partial<{ apiUrl: string }> = {},
) {
  return http.createServer(async (req, res) => {
    function answer<Type extends IType | { type: number }>(response: Type) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(response));
    }

    if (req.method === 'POST' && req.url === apiUrl) {
      let body = '';

      req.on('data', (chunk) => {
        body += chunk;
      });

      req.on('end', async () => {
        try {
          const request = JSON.parse(body);
          if (request && 'type' in request) {
            answer(await service(request.type, request));
          } else {
            answer({ type: 400 });
          }
        } catch (error) {
          console.error(error);
          res.end(JSON.stringify({ type: 500 }));
          answer({ type: 500 });
        }
      });
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
    }
  });
}
