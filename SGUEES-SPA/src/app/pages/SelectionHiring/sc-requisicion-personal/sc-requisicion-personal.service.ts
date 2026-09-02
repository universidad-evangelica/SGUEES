import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';

import { ScRequisicionPersonalRepository } from './sc-requisicion-personal.repository';
import { ScRequisicionPersonal } from './models/sc-requisicion-personal';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { ScExpedienteEntrevistaRepository } from '../sc-expediente-candidato/sc-expediente-entrevista/sc-expediente-entrevista.repository';

@Injectable({
	providedIn: 'root',
})
export class ScRequisicionPersonalService {
    constructor(
		private repo: ScRequisicionPersonalRepository,
		private entrevistaRepo: ScExpedienteEntrevistaRepository,
	) {}

    //#region <Validadores>
    esValido(model: ScRequisicionPersonal, msg: Function): boolean {

        if (model.FECHA_REQUISICION == null) {
        msg('Debe digitar la fecha de requisición', NotifyType.Warning);
        return false;
        }

        if (model.NOMBRE_PUESTO_SOLICITADO == '' || model.NOMBRE_PUESTO_SOLICITADO == null) {
        msg('Debe digitar el nombre del puesto solicitado', NotifyType.Warning);
        return false;
        }

        if (model.CORR_UNIDAD == 0 || model.CORR_UNIDAD == null) {
            msg('Debe seleccionar la unidad organizativa', NotifyType.Warning);
            return false;
        }

        if (model.CORR_DESCRIPTOR_PUESTO == 0 || model.CORR_DESCRIPTOR_PUESTO == null) {
            msg('Debe seleccionar el descriptor del puesto', NotifyType.Warning);
            return false;
        }

        if (model.CORR_TIPO_MODALIDAD == 0 || model.CORR_TIPO_MODALIDAD == null) {
            msg('Debe seleccionar el tipo de modalidad', NotifyType.Warning);
            return false;
        }

        if (model.CORR_TIPO_CONTRATACION == 0 || model.CORR_TIPO_CONTRATACION == null) {
            msg('Debe seleccionar el tipo de contratación', NotifyType.Warning);
            return false;
        }

        if (model.CORR_TIPO_VACANTE == 0 || model.CORR_TIPO_VACANTE == null) {
            msg('Debe seleccionar el tipo de vacante', NotifyType.Warning);
            return false;
        }

        if (model.CANTIDAD_PLAZAS == 0 || model.CANTIDAD_PLAZAS == null) {
            msg('Debe digitar la cantidad de plazas', NotifyType.Warning);
            return false;
        }

        if (model.SALARIO == 0 || model.SALARIO == null) {
            msg('Debe digitar el salario', NotifyType.Warning);
            return false;
        }

        // Solo aplica si la contratación NO es permanente (flag UI desde lookup).
        if (model.ES_PERMANENTE !== true) {
            if (model.TIEMPO_CONTRATO == null || model.TIEMPO_CONTRATO <= 0) {
                msg('Debe digitar el tiempo de contrato (meses)', NotifyType.Warning);
                return false;
            }
        }

        // Solo aplica si el tipo de vacante requiere sustitución (flag UI desde lookup).
        if (model.REQUIERE_SUSTITUCION === true) {
            if (model.CORR_EMPLEADO_SUSTITUTO == null || model.CORR_EMPLEADO_SUSTITUTO === '' || model.CORR_EMPLEADO_SUSTITUTO === '0') {
                msg('Debe seleccionar el empleado sustituto', NotifyType.Warning);
                return false;
            }
        }

        return true;
    }
    // #endregion

    // Convierte a yyyy-MM-dd sin desfase por zona horaria (UTC vs local).
    private formatearDateOnly(fecha: Date | string | null): string | null {

        if (!fecha) {
            return null;
        }

        // String ISO o yyyy-MM-dd: usar la parte de fecha tal cual, sin new Date() (evita restar 1 día en UTC-6).
        if (typeof fecha === 'string') {
            const soloFecha = fecha.split('T')[0];
            if (/^\d{4}-\d{2}-\d{2}$/.test(soloFecha)) {
                return soloFecha;
            }
        }

        const date = fecha instanceof Date ? fecha : new Date(fecha);
        if (isNaN(date.getTime())) {
            return null;
        }

        // Componentes en hora local (fecha elegida en el calendario).
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');

        return `${year}-${month}-${day}`;
    }

