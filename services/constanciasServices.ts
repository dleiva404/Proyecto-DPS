import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import QRCode from "qrcode";

const BASE_URL = "https://tuapp.web.app";

export interface DatosConstancia {
  codigo: string;
  nombre: string;
  apellido: string;
  cargo: string;
  area: string;
  empresa: string;
  tipo: string; // "Constancia Salarial" | "Constancia Laboral"
  dirigidaA: string;
  salario: string;
  fechaPeticion: string;
  fechaContratacion?: string; // formato "YYYY-MM-DD"
  aprobadoPor?: string;
}

export interface ConstanciaGenerada {
  pdfBytes: Uint8Array;
  verificacionId: string;
  urlVerificacion: string;
}

function dataUrlABytes(dataUrl: string): Uint8Array {
  const base64 = dataUrl.split(",")[1];
  const binario = atob(base64);
  const bytes = new Uint8Array(binario.length);
  for (let i = 0; i < binario.length; i++) {
    bytes[i] = binario.charCodeAt(i);
  }
  return bytes;
}

export function calcularTiempoServicio(
  fechaContratacion: string,
  hoy: Date = new Date(),
): string {
  const inicio = new Date(fechaContratacion + "T00:00:00");

  let años = hoy.getFullYear() - inicio.getFullYear();
  let meses = hoy.getMonth() - inicio.getMonth();
  const dias = hoy.getDate() - inicio.getDate();

  if (dias < 0) meses -= 1;
  if (meses < 0) {
    años -= 1;
    meses += 12;
  }

  const partes: string[] = [];
  if (años > 0) partes.push(`${años} ${años === 1 ? "año" : "años"}`);
  if (meses > 0) partes.push(`${meses} ${meses === 1 ? "mes" : "meses"}`);

  return partes.length > 0 ? partes.join(" y ") : "menos de un mes";
}

function formatearFecha(fechaISO: string): string {
  const meses = [
    "enero",
    "febrero",
    "marzo",
    "abril",
    "mayo",
    "junio",
    "julio",
    "agosto",
    "septiembre",
    "octubre",
    "noviembre",
    "diciembre",
  ];
  const fecha = new Date(fechaISO + "T00:00:00");
  return `${String(fecha.getDate()).padStart(2, "0")} de ${meses[fecha.getMonth()]} de ${fecha.getFullYear()}`;
}

function envolverTexto(texto: string, maxCaracteres: number): string[] {
  const palabras = texto.split(" ");
  let linea = "";
  const lineas: string[] = [];
  for (const palabra of palabras) {
    const prueba = linea ? `${linea} ${palabra}` : palabra;
    if (prueba.length > maxCaracteres) {
      lineas.push(linea);
      linea = palabra;
    } else {
      linea = prueba;
    }
  }
  if (linea) lineas.push(linea);
  return lineas;
}

export async function generarConstanciaPDF(
  datos: DatosConstancia,
): Promise<ConstanciaGenerada> {
  const verificacionId = crypto.randomUUID();
  const urlVerificacion = `${BASE_URL}/verificar/${verificacionId}`;

  // 1. Generar el QR
  const qrDataUrl = await QRCode.toDataURL(urlVerificacion, {
    width: 240,
    margin: 1,
  });
  const qrBytes = dataUrlABytes(qrDataUrl);

  // 2. Armar el PDF
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([612, 792]);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const azulOscuro = rgb(0.11, 0.15, 0.22);
  const gris = rgb(0.4, 0.42, 0.45);
  const negro = rgb(0.1, 0.1, 0.1);

  const margenIzq = 60;
  const anchoPagina = 612;
  let y = 730;

  page.drawText("GRUPO CALMA", {
    x: margenIzq,
    y,
    size: 16,
    font: fontBold,
    color: azulOscuro,
  });
  y -= 16;
  page.drawText("Departamento de Recursos Humanos", {
    x: margenIzq,
    y,
    size: 9,
    font: fontRegular,
    color: gris,
  });
  y -= 12;
  page.drawText(datos.empresa, {
    x: margenIzq,
    y,
    size: 9,
    font: fontRegular,
    color: gris,
  });

  try {
    const logoBytes = await obtenerLogoBytes();
    const logoImage = await pdfDoc.embedPng(logoBytes);
    const logoAncho = 55;
    const logoAlto = (logoImage.height / logoImage.width) * logoAncho;
    page.drawImage(logoImage, {
      x: anchoPagina - margenIzq - logoAncho,
      y: 730 - logoAlto + 12,
      width: logoAncho,
      height: logoAlto,
    });
  } catch {}

  y -= 30;
  page.drawLine({
    start: { x: margenIzq, y },
    end: { x: anchoPagina - margenIzq, y },
    thickness: 1,
    color: rgb(0.85, 0.85, 0.85),
  });

  y -= 30;
  page.drawText(`Fecha: ${datos.fechaPeticion}`, {
    x: margenIzq,
    y,
    size: 10,
    font: fontRegular,
    color: gris,
  });

  y -= 35;
  page.drawText("A quien corresponda", {
    x: margenIzq,
    y,
    size: 13,
    font: fontBold,
    color: negro,
  });

  y -= 30;
  const parrafo =
    `Por este medio se hace constar que el(la) señor(a) ${datos.nombre} ${datos.apellido}, ` +
    `identificado(a) con código de empleado ${datos.codigo}, labora en ${datos.empresa} ` +
    `desempeñando el cargo de ${datos.cargo} en el área de ${datos.area}.`;

  for (const l of envolverTexto(parrafo, 80)) {
    page.drawText(l, {
      x: margenIzq,
      y,
      size: 11,
      font: fontRegular,
      color: negro,
    });
    y -= 17;
  }

  if (
    datos.tipo.toLowerCase().includes("salario") ||
    datos.tipo.toLowerCase().includes("salarial")
  ) {
    y -= 8;
    for (const l of envolverTexto(
      `Devengando un salario de ${datos.salario} + comisiones.`,
      80,
    )) {
      page.drawText(l, {
        x: margenIzq,
        y,
        size: 11,
        font: fontRegular,
        color: negro,
      });
      y -= 17;
    }
  } else if (datos.fechaContratacion) {
    const tiempoServicio = calcularTiempoServicio(datos.fechaContratacion);
    y -= 8;
    for (const l of envolverTexto(
      `A la fecha, cuenta con ${tiempoServicio} de laborar en la empresa, ` +
        `habiendo ingresado el ${formatearFecha(datos.fechaContratacion)}.`,
      80,
    )) {
      page.drawText(l, {
        x: margenIzq,
        y,
        size: 11,
        font: fontRegular,
        color: negro,
      });
      y -= 17;
    }
  }

  if (datos.dirigidaA) {
    y -= 8;
    for (const l of envolverTexto(
      `La presente constancia se extiende a solicitud del interesado, para ser presentada ante ${datos.dirigidaA}.`,
      80,
    )) {
      page.drawText(l, {
        x: margenIzq,
        y,
        size: 11,
        font: fontRegular,
        color: negro,
      });
      y -= 17;
    }
  }

  y -= 8;
  for (const l of envolverTexto(
    "Para cualquier aclaración adicional, puede comunicarse con nuestro departamento de Recursos Humanos.",
    80,
  )) {
    page.drawText(l, {
      x: margenIzq,
      y,
      size: 11,
      font: fontRegular,
      color: negro,
    });
    y -= 17;
  }

  y -= 30;
  page.drawText("Atentamente,", {
    x: margenIzq,
    y,
    size: 11,
    font: fontRegular,
    color: negro,
  });

  const qrImage = await pdfDoc.embedPng(qrBytes);
  const qrTamano = 85;
  const qrY = y - qrTamano - 15;
  page.drawImage(qrImage, {
    x: margenIzq,
    y: qrY,
    width: qrTamano,
    height: qrTamano,
  });

  let yFirma = qrY - 18;
  const autorizadoPor = datos.aprobadoPor || "Recursos Humanos — Grupo Calma";
  page.drawText(autorizadoPor, {
    x: margenIzq,
    y: yFirma,
    size: 10,
    font: fontBold,
    color: negro,
  });
  yFirma -= 14;
  page.drawText("Recursos Humanos", {
    x: margenIzq,
    y: yFirma,
    size: 9,
    font: fontRegular,
    color: gris,
  });
  yFirma -= 12;
  page.drawText(datos.empresa, {
    x: margenIzq,
    y: yFirma,
    size: 9,
    font: fontRegular,
    color: gris,
  });

  yFirma -= 20;
  page.drawText(
    "Escanee el código QR para verificar la autenticidad de este documento.",
    {
      x: margenIzq,
      y: yFirma,
      size: 8,
      font: fontRegular,
      color: gris,
    },
  );

  const pdfBytes = await pdfDoc.save();

  return { pdfBytes, verificacionId, urlVerificacion };
}

async function obtenerLogoBytes(): Promise<Uint8Array> {
  const respuesta = await fetch("/LogoGC.png");
  const buffer = await respuesta.arrayBuffer();
  return new Uint8Array(buffer);
}

export function descargarPDF(pdfBytes: Uint8Array, nombreArchivo: string) {
  const blob = new Blob([pdfBytes] as BlobPart[], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const enlace = document.createElement("a");
  enlace.href = url;
  enlace.download = nombreArchivo;
  enlace.click();
  URL.revokeObjectURL(url);
}
