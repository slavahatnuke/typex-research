// src/server.ts
import {ClickHouseService} from './app';
import {HttpServerAsService} from '@slavax/typex/HttpServerAsService';

const appService = ClickHouseService();
const server = HttpServerAsService(appService);

const PORT = 7700;
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
