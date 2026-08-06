import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import * as MailComposer from 'expo-mail-composer';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

import { fotoABase64 } from '@/lib/fotos';
import { ETIQUETAS_DESCANSO, PeriodoRegistro, TIPOS_COMIDA } from '@/lib/types';

const EMAIL_NUTRICIONISTA = 'nutricion.olaverry@gmail.com';

function escapeHtml(texto: string): string {
  return texto
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

async function construirHtml(periodo: PeriodoRegistro): Promise<string> {
  const bloquesDias = await Promise.all(
    periodo.dias.map(async (dia) => {
      const fechaLegible = format(parseISO(dia.fecha), "EEEE d 'de' MMMM", { locale: es });

      const bloquesComida = await Promise.all(
        TIPOS_COMIDA.map(async ({ tipo, etiqueta }) => {
          const comida = dia.comidas[tipo];
          const nota = comida.nota ? escapeHtml(comida.nota) : '<em>Sin anotación</em>';
          const horario = comida.horario ? ` · ${escapeHtml(comida.horario)}` : '';
          let imgHtml = '';
          if (comida.fotoUri) {
            const base64 = await fotoABase64(comida.fotoUri);
            if (base64) {
              imgHtml = `<img class="foto" src="data:image/jpeg;base64,${base64}" />`;
            }
          }
          return `
            <div class="comida">
              <div class="comida-titulo">${etiqueta}${horario}</div>
              <div class="comida-nota">${nota}</div>
              ${imgHtml}
            </div>`;
        })
      );

      const ent = dia.entrenamiento;
      const entrenamientoHtml = ent.entreno
        ? `
          <div class="entrenamiento">
            <div class="entrenamiento-titulo">Entrenamiento</div>
            <table>
              <tr><td>Actividad</td><td>${ent.tipoActividad ? escapeHtml(ent.tipoActividad) : '-'}</td></tr>
              <tr><td>Duración</td><td>${ent.duracionMin ? `${escapeHtml(ent.duracionMin)} min` : '-'}</td></tr>
              <tr><td>Tipo de recuperación</td><td>${ent.tipoRecuperacion ? escapeHtml(ent.tipoRecuperacion) : '-'}</td></tr>
              <tr><td>Mejoría en el rendimiento</td><td>${ent.mejoraRendimiento ? escapeHtml(ent.mejoraRendimiento) : '-'}</td></tr>
              <tr><td>Calidad del descanso</td><td>${ent.calidadDescanso ? escapeHtml(ETIQUETAS_DESCANSO[ent.calidadDescanso]) : '-'}</td></tr>
              <tr><td>Notas</td><td>${ent.notas ? escapeHtml(ent.notas) : '-'}</td></tr>
            </table>
          </div>`
        : `<div class="entrenamiento"><div class="entrenamiento-titulo">Entrenamiento</div><p><em>No entrenó este día</em></p></div>`;

      return `
        <section class="dia">
          <h2>${fechaLegible.charAt(0).toUpperCase() + fechaLegible.slice(1)}</h2>
          ${bloquesComida.join('')}
          ${entrenamientoHtml}
        </section>`;
    })
  );

  return `
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          body { font-family: -apple-system, Roboto, sans-serif; color: #1a1a1a; padding: 24px; }
          h1 { font-size: 22px; margin-bottom: 4px; }
          .subtitulo { color: #555; margin-bottom: 24px; }
          .dia { margin-bottom: 32px; page-break-inside: avoid; }
          .dia h2 { font-size: 18px; border-bottom: 2px solid #2E9E5B; padding-bottom: 4px; }
          .comida { margin: 10px 0; padding: 8px 12px; background: #f5f6f8; border-radius: 8px; }
          .comida-titulo { font-weight: bold; margin-bottom: 4px; }
          .comida-nota { font-size: 13px; }
          .foto { max-width: 260px; max-height: 260px; margin-top: 8px; border-radius: 6px; }
          .entrenamiento { margin-top: 12px; padding: 8px 12px; background: #eef7f0; border-radius: 8px; }
          .entrenamiento-titulo { font-weight: bold; margin-bottom: 4px; }
          table { width: 100%; font-size: 13px; border-collapse: collapse; }
          td { padding: 2px 0; vertical-align: top; }
          td:first-child { width: 45%; color: #555; }
        </style>
      </head>
      <body>
        <h1>Registro de 3 días</h1>
        <div class="subtitulo">Generado el ${format(new Date(), "d 'de' MMMM 'de' yyyy, HH:mm", { locale: es })}</div>
        ${bloquesDias.join('')}
      </body>
    </html>`;
}

export async function exportarYCompartirPeriodo(periodo: PeriodoRegistro): Promise<void> {
  const html = await construirHtml(periodo);
  const { uri } = await Print.printToFileAsync({ html });

  const rangoFechas = periodo.dias.length
    ? `${format(parseISO(periodo.dias[0].fecha), 'd/M', { locale: es })} al ${format(
        parseISO(periodo.dias[periodo.dias.length - 1].fecha),
        'd/M',
        { locale: es }
      )}`
    : '';

  const mailDisponible = await MailComposer.isAvailableAsync();
  if (mailDisponible) {
    await MailComposer.composeAsync({
      recipients: [EMAIL_NUTRICIONISTA],
      subject: `Registro de 3 días (${rangoFechas})`,
      body: 'Hola Pilar, te comparto el registro de las comidas y entrenamientos de estos 3 días. ¡Gracias!',
      attachments: [uri],
    });
    return;
  }

  const disponible = await Sharing.isAvailableAsync();
  if (!disponible) {
    throw new Error('No hay ninguna app disponible para enviar el registro');
  }
  await Sharing.shareAsync(uri, {
    mimeType: 'application/pdf',
    dialogTitle: 'Compartir registro con tu nutricionista',
  });
}
