import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';

import { ScRequisicionPersonalRepository } from './sc-requisicion-personal.repository';
import { ScRequisicionPersonal } from './models/sc-requisicion-personal';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { ScExpedienteEntrevistaRepository } from '../sc-expediente-candidato/sc-expediente-entrevista/sc-expediente-entrevista.repository';
import { ScExpedienteEntrevistaDocumentoRepository } from '../sc-expediente-candidato/sc-expediente-entrevista/sc-expediente-entrevista-documento/sc-expediente-entrevista-documento.repository';
import { ScExpedienteDocumentoRepository } from '../sc-expediente-candidato/sc-expediente-documento/sc-expediente-documento.repository';
import { ScRequisicionCandidatoService } from './sc-requisicion-candidato/sc-requisicion-candidato.service';

@Injectable({
	providedIn: 'root',
})
export class ScRequisicionPersonalService {
	// Qué hace: Catálogo local de estados de la requisición de personal.
	// Cómo lo hace: Arreglo constante con los identificadores y descripciones de cada fase de la requisición.
	readonly estadosRequisicion: { CORR_ESTADO_REQUISICION: number; ESTADO_REQUISICION: string }[] = [
		{ CORR_ESTADO_REQUISICION: 1, ESTADO_REQUISICION: 'Borrador' },
		{ CORR_ESTADO_REQUISICION: 2, ESTADO_REQUISICION: 'En Aprobación' },
		{ CORR_ESTADO_REQUISICION: 3, ESTADO_REQUISICION: 'Observada' },
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

    constructor(
		private repo: ScRequisicionPersonalRepository,
		private entrevistaRepo: ScExpedienteEntrevistaRepository,
		private entrevistaDocumentoRepo: ScExpedienteEntrevistaDocumentoRepository,
		private expedienteDocumentoRepo: ScExpedienteDocumentoRepository,
		private requisicionCandidatoService: ScRequisicionCandidatoService,
	) {}

    //#region <Validadores>
    esValido(model: ScRequisicionPersonal, msg: Function): boolean {

        if (model.FECHA_REQUISICION == null) {
        msg('Debe digitar la fecha de requisición', NotifyType.Warning);
        return false;
        }

        if (model.CORR_UNIDAD == 0 || model.CORR_UNIDAD == null) {
            msg('Debe seleccionar la unidad organizativa', NotifyType.Warning);
            return false;
        }

        if (model.CORR_PUESTO == 0 || model.CORR_PUESTO == null) {
            msg('Debe seleccionar el puesto', NotifyType.Warning);
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

        // Qué hace: Valida tiempo de contrato solo para contrataciones no permanentes.
        // Cómo lo hace: Considera permanente si ES_PERMANENTE es true o si CORR_TIPO_CONTRATACION es 1 (Permanente).
        const esPermanente = model.ES_PERMANENTE === true || (model.ES_PERMANENTE == null && Number(model.CORR_TIPO_CONTRATACION) === 1);
        if (!esPermanente) {
            if (model.TIEMPO_CONTRATO == null || model.TIEMPO_CONTRATO <= 0) {
                msg('Debe digitar el tiempo de contrato (meses)', NotifyType.Warning);
                return false;
            }
        }

        // Solo aplica si el tipo de vacante requiere sustitución (flag UI desde lookup).
        if (model.REQUIERE_SUSTITUCION === true) {
            const corrSustituto = model.CORR_EMPLEADO_SUSTITUTO;
            if (corrSustituto == null || corrSustituto === '' || corrSustituto === '0' || Number(corrSustituto) <= 0) {
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


	// Qué hace: Formatea visualmente el estado del flujo expandiendo siglas de roles y cambiando 'Devuelta' por 'Observada'.
	// Cómo lo hace: Aplica expresiones regulares para reemplazar Devuelta/Devuelto por Observada y expandir JI, JU, GG a sus nombres completos.
	formatearNombreEstadoFlujo(texto?: string | null): string {
		if (!texto?.trim()) {
			return '';
		}
		return texto
			.replace(/\bDevuelt[ao]\b/gi, 'Observada')
			.replace(/\bJI\b/g, 'Jefe Inmediato')
			.replace(/\bJU\b/g, 'Jefe de Unidad')
			.replace(/\bGG\b/g, 'Gerente General')
			.trim();
	}

	// Qué hace: Retorna el texto visible del chip de estado en la grilla y el formulario.
	// Cómo lo hace: Si la requisición está en circuito de flujo (estados 2..5) y posee NOMBRE_ESTADO_FLUJO de la bitácora, formatea el texto expandiendo nombres de roles y cambiando Devuelta por Observada; de lo contrario toma el catálogo de negocio o 'Borrador'.
	getEstadoRequisicionLabel(corrEstado: number | null | undefined, nombreEstadoFlujo?: string | null): string {
		const corr = Number(corrEstado) > 0 ? Number(corrEstado) : 1;
		if (corr >= 2 && corr <= 5 && nombreEstadoFlujo?.trim()) {
			return this.formatearNombreEstadoFlujo(nombreEstadoFlujo);
		}
		const item = this.estadosRequisicion.find((x) => x.CORR_ESTADO_REQUISICION === corr);
		return item?.ESTADO_REQUISICION ?? 'Borrador';
	}

	/**
	 * Borrador (1) y Devuelta (3): se puede editar y enviar a aprobación.
	 * En Aprobación / Aprobada / Rechazada (y demás): solo consulta.
	 */
	esEstadoRequisicionEditable(corrEstado: number | null | undefined): boolean {
		const corr = Number(corrEstado) > 0 ? Number(corrEstado) : 1;
		return corr === 1 || corr === 3;
	}

	/** Alias de negocio: mismos estados que permiten “Enviar requisición”. */
	esEstadoRequisicionEnviable(corrEstado: number | null | undefined): boolean {
		return this.esEstadoRequisicionEditable(corrEstado);
	}

	// Qué hace: devuelve la clase CSS del badge/chip según el estado general o el actor específico del flujo.
	// Cómo lo hace: evalúa el texto del flujo (JI -> azul, JU -> violeta, GG/Final -> verde, devuelta -> ámbar, rechazada -> rojo).
	getEstadoRequisicionBadgeClass(corrEstado: number | null | undefined, nombreEstadoFlujo?: string | null): string {
		const corr = Number(corrEstado) > 0 ? Number(corrEstado) : 1;
		if (corr >= 2 && corr <= 5 && nombreEstadoFlujo?.trim()) {
			const nombre = nombreEstadoFlujo.trim().toLowerCase();
			if (nombre.includes('aprobado') || nombre.includes('aprobada')) {
				if (nombre.includes('ju')) {
					return 'estado-req--aprobado-ju';
				}
				if (nombre.includes('ji')) {
					return 'estado-req--aprobacion';
				}
				if (nombre.includes('gg')) {
					return 'estado-req--aprobada';
				}
				return 'estado-req--aprobada';
			}
			if (nombre.includes('devuelt') || nombre.includes('observad')) {
				return 'estado-req--devuelta';
			}
			if (nombre.includes('rechaz') || nombre.includes('deneg')) {
				return 'estado-req--rechazada';
			}
			return 'estado-req--aprobacion';
		}
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

	// Qué hace: Renderiza el elemento DOM span con el chip de estado en la celda del grid.
	// Cómo lo hace: Agrega las clases CSS y el texto descriptivo pasando tanto CORR_ESTADO_REQUISICION como NOMBRE_ESTADO_FLUJO.
	private renderEstadoRequisicionChip(
		cellElement: HTMLElement,
		corrEstado: number | null | undefined,
		nombreEstadoFlujo?: string | null
	): void {
		cellElement.classList.add('requisicion-grid-estado-cell');

		const chip = document.createElement('span');
		chip.classList.add('estado-req-chip', this.getEstadoRequisicionBadgeClass(corrEstado, nombreEstadoFlujo));
		chip.textContent = this.getEstadoRequisicionLabel(corrEstado, nombreEstadoFlujo);
		chip.title = chip.textContent;

		cellElement.innerHTML = '';
		cellElement.appendChild(chip);
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
            // Qué hace: Formatea el correlativo del empleado sustituto a string para la BD varchar.
            // Cómo lo hace: Si tiene valor mayor a 0 lo envía como string, de lo contrario envía null.
            CORR_EMPLEADO_SUSTITUTO:
                model.CORR_EMPLEADO_SUSTITUTO != null &&
                model.CORR_EMPLEADO_SUSTITUTO !== '' &&
                Number(model.CORR_EMPLEADO_SUSTITUTO) > 0
                    ? String(model.CORR_EMPLEADO_SUSTITUTO)
                    : null,
            FECHA_REQUISICION: this.formatearDateOnly(model.FECHA_REQUISICION),
            FECHA_APROBACION: this.formatearDateOnly(model.FECHA_APROBACION),
            FECHA_CIERRE: this.formatearDateOnly(model.FECHA_CIERRE),
        };

		return this.repo.create(modelToInsert);
	}

	update(model: any): Observable<IResult> {
        const modelToUpdate = {
            ...model,
            // Qué hace: Formatea el correlativo del empleado sustituto a string para la BD varchar.
            // Cómo lo hace: Si tiene valor mayor a 0 lo envía como string, de lo contrario envía null.
            CORR_EMPLEADO_SUSTITUTO:
                model.CORR_EMPLEADO_SUSTITUTO != null &&
                model.CORR_EMPLEADO_SUSTITUTO !== '' &&
                Number(model.CORR_EMPLEADO_SUSTITUTO) > 0
                    ? String(model.CORR_EMPLEADO_SUSTITUTO)
                    : null,
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

	/**
	 * Ejecuta una operación del flujo de la requisición (Enviar/Aprobar/Devolver/Rechazar).
	 * Inyectable desde otros componentes: ScRequisicionPersonalService.autoriza(...).
	 */
	autoriza(payload: {
		CORR_REQUISICION_PERSONAL: number;
		OPERACION: number;
		OBSERVACION: string;
		CORR_UNIDAD_DOCUMENTO?: number | null;
		CORR_ACCION?: number | null;
	}): Observable<IResult> {
		return this.repo.autoriza({
			CORR_REQUISICION_PERSONAL: payload.CORR_REQUISICION_PERSONAL,
			OPERACION: payload.OPERACION,
			OBSERVACION: payload.OBSERVACION,
			CORR_UNIDAD_DOCUMENTO: payload.CORR_UNIDAD_DOCUMENTO ?? null,
			CORR_ACCION: payload.CORR_ACCION ?? null,
		});
	}

	/** JWT RPT para iframe SelectionHiring.aspx (visor universal del módulo). */
	getRptToken(): Observable<any> {
		return this.repo.getRptToken();
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

	decidirCandidato(model: {
		CORR_REQUISICION_PERSONAL: number;
		CORR_SOLICITUD_EMPLEO: number;
		CORR_EXPEDIENTE_CANDIDATO: number;
		ESTADO_DECISION: string;
		OBSERVACION_DECISION?: string;
	}): Observable<IResult> {
		return this.requisicionCandidatoService.decide(model);
	}

	getEstadoDecisionLabel(estado: string | null | undefined): string {
		return this.requisicionCandidatoService.getEstadoDecisionLabel(estado);
	}

	// Qué hace: Retorna el texto descriptivo del estado del expediente del candidato.
	// Cómo lo hace: Homologa los estados de selección (2, 3, 4) como 'Proceso de selección', 5 como 'Contratado' y 1 como 'Borrador'.
	getEstadoExpedienteLabel(corrEstado?: number): string {
		const corr = Number(corrEstado) || 0;
		if (corr === 5) {
			return 'Contratado';
		}
		if (corr >= 2 && corr <= 4) {
			return 'Proceso de selección';
		}
		if (corr === 1) {
			return 'Borrador';
		}
		return '';
	}

	/** Entrevistas del candidato/solicitud/requisición (permiso requisición). */
	getEntrevistasCandidato(
		corrExpediente: number,
		corrSolicitudEmpleo: number,
		corrRequisicionPersonal: number
	): Observable<IResult> {
		const xWhere: IParam[] = [
			{ Parameter: 'CORR_EXPEDIENTE_CANDIDATO', Value: corrExpediente },
			{ Parameter: 'CORR_SOLICITUD_EMPLEO', Value: corrSolicitudEmpleo },
		];
		if (corrRequisicionPersonal > 0) {
			xWhere.push({ Parameter: 'CORR_REQUISICION_PERSONAL', Value: corrRequisicionPersonal });
		}
		return this.entrevistaRepo.getAllForRequisicion(xWhere);
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

	/** Confirma reunión realizada (ESTADO forzado a REALIZADA). */
	marcarEntrevistaRealizadaFromRequisicion(model: {
		CORR_EXPEDIENTE_CANDIDATO: number;
		CORR_EXPEDIENTE_ENTREVISTA: number;
		RESULTADO_ENTREVISTA?: string;
		RESUMEN_ENTREVISTA?: string;
	}): Observable<IResult> {
		return this.entrevistaRepo.markAsRealizadaForRequisicion(model, [
			{ Parameter: 'CORR_EXPEDIENTE_ENTREVISTA', Value: model.CORR_EXPEDIENTE_ENTREVISTA },
			{ Parameter: 'CORR_EXPEDIENTE_CANDIDATO', Value: model.CORR_EXPEDIENTE_CANDIDATO },
		]);
	}

	/** Ítems del popup confirmar reunión realizada (resultado y resumen opcionales). */
	getMarcarRealizadaEntrevistaItems(): any[] {
		return [
			{
				dataField: 'RESULTADO_ENTREVISTA',
				label: { text: 'Resultado (opcional)' },
				colSpan: 1,
				editorType: 'dxSelectBox',
				editorOptions: {
					dataSource: this.getResultadoEntrevistaOptions(),
					valueExpr: 'value',
					displayExpr: 'text',
					searchEnabled: false,
					showClearButton: true,
					placeholder: 'Seleccione un resultado',
				},
			},
			{
				dataField: 'RESUMEN_ENTREVISTA',
				label: { text: 'Resumen — notas u observaciones (opcional)' },
				colSpan: 1,
				editorType: 'dxTextArea',
				editorOptions: {
					height: 110,
					maxLength: 2000,
					placeholder: 'Notas u observaciones de la reunión',
				},
			},
		];
	}

	/** Documentos del expediente (consulta desde requisición; mismos endpoints). */
	getAllExpedienteDocumento(corrExpediente: number): Observable<IResult> {
		return this.expedienteDocumentoRepo.getAll([
			{ Parameter: 'CORR_EXPEDIENTE_CANDIDATO', Value: corrExpediente },
		]);
	}

	getExpedienteDocumentoBlob(param: {
		CORR_EXPEDIENTE_CANDIDATO: number;
		CORR_EXPEDIENTE_DOCUMENTO: number;
		NOMBRE_ARCHIVO: string;
	}): Observable<Blob> {
		return this.expedienteDocumentoRepo.getDoc([
			{ Parameter: 'CORR_EXPEDIENTE_CANDIDATO', Value: param.CORR_EXPEDIENTE_CANDIDATO },
			{ Parameter: 'CORR_EXPEDIENTE_DOCUMENTO', Value: param.CORR_EXPEDIENTE_DOCUMENTO },
			{ Parameter: 'NOMBRE_ARCHIVO', Value: param.NOMBRE_ARCHIVO },
		]);
	}

	/** Columnas del tab Documentos en consulta (solo ver). */
	getExpedienteDocumentoColumns(): any[] {
		return [
			{ dataField: 'CORR_EXPEDIENTE_DOCUMENTO', caption: 'Corr.', width: 70 },
			{
				dataField: 'FECHA_CARGA',
				caption: 'Fecha carga',
				width: 150,
				dataType: 'datetime',
				format: 'dd/MM/yyyy',
			},
			{ dataField: 'TIPO_DOCUMENTO', caption: 'Tipo', width: 180 },
			{ dataField: 'NOMBRE_ARCHIVO', caption: 'Archivo', width: 360 },
			{ dataField: 'NOTAS', caption: 'Notas', width: 280 },
			{
				caption: 'Options',
				width: 70,
				allowSorting: false,
				allowFiltering: false,
				cellTemplate: 'documentoActionsTemplate',
				fixed: true,
				fixedPosition: 'left',
				alignment: 'center',
			},
		];
	}

	/** Combos fijos del formulario de entrevistas (estado / resultado). Tipo viene de SC_TIPO_ENTREVISTA. */
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
				width: 150,
				allowSorting: false,
				allowFiltering: false,
				cellTemplate: 'entrevistaActionsTemplate',
                alignment: 'center',
				fixed: true,
				fixedPosition: 'left',
			},
		];
	}

	/** Mismos endpoints que expediente-candidato (SC_EXPEDIENTE_ENTREVISTA_DOCUMENTO). */
	getAllEntrevistaDocumento(corrExpediente: number, corrEntrevista: number): Observable<IResult> {
		return this.entrevistaDocumentoRepo.getAll([
			{ Parameter: 'CORR_EXPEDIENTE_CANDIDATO', Value: corrExpediente },
			{ Parameter: 'CORR_EXPEDIENTE_ENTREVISTA', Value: corrEntrevista },
		]);
	}

	updateEntrevistaDocumento(model: any): Observable<IResult> {
		return this.entrevistaDocumentoRepo.update(model, [
			{ Parameter: 'CORR_EXPEDIENTE_CANDIDATO', Value: model.CORR_EXPEDIENTE_CANDIDATO },
			{ Parameter: 'CORR_EXPEDIENTE_ENTREVISTA', Value: model.CORR_EXPEDIENTE_ENTREVISTA },
			{ Parameter: 'CORR_ENTREVISTA_DOCUMENTO', Value: model.CORR_ENTREVISTA_DOCUMENTO },
		]);
	}

	deleteEntrevistaDocumento(
		corrExpediente: number,
		corrEntrevista: number,
		corrDocumento: number
	): Observable<IResult> {
		return this.entrevistaDocumentoRepo.delete([
			{ Parameter: 'CORR_EXPEDIENTE_CANDIDATO', Value: corrExpediente },
			{ Parameter: 'CORR_EXPEDIENTE_ENTREVISTA', Value: corrEntrevista },
			{ Parameter: 'CORR_ENTREVISTA_DOCUMENTO', Value: corrDocumento },
		]);
	}

	postEntrevistaDocumento(formData: FormData): Observable<IResult> {
		return this.entrevistaDocumentoRepo.postDoc(formData);
	}

	putEntrevistaDocumento(
		formData: FormData,
		corrExpediente: number,
		corrEntrevista: number,
		corrDocumento: number
	): Observable<IResult> {
		return this.entrevistaDocumentoRepo.putDoc(formData, [
			{ Parameter: 'CORR_EXPEDIENTE_CANDIDATO', Value: corrExpediente },
			{ Parameter: 'CORR_EXPEDIENTE_ENTREVISTA', Value: corrEntrevista },
			{ Parameter: 'CORR_ENTREVISTA_DOCUMENTO', Value: corrDocumento },
		]);
	}

	getEntrevistaDocumentoBlob(param: {
		CORR_EXPEDIENTE_CANDIDATO: number;
		CORR_EXPEDIENTE_ENTREVISTA: number;
		CORR_ENTREVISTA_DOCUMENTO: number;
		NOMBRE_ARCHIVO: string;
	}): Observable<Blob> {
		return this.entrevistaDocumentoRepo.getDoc([
			{ Parameter: 'CORR_EXPEDIENTE_CANDIDATO', Value: param.CORR_EXPEDIENTE_CANDIDATO },
			{ Parameter: 'CORR_EXPEDIENTE_ENTREVISTA', Value: param.CORR_EXPEDIENTE_ENTREVISTA },
			{ Parameter: 'CORR_ENTREVISTA_DOCUMENTO', Value: param.CORR_ENTREVISTA_DOCUMENTO },
			{ Parameter: 'NOMBRE_ARCHIVO', Value: param.NOMBRE_ARCHIVO },
		]);
	}

	getEntrevistaDocumentoColumns(): any[] {
		return [
			{ dataField: 'CORR_ENTREVISTA_DOCUMENTO', caption: 'Corr.', width: 70 },
			{
				dataField: 'FECHA_CARGA',
				caption: 'Fecha carga',
				width: 150,
				dataType: 'datetime',
				format: 'dd/MM/yyyy',
			},
			{ dataField: 'NOMBRE_ARCHIVO', caption: 'Archivo', width: 360 },
			{ dataField: 'NOTAS', caption: 'Notas', width: 280 },
			{
				caption: 'Options',
				width: 120,
				allowSorting: false,
				allowFiltering: false,
				cellTemplate: 'entrevistaDocumentoActionsTemplate',
				alignment: 'center',
				fixed: true,
				fixedPosition: 'left',
			},
		];
	}

	getEntrevistaDocumentoItems(): any[] {
		return [
			{
				dataField: 'NOMBRE_ARCHIVO',
				label: { visible: false },
				colSpan: 8,
				template: 'entrevistaDocumentoArchivoUploader',
			},
			{
				dataField: 'NOTAS',
				label: { text: 'Notas' },
				colSpan: 8,
				editorType: 'dxTextArea',
				editorOptions: {
					height: 100,
					maxLength: 1000,
					placeholder: 'Observaciones del adjunto',
				},
			},
		];
	}

	esValidoEntrevistaDocumento(
		model: any,
		esNuevo: boolean,
		tieneArchivoNuevo: boolean,
		msg: Function
	): boolean {
		if (esNuevo && !tieneArchivoNuevo) {
			msg('Debe seleccionar un archivo.', NotifyType.Warning);
			return false;
		}
		return true;
	}

	esValidoEntrevista(model: any, msg: Function): boolean {
		if (!model?.CORR_SOLICITUD_EMPLEO || Number(model.CORR_SOLICITUD_EMPLEO) <= 0) {
			msg('Debe indicar la solicitud de empleo.', NotifyType.Warning);
			return false;
		}
		if (!model?.CORR_REQUISICION_PERSONAL || Number(model.CORR_REQUISICION_PERSONAL) <= 0) {
			msg('Debe indicar la requisición personal de la entrevista.', NotifyType.Warning);
			return false;
		}
		if (!model?.CORR_TIPO_ENTREVISTA || Number(model.CORR_TIPO_ENTREVISTA) <= 0) {
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
	 * Descriptores de puesto filtrados por CORR_UNIDAD + CORR_PUESTO
	 * (API: SC_DESCRIPTOR_PUESTO/GetCORR_DESCRIPTOR_PUESTO_BY_PUESTO_SC_REQUISICION_PERSONAL).
	 */
    getDescriptorPuesto(param?: any): Observable<IResult> {
        const xWhere: IParam[] = [];
        if (param?.CORR_UNIDAD != null && param.CORR_UNIDAD > 0) {
            xWhere.push({ Parameter: 'CORR_UNIDAD', Value: param.CORR_UNIDAD });
        }
        if (param?.CORR_PUESTO != null && param.CORR_PUESTO > 0) {
            xWhere.push({ Parameter: 'CORR_PUESTO', Value: param.CORR_PUESTO });
        }
        return this.repo.getDescriptorPuesto(xWhere);
    }

    getColumns(): any {
        return [
            // Qué hace: define la columna correlativo ordenada de la más reciente a la más antigua por defecto.
            // Cómo lo hace: añade sortOrder: 'desc' y sortIndex: 0 en la configuración de la columna DevExtreme.
            {
                dataField: 'CORR_REQUISICION_PERSONAL',
                caption: 'Corr.',
                width: 85,
                sortOrder: 'desc',
                sortIndex: 0,
            },
            {
                dataField: 'CORR_ESTADO_REQUISICION',
                caption: 'Estado',
                width: 220,
                alignment: 'center',
                cssClass: 'requisicion-grid-estado-col',
                allowFiltering: true,
                allowHeaderFiltering: true,
                calculateCellValue: (row: any) =>
                    this.getEstadoRequisicionLabel(row?.CORR_ESTADO_REQUISICION, row?.NOMBRE_ESTADO_FLUJO),
                cellTemplate: (cellElement: HTMLElement, cellInfo: { data?: any }) => {
                    this.renderEstadoRequisicionChip(
                        cellElement,
                        cellInfo.data?.CORR_ESTADO_REQUISICION,
                        cellInfo.data?.NOMBRE_ESTADO_FLUJO
                    );
                },
                lookup: {
                    dataSource: this.estadosRequisicion,
                    valueExpr: 'CORR_ESTADO_REQUISICION',
                    displayExpr: 'ESTADO_REQUISICION',
                },
            },
            { dataField: 'FECHA_REQUISICION', caption: 'Fecha', width: 130, dataType: 'date', format: 'dd/MM/yyyy' },
            { dataField: 'NOMBRE_UNIDAD', caption: 'Unidad', width: 250 },
            { dataField: 'NOMBRE_PUESTO', caption: 'Puesto', width: 220 },
            { dataField: 'MODALIDAD_NOMBRE', caption: 'Modalidad', width: 120 },
            { dataField: 'NOMBRE_TIPO_CONTRATACION', caption: 'Tipo Contrato', width: 140 },
            // Qué hace: Muestra el conteo de plazas cubiertas sobre el total solicitado de la requisición.
            // Cómo lo hace: Formatea 'cubiertas / total' a partir de PLAZAS_CUBIERTAS y CANTIDAD_PLAZAS.
            {
                dataField: 'CANTIDAD_PLAZAS',
                caption: 'Plazas (Cubiertas / Total)',
                width: 175,
                alignment: 'center',
                calculateCellValue: (row: any) =>
                    `${row?.PLAZAS_CUBIERTAS ?? 0} / ${row?.CANTIDAD_PLAZAS ?? 0}`,
            },
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

    // Qué hace: Define los ítems del formulario principal de la requisición.
    // Cómo lo hace: Configura las propiedades de cada campo en el dx-form usando showColon: false y sufijo :* en campos obligatorios.
    getItems(): any {
        return [
            { dataField: 'CORR_REQUISICION_PERSONAL', label: { text: 'Corr.' }, colSpan: 1, editorOptions: { readOnly: true } },
								// Qué hace: Muestra el chip con el estado del flujo de la requisición.
								// Cómo lo hace: Configura label 'Estado' en colSpan: 1 alineado con el layout.
								{
									dataField: 'CORR_ESTADO_REQUISICION',
									label: { text: 'Estado' },
									colSpan: 1,
									template: 'CORR_ESTADO_REQUISICIONChip',
								},
                                {
                                    dataField: 'FECHA_REQUISICION',
                                    label: { text: 'Fecha:*', showColon: false },
                                    colSpan: 2,
                                    cssClass: 'requisicion-form-fecha',
                                    editorType: 'dxDateBox',
                                    editorOptions: {
                                        type: 'date',
                                        displayFormat: 'dd/MM/yyyy',
                                        useMaskBehavior: true,
                                        dateSerializationFormat: 'yyyy-MM-dd',
                                    }
                                },
                                {
                                    dataField: 'CORR_UNIDAD',
                                    label: { text: 'Unidad Organizativa:*', showColon: false },
                                    colSpan: 4,
                                    template: 'CORR_UNIDADLookup',
                                },
                                {
                                    dataField: 'CORR_PUESTO',
                                    label: { text: 'Puesto:*', showColon: false },
                                    colSpan: 4,
                                    template: 'CORR_PUESTOLookup',
                                },
                                {
                                    dataField: 'CORR_DESCRIPTOR_PUESTO',
                                    label: { text: 'Descriptor Puesto:*', showColon: false },
                                    colSpan: 4,
                                    template: 'CORR_DESCRIPTOR_PUESTOLookup',
                                },
                                {
                                    dataField: 'CORR_TIPO_MODALIDAD',
                                    label: { text: 'Tipo Modalidad:*', showColon: false },
                                    colSpan: 2,
                                    template: 'CORR_TIPO_MODALIDADLookup',
                                },
                                {
                                    dataField: 'CORR_TIPO_CONTRATACION',
                                    label: { text: 'Tipo Contratacion:*', showColon: false },
                                    colSpan: 2,
                                    template: 'CORR_TIPO_CONTRATACIONLookup',
                                },
                                {
                                    dataField: 'CORR_TIPO_VACANTE',
                                    label: { text: 'Tipo Vacante:*', showColon: false },
                                    colSpan: 2,
                                    template: 'CORR_TIPO_VACANTELookup',
                                },
                                // Qué hace: Configuración de cantidad de plazas requeridas con mínimo 1.
                                // Cómo lo hace: Establece editorType dxNumberBox con min: 1 y spin buttons.
                                {
                                    dataField: 'CANTIDAD_PLAZAS',
                                    label: { text: 'Cantidad plazas:*', showColon: false },
                                    colSpan: 1,
                                    editorType: 'dxNumberBox',
                                    editorOptions: { min: 1, showSpinButtons: true },
                                },
                                // Qué hace: Muestra las plazas cubiertas en modo solo lectura.
                                // Cómo lo hace: Configura editorType dxNumberBox con readOnly: true para que sea visible pero no editable.
                                {
                                    dataField: 'PLAZAS_CUBIERTAS',
                                    label: { text: 'Plazas cubiertas' },
                                    colSpan: 1,
                                    editorType: 'dxNumberBox',
                                    editorOptions: { readOnly: true },
                                },
                                // Qué hace: Selector lookup de empleado sustituto si el tipo de vacante lo requiere.
                                // Cómo lo hace: Utiliza template CORR_EMPLEADO_SUSTITUTOLookup (app-data-lookup) con ancho completo colSpan: 8.
                                {
                                    dataField: 'CORR_EMPLEADO_SUSTITUTO',
                                    label: { text: 'Empleado sustituto:*', showColon: false },
                                    visible: false, // Visible cuando REQUIERE_SUSTITUCION === true
                                    colSpan: 8,
                                    template: 'CORR_EMPLEADO_SUSTITUTOLookup',
                                },
                                {
                                    dataField: 'SALARIO',
                                    label: { text: 'Salario:*', showColon: false },
                                    colSpan: 1,
                                    editorType: 'dxNumberBox',
                                    editorOptions: { min: 0, format: '#,##0.00' },
                                },
                                {
                                    dataField: 'TIEMPO_CONTRATO',
                                    label: { text: 'Tiempo contrato (meses):*', showColon: false },
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
            { dataField: 'CORR_REQUISICION_PERSONAL', caption: 'Corr. Requisición', width: 130 },
            { dataField: 'LOGIN_SISTEMA', caption: 'Usuario', width: 140 },
            {
                dataField: 'ESTADO_DESTINO',
                caption: 'Estado destino',
                width: 220,
                calculateCellValue: (row: any) => this.formatearNombreEstadoFlujo(row?.ESTADO_DESTINO),
            },
            // Qué hace: define la columna Fecha / Hora ordenada de la acción más reciente a la más antigua.
            // Cómo lo hace: añade sortOrder: 'desc' y calculateSortValue: 'CORR_BITACORA' para desempatar acciones del mismo minuto.
            {
                dataField: 'FECHA_ACCION',
                caption: 'Fecha / Hora',
                width: 170,
                dataType: 'datetime',
                format: 'dd/MM/yyyy HH:mm',
                calculateSortValue: 'CORR_BITACORA',
                sortOrder: 'desc',
                sortIndex: 0,
            },
            { dataField: 'COMENTARIO', caption: 'Comentario', minWidth: 280 },
        ];
    }

    getBitacoraSummary(): any {
        return {
            totalItems: [{ column: 'LOGIN_SISTEMA', summaryType: 'count', valueFormat: '#,##0', displayFormat: 'Cant: {0}' }],
        };
    }

    	/** Ítems del dx-form de entrevistas. tipoOptions = catálogo SC_TIPO_ENTREVISTA. */
	getEntrevistaItems(tipoOptions: any[] = []): any[] {
		return [
			{
				dataField: 'CORR_TIPO_ENTREVISTA',
				label: { text: 'Tipo de entrevista' },
				colSpan: 2,
				editorType: 'dxSelectBox',
				editorOptions: {
					dataSource: tipoOptions,
					displayExpr: 'TIPO_ENTREVISTA',
					valueExpr: 'CORR_TIPO_ENTREVISTA',
					searchEnabled: true,
					searchExpr: ['TIPO_ENTREVISTA', 'DESCRIPCION_ENTREVISTA'],
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
    // Qué hace: Retorna la definición de columnas para el grid de candidatos de la requisición.
    // Cómo lo hace: Mapea las propiedades del modelo y formatea fechas, estado de expediente y decisión de jefatura.
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
                caption: 'Estado expediente',
                width: 180,
                calculateCellValue: (row: any) => this.getEstadoExpedienteLabel(row?.CORR_ESTADO_EXPEDIENTE),
            },
            {
                dataField: 'ESTADO_DECISION',
                caption: 'Decisión jefatura',
                width: 150,
                calculateCellValue: (row: any) => this.getEstadoDecisionLabel(row?.ESTADO_DECISION),
            },
            { dataField: 'USUARIO_DECISION', caption: 'Decidió', width: 140 },
            {
                dataField: 'FECHA_DECISION',
                caption: 'Fecha decisión',
                width: 150,
                dataType: 'datetime',
                format: 'dd/MM/yyyy HH:mm',
            },
            { dataField: 'CORR_SOLICITUD_EMPLEO', caption: 'Solicitud de empleo', width: 170 },
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
