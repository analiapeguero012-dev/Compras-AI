from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor
from reportlab.lib.pagesizes import A4
from pathlib import Path
ROOT=Path(__file__).resolve().parent.parent / 'ejemplos'
ROOT.mkdir(parents=True, exist_ok=True)
records=[
 ('01_Frio_Caribe.pdf', 'FRÍO CARIBE EQUIPOS', 'COT-2026-1042', [
  ('Freezer vertical de 2 puertas',2,85000),('Vitrina refrigerada de 2 puertas',1,124000),('Mesa acero inoxidable 1.5 m',2,31000)],
  [('Forma de pago','Crédito a 30 días'),('Tiempo de entrega','15 días hábiles desde la OC'),('Garantía','12 meses'),('Instalación','Incluida'),('Flete / transporte','Incluido'),('Validez de la oferta','30 días calendario'),('ITBIS','18% no incluido'),('Moneda','DOP'),('Servicio posventa','Incluido'),('Repuestos','Disponibles según inventario'),('Exclusiones','Obras civiles'),('Lugar de entrega','Santo Domingo')]),
 ('03_Comercial_Costa_Azul.pdf', 'COMERCIAL COSTA AZUL', 'COT-2026-2255', [
  ('Freezer 2 puertas vertical',2,79500),('Vitrina 2 puertas refrigerada',1,123000),('Mesa acero inox 1.5m',2,29500)],
  [('Forma de pago','Crédito a 45 días'),('Tiempo de entrega','20 días hábiles'),('Garantía','12 meses por defectos de fábrica'),('Instalación','Incluida'),('Flete / transporte','Incluido'),('Validez de la oferta','20 días'),('ITBIS','18% no incluido'),('Moneda','DOP'),('Servicio posventa','Incluido'),('Repuestos','Disponibles con pedido'),('Exclusiones','Obras civiles'),('Lugar de entrega','Santo Domingo')])
]
for fname,name,code,items,terms in records:
    c=canvas.Canvas(str(ROOT/fname),pagesize=A4); w,h=A4
    c.setFillColor(HexColor('#153c70'));c.rect(0,h-108,w,108,fill=1,stroke=0)
    c.setFillColorRGB(1,1,1);c.setFont('Helvetica-Bold',18);c.drawString(42,h-48,name)
    c.setFont('Helvetica',10);c.drawString(42,h-72,'Cotización de suministro de equipos comerciales')
    c.setFillColor(HexColor('#173958'));c.setFont('Helvetica-Bold',10);c.drawString(42,h-135,'Proveedor: '+name)
    c.setFont('Helvetica',9);c.drawString(42,h-153,'Cotización: '+code);c.drawString(370,h-153,'Fecha: 11/11/2026')
    c.drawString(42,h-173,'Cliente: Departamento de Compras · Proyecto de prueba')
    c.setFillColor(HexColor('#e8f2fd'));c.rect(40,h-226,w-80,30,fill=1,stroke=0)
    c.setFillColor(HexColor('#174376'));c.setFont('Helvetica-Bold',9)
    y=h-216
    for x,t in [(45,'Descripción'),(338,'Cantidad'),(410,'Precio unitario'),(509,'Total')]:c.drawString(x,y,t)
    c.setFillColor(HexColor('#28354b'));c.setFont('Helvetica',9)
    y-=33
    for d,q,p in items:
        c.drawString(45,y,d);c.drawString(346,y,str(q));c.drawRightString(476,y,f'{p:,.2f}');c.drawRightString(562,y,f'{q*p:,.2f}');
        c.setStrokeColor(HexColor('#e7ebf0'));c.line(41,y-13,w-40,y-13);y-=31
    y-=15;c.setFont('Helvetica-Bold',9);c.drawRightString(562,y,'Subtotal RD$ '+f'{sum(q*p for _,q,p in items):,.2f}')
    y-=38;c.setFillColor(HexColor('#1c528a'));c.setFont('Helvetica-Bold',12);c.drawString(42,y,'CONDICIONES COMERCIALES');y-=21
    c.setFillColor(HexColor('#273b50'));c.setFont('Helvetica',9)
    for term,value in terms:
        c.drawString(45,y,term+': '+value);y-=19
    c.setFillColor(HexColor('#866c33'));c.setFont('Helvetica-Oblique',8);c.drawString(42,39,'DOCUMENTO FICTICIO PARA PRUEBAS DE SOFTWARE · NO CONSTITUYE UNA OFERTA REAL')
    c.save()
    print(ROOT/fname)
