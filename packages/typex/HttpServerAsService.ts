import http from 'http';
import { IService, IType } from './index';

export function HttpServerAsService(
  service: IService<IType>,
  { apiUrl = '/' }: Partial<{ apiUrl: string }> = {},
) {
  return http.createServer(async (req, res) => {
    // Helper function to send the response
    function answer<Type extends IType | { type: number }>(response: Type) {
      res.writeHead(200, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*', // Allow CORS from any domain
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS', // Allow specific HTTP methods
        'Access-Control-Allow-Headers': 'Content-Type', // Allow headers in the request
      });
      res.end(JSON.stringify(response));
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
