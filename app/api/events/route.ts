import {db,failure} from '@/lib/server';
import {seedEvents,Event} from '@/lib/data';
import {eventKey,findDuplicate,reviewIssues} from '@/lib/extraction';
export async function GET(){try{const r=await db().prepare('SELECT data FROM events ORDER BY created DESC').all();return Response.json(r.results.map((r:any)=>JSON.parse(r.data)));}catch(e){return failure(e);}}
export async function POST(req:Request){
 try{
  const e:any=await req.json();
  if(!e||['well','type','formation','basis','severity','action','outcome','source','excerpt'].some(k=>typeof e[k]!=='string')||!Number.isInteger(e.page)||e.page<1||JSON.stringify(e).length>100000)return Response.json({error:'Invalid event fields or report size.'},{status:400});
  const invalid=reviewIssues(e);if(invalid.length)return Response.json({error:invalid.map(i=>i.message).join(' ')},{status:400});
  const existing=await db().prepare('SELECT data FROM events').all();
  const duplicate=findDuplicate(e,[...seedEvents,...existing.results.map((r:any)=>JSON.parse(r.data))]);
  if(duplicate)return Response.json({error:`Matching event already exists: ${duplicate.well}, ${duplicate.type}, ${duplicate.from}–${duplicate.to} m ${duplicate.basis}. Open the existing evidence instead.`,duplicate},{status:409});
  if(typeof e.reportId!=='string'||!await db().prepare('SELECT id FROM reports WHERE id=?').bind(e.reportId).first())return Response.json({error:'Save a valid source report first.'},{status:400});
  const id=crypto.randomUUID();const data:Event={id,well:e.well,type:e.type,formation:e.formation.trim(),from:e.from,to:e.to,basis:e.basis,severity:e.severity,action:e.action.trim(),outcome:e.outcome.trim(),source:e.source,page:e.page,excerpt:e.excerpt,reportId:e.reportId,reviewed:true};
  try{await db().batch([
   db().prepare('INSERT INTO event_keys(fingerprint,event_id) VALUES(?,?)').bind(eventKey(data),id),
   db().prepare('INSERT INTO events(id,data,created) VALUES(?,?,?)').bind(id,JSON.stringify(data),new Date().toISOString())
  ]);}catch(error){if(String(error).includes('UNIQUE'))return Response.json({error:'A matching event was just saved. Refresh the repository before trying again.'},{status:409});throw error;}
  return Response.json(data);
 }catch(e){return failure(e);}
}
