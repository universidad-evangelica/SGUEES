import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';

import { AcaProspectoSeRespuestaRepository } from './aca-prospecto-se-respuesta.repository';
import { AcaProspectoSeRespuesta } from './models/aca-prospecto-se-respuesta';

@Injectable({
    providedIn: 'root',
})
export class AcaProspectoSeRespuestaService {
    constructor(private repo: AcaProspectoSeRespuestaRepository) {}

    // Qué hace: preguntas de la versión con la que el prospecto llenó el estudio, con su respuesta.
    // Cómo lo hace: la API devuelve todas las preguntas en ORDEN, respondidas o no.
    getRespuestasPorProspecto(CORR_PROSPECTO: number): Observable<IResult> {
        let xWhere: IParam[] = [{ Parameter: 'CORR_PROSPECTO', Value: CORR_PROSPECTO }];
        return this.repo.getAll(xWhere);
    }

    getColumns(): any {
        return [
            { dataField: 'ORDEN', caption: 'Orden', width: 80 },
            { dataField: 'ENUNCIADO', caption: 'Pregunta', width: 360 },
            { dataField: 'TIPO_PREGUNTA_NOMBRE', caption: 'Tipo', width: 130 },
            {
                caption: 'Respuesta',
                width: 260,
                calculateCellValue: (row: any) => this.textoRespuesta(row),
            },
        ];
    }

    getSummary(): any {
        return {
            totalItems: [
                {
                    column: 'CORR_PREGUNTA',
                    summaryType: 'count',
                    valueFormat: '#,##0',
                    displayFormat: 'Cant: {0}',
                },
            ],
        };
    }

    // Qué hace: agrupación visual de las preguntas del estudio socioeconómico (solo presentación).
    // Cómo lo hace: cada subsección lista los códigos de sus preguntas y su ancho (de 8 columnas).
    //               La BD solo guarda preguntas y versiones; si una versión agrega una pregunta,
    //               se ubica aquí. Mientras no se agregue, aparece en "Otras preguntas".
    getSecciones(): any[] {
        return [
            {
                titulo: 'Estudios previos',
                subsecciones: [
                    { titulo: 'Centro educativo', preguntas: [{ codigo: 'CENTRO_EDUCATIVO', ancho: 4 }] },
                    {
                        titulo: 'Bachillerato',
                        preguntas: [
                            { codigo: 'BACH_NOMBRE', ancho: 2 },
                            { codigo: 'BACH_OPCION', ancho: 2 },
                            { codigo: 'BACH_CUOTA', ancho: 2 },
                            { codigo: 'BACH_QUIEN_PAGO', ancho: 2 },
                        ],
                    },
                    {
                        titulo: 'Universidad',
                        preguntas: [
                            { codigo: 'UNI_TIENE', ancho: 8 },
                            { codigo: 'UNI_NOMBRE', ancho: 2 },
                            { codigo: 'UNI_CARRERA_CICLO', ancho: 2 },
                            { codigo: 'UNI_CUOTA', ancho: 2 },
                            { codigo: 'UNI_QUIEN_PAGO', ancho: 2 },
                        ],
                    },
                ],
            },
            {
                titulo: 'Ingresos mensuales',
                subsecciones: [
                    { titulo: 'Estudiante', preguntas: this.getPreguntasIngreso('EST') },
                    { titulo: 'Madre', preguntas: this.getPreguntasIngreso('MAD') },
                    { titulo: 'Padre', preguntas: this.getPreguntasIngreso('PAD') },
                    { titulo: 'Otras personas', preguntas: this.getPreguntasIngreso('OTR') },
                    { titulo: 'Remesas', preguntas: this.getPreguntasIngreso('REM') },
                ],
            },
            {
                titulo: 'Egresos mensuales',
                subsecciones: [
                    { titulo: 'Alimentación', preguntas: this.getPreguntasEgreso('ALIM') },
                    { titulo: 'Casa o alquiler', preguntas: this.getPreguntasEgreso('CASA') },
                    { titulo: 'Servicios básicos', preguntas: this.getPreguntasEgreso('SERV') },
                    { titulo: 'Educación familiar', preguntas: this.getPreguntasEgreso('EDUC') },
                    { titulo: 'Transporte', preguntas: this.getPreguntasEgreso('TRAN') },
                    { titulo: 'Salud', preguntas: this.getPreguntasEgreso('SALU') },
                ],
            },
        ];
    }

