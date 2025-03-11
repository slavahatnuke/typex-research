export function ensureSlashAtTheEnd(apiUrl: string) {
  if (!apiUrl.endsWith('/')) {
    apiUrl = `${apiUrl}/`;
  }
  return apiUrl;
}