import QRCode from "qrcode";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { File, Paths } from "expo-file-system";
import { Platform } from "react-native";

const MESES = [
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

function fechaLarga(texto) {
  if (!texto) return "";
  const [anio, mes, dia] = texto.split("-");
  return `${Number(dia)} de ${MESES[Number(mes) - 1]} de ${anio}`;
}

function limpiar(texto) {
  return String(texto ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function textoQR(c) {
  return [
    `CONSTANCIA VERIFICADA - ${(c.empresa || "Grupo Calma").toUpperCase()}`,
    `Código: ${c.codigo}`,
    `Empleado: ${c.empleado}`,
    `Tipo: ${c.tipo}`,
    `Autorizado por: ${c.autorizadoPor} (${c.autorizadoRol || "RRHH"})`,
    `Fecha de emisión: ${fechaLarga(c.fechaEmision)}`,
  ].join("\n");
}

async function armarHtml(c) {
  const empresa = limpiar(c.empresa || "Grupo Calma").toUpperCase();
  const qrSvg = await QRCode.toString(textoQR(c), {
    type: "svg",
    margin: 1,
    width: 150,
  });
  const esSalarial = c.tipo.toLowerCase().includes("salarial");

  return `
<html>
<head>
<meta charset="utf-8" />
<style>
  body { font-family: Helvetica, Arial, sans-serif; color: #0f172a; padding: 48px 56px; }
  .encabezado { border-bottom: 3px solid #1e3a8a; padding-bottom: 12px; display: flex; justify-content: space-between; align-items: flex-end; }
  .empresa { font-size: 28px; font-weight: bold; color: #1e3a8a; letter-spacing: 2px; }
  .sub { font-size: 12px; color: #64748b; }
  h1 { text-align: center; font-size: 20px; letter-spacing: 3px; margin: 40px 0 28px; }
  p { font-size: 15px; line-height: 1.8; text-align: justify; }
  .pie { margin-top: 56px; text-align: center; }
  .qr svg { width: 150px; height: 150px; }
  .nota { font-size: 12px; color: #64748b; margin-top: 8px; }
</style>
</head>
<body>
  <div class="encabezado">
    <div>
            <div class="empresa">${empresa}</div>
      <div class="sub">Grupo Calma · Recursos Humanos</div>
    </div>
  </div>

  <h1>${limpiar(c.tipo).toUpperCase()}</h1>

  <p>Por medio de la presente se hace constar que <b>${limpiar(c.empleado)}</b>
    labora en <b>${empresa}</b> desde el ${fechaLarga(c.fechaIngreso)}, con una
  antigüedad de <b>${limpiar(c.antiguedad)}</b>${
    c.cargo ? `, desempeñando el cargo de <b>${limpiar(c.cargo)}</b>` : ""
  }${
    c.departamento ? ` en el departamento de ${limpiar(c.departamento)}` : ""
  }.${
    esSalarial
      ? ` Devenga un salario mensual de <b>$${Number(c.salario).toFixed(2)}</b>.`
      : ""
  }</p>

  <p>Se extiende la presente a solicitud del interesado${
    c.destinatario ? `, dirigida a <b>${limpiar(c.destinatario)}</b>` : ""
  }, para los usos que estime convenientes.</p>

  <div class="pie">
    <div class="qr">${qrSvg}</div>
    <div class="nota">Escanee el código QR para verificar la autenticidad de esta constancia.</div>
  </div>
</body>
</html>`;
}

// Genera el PDF y abre el menú del celular para guardarlo o compartirlo
export async function descargarConstanciaPdf(constancia) {
  const html = await armarHtml(constancia);

  if (Platform.OS === "web") {
    await Print.printAsync({ html });
    return;
  }

  const { base64 } = await Print.printToFileAsync({ html, base64: true });
  const archivo = new File(Paths.cache, `constancia-${constancia.codigo}.pdf`);
  archivo.create({ overwrite: true });
  archivo.write(base64, { encoding: "base64" });
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(archivo.uri, {
      mimeType: "application/pdf",
      UTI: "com.adobe.pdf",
      dialogTitle: "Guardar constancia",
    });
  } else {
    throw new Error("Este dispositivo no permite guardar archivos.");
  }
}