    // Qué hace: campos del formulario "Preguntas" agrupados según getSecciones().
    // Cómo lo hace: solo pinta las preguntas que trae la versión del prospecto; omite
    //               subsecciones y secciones sin preguntas; las que no están en la
    //               configuración van al final en "Otras preguntas", en su ORDEN.
    getItems(respuestas: AcaProspectoSeRespuesta[]): any {
        const porCodigo = new Map<string, AcaProspectoSeRespuesta>();
        for (const r of respuestas ?? []) {
            porCodigo.set(r.CODIGO_PREGUNTA, r);
        }

        const usadas = new Set<string>();
        const grupos: any[] = [];

        for (const seccion of this.getSecciones()) {
            const subgrupos: any[] = [];
            for (const subseccion of seccion.subsecciones) {
                const items: any[] = [];
                for (const pregunta of subseccion.preguntas) {
                    const respuesta = porCodigo.get(pregunta.codigo);
                    if (respuesta) {
                        usadas.add(pregunta.codigo);
                        items.push(this.getItemPregunta(respuesta, pregunta.ancho));
                    }
                }
                if (items.length) {
                    subgrupos.push({
                        itemType: 'group',
                        caption: subseccion.titulo,
                        colSpan: 8,
                        colCount: 8,
                        cssClass: 'aca-prospecto-subseccion',
                        items,
                    });
                }
            }
            if (subgrupos.length) {
                grupos.push({
                    itemType: 'group',
                    caption: seccion.titulo,
                    colSpan: 8,
                    colCount: 8,
                    cssClass: 'aca-prospecto-seccion',
                    items: subgrupos,
                });
            }
        }

        const otras = (respuestas ?? [])
            .filter((r) => !usadas.has(r.CODIGO_PREGUNTA))
            .map((r) => this.getItemPregunta(r));
        if (otras.length) {
            grupos.push({
                itemType: 'group',
                caption: 'Otras preguntas',
                colSpan: 8,
                colCount: 8,
                cssClass: 'aca-prospecto-seccion',
                items: otras,
            });
        }

        return grupos;
    }

    // Qué hace: objeto formData del formulario "Preguntas" ({ CODIGO_PREGUNTA: valor }).
    // Cómo lo hace: toma el valor según el tipo; null cuando no hay respuesta.
    getFormData(respuestas: AcaProspectoSeRespuesta[]): any {
        const data: any = {};
        for (const r of respuestas ?? []) {
            data[r.CODIGO_PREGUNTA] = this.valorRespuesta(r);
        }
        return data;
    }

    // Qué hace: fila de un ingreso (lugar de trabajo, bruto, descuentos, líquido) de 2 columnas cada uno.
    // Cómo lo hace: remesas no tiene lugar de trabajo; como no viene en la versión, no se pinta.
    private getPreguntasIngreso(persona: string): any[] {
        return [
            { codigo: `ING_${persona}_LUGAR`, ancho: 2 },
            { codigo: `ING_${persona}_BRUTO`, ancho: 2 },
            { codigo: `ING_${persona}_DESC`, ancho: 2 },
            { codigo: `ING_${persona}_LIQ`, ancho: 2 },
        ];
    }

    // Qué hace: fila de un egreso: monto (2 columnas) + detalle (6 columnas).
    private getPreguntasEgreso(rubro: string): any[] {
        return [
            { codigo: `EGR_${rubro}_MONTO`, ancho: 2 },
            { codigo: `EGR_${rubro}_DET`, ancho: 6 },
        ];
    }

    // Qué hace: campo de una pregunta según su tipo (texto, monto, número, sí/no, opción).
    // Cómo lo hace: usa el ancho de getSecciones() o, si la pregunta no está ahí, uno por tipo.
    //               Las opciones se muestran con su texto histórico (sin catálogo de opciones).
    private getItemPregunta(r: AcaProspectoSeRespuesta, ancho?: number): any {
        const base: any = {
            dataField: r.CODIGO_PREGUNTA,
            label: { text: r.ENUNCIADO },
            helpText: r.AYUDA || undefined,
        };

        switch (r.TIPO_PREGUNTA) {
            case 'MONTO':
                return {
                    ...base,
                    colSpan: ancho ?? 2,
                    editorType: 'dxNumberBox',
                    editorOptions: { readOnly: true, format: '#,##0.00', placeholder: 'Sin respuesta' },
                };
            case 'NUMERO':
                return {
                    ...base,
                    colSpan: ancho ?? 2,
                    editorType: 'dxNumberBox',
                    editorOptions: { readOnly: true, placeholder: 'Sin respuesta' },
                };
            case 'SI_NO':
                // Sin respuesta → valor null → casilla en estado indeterminado.
                return { ...base, colSpan: ancho ?? 2, editorType: 'dxCheckBox', editorOptions: { readOnly: true } };
            case 'OPCION_MULTIPLE':
                return {
                    ...base,
                    colSpan: ancho ?? 4,
                    editorType: 'dxTextArea',
                    editorOptions: { readOnly: true, placeholder: 'Sin respuesta', autoResizeEnabled: true },
                };
            default: // TEXTO, OPCION_UNICA
                return { ...base, colSpan: ancho ?? 4, editorOptions: { readOnly: true, placeholder: 'Sin respuesta' } };
        }
    }

    private valorRespuesta(r: AcaProspectoSeRespuesta): any {
        if (!r.TIENE_RESPUESTA) {
            return null;
        }
        switch (r.TIPO_PREGUNTA) {
            case 'MONTO':
            case 'NUMERO':
                return r.VALOR_NUMERO;
            case 'SI_NO':
                return r.VALOR_BIT;
            case 'OPCION_UNICA':
                return r.TEXTO_OPCION;
            case 'OPCION_MULTIPLE':
                return r.TEXTO_OPCIONES_MULTIPLES;
            default:
                return r.VALOR_TEXTO;
        }
    }

    private textoRespuesta(r: AcaProspectoSeRespuesta): string {
        const valor = this.valorRespuesta(r);
        if (valor === null || valor === undefined || valor === '') {
            return 'Sin respuesta';
        }
        if (r.TIPO_PREGUNTA === 'SI_NO') {
            return valor ? 'Sí' : 'No';
        }
        return String(valor);
    }
}
