// Network-free checks for the Vercel storage boundary, using dummy credentials.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import ts from 'typescript';
const source = await fs.readFile(new URL('../lib/server.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, {compilerOptions: {target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext}}).outputText
  .replace("from 'aws4fetch'", `from '${import.meta.resolve('aws4fetch')}'`);
const {db, bucket} = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`);
Object.assign(process.env, {CLOUDFLARE_ACCOUNT_ID:'test-account', CLOUDFLARE_D1_DATABASE_ID:'test-db', CLOUDFLARE_D1_API_TOKEN:'dummy-token', R2_ACCESS_KEY_ID:'dummy-key', R2_SECRET_ACCESS_KEY:'dummy-secret', R2_BUCKET_NAME:'test-bucket'});
let captured;
globalThis.fetch = async (url, options) => {
  captured = {url, options};
  return Response.json({success:true, result:[{success:true, results:[{id:'record'}]}]});
};
assert.deepEqual(await db().prepare('SELECT id FROM reports WHERE id=?').bind('record').first(), {id:'record'});
assert.deepEqual(JSON.parse(captured.options.body), {sql:'SELECT id FROM reports WHERE id=?',params:['record']});
assert.equal(captured.options.headers.Authorization, 'Bearer dummy-token');
await db().batch([db().prepare('INSERT A VALUES(?)').bind('one'), db().prepare('INSERT B VALUES(?)').bind('two')]);
assert.deepEqual(JSON.parse(captured.options.body), {batch:[{sql:'INSERT A VALUES(?)',params:['one']},{sql:'INSERT B VALUES(?)',params:['two']}]});
globalThis.fetch = async () => Response.json({success:false,errors:[{message:'UNIQUE constraint failed'}]});
await assert.rejects(db().prepare('INSERT').run(), /UNIQUE/);
delete process.env.CLOUDFLARE_D1_API_TOKEN;
await assert.rejects(db().prepare('SELECT').all(), /Missing server setting/);
globalThis.fetch = async request => {captured=request;return new Response(null,{status:200});};
await bucket().put('test-id',new TextEncoder().encode('sample').buffer,{httpMetadata:{contentType:'text/plain'}});
assert.equal(captured.method,'PUT');
assert.equal(captured.url,'https://test-account.r2.cloudflarestorage.com/test-bucket/test-id');
assert.match(captured.headers.get('authorization'),/^AWS4-HMAC-SHA256 /);
assert.equal(await captured.text(),'sample');
globalThis.fetch = async () => new Response('source text',{headers:{'Content-Type':'text/plain'}});
const object=await bucket().get('test-id');
assert.equal(await new Response(object.body).text(),'source text');
assert.equal(object.httpMetadata.contentType,'text/plain');
globalThis.fetch = async () => new Response(null,{status:404});
assert.equal(await bucket().get('absent'),null);
console.log('PASS: D1 parameter binding, batch request, errors, missing settings; signed R2 upload, download, missing object.');