    /** Catálogo de estados de la requisición (flujo; el cambio lo hace otro proceso). */
	readonly estadosRequisicion: { CORR_ESTADO_REQUISICION: number; ESTADO_REQUISICION: string }[] = [
		{ CORR_ESTADO_REQUISICION: 1, ESTADO_REQUISICION: 'Borrador' },
		{ CORR_ESTADO_REQUISICION: 2, ESTADO_REQUISICION: 'En Aprobación' },
		{ CORR_ESTADO_REQUISICION: 3, ESTADO_REQUISICION: 'Devuelta' },
		{ CORR_ESTADO_REQUISICION: 4, ESTADO_REQUISICION: 'Rechazada' },
		{ CORR_ESTADO_REQUISICION: 5, ESTADO_REQUISICION: 'Aprobada' },
		{ CORR_ESTADO_REQUISICION: 6, ESTADO_REQUISICION: 'Publicada' },
		{ CORR_ESTADO_REQUISICION: 7, ESTADO_REQUISICION: 'En Reclutamiento' },
		{ CORR_ESTADO_REQUISICION: 8, ESTADO_REQUISICION: 'En Selección' },
		{ CORR_ESTADO_REQUISICION: 9, ESTADO_REQUISICION: 'En Contratación' },
		{ CORR_ESTADO_REQUISICION: 10, ESTADO_REQUISICION: 'Parcial Cubierta' },
		{ CORR_ESTADO_REQUISICION: 11, ESTADO_REQUISICION: 'Cerrada' },
		{ CORR_ESTADO_REQUISICION: 12, ESTADO_REQUISICION: 'Cancelada' },
	];

	/** Texto del chip según CORR_ESTADO_REQUISICION (default Borrador si viene vacío). */
	getEstadoRequisicionLabel(corrEstado: number | null | undefined): string {
		const corr = Number(corrEstado) > 0 ? Number(corrEstado) : 1;
		const item = this.estadosRequisicion.find((x) => x.CORR_ESTADO_REQUISICION === corr);
		return item?.ESTADO_REQUISICION ?? 'Borrador';
	}

	/** Clase CSS del chip según el estado (solo lectura / indicador de flujo). */
	getEstadoRequisicionBadgeClass(corrEstado: number | null | undefined): string {
		const corr = Number(corrEstado) > 0 ? Number(corrEstado) : 1;
		switch (corr) {
			case 1:
				return 'estado-req--borrador';
			case 2:
				return 'estado-req--aprobacion';
			case 3:
				return 'estado-req--devuelta';
			case 4:
				return 'estado-req--rechazada';
			case 5:
				return 'estado-req--aprobada';
			case 6:
				return 'estado-req--publicada';
			case 7:
			case 8:
			case 9:
				return 'estado-req--proceso';
			case 10:
				return 'estado-req--parcial';
			case 11:
				return 'estado-req--cerrada';
			case 12:
				return 'estado-req--cancelada';
			default:
				return 'estado-req--borrador';
		}
	}

    getAll(param: any): Observable<IResult> {
		const xWhere: IParam[] = [{ Parameter: 'CORR_REQUISICION_PERSONAL', Value: param.CORR_REQUISICION_PERSONAL }];

		return this.repo.get(xWhere);
	}

	get(param: any): Observable<IResult> {
		const xWhere: IParam[] = [{ Parameter: 'CORR_REQUISICION_PERSONAL', Value: param.CORR_REQUISICION_PERSONAL }];

		return this.repo.get(xWhere);
	}

	insert(model: any): Observable<IResult> {

        const modelToInsert = {
            ...model,
            FECHA_REQUISICION: this.formatearDateOnly(model.FECHA_REQUISICION),
            FECHA_APROBACION: this.formatearDateOnly(model.FECHA_APROBACION),
            FECHA_CIERRE: this.formatearDateOnly(model.FECHA_CIERRE),
        };

		return this.repo.create(modelToInsert);
	}

