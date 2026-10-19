import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';

import { AcaProspectoRepository } from './aca-prospecto.repository';

@Injectable({
    providedIn: 'root',
})
export class AcaProspectoService {
    constructor(private repo: AcaProspectoRepository) {}

    // Qué hace: prospectos de nuevo ingreso de todos los ciclos.
    // Cómo lo hace: no manda año ni período; el ciclo queda como columna de la grilla.
    getAll(): Observable<IResult> {
        return this.repo.getAll([]);
    }

    // Qué hace: pregunta si este usuario puede aprobar el prospecto abierto.
    getPuedeAprobar(CORR_PROSPECTO: number): Observable<IResult> {
        const xWhere: IParam[] = [{ Parameter: 'CORR_PROSPECTO', Value: CORR_PROSPECTO }];
        return this.repo.getPuedeAprobar(xWhere);
    }

    // Qué hace: envía la aprobación con el comentario de la bitácora.
    aprobar(CORR_PROSPECTO: number, OBSERVACION: string): Observable<IResult> {
        return this.repo.aprobar({ CORR_PROSPECTO, OBSERVACION });
    }

    // Qué hace: envía el rechazo con el comentario de la bitácora.
    rechazar(CORR_PROSPECTO: number, OBSERVACION: string): Observable<IResult> {
        return this.repo.rechazar({ CORR_PROSPECTO, OBSERVACION });
    }

    // Qué hace: revierte la aprobación y deja la solicitud Ingresada.
    revertir(CORR_PROSPECTO: number, OBSERVACION: string): Observable<IResult> {
        return this.repo.revertir({ CORR_PROSPECTO, OBSERVACION });
    }

    // Qué hace: manda un borrador al flujo de nuevo ingreso.
    enviar(CORR_PROSPECTO: number, OBSERVACION: string): Observable<IResult> {
        return this.repo.enviar({ CORR_PROSPECTO, OBSERVACION });
    }

    getBorradores(): Observable<IResult> {
        return this.repo.getBorradores([]);
    }

    get(param: any): Observable<IResult> {
        let xWhere: IParam[] = [{ Parameter: 'CORR_PROSPECTO', Value: param.CORR_PROSPECTO }];
        return this.repo.get(xWhere);
    }

    // Qué hace: actualiza los campos editables del encabezado (forma de ingreso, financia estudios y
    //           la carrera con su modalidad).
    // Cómo lo hace: envía solo lo que el ERP edita; la PK va en el query. Carrera y modalidad no son
    //               columnas de ACA_PROSPECTO: con ellas el API resuelve el plan académico y el
    //               período, igual que el cambio de carrera del portal.
    update(model: any): Observable<IResult> {
        let xWhere: IParam[] = [{ Parameter: 'CORR_PROSPECTO', Value: model.CORR_PROSPECTO }];
        const payload = {
            CORR_PROSPECTO: model.CORR_PROSPECTO,
            FORMA_INGRESO: model.FORMA_INGRESO,
            FINANCIA_ESTUDIOS: model.FINANCIA_ESTUDIOS,
            ANIO: model.ANIO,
            NUMERO_PERIODO: model.NUMERO_PERIODO,
            CORR_CARRERA: model.CORR_CARRERA,
            CORR_MODALIDAD: model.CORR_MODALIDAD,
        };
        return this.repo.update(payload, xWhere);
    }

    // Qué hace: carreras que se pueden elegir en un ciclo (el que está en pantalla, aún sin guardar).
    getCarrerasDelCiclo(CORR_PROSPECTO: number, ANIO: number, NUMERO_PERIODO: number): Observable<IResult> {
        let xWhere: IParam[] = [
            { Parameter: 'CORR_PROSPECTO', Value: CORR_PROSPECTO },
            { Parameter: 'ANIO', Value: ANIO },
            { Parameter: 'NUMERO_PERIODO', Value: NUMERO_PERIODO },
        ];
        return this.repo.getCarreras(xWhere);
    }

    // Qué hace: ciclos a los que se puede mover el prospecto, más el suyo actual.
    getCiclosCambio(CORR_PROSPECTO: number): Observable<IResult> {
        let xWhere: IParam[] = [{ Parameter: 'CORR_PROSPECTO', Value: CORR_PROSPECTO }];
        return this.repo.getCiclos(xWhere);
    }

