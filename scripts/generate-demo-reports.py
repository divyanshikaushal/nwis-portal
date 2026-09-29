import json, subprocess
from pathlib import Path
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import Paragraph
from reportlab.lib.enums import TA_LEFT
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
pdfmetrics.registerFont(TTFont("DemoSans", "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"))
pdfmetrics.registerFont(TTFont("DemoSans-Bold", "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"))
root=Path(__file__).resolve().parents[1]
js="""import ts from 'typescript';import fs from 'fs';const code=ts.transpileModule(fs.readFileSync('lib/data.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext}}).outputText;const{seedEvents}=await import('data:text/javascript;base64,'+Buffer.from(code).toString('base64'));console.log(JSON.stringify(seedEvents));"""
events=json.loads(subprocess.check_output(['node','--input-type=module','-e',js],cwd=root))
events.append(dict(id='ingestion',well='OW-04',formation='Barail sandstone',type='Torque spike',severity='Medium',**{'from':2380,'to':2395},basis='TVD',action='Reviewed hole cleaning and drilling parameters',outcome='Torque stabilized after review; 2 h NPT'))
for i,e in enumerate(events):
 filename='ingestion-sample.pdf' if e['id']=='ingestion' else f'incident-{i+1}.pdf'
 p=root/'public/reports'/filename
 c=canvas.Canvas(str(p),pagesize=(595.28,841.89));c.setTitle(f"Synthetic DDR | {e['well']} | {e['type']}");c.setAuthor('NWIS Demonstration Dataset')
 c.setFillColor(HexColor('#11263b'));c.rect(0,715,596,127,fill=1,stroke=0)
 c.setFont('DemoSans-Bold',24);c.setFillColor(HexColor('#ffffff'));c.drawString(42,793,'NWIS')
 c.setFont('DemoSans',10);c.setFillColor(HexColor('#9bd5ca'));c.drawString(42,773,'NEARBY WELLS INTELLIGENCE SYSTEM')
 c.setFillColor(HexColor('#ffffff'));c.setFont('DemoSans-Bold',18);c.drawString(42,740,'Daily drilling report - sample event')
 c.setFillColor(HexColor('#fff4d9'));c.roundRect(42,661,511,31,5,fill=1,stroke=0)
 c.setFillColor(HexColor('#8b661f'));c.setFont('DemoSans-Bold',10);c.drawString(54,673,'SYNTHETIC DEMONSTRATION DATA - NOT AN OIL FIELD REPORT')
 y=625
 def para(text,y,size=12,color='#304b60',bold=False):
  style=ParagraphStyle('line',fontName='DemoSans-Bold' if bold else 'DemoSans',fontSize=size,leading=size*1.5,textColor=HexColor(color))
  item=Paragraph(text,style);_,h=item.wrap(510,500);item.drawOn(c,42,y-h);return y-h
 for key,val in [('Well',e['well']),('Formation',e['formation']),('Depth',f"{e['from']}-{e['to']} m {e['basis']}"),('Event',e['type']),('Severity',e['severity'])]:
  y=para(f'{key}: {val}',y,12)-12
 c.setStrokeColor(HexColor('#dfe7ed'));c.line(42,y,553,y);y-=22
 y=para('Recorded response and outcome',y,14,bold=True)-18
 y=para('Action: '+e['action'],y)-17
 y=para('Outcome: '+e['outcome'],y)-25
 y=para('Evidence note',y,12,bold=True)-9
 y=para('This report is generated from the NWIS synthetic event dataset. The incident, depths, formation and operational response are illustrative. Historical actions require engineering review and are not operating instructions.',y,10,'#6b7f8d')-20
 c.setStrokeColor(HexColor('#dfe7ed'));c.line(42,83,553,83)
 c.setFont('DemoSans',9);c.setFillColor(HexColor('#748895'));c.drawString(42,62,'Source ID: '+e['id']+' | SIH 26121 prototype');c.drawRightString(553,62,'Page 1 of 1')
 c.save()
print('Created 11 source PDFs.')