	update(model: any): Observable<IResult> {
        const modelToUpdate = {
            ...model,
            FECHA_REQUISICION: this.formatearDateOnly(model.FECHA_REQUISICION),
            FECHA_APROBACION: this.formatearDateOnly(model.FECHA_APROBACION),
            FECHA_CIERRE: this.formatearDateOnly(model.FECHA_CIERRE),
        };

		const xWhere: IParam[] = [{ Parameter: 'CORR_REQUISICION_PERSONAL', Value: model.CORR_REQUISICION_PERSONAL }];

		return this.repo.update(modelToUpdate, xWhere);
	}

	delete(model: any): Observable<IResult> {
		const xWhere: IParam[] = [{ Parameter: 'CORR_REQUISICION_PERSONAL', Value: model.CORR_REQUISICION_PERSONAL }];

		return this.repo.delete(xWhere);
	}

	/** Bitácora de la requisición (endpoint GetCORR_BITACORA_SC_REQUISICION_PERSONAL). */
	getBitacora(param?: any): Observable<IResult> {
		const xWhere: IParam[] = [];
		if (param?.CORR_REQUISICION_PERSONAL != null && param.CORR_REQUISICION_PERSONAL > 0) {
			xWhere.push({ Parameter: 'CORR_REQUISICION_PERSONAL', Value: param.CORR_REQUISICION_PERSONAL });
		}
		return this.repo.getBitacora(xWhere);
	}

	/** Obtiene candidatos activos en proceso de selección de la requisición. */
	getCandidatos(param?: any): Observable<IResult> {
		const xWhere: IParam[] = [];
		if (param?.CORR_REQUISICION_PERSONAL != null && param.CORR_REQUISICION_PERSONAL > 0) {
			xWhere.push({ Parameter: 'CORR_REQUISICION_PERSONAL', Value: param.CORR_REQUISICION_PERSONAL });
		}
		return this.repo.getCandidatos(xWhere);
	}

	/** Entrevistas del candidato/solicitud (permiso requisición). */
	getEntrevistasCandidato(corrExpediente: number, corrSolicitudEmpleo: number): Observable<IResult> {
		return this.entrevistaRepo.getAllForRequisicion([
			{ Parameter: 'CORR_EXPEDIENTE_CANDIDATO', Value: corrExpediente },
			{ Parameter: 'CORR_SOLICITUD_EMPLEO', Value: corrSolicitudEmpleo },
		]);
	}

	insertEntrevistaFromRequisicion(model: any): Observable<IResult> {
		return this.entrevistaRepo.createForRequisicion(model);
	}

	updateEntrevistaFromRequisicion(model: any): Observable<IResult> {
		return this.entrevistaRepo.updateForRequisicion(model, [
			{ Parameter: 'CORR_EXPEDIENTE_ENTREVISTA', Value: model.CORR_EXPEDIENTE_ENTREVISTA },
			{ Parameter: 'CORR_EXPEDIENTE_CANDIDATO', Value: model.CORR_EXPEDIENTE_CANDIDATO },
		]);
	}

	deleteEntrevistaFromRequisicion(corrExpediente: number, corrEntrevista: number): Observable<IResult> {
		return this.entrevistaRepo.deleteForRequisicion([
			{ Parameter: 'CORR_EXPEDIENTE_CANDIDATO', Value: corrExpediente },
			{ Parameter: 'CORR_EXPEDIENTE_ENTREVISTA', Value: corrEntrevista },
		]);
	}

	/** Combos fijos del formulario de entrevistas (workspace Candidatos). */
	getTipoEntrevistaOptions(): Array<{ value: string; text: string }> {
		return [
			{ value: 'TALENTO HUMANO', text: 'Talento humano' },
			{ value: 'JEFATURA', text: 'Jefatura' },
			{ value: 'DIRECCION CAPELLANIA', text: 'Dirección Capellanía' },
			// { value: 'DOCENTE', text: 'Docente' },
			// { value: 'FINAL', text: 'Final' },
		];
	}