    // Qué hace: qué pasará al guardar el cambio de ciclo/carrera (beca a clonar, reapertura), sin guardar.
    validarCambio(model: any): Observable<IResult> {
        let xWhere: IParam[] = [
            { Parameter: 'CORR_PROSPECTO', Value: model.CORR_PROSPECTO },
            { Parameter: 'ANIO', Value: model.ANIO },
            { Parameter: 'NUMERO_PERIODO', Value: model.NUMERO_PERIODO },
            { Parameter: 'CORR_CARRERA', Value: model.CORR_CARRERA },
            { Parameter: 'CORR_MODALIDAD', Value: model.CORR_MODALIDAD },
        ];
        return this.repo.validarCambio(xWhere);
    }

    // Qué hace: modalidades con plan vigente de la carrera elegida.
    getModalidadesDeCarrera(CORR_CARRERA: number): Observable<IResult> {
        let xWhere: IParam[] = [{ Parameter: 'CORR_CARRERA', Value: CORR_CARRERA }];
        return this.repo.getModalidades(xWhere);
    }

    // Qué hace: texto del estado de la solicitud de nuevo ingreso.
    // Cómo lo hace: Ingresado (38) se muestra como Pendiente nuevo ingreso.
    //               Aprobado (39) y Rechazada (46) usan su nombre.
    textoEstadoSolicitud(row: any): string {
        const estado = Number(row?.CORR_ESTADO);
        if (estado === 38) {
            return 'Pendiente nuevo ingreso';
        }
        if (estado === 39) {
            return 'Aprobado';
        }
        if (estado === 46) {
            return 'Rechazada';
        }
        if (!estado && (row?.ESTADO === 'P' || row?.ESTADO === 'p')) {
            return 'Borrador';
        }
        return row?.NOMBRE_ESTADO || '';
    }

    // Qué hace: clase del badge según el estado del flujo 104.
    claseEstadoSolicitud(corrEstado: number): string {
        if (Number(corrEstado) === 38) {
            return 'aca-prospecto-badge--pendiente';
        }
        if (Number(corrEstado) === 39) {
            return 'aca-prospecto-badge--aprobado';
        }
        if (Number(corrEstado) === 46) {
            return 'aca-prospecto-badge--rechazada';
        }
        return 'aca-prospecto-badge--default';
    }

    // Qué hace: la solicitud aprobada ya no avisa el cierre de inscripción.
    // Cómo lo hace: el estado 39 cierra el flujo, así que Vence y el plazo dejan de mostrarse.
    solicitudAprobada(row: any): boolean {
        return Number(row?.CORR_ESTADO) === 39;
    }

    // Qué hace: texto de la columna Vence según los días que faltan para cerrar la inscripción.
    // Cómo lo hace: más de 15 días, de 6 a 15, 5 o menos, o vencido. La fecha es FECHA_FIN_INSCRIPCION del ciclo.
    //               Si ya está aprobada, no hay aviso.
    textoVence(dias: number | null | undefined): string {
        if (dias === null || dias === undefined || Number.isNaN(Number(dias))) {
            return '—';
        }
        const n = Number(dias);
        if (n < 0) {
            const cantidad = Math.abs(n);
            return cantidad === 1 ? 'Vencido hace 1 día' : `Vencido hace ${cantidad} días`;
        }
        if (n === 0) {
            return 'Vence hoy';
        }
        return n === 1 ? 'En 1 día' : `En ${n} días`;
    }

    // Qué hace: clase de color de Vence, la misma de la leyenda arriba de la grilla.
    claseVence(dias: number | null | undefined): string {
        if (dias === null || dias === undefined || Number.isNaN(Number(dias))) {
            return 'aca-prospecto-vence--sin';
        }
        const n = Number(dias);
        if (n < 0) {
            return 'aca-prospecto-vence--vencido';
        }
        if (n <= 5) {
            return 'aca-prospecto-vence--corto';
        }
        if (n <= 15) {
            return 'aca-prospecto-vence--medio';
        }
        return 'aca-prospecto-vence--largo';
    }

    // Qué hace: días que la solicitud lleva en el paso actual.
    textoEnPaso(dias: number | null | undefined): string {
        if (dias === null || dias === undefined || Number.isNaN(Number(dias))) {
            return '—';
        }
        const n = Number(dias);
        if (n <= 0) {
            return 'Hoy';
        }
        return n === 1 ? '1 día' : `${n} días`;
    }

    // Qué hace: texto del paso actual, por ejemplo P2 - Aprobación del analista.
    textoPaso(row: any): string {
        const orden = Number(row?.ORDEN_PASO);
        const nombre = row?.NOMBRE_PASO || '';
        if (!orden || !nombre) {
            return '';
        }
        return `P${orden} - ${nombre}`;
    }

