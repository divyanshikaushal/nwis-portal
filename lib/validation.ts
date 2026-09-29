import {Event,wells,seedEvents,risks,demoScenarios} from './data';
import {parseReport,searchEvents,findDuplicate} from './extraction';
const base=seedEvents[0];
export const extractionFixtures=[
 {name:'Clear mud-loss report',text:'Well: OW-02\nFormation: Barail sandstone\nDepth: 2160-2185 m TVD\nEvent: Mud loss\nSeverity: High\nAction: Reviewed loss trend\nOutcome: Circulation restored',expected:{well:'OW-02',formation:'Barail sandstone',from:2160,to:2185,basis:'TVD',type:'Mud loss',severity:'High',action:'Reviewed loss trend',outcome:'Circulation restored'}},
 {name:'Comma-separated measured depths',text:'Well: OW-04\nFormation: Barail sandstone\nDepth: 2,260–2,280 m MD\nEvent: Stuck pipe\nSeverity: High\nAction: Engineering review\nOutcome: Freed',expected:{well:'OW-04',from:2260,to:2280,basis:'MD',type:'Stuck pipe',action:'Engineering review',outcome:'Freed'}},
 {name:'Missing depth basis stays unknown',text:'Well: OW-03\nFormation: Barail sandstone\nDepth: 2135-2155 m\nEvent: Mud loss',expected:{well:'OW-03',from:2135,to:2155,basis:'',severity:'',action:'',outcome:''}},
 {name:'Negated event needs review',text:'Well: OW-05\nFormation: Barail sandstone\nDepth: 2195-2210 m TVD\nEvent: No torque spike observed',expected:{type:'',well:'OW-05',basis:'TVD'}},
 {name:'Feet are not interpreted as metres',text:'Well: OW-02\nDepth: 7000-7050 ft TVD\nEvent: Mud loss',expected:{from:0,to:0,basis:'TVD',type:'Mud loss'}},
 {name:'Multiple incidents stay unresolved',text:'Well: OW-04\nDepth: 2300-2310 m TVD\nEvent: Kick and mud loss',expected:{type:'',from:2300,to:2310}},
 {name:'Reordered fields and explicit basis',text:'Outcome: Stabilized\nAction: Reviewed pressure\nEvent: Overpressure\nDepth: 2320-2340 metres\nDepth basis: TVD\nFormation: Barail sandstone\nWell: OW-06\nSeverity: High',expected:{well:'OW-06',basis:'TVD',type:'Overpressure',from:2320,to:2340,severity:'High',action:'Reviewed pressure',outcome:'Stabilized'}}
];
export const alertFixtures:{name:string;event:Event;depth:number;radius:number;expected:string}[]=[
 {name:'Before look-ahead window',event:base,depth:2039,radius:10,expected:'None'},
 {name:'At watch boundary',event:base,depth:2040,radius:10,expected:'Watch'},
 {name:'Approaching high-concern boundary',event:base,depth:2099,radius:10,expected:'Watch'},
 {name:'At high-concern boundary',event:base,depth:2100,radius:10,expected:'High'},
 {name:'Within projected interval',event:base,depth:2145,radius:10,expected:'High'},
 {name:'After projected interval',event:base,depth:2166,radius:10,expected:'None'},
 {name:'Outside selected radius',event:base,depth:2120,radius:1,expected:'None'},
 {name:'Unrelated formation',event:{...base,formation:'Other formation'},depth:2120,radius:10,expected:'None'},
 {name:'MD conversion unavailable',event:{...base,basis:'MD'},depth:2120,radius:10,expected:'None'},
 {name:'Same well excluded',event:{...base,well:'NW-01'},depth:2120,radius:10,expected:'None'},
 {name:'Unknown well excluded',event:{...base,well:'UNKNOWN'},depth:2120,radius:10,expected:'None'},
 {name:'Formation whitespace normalized',event:{...base,formation:' Barail sandstone '},depth:2120,radius:10,expected:'High'}
];
export function runValidation(){
 const started=Date.now(),clock=()=>typeof performance!=='undefined'?performance.now():Date.now();
 const extraction=extractionFixtures.map(f=>{const got=parseReport(f.text).draft;const fields=Object.entries(f.expected).map(([field,expected])=>({field,expected,actual:got[field as keyof Event],pass:got[field as keyof Event]===expected}));return{name:f.name,pass:fields.every(f=>f.pass),correct:fields.filter(f=>f.pass).length,total:fields.length,fields};});
 const alerts=alertFixtures.map(f=>{const actual=risks([f.event],wells[0],f.depth,f.radius)[0]?.level||'None';return{name:f.name,expected:f.expected,actual,pass:actual===f.expected,depth:f.depth,radius:f.radius};});
 const negative=alerts.filter(a=>a.expected==='None'),positive=alerts.filter(a=>a.expected!=='None');
 const leads=demoScenarios.map(s=>{const e=seedEvents.find(e=>e.id===s.eventId)!,offset=wells.find(w=>w.id===e.well)!,projected=wells[0].top+e.from-offset.top;let first:null|number=null;for(let d=1950;d<=2400;d++)if(risks([e],wells[0],d,s.radius).length){first=d;break;}return{name:s.title,projected,first,lead:first===null?null:projected-first};});
 const searches=[{query:'mud loss',expected:3},{query:'OW-02',expected:2},{query:'nonexistent formation',expected:0}];
 const search=searches.map(s=>{const rounds=300,start=clock();let count=0;for(let i=0;i<rounds;i++)count=searchEvents(seedEvents,s.query).length;const ms=(clock()-start)/rounds;return{query:s.query,expected:s.expected,actual:count,pass:count===s.expected,milliseconds:ms,rounds};});
 const duplicate=[{name:'Exact record detected',pass:!!findDuplicate({...base,id:'new'},seedEvents)},{name:'Case and spacing normalized',pass:!!findDuplicate({...base,formation:'  BARAIL   SANDSTONE '},seedEvents)},{name:'Different interval is distinct',pass:!findDuplicate({...base,from:2500,to:2510},seedEvents)},{name:'MD is distinct from TVD',pass:!findDuplicate({...base,basis:'MD'},seedEvents)}];
 return {ranAt:new Date(started).toISOString(),dataset:'Fixed synthetic verification fixtures v1',extraction,alerts,leads,search,duplicate,correctFields:extraction.reduce((n,x)=>n+x.correct,0),totalFields:extraction.reduce((n,x)=>n+x.total,0),falseAlerts:negative.filter(a=>a.actual!=='None').length,negativeCases:negative.length,missedAlerts:positive.filter(a=>a.actual==='None').length,positiveCases:positive.length};
}
export type ValidationResult=ReturnType<typeof runValidation>;