	getEstadoEntrevistaOptions(): Array<{ value: string; text: string }> {
		return [
			{ value: 'PROGRAMADA', text: 'Programada' },
			{ value: 'REALIZADA', text: 'Realizada' },
			{ value: 'CANCELADA', text: 'Cancelada' },
			{ value: 'NO SE PRESENTO', text: 'No se presentó' },
			{ value: 'REPROGRAMADA', text: 'Reprogramada' },
		];
	}

	getResultadoEntrevistaOptions(): Array<{ value: string; text: string }> {
		return [
			{ value: 'FAVORABLE', text: 'Favorable' },
			{ value: 'FAVORABLE CON OBSERVACION', text: 'Favorable con observación' },
			{ value: 'NO FAVORABLE', text: 'No favorable' },
		];
	}

	/** Columnas del grid de entrevistas en el workspace. */
	getEntrevistaColumns(): any[] {
		return [
			{ dataField: 'CORR_EXPEDIENTE_ENTREVISTA', caption: 'Corr.', width: 70 },
			{ dataField: 'TIPO_ENTREVISTA', caption: 'Tipo', width: 170 },
			{
				dataField: 'FECHA_ENTREVISTA',
				caption: 'Fecha',
				width: 160,
				dataType: 'datetime',
				format: 'dd/MM/yyyy HH:mm',
			},
			{ dataField: 'ENTREVISTADOR', caption: 'Entrevistador', width: 180 },
			{ dataField: 'ESTADO_ENTREVISTA', caption: 'Estado', width: 140 },
			{ dataField: 'RESULTADO_ENTREVISTA', caption: 'Resultado', width: 180 },
			{ dataField: 'RESUMEN_ENTREVISTA', caption: 'Resumen', width: 500 },
			{
				caption: 'Options',
				width: 90,
				allowSorting: false,
				allowFiltering: false,
				cellTemplate: 'entrevistaActionsTemplate',
			},
		];
	}

	esValidoEntrevista(model: any, msg: Function): boolean {
		if (!model?.TIPO_ENTREVISTA) {
			msg('Debe indicar el tipo de entrevista.', NotifyType.Warning);
			return false;
		}
		if (!model?.FECHA_ENTREVISTA) {
			msg('Debe indicar la fecha de la entrevista.', NotifyType.Warning);
			return false;
		}
		if (!`${model?.ENTREVISTADOR ?? ''}`.trim()) {
			msg('Debe indicar el entrevistador.', NotifyType.Warning);
			return false;
		}
		if (!model?.ESTADO_ENTREVISTA) {
			msg('Debe indicar el estado de la entrevista.', NotifyType.Warning);
			return false;
		}
		return true;
	}

	/**
	 * Descriptores de puesto filtrados por CORR_UNIDAD
	 * (API: SC_DESCRIPTOR_PUESTO/GetCORR_DESCRIPTOR_PUESTO_SC_REQUISICION_PERSONAL).
	 */
    getDescriptorPuesto(param?: any): Observable<IResult> {
        const xWhere: IParam[] = [];
        if (param?.CORR_UNIDAD != null && param.CORR_UNIDAD > 0) {
            xWhere.push({ Parameter: 'CORR_UNIDAD', Value: param.CORR_UNIDAD });
        }
        return this.repo.getDescriptorPuesto(xWhere);
    }

    getColumns(): any {
        return [
            { dataField: 'CORR_REQUISICION_PERSONAL', caption: 'Corr.', width: 85 },
            { dataField: 'FECHA_REQUISICION', caption: 'Fecha', width: 130, dataType: 'date', format: 'dd/MM/yyyy' },
            { dataField: 'NOMBRE_UNIDAD', caption: 'Unidad', width: 250 },
            //{ dataField: 'NOMBRE_PUESTO', caption: 'Descriptor Puesto', width: 250 },
            { dataField: 'MODALIDAD_NOMBRE', caption: 'Modalidad', width: 120 },
            { dataField: 'NOMBRE_TIPO_CONTRATACION', caption: 'Tipo Contrato', width: 140 },
            { dataField: 'NOMBRE_TIPO_VACANTE', caption: 'Tipo Vacante', width: 200 },
            { dataField: 'CANTIDAD_PLAZAS', caption: 'No. Plazas', width: 120 },
            { dataField: 'SALARIO', caption: 'Salario', width: 120, format: '#,##0.00' },
            { dataField: 'TIEMPO_CONTRATO', caption: 'Contrato (Meses)', width: 170 },
            { dataField: 'HORARIO', caption: 'Horario', width: 200 },
            { dataField: 'JUSTIFICACION', caption: 'Justificacion', width: 250 },
            { dataField: 'FECHA_CREA', caption: 'Fecha creación', width: 150, dataType: 'date', format: 'dd/MM/yyyy' },
            { dataField: 'USUARIO_CREA', caption: 'Usuario creación', width: 150 },
            { dataField: 'FECHA_ACTU', caption: 'Fecha actualización', width: 150, dataType: 'date', format: 'dd/MM/yyyy' },
            { dataField: 'USUARIO_ACTU', caption: 'Usuario actualización', width: 150 },
        ];
    }