    // Qué hace: aviso del plazo de inscripción en el panel del flujo.
    textoPlazo(row: any): string {
        if (row?.DIAS_VENCE === null || row?.DIAS_VENCE === undefined || !row?.FECHA_FIN_INSCRIPCION) {
            return '';
        }
        const fecha = new Date(row.FECHA_FIN_INSCRIPCION);
        const fechaTexto = Number.isNaN(fecha.getTime())
            ? ''
            : fecha.toLocaleDateString('es-SV');
        const ciclo = row.CICLO || '';
        const facultad = row.NOMBRE_FACULTAD ? ` (${row.NOMBRE_FACULTAD})` : '';
        const dias = Number(row.DIAS_VENCE);
        const cierra = dias < 0
            ? `cerró hace ${Math.abs(dias)} ${Math.abs(dias) === 1 ? 'día' : 'días'}`
            : dias === 0
                ? 'cierra hoy'
                : `cierra en ${dias} ${dias === 1 ? 'día' : 'días'}`;
        const paso = this.textoPaso(row);
        const diasPaso = Number(row.DIAS_EN_PASO);
        const lleva = diasPaso <= 0 ? 'menos de 1 día' : this.textoEnPaso(row.DIAS_EN_PASO);
        const enPaso = paso ? ` Lleva ${lleva} en ${paso}.` : '';
        return `La inscripción del ciclo ${ciclo}${facultad} ${cierra}${fechaTexto ? ', el ' + fechaTexto : ''}.${enPaso}`;
    }

    getFormasIngreso(): any[] {
        return [
            { CODIGO: 'NI', TEXTO: 'Nuevo Ingreso' },
            { CODIGO: 'EQ', TEXTO: 'Ingreso por Equivalencia' },
            { CODIGO: 'CC', TEXTO: 'Cambio de Carrera' },
            { CODIGO: 'RI', TEXTO: 'Reingreso' },
        ];
    }

    getColumns(): any {
        return [
            { dataField: 'CODIGO_PROSPECTO', caption: 'CIF', width: 120 },
            { dataField: 'NOMBRE_COMPLETO', caption: 'Nombre completo', width: 280 },
            { dataField: 'NOMBRE_CARRERA', caption: 'Carrera', width: 280 },
            { dataField: 'CICLO', caption: 'Ciclo', width: 110 },
            {
                dataField: 'NOMBRE_ESTADO',
                caption: 'Estado',
                width: 220,
                minWidth: 180,
                cssClass: 'aca-prospecto-grid-badge-col',
                allowHeaderFiltering: false,
                calculateCellValue: (row: any) => this.textoEstadoSolicitud(row),
                cellTemplate: (cellElement: HTMLElement, cellInfo: any) => {
                    const texto = this.textoEstadoSolicitud(cellInfo?.data);
                    cellElement.classList.add('aca-prospecto-badge-cell');
                    const badge = document.createElement('span');
                    badge.className = 'aca-prospecto-badge ' + this.claseEstadoSolicitud(cellInfo?.data?.CORR_ESTADO);
                    badge.textContent = texto;
                    cellElement.appendChild(badge);
                },
            },
            {
                dataField: 'DIAS_VENCE',
                caption: 'Vence',
                width: 170,
                minWidth: 140,
                allowHeaderFiltering: false,
                calculateCellValue: (row: any) => (this.solicitudAprobada(row) ? '—' : this.textoVence(row?.DIAS_VENCE)),
                cellTemplate: (cellElement: HTMLElement, cellInfo: any) => {
                    cellElement.classList.add('aca-prospecto-badge-cell');
                    if (this.solicitudAprobada(cellInfo?.data)) {
                        cellElement.textContent = '—';
                        return;
                    }
                    const texto = this.textoVence(cellInfo?.data?.DIAS_VENCE);
                    const badge = document.createElement('span');
                    badge.className = 'aca-prospecto-vence ' + this.claseVence(cellInfo?.data?.DIAS_VENCE);
                    badge.textContent = texto;
                    cellElement.appendChild(badge);
                },
            },
            { dataField: 'NOMBRE_MODALIDAD', caption: 'Modalidad', width: 130 },
            { dataField: 'FORMA_INGRESO_TEXTO', caption: 'Forma de ingreso', width: 180 },
            { dataField: 'DUI', caption: 'DUI', width: 120 },
            {
                dataField: 'DIAS_EN_PASO',
                caption: 'En el paso',
                width: 110,
                calculateCellValue: (row: any) => (row?.NOMBRE_PASO ? this.textoEnPaso(row?.DIAS_EN_PASO) : '—'),
            },
            {
                dataField: 'NOMBRE_PASO',
                caption: 'Paso actual',
                width: 260,
                minWidth: 200,
                calculateCellValue: (row: any) => this.textoPaso(row),
            },
            {
                dataField: 'FECHA_REGISTRO',
                caption: 'Fecha de registro',
                width: 160,
                dataType: 'datetime',
                format: 'dd/MM/yyyy HH:mm',
            },
        ];
    }

