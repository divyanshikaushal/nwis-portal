import {env} from 'cloudflare:workers';
export function db(){const d=(env as any).DB;if(!d)throw new Error('Repository unavailable');return d;}
export function bucket(){const b=(env as any).BUCKET;if(!b)throw new Error('Document storage unavailable');return b;}
export function failure(e:unknown){console.error(e);return Response.json({error:'The repository is temporarily unavailable. Your draft has been preserved; please retry.'},{status:503});}
