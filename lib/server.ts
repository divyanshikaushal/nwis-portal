import { AwsClient } from 'aws4fetch';

function setting(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing server setting: ${name}`);
  return value;
}

type Query = { sql: string; params: unknown[] };
async function query(statements: Query[]) {
  const account = setting('CLOUDFLARE_ACCOUNT_ID');
  const database = setting('CLOUDFLARE_D1_DATABASE_ID');
  const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(account)}/d1/database/${encodeURIComponent(database)}/query`, {
    method: 'POST', cache: 'no-store',
    headers: { Authorization: `Bearer ${setting('CLOUDFLARE_D1_API_TOKEN')}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(statements.length === 1 ? statements[0] : {batch: statements}),
  });
  const data = await response.json() as {success: boolean; errors?: unknown; result?: {results: Record<string, any>[]; success: boolean}[]};
  if (!response.ok || !data.success || data.result?.some((r: any) => r.success === false)) {
    throw new Error(JSON.stringify(data.errors || data.result || {status: response.status}));
  }
  if (!data.result?.length) throw new Error("Database returned no query results");
  return data.result;
}
class Statement {
  constructor(public sql: string, public params: unknown[] = []) {}
  bind(...params: unknown[]) { return new Statement(this.sql, params); }
  async all() { return (await query([this]))[0]; }
  async first() { return (await this.all()).results[0] || null; }
  async run() { return this.all(); }
}
export function db() {
  return { prepare: (sql: string) => new Statement(sql), batch: (statements: Statement[]) => query(statements) };
}
export function bucket() {
  const client = new AwsClient({accessKeyId: setting('R2_ACCESS_KEY_ID'), secretAccessKey: setting('R2_SECRET_ACCESS_KEY'), service: 's3', region: 'auto'});
  const account = setting('CLOUDFLARE_ACCOUNT_ID');
  const bucketName = setting('R2_BUCKET_NAME');
  // Optional endpoint supports jurisdiction-specific R2 buckets.
  const endpoint = process.env.R2_ENDPOINT || `https://${account}.r2.cloudflarestorage.com`;
  const url = (key: string) => `${endpoint.replace(/\/$/, '')}/${encodeURIComponent(bucketName)}/${encodeURIComponent(key)}`;
  return {
    async put(key: string, body: ArrayBuffer, options: {httpMetadata: {contentType: string}}) {
      const response = await client.fetch(url(key), {method: 'PUT', body, headers: {'Content-Type': options.httpMetadata.contentType}});
      if (!response.ok) throw new Error(`Document upload failed (${response.status})`);
    },
    async get(key: string) {
      const response = await client.fetch(url(key), {method: 'GET'});
      if (response.status === 404) return null;
      if (!response.ok) throw new Error(`Document retrieval failed (${response.status})`);
      return {body: response.body, httpMetadata: {contentType: response.headers.get('Content-Type')}};
    }
  };
}
export function failure(e: unknown) {
  console.error(e);
  return Response.json({error: 'Saved reports are unavailable. Check the server storage configuration and retry; your draft is preserved.'}, {status: 503});
}