    getSummary(): any {
        return {
            totalItems: [{ column: 'CORR_REQUISICION_PERSONAL', summaryType: 'count', valueFormat: '#,##0', displayFormat: 'Cant: {0}' }],
        };
    }

    getItems(): any {
        return [
            { dataField: 'CORR_REQUISICION_PERSONAL', label: { text: 'Corr.' }, colSpan: 1, editorOptions: { readOnly: true } },
								// Solo lectura: el cambio de estado lo hace otro proceso (chip/badge).
                                
								{
									dataField: 'CORR_ESTADO_REQUISICION',
									label: { text: 'Estado requisición' },
									colSpan: 1,
									template: 'CORR_ESTADO_REQUISICIONChip',
								},
                                {
                                    dataField: 'FECHA_REQUISICION',
                                    label: { text: 'Fecha requisición' },
                                    colSpan: 2,
                                    editorType: 'dxDateBox',
                                    editorOptions: {
                                        type: 'date',
                                        displayFormat: 'dd/MM/yyyy',
                                        useMaskBehavior: true,
                                        dateSerializationFormat: 'yyyy-MM-dd',
                                    }
                                },
                                {
                                    dataField: 'NOMBRE_PUESTO_SOLICITADO',
                                    label: { text: 'Nombre puesto solicitado' },
                                    colSpan: 4,
                                },
                                {
                                    dataField: 'CORR_UNIDAD',
                                    label: { text: 'Unidad Organizativa' },
                                    colSpan: 4,
                                    template: 'CORR_UNIDADLookup',
                                },
                                {
                                    dataField: 'CORR_DESCRIPTOR_PUESTO',
                                    label: { text: 'Descriptor Puesto' },
                                    colSpan: 4,
                                    template: 'CORR_DESCRIPTOR_PUESTOLookup',
                                },
                                {
                                    dataField: 'CORR_TIPO_MODALIDAD',
                                    label: { text: 'Tipo Modalidad' },
                                    colSpan: 2,
                                    template: 'CORR_TIPO_MODALIDADLookup',
                                },
                                {
                                    dataField: 'CORR_TIPO_CONTRATACION',
                                    label: { text: 'Tipo Contratacion' },
                                    colSpan: 2,
                                    template: 'CORR_TIPO_CONTRATACIONLookup',
                                },
                                {
                                    dataField: 'CORR_TIPO_VACANTE',
                                    label: { text: 'Tipo Vacante' },
                                    colSpan: 2,
                                    template: 'CORR_TIPO_VACANTELookup',
                                },
                                {
                                    dataField: 'CANTIDAD_PLAZAS',
                                    label: { text: 'Cantidad plazas' },
                                    colSpan: 1,
                                    editorType: 'dxNumberBox',
                                    editorOptions: { min: 0, showSpinButtons: true },
                                },
                                {
                                    dataField: 'PLAZAS_CUBIERTAS',
                                    label: { text: 'Plazas cubiertas' },
                                    colSpan: 1,
                                    editorType: 'dxNumberBox',
                                    editorOptions: { min: 0, showSpinButtons: true },
                                },
                                {
                                    dataField: 'SALARIO',
                                    label: { text: 'Salario' },
                                    colSpan: 1,
                                    editorType: 'dxNumberBox',
                                    editorOptions: { min: 0, format: '#,##0.00' },
                                },
                                {
                                    dataField: 'TIEMPO_CONTRATO',
                                    label: { text: 'Tiempo contrato (meses)' },
                                    colSpan: 2,
                                    visible: false, // Visible cuando ES_PERMANENTE !== true (tipo no permanente)
                                    editorType: 'dxNumberBox',
                                    editorOptions: { placeholder: 'Ej. 6 meses', showClearButton: true, maxLength: 50 },
                                },
                                {
                                    dataField: 'HORARIO',
                                    label: { text: 'Horario laboral' },
                                    colSpan: 4,
                                    editorType: 'dxTextArea',
                                    editorOptions: { placeholder: 'Detalle horario laboral...', showClearButton: true, maxLength: 100 },
                                },
                                {
                                    dataField: 'CORR_EMPLEADO_SUSTITUTO',
                                    label: { text: 'Empleado sustituto' },
                                    visible: false, // Visible cuando REQUIERE_SUSTITUCION === true
                                    colSpan: 8, // Ancho completo al mostrarse (antes de JUSTIFICACION)
                                    editorType: 'dxSelectBox',
                                    editorOptions: { 
                                        dataSource: [
                                        { CORR_EMPLEADO_SUSTITUTO: 1, EMPLEADO_SUSTITUTO: 'Javier Orellana' },
                                        { CORR_EMPLEADO_SUSTITUTO: 2, EMPLEADO_SUSTITUTO: 'Juan Pérez' },
                                        { CORR_EMPLEADO_SUSTITUTO: 3, EMPLEADO_SUSTITUTO: 'María López' },
                                        ],
                                        displayExpr: 'EMPLEADO_SUSTITUTO',
                                        valueExpr: 'CORR_EMPLEADO_SUSTITUTO',
                                        placeholder: 'Seleccione un empleado sustituto...',
                                        searchEnabled: true,
                                        showClearButton: true,
                                    }
                                },
                                {
                                    itemType: 'simple',
                                    colSpan: 8,
                                    template: 'alertJustificacion'
                                },
								{
									dataField: 'JUSTIFICACION',
									label: { text: 'Justificacion requisición' },
									colSpan: 8,
									editorType: 'dxTextArea',
									editorOptions: { minHeight: 90, maxLength: 500 },
								},
        ];
    }

