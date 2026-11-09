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

    // Qué hace: guarda de una vez todas las respuestas del prospecto.
    // Cómo lo hace: arma una fila por pregunta con el valor del formulario en la columna que
    //               corresponde a su tipo; el API decide actualizar, insertar o borrar (vacío y
    //               monto 0 = sin respuesta, como en el portal).
    guardar(CORR_PROSPECTO: number, CORR_PROSPECTO_SOCIOECONOMICO: number, respuestas: AcaProspectoSeRespuesta[], formData: any): Observable<IResult> {
        const payload = {
            CORR_PROSPECTO,
            CORR_PROSPECTO_SOCIOECONOMICO,
            RESPUESTAS: (respuestas ?? []).map((r) => {
                const valor = formData?.[r.CODIGO_PREGUNTA];
                return {
                    CORR_PREGUNTA: r.CORR_PREGUNTA,
                    VALOR_TEXTO: this.esTexto(r) ? this.textoONull(valor) : null,
                    VALOR_NUMERO: this.esNumero(r) ? this.numeroONull(valor) : null,
                    VALOR_BIT: r.TIPO_PREGUNTA === 'SI_NO' ? (valor === true || valor === false ? valor : null) : null,
                    CORR_OPCION: r.TIPO_PREGUNTA === 'OPCION_UNICA' ? this.numeroONull(valor) : null,
                };
            }),
        };
        return this.repo.guardar(payload);
    }

    getColumns(): any {
        return [
            { dataField: 'ORDEN', caption: 'Orden', width: 80 },
            { dataField: 'NOMBRE_SECCION', caption: 'Sección', width: 180, minWidth: 120 },
            { dataField: 'ENUNCIADO', caption: 'Pregunta', width: 300, minWidth: 200 },
            { dataField: 'TIPO_PREGUNTA_NOMBRE', caption: 'Tipo', width: 130 },
            {
                caption: 'Respuesta',
                width: 220,
                minWidth: 140,
                calculateCellValue: (row: any) => this.textoRespuestaPublico(row),
            },
            { dataField: 'PUNTAJE_OBTENIDO', caption: 'Puntaje', width: 100, dataType: 'number', format: '#,##0.00' },
            { dataField: 'PORCENTAJE_APLICADO', caption: '%', width: 90, dataType: 'number', format: '#,##0.00' },
        ];
    }

    // Qué hace: texto legible de una respuesta (para chips / grilla, patrón becas).
    textoRespuestaPublico(r: AcaProspectoSeRespuesta): string {
        return this.textoRespuesta(r);
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
    //               opciones = banco ACA_SE_OPCION para las preguntas de opción única.
    // Qué hace: preguntas que solo aplican si otra pregunta Sí/No está en Sí.
    // Cómo lo hace: configuración de presentación, como getSecciones (la BD no guarda dependencias).
    //               Es la regla del portal: al responder "No" oculta y limpia las dependientes.
    getDependencias(): Record<string, string> {
        return {
            UNI_NOMBRE: 'UNI_TIENE',
            UNI_CARRERA_CICLO: 'UNI_TIENE',
            UNI_CUOTA: 'UNI_TIENE',
            UNI_QUIEN_PAGO: 'UNI_TIENE',
        };
    }

    // Qué hace: preguntas que dependen de la pregunta indicada (vacío si no gobierna a ninguna).
    getDependientes(codigo: string): string[] {
        const dependencias = this.getDependencias();
        return Object.keys(dependencias).filter((c) => dependencias[c] === codigo);
    }

    // Qué hace: formulario SE en un solo dx-form (grupos anidados).
    // Cómo lo hace: reutiliza getTabs() y aplana cada pestaña como grupo de sección.
    getItems(respuestas: AcaProspectoSeRespuesta[], opciones: any[] = [], formData: any = null): any {
        return this.getTabs(respuestas, opciones, formData).map((tab) => ({
            itemType: 'group',
            caption: tab.titulo,
            colSpan: 8,
            colCount: 8,
            cssClass: 'aca-prospecto-seccion',
            items: tab.items,
        }));
    }

    // Qué hace: subtabs del cuestionario con el NOMBRE_SECCION real de BD.
    // Cómo lo hace: agrupa por CORR_SECCION_SE / NOMBRE_SECCION (ORDEN_SECCION); dentro aplica
    //               los subgrupos de presentación del portal solo para las preguntas de esa sección.
    getTabs(
        respuestas: AcaProspectoSeRespuesta[],
        opciones: any[] = [],
        formData: any = null,
        aplicaCuotaMaxima = false
    ): { key: string; titulo: string; items: any[]; codigoSeccion?: string; tipoEvaluacion?: string }[] {
        const anchos = this.getMapaAnchos();
        const grupos = new Map<
            string,
            { key: string; titulo: string; orden: number; filas: AcaProspectoSeRespuesta[] }
        >();

        for (const r of respuestas ?? []) {
            const meta = this.resolverClaveSeccion(r);
            let grupo = grupos.get(meta.key);
            if (!grupo) {
                grupo = { key: meta.key, titulo: meta.titulo, orden: meta.orden, filas: [] };
                grupos.set(meta.key, grupo);
            }
            grupo.filas.push(r);
        }

        const tabs: { key: string; titulo: string; items: any[]; codigoSeccion?: string; tipoEvaluacion?: string }[] = [];
        for (const grupo of [...grupos.values()].sort((a, b) => a.orden - b.orden || a.titulo.localeCompare(b.titulo))) {
            // Qué hace: con cuota máxima oculta tabs RANGO_MONTO (ingresos/egresos), igual que ADMISIONES.
            const muestraGrupo = grupo.filas[0];
            if (aplicaCuotaMaxima && this.esSeccionRangoMonto(muestraGrupo)) {
                continue;
            }

            const porCodigo = new Map<string, AcaProspectoSeRespuesta>();
            for (const fila of grupo.filas) {
                porCodigo.set(fila.CODIGO_PREGUNTA, fila);
            }
            const usadas = new Set<string>();
            const itemsTab: any[] = [];

            // Subtítulos de presentación (Bachillerato, Estudiante, etc.) solo si hay preguntas de esta sección.
            for (const seccionUi of this.getSecciones()) {
                for (const subseccion of seccionUi.subsecciones) {
                    const items: any[] = [];
                    for (const pregunta of subseccion.preguntas) {
                        const respuesta = porCodigo.get(pregunta.codigo);
                        if (respuesta) {
                            usadas.add(pregunta.codigo);
                            items.push(this.getItemPregunta(respuesta, opciones, pregunta.ancho, formData, aplicaCuotaMaxima));
                        }
                    }
                    if (items.length) {
                        itemsTab.push({
                            itemType: 'group',
                            caption: subseccion.titulo,
                            colSpan: 8,
                            colCount: 8,
                            cssClass: 'aca-prospecto-subseccion',
                            items,
                        });
                    }
                }
            }

            const restantes = grupo.filas
                .filter((f) => !usadas.has(f.CODIGO_PREGUNTA))
                .sort((a, b) => (Number(a.ORDEN) || 0) - (Number(b.ORDEN) || 0))
                .map((f) => this.getItemPregunta(f, opciones, anchos.get(f.CODIGO_PREGUNTA), formData, aplicaCuotaMaxima));
            if (restantes.length) {
                if (itemsTab.length) {
                    itemsTab.push({
                        itemType: 'group',
                        caption: 'Otras preguntas',
                        colSpan: 8,
                        colCount: 8,
                        cssClass: 'aca-prospecto-subseccion',
                        items: restantes,
                    });
                } else {
                    itemsTab.push(...restantes);
                }
            }

            if (itemsTab.length) {
                const muestra = grupo.filas[0];
                tabs.push({
                    key: grupo.key,
                    titulo: grupo.titulo,
                    items: itemsTab,
                    codigoSeccion: (muestra?.CODIGO_SECCION || '').toUpperCase(),
                    tipoEvaluacion: (muestra?.TIPO_EVALUACION || '').toUpperCase(),
                });
            }
        }

        return tabs;
    }

    // Qué hace: clave y título de pestaña según la sección de BD de la pregunta.
    claveSeccion(r: AcaProspectoSeRespuesta): { key: string; titulo: string; orden: number } {
        return this.resolverClaveSeccion(r);
    }

    private resolverClaveSeccion(r: AcaProspectoSeRespuesta): { key: string; titulo: string; orden: number } {
        const nombre = (r.NOMBRE_SECCION && String(r.NOMBRE_SECCION).trim()) || '';
        if (r.CORR_SECCION_SE != null || nombre) {
            return {
                key: `S:${r.CORR_SECCION_SE ?? nombre}`,
                titulo: nombre || 'Sección',
                orden: Number(r.ORDEN_SECCION) || 999,
            };
        }

        const codigo = (r.CODIGO_PREGUNTA || '').toUpperCase();
        if (codigo === 'CENTRO_EDUCATIVO' || codigo.startsWith('BACH_') || codigo.startsWith('UNI_')) {
            return { key: 'F:ESTUDIOS', titulo: 'Centro Educativo / Estudios', orden: 1 };
        }
        if (codigo.startsWith('ING_')) {
            return { key: 'F:INGRESOS', titulo: 'Ingresos', orden: 2 };
        }
        if (codigo.startsWith('EGR_')) {
            return { key: 'F:EGRESOS', titulo: 'Egresos', orden: 3 };
        }
        return { key: 'F:OTROS', titulo: 'Otras preguntas', orden: 900 };
    }

    // Qué hace: true si la pregunta aplica en pantalla (dependencias del portal).
    esPreguntaVisible(r: AcaProspectoSeRespuesta, formData: any = null): boolean {
        const controlador = this.getDependencias()[r.CODIGO_PREGUNTA];
        return !controlador || formData?.[controlador] === true;
    }

    // Qué hace: vacío para borrador (null/'' ; montos 0 vacíos salvo cuota bachiller/universidad).
    esValorVacioBorrador(r: AcaProspectoSeRespuesta, formData: any = null): boolean {
        const codigo = (r.CODIGO_PREGUNTA || '').toUpperCase();
        const valor = formData?.[r.CODIGO_PREGUNTA];
        if (r.TIPO_PREGUNTA === 'SI_NO') {
            return valor !== true && valor !== false;
        }
        if (r.TIPO_PREGUNTA === 'MONTO' || r.TIPO_PREGUNTA === 'NUMERO') {
            if (valor === null || valor === undefined || valor === '') {
                return true;
            }
            if (codigo === 'BACH_CUOTA' || codigo === 'UNI_CUOTA') {
                return !Number.isFinite(Number(valor));
            }
            return !(Number(valor) > 0);
        }
        if (valor === null || valor === undefined) {
            return true;
        }
        return String(valor).trim() === '';
    }

    // Qué hace: cuenta obligatorios vacíos de una sección (aviso de borrador; no bloquea guardar).
    // Cómo lo hace: ES_REQUERIDO + visibles; con cuota máxima no cuenta secciones RANGO_MONTO.
    contarPendientesBorrador(
        filas: AcaProspectoSeRespuesta[],
        formData: any = null,
        aplicaCuotaMaxima = false
    ): number {
        let n = 0;
        for (const r of filas ?? []) {
            if (aplicaCuotaMaxima && this.esSeccionRangoMonto(r)) {
                continue;
            }
            if (!r.ES_REQUERIDO) {
                continue;
            }
            if (!this.esPreguntaVisible(r, formData)) {
                continue;
            }
            // Líquido calculado: no se captura a mano.
            if (/^ING_[A-Z]+_LIQ$/i.test(r.CODIGO_PREGUNTA || '')) {
                continue;
            }
            if (this.esValorVacioBorrador(r, formData)) {
                n += 1;
            }
        }
        return n;
    }

    // Qué hace: true si el campo debe ir con borde rojo (requerido vacío y visible).
    esCampoPendienteBorrador(
        r: AcaProspectoSeRespuesta,
        formData: any = null,
        aplicaCuotaMaxima = false
    ): boolean {
        if (!r?.ES_REQUERIDO) {
            return false;
        }
        if (aplicaCuotaMaxima && this.esSeccionRangoMonto(r)) {
            return false;
        }
        if (/^ING_[A-Z]+_LIQ$/i.test(r.CODIGO_PREGUNTA || '')) {
            return false;
        }
        if (!this.esPreguntaVisible(r, formData)) {
            return false;
        }
        return this.esValorVacioBorrador(r, formData);
    }

    esSeccionRangoMonto(r: AcaProspectoSeRespuesta): boolean {
        const tipo = (r.TIPO_EVALUACION || '').toUpperCase();
        const codigo = (r.CODIGO_SECCION || '').toUpperCase();
        return tipo === 'RANGO_MONTO' || codigo === 'INGRESOS' || codigo === 'EGRESOS';
    }

    // Qué hace: anchos de columna del layout del portal, indexados por código de pregunta.
    private getMapaAnchos(): Map<string, number> {
        const mapa = new Map<string, number>();
        for (const seccion of this.getSecciones()) {
            for (const sub of seccion.subsecciones) {
                for (const p of sub.preguntas) {
                    mapa.set(p.codigo, p.ancho);
                }
            }
        }
        return mapa;
    }

    // Qué hace: regla del portal para los ingresos: líquido = salario − descuentos, nunca negativo.
    // Cómo lo hace: si cambió un ING_*_BRUTO o ING_*_DESC recalcula *_LIQ (incluye 0); null solo si ambos vacíos.
    calcularLiquido(dataField: string, formData: any): { campo: string; valor: number | null } | null {
        const coincidencia = /^(ING_[A-Z]+)_(BRUTO|DESC)$/.exec(dataField ?? '');
        if (!coincidencia) {
            return null;
        }
        const prefijo = coincidencia[1];
        const brutoRaw = formData?.[`${prefijo}_BRUTO`];
        const descRaw = formData?.[`${prefijo}_DESC`];
        const sinDatos =
            (brutoRaw === null || brutoRaw === undefined || brutoRaw === '') &&
            (descRaw === null || descRaw === undefined || descRaw === '');
        if (sinDatos) {
            return { campo: `${prefijo}_LIQ`, valor: null };
        }
        const bruto = Number(brutoRaw);
        const descuentos = Number(descRaw);
        const b = Number.isFinite(bruto) ? bruto : 0;
        const d = Number.isFinite(descuentos) ? descuentos : 0;
        const liquido = Math.max(0, b - d);
        return { campo: `${prefijo}_LIQ`, valor: liquido };
    }

    // Qué hace: objeto formData del formulario "Preguntas" ({ CODIGO_PREGUNTA: valor }).
    // Cómo lo hace: toma el valor según el tipo; null cuando no hay respuesta.
    //               Opción única guarda CORR_OPCION (el combo muestra el texto).
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
    //               Borrador: sin validationRules (no bloquea Guardar); marca * y borde si falta.
    //               Opción única = combo con las opciones activas de esa pregunta; opción múltiple
    //               se muestra como texto y no se edita (V1 no la usa).
    private getItemPregunta(
        r: AcaProspectoSeRespuesta,
        opciones: any[],
        ancho?: number,
        formData: any = null,
        aplicaCuotaMaxima = false
    ): any {
        const visible = this.esPreguntaVisible(r, formData);
        const pendiente =
            visible &&
            !!r.ES_REQUERIDO &&
            !(aplicaCuotaMaxima && this.esSeccionRangoMonto(r)) &&
            !/^ING_[A-Z]+_LIQ$/i.test(r.CODIGO_PREGUNTA || '') &&
            this.esValorVacioBorrador(r, formData);
        const base: any = {
            dataField: r.CODIGO_PREGUNTA,
            label: { text: r.ES_REQUERIDO ? `${r.ENUNCIADO} *` : r.ENUNCIADO },
            helpText: r.AYUDA || undefined,
            visible,
            cssClass: pendiente ? 'aca-prospecto-req--vacio' : undefined,
        };

        // Líquido de ingresos: calculado (salario − descuentos), no se captura a mano, como en el portal.
        const esLiquido = /^ING_[A-Z]+_LIQ$/.test(r.CODIGO_PREGUNTA);

        switch (r.TIPO_PREGUNTA) {
            case 'MONTO':
                return {
                    ...base,
                    colSpan: ancho ?? 2,
                    editorType: 'dxNumberBox',
                    helpText: esLiquido ? 'Se calcula: salario − descuentos' : base.helpText,
                    editorOptions: { format: '#,##0.00', min: 0, placeholder: 'Sin respuesta', showClearButton: !esLiquido, readOnly: esLiquido },
                };
            case 'NUMERO':
                return {
                    ...base,
                    colSpan: ancho ?? 2,
                    editorType: 'dxNumberBox',
                    editorOptions: { min: 0, placeholder: 'Sin respuesta', showClearButton: true },
                };
            case 'SI_NO':
                return { ...base, colSpan: ancho ?? 2, editorType: 'dxCheckBox' };
            case 'OPCION_UNICA':
                return {
                    ...base,
                    colSpan: ancho ?? 4,
                    editorType: 'dxSelectBox',
                    editorOptions: {
                        items: (opciones ?? []).filter((o) => o.CORR_PREGUNTA === r.CORR_PREGUNTA),
                        valueExpr: 'CORR_OPCION',
                        displayExpr: 'TEXTO',
                        placeholder: 'Sin respuesta',
                        showClearButton: true,
                    },
                };
            case 'OPCION_MULTIPLE':
                return {
                    ...base,
                    colSpan: ancho ?? 4,
                    editorType: 'dxTextArea',
                    editorOptions: { readOnly: true, placeholder: 'Sin respuesta', autoResizeEnabled: true },
                };
            default: // TEXTO
                return { ...base, colSpan: ancho ?? 4, editorOptions: { placeholder: 'Sin respuesta', maxLength: 1000 } };
        }
    }

    private esTexto(r: AcaProspectoSeRespuesta): boolean {
        return r.TIPO_PREGUNTA === 'TEXTO';
    }

    private esNumero(r: AcaProspectoSeRespuesta): boolean {
        return r.TIPO_PREGUNTA === 'MONTO' || r.TIPO_PREGUNTA === 'NUMERO';
    }

    private textoONull(valor: any): string | null {
        const texto = valor === null || valor === undefined ? '' : String(valor).trim();
        return texto === '' ? null : texto;
    }

    private numeroONull(valor: any): number | null {
        if (valor === null || valor === undefined || valor === '') {
            return null;
        }
        const numero = Number(valor);
        return Number.isFinite(numero) ? numero : null;
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
                return r.CORR_OPCION;
            case 'OPCION_MULTIPLE':
                return r.TEXTO_OPCIONES_MULTIPLES;
            default:
                return r.VALOR_TEXTO;
        }
    }

    private textoRespuesta(r: AcaProspectoSeRespuesta): string {
        if (!r.TIENE_RESPUESTA) {
            return 'Sin respuesta';
        }
        if (r.TIPO_PREGUNTA === 'OPCION_UNICA') {
            return r.TEXTO_OPCION || 'Sin respuesta';
        }
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
