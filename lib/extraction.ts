import {Event,wells,types} from './data';
export type Issue={field:keyof Event|'source';message:string};
export const clean=(s:string)=>s.trim().toLowerCase().replace(/\s+/g,' ');
export function eventKey(e:Pick<Event,'well'|'type'|'formation'|'from'|'to'|'basis'>){return JSON.stringify([clean(e.well),clean(e.type),clean(e.formation),e.from,e.to,clean(e.basis)]);}
export function findDuplicate(e:Event,events:Event[]){return events.find(x=>eventKey(x)===eventKey(e));}
export function searchEvents(events:Event[],query:string,type='All events'){const q=clean(query);return events.filter(e=>(type==='All events'||e.type===type)&&clean([e.well,e.type,e.formation,e.action,e.outcome,e.source,e.from,e.to].join(' ')).includes(q));}
export function parseReport(text:string,page=1,source='Report'){
 const issues:Issue[]=[];
 const grab=(label:string)=>text.match(new RegExp(`(?:^|[\\r\\n])\\s*${label}\\s*:\\s*([^\\r\\n]+)`,'i'))?.[1]?.trim()||'';
 const well=grab('Well').toUpperCase()||text.match(/\b(?:OW|NW)-\d{2}\b/i)?.[0]?.toUpperCase()||'';
 const named=grab('Event'),candidates=types.filter(t=>new RegExp(`\\b${t}\\b`,'i').test(named||text));
 const negated=/(?:\bno\b|\bnot\b|\bwithout\b|\babsent\b|\bdenied\b)/i.test(named)||(!named&&/(?:no|without|not observed|absent)[^\n.]{0,40}(?:mud loss|kick|stuck pipe|overpressure|torque spike|cementing issue)|(?:mud loss|kick|stuck pipe|overpressure|torque spike|cementing issue)[^\n.]{0,25}(?:not observed|absent)/i.test(text));
 const type=!negated&&candidates.length===1?candidates[0]:'';
 if(negated)issues.push({field:'type',message:'Possible negated incident. Check whether an event actually occurred.'});
 if(candidates.length>1)issues.push({field:'type',message:'Multiple event types found. Select and record one incident at a time.'});
 if(!named&&type)issues.push({field:'type',message:'Event inferred from a keyword; confirm it is an actual incident.'});
 const d=text.match(/(?:depth|interval)\s*:\s*([\d,]+(?:\.\d+)?)\s*[-–—]\s*([\d,]+(?:\.\d+)?)\s*(m|metres?|meters?|ft|feet)\b\s*(MD|TVD)?/i);
 const metric=!!d&&!/^(ft|feet)$/i.test(d[3]);if(d&&!metric)issues.push({field:'from',message:'Depth is in feet. Enter a verified metre conversion before saving.'});
 const basis=d?.[4]?.toUpperCase()||grab('Depth basis').toUpperCase();
 const severity=['Low','Medium','High'].find(s=>clean(s)===clean(grab('Severity')))||'';
 const draft:Event={id:'',well,type,formation:grab('Formation'),from:metric?Number(d![1].replaceAll(',','')):0,to:metric?Number(d![2].replaceAll(',','')):0,basis: ['MD','TVD'].includes(basis)?basis:'',severity,action:grab('Action'),outcome:grab('Outcome'),source,page,excerpt:text};
 return {draft,issues};
}
export function reviewIssues(e:Event):Issue[]{const result:Issue[]=[];for(const [field,ok,message] of [
 ['well',wells.some(w=>w.id===e.well),'Select a known well.'],['type',types.includes(e.type),'Confirm the incident type.'],['formation',!!e.formation.trim(),'Formation was not identified.'],['basis',['MD','TVD'].includes(e.basis),'Confirm measured or true vertical depth.'],['from',Number.isFinite(e.from)&&e.from>0,'Enter a positive depth in metres.'],['to',Number.isFinite(e.to)&&e.to>=e.from&&e.to<=10000,'Check the end depth.'],['severity',['Low','Medium','High'].includes(e.severity),'Review and select historical severity.'],['action',!!e.action.trim(),'Add the recorded mitigation, or explicitly mark it not recorded.'],['outcome',!!e.outcome.trim(),'Add the recorded outcome, or explicitly mark it not recorded.']
 ] as [keyof Event,boolean,string][])if(!ok)result.push({field,message});return result;}
export const ingestionSample=`SYNTHETIC DEMONSTRATION DAILY DRILLING REPORT\nWell: OW-04\nFormation: Barail sandstone\nDepth: 2380-2395 m TVD\nEvent: Torque spike\nSeverity: Medium\nAction: Reviewed hole cleaning and drilling parameters\nOutcome: Torque stabilized after review; 2 h NPT`;