    getSummary(): any {
        return {
            totalItems: [
                {
                    column: 'CODIGO_PROSPECTO',
                    summaryType: 'count',
                    valueFormat: '#,##0',
                    displayFormat: 'Cant: {0}',
                },
            ],
        };
    }

    // Qué hace: encabezado de la consulta/edición del prospecto.
    // Cómo lo hace: son editables la forma de ingreso, quién financia, el ciclo y la carrera con su
    //               modalidad (el dx-form [readOnly] las bloquea en consulta); el resto lleva readOnly fijo.
    //               Facultad y plan son derivados: los resuelve ACA_SP_CAMBIAR_CICLO_PROSPECTO al guardar.
    getItems(): any {
        return [
            {
                dataField: 'CODIGO_PROSPECTO',
                label: { text: 'CIF' },
                colSpan: 2,
                editorOptions: { readOnly: true },
            },
            {
                dataField: 'NOMBRE_COMPLETO',
                label: { text: 'Nombre completo' },
                colSpan: 4,
                editorOptions: { readOnly: true },
            },
            {
                dataField: 'DUI',
                label: { text: 'DUI' },
                colSpan: 2,
                editorOptions: { readOnly: true },
            },
            {
                dataField: 'CORR_CARRERA',
                label: { text: 'Carrera' },
                colSpan: 4,
                template: 'CORR_CARRERA_PROSPECTOLookup',
            },
            {
                dataField: 'CORR_MODALIDAD',
                label: { text: 'Modalidad' },
                colSpan: 2,
                template: 'CORR_MODALIDAD_PROSPECTOLookup',
            },
            {
                dataField: 'CICLO',
                label: { text: 'Ciclo' },
                colSpan: 2,
                template: 'CICLO_PROSPECTOLookup',
            },
            {
                dataField: 'NOMBRE_FACULTAD',
                label: { text: 'Facultad' },
                colSpan: 3,
                editorOptions: { readOnly: true },
            },
            {
                dataField: 'FORMA_INGRESO',
                label: { text: 'Forma de ingreso' },
                colSpan: 2,
                editorType: 'dxSelectBox',
                editorOptions: { items: this.getFormasIngreso(), valueExpr: 'CODIGO', displayExpr: 'TEXTO' },
                validationRules: [{ type: 'required', message: 'Seleccione la forma de ingreso' }],
            },
            {
                dataField: 'FINANCIA_ESTUDIOS',
                label: { text: 'Financia estudios' },
                colSpan: 3,
                editorOptions: { maxLength: 100 },
            },
            {
                dataField: 'FECHA_REGISTRO',
                label: { text: 'Fecha de registro' },
                colSpan: 3,
                editorType: 'dxDateBox',
                editorOptions: { readOnly: true, type: 'datetime', displayFormat: 'dd/MM/yyyy HH:mm' },
            },
            {
                dataField: 'ESTADO_SOLICITUD',
                label: { text: 'Estado' },
                colSpan: 5,
                editorOptions: { readOnly: true },
            },
        ];
    }

    // Qué hace: formulario "Carrera a la que aplica" (pestaña Información académica).
    // Cómo lo hace: mismos datos del encabezado más plan, código de carrera y quién financia.
    getItemsCarrera(): any {
        return [
            { dataField: 'CODIGO_CARRERA', label: { text: 'Código' }, colSpan: 1, editorOptions: { readOnly: true } },
            { dataField: 'NOMBRE_CARRERA', label: { text: 'Carrera' }, colSpan: 4, editorOptions: { readOnly: true } },
            { dataField: 'NOMBRE_MODALIDAD', label: { text: 'Modalidad' }, colSpan: 2, editorOptions: { readOnly: true } },
            { dataField: 'CICLO', label: { text: 'Ciclo' }, colSpan: 1, editorOptions: { readOnly: true } },
            { dataField: 'NOMBRE_FACULTAD', label: { text: 'Facultad' }, colSpan: 4, editorOptions: { readOnly: true } },
            { dataField: 'CODIGO_PLAN', label: { text: 'Plan académico' }, colSpan: 2, editorOptions: { readOnly: true } },
            { dataField: 'FORMA_INGRESO_TEXTO', label: { text: 'Forma de ingreso' }, colSpan: 2, editorOptions: { readOnly: true } },
            { dataField: 'FINANCIA_ESTUDIOS', label: { text: 'Financia estudios' }, colSpan: 2, editorOptions: { readOnly: true } },
        ];
    }
}