    getObservadoresColumns(): any {
        return [
            { dataField: 'OPTIONS', caption: 'Opciones', width: 100, cellTemplate: 'optionsTemplate', alignment: 'center'},
            { dataField: 'CORR_REQUISICION_OBSERVADORES', caption: 'Corr.', width: 90, alignment: 'center' },
            { dataField: 'LOGIN_SISTEMA', caption: 'Usuario', width: 160 },
            { dataField: 'NOMBRE_USUARIO', caption: 'Nombre', width: 250 },
            //{ dataField: 'TIPO_OBSERVADOR', caption: 'Tipo observador', width: 160 },
            { dataField: 'ACTIVO', caption: 'Activo', width: 160, dataType: 'boolean' },
            { dataField: 'FECHA_ASIGNACION', caption: 'Fecha asignación', width: 160, dataType: 'datetime', format: 'dd/MM/yyyy HH:mm' },
        ];
    }

    getObservadoresSummary(): any {
        return {
            totalItems: [{ column: 'CORR_REQUISICION_OBSERVADORES', summaryType: 'count', valueFormat: '#,##0', displayFormat: 'Cant: {0}' }],
        };
    }

    /**
     * Columnas del grid Bitácora (tab en sc-requisicion-personal).
     * Dejar comentadas las columnas futuras para ir habilitando sin romper el grid.
     */
    getBitacoraColumns(): any {
        return [
            { dataField: 'CORR_EMPRESA', caption: 'Empresa', width: 100 },
            { dataField: 'CORR_REQUISICION_PERSONAL', caption: 'Corr. Requisición', width: 130 },
            { dataField: 'LOGIN_SISTEMA', caption: 'Usuario', width: 180 },
            { dataField: 'ESTADO_DESTINO', caption: 'Estado destino', width: 180 },
            { dataField: 'COMENTARIO', caption: 'Comentario', width: 320 },
            // Columnas futuras (descomentar cuando el API las envíe):
            // { dataField: 'FECHA', caption: 'Fecha', width: 160, dataType: 'datetime', format: 'dd/MM/yyyy HH:mm' },
            // { dataField: 'ESTADO_ORIGEN', caption: 'Estado origen', width: 180 },
            // { dataField: 'NOMBRE_USUARIO', caption: 'Nombre usuario', width: 220 },
        ];
    }

    getBitacoraSummary(): any {
        return {
            totalItems: [{ column: 'LOGIN_SISTEMA', summaryType: 'count', valueFormat: '#,##0', displayFormat: 'Cant: {0}' }],
        };
    }

    	/** Ítems del dx-form de entrevistas (mismo patrón que sc-expediente-candidato: colCount 8). */
	getEntrevistaItems(): any[] {
		return [
			{
				dataField: 'TIPO_ENTREVISTA',
				label: { text: 'Tipo de entrevista' },
				colSpan: 2,
				editorType: 'dxSelectBox',
				editorOptions: {
					items: this.getTipoEntrevistaOptions(),
					displayExpr: 'text',
					valueExpr: 'value',
					searchEnabled: false,
					showClearButton: true,
					placeholder: 'Seleccione tipo',
				},
			},
			{
				dataField: 'FECHA_ENTREVISTA',
				label: { text: 'Fecha entrevista' },
				colSpan: 2,
				editorType: 'dxDateBox',
				editorOptions: {
					type: 'datetime',
					displayFormat: 'dd/MM/yyyy HH:mm',
					showClearButton: false,
				},
			},
			{
				dataField: 'ESTADO_ENTREVISTA',
				label: { text: 'Estado' },
				colSpan: 2,
				editorType: 'dxSelectBox',
				editorOptions: {
					items: this.getEstadoEntrevistaOptions(),
					displayExpr: 'text',
					valueExpr: 'value',
					searchEnabled: false,
					placeholder: 'Seleccione estado',
				},
			},
			{
				dataField: 'RESULTADO_ENTREVISTA',
				label: { text: 'Resultado' },
				colSpan: 2,
				editorType: 'dxSelectBox',
				editorOptions: {
					items: this.getResultadoEntrevistaOptions(),
					displayExpr: 'text',
					valueExpr: 'value',
					searchEnabled: false,
					showClearButton: true,
					placeholder: 'Opcional',
				},
			},
            			{
				dataField: 'ENTREVISTADOR',
				label: { text: 'Entrevistado por' },
				colSpan: 8,
				editorOptions: {
					placeholder: 'Nombre del entrevistador',
					maxLength: 150,
					showClearButton: true,
				},
			},
			{
				dataField: 'RESUMEN_ENTREVISTA',
				label: { text: 'Resumen' },
				colSpan: 8,
				editorType: 'dxTextArea',
				editorOptions: {
					height: 84,
					maxLength: 2000,
					placeholder: 'Notas u observaciones de la entrevista',
				},
			},
		];
	}

    /** Columnas visibles del tab Candidatos. */
    getCandidatosColumns(): any[] {
        return [
            { dataField: 'NOMBRE_PERSONA', caption: 'Candidato', minWidth: 240 },
            { dataField: 'DUI_PERSONA', caption: 'DUI', width: 130 },
            {
                dataField: 'FECHA_GENERACION',
                caption: 'Fecha expediente',
                width: 160,
                dataType: 'date',
                format: 'dd/MM/yyyy',
            },
            {
                dataField: 'CORR_ESTADO_EXPEDIENTE',
                caption: 'Estado',
                width: 180,
                calculateCellValue: () => 'Proceso de selección',
            },
            { dataField: 'CORR_SOLICITUD_EMPLEO', caption: 'Solicitud de empleo', width: 170 },
            {
                caption: 'Options',
                width: 110,
                allowSorting: false,
                allowFiltering: false,
                cellTemplate: 'candidatosActionsTemplate',
            },
        ];
    }

    getCandidatosSummary(): any {
        return {
            totalItems: [
                {
                    column: 'NOMBRE_PERSONA',
                    summaryType: 'count',
                    valueFormat: '#,##0',
                    displayFormat: 'Cant: {0}',
                },
            ],
        };
    }
    

}
