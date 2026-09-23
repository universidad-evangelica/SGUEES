import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { IResult } from 'src/app/FxAPI/IResult';
import { NotifyType } from 'src/app/shared/models/NotifyType';

import { ScMovimientoPersonalRepository } from './sc-movimiento-personal.repository';
import { ScMovimientoPersonal } from './models/sc-movimiento-personal';

@Injectable({
	providedIn: 'root',
})
export class ScMovimientoPersonalService {
	constructor(private repo: ScMovimientoPersonalRepository) {}

	/** Catálogo de estados de negocio (chip / grid). */
	readonly estadosMovimiento: { CODIGO: string; NOMBRE: string }[] = [
		{ CODIGO: 'DI', NOMBRE: 'Borrador' },
		{ CODIGO: 'SO', NOMBRE: 'Solicitado' },
		{ CODIGO: 'OB', NOMBRE: 'Devuelto' },
		{ CODIGO: 'AP', NOMBRE: 'Aprobado' },
		{ CODIGO: 'DE', NOMBRE: 'Denegado' },
		{ CODIGO: 'AN', NOMBRE: 'Anulado' },
	];

	readonly tiposMovimiento: { CODIGO: string; NOMBRE: string }[] = [
		//{ CODIGO: 'PERMANENTE', NOMBRE: 'Contratación permanente' },
		//{ CODIGO: 'EVENTUAL', NOMBRE: 'Contratación eventual' },
		{ CODIGO: 'ASCENSO', NOMBRE: 'Ascenso' },
		{ CODIGO: 'TRASLADO', NOMBRE: 'Traslado' },
	];

	//#region Validadores
	esValido(model: ScMovimientoPersonal, msg: Function): boolean {
		const origen = `${model?.ORIGEN_MOVIMIENTO || 'DIRECTO'}`.trim().toUpperCase();
		if (origen === 'DIRECTO' && !(Number(model?.CORR_EMPLEADO) > 0)) {
			msg('Debe seleccionar el empleado.', NotifyType.Warning);
			return false;
		}

		if (!model?.NOMBRE_COMPLETO?.trim()) {
			msg('Debe indicar el nombre completo.', NotifyType.Warning);
			return false;
		}

		const tipo = `${model.TIPO_MOVIMIENTO || ''}`.trim().toUpperCase();
		if (!['PERMANENTE', 'EVENTUAL', 'ASCENSO', 'TRASLADO'].includes(tipo)) {
			msg('Debe seleccionar un tipo de movimiento.', NotifyType.Warning);
			return false;
		}

		if (!`${model.GERENCIA_PROPUESTA || ''}`.trim()) {
			msg('Debe indicar la gerencia / vicerrectoría / facultad propuesta.', NotifyType.Warning);
			return false;
		}

		if (!model.CORR_UNIDAD_PROPUESTA || model.CORR_UNIDAD_PROPUESTA <= 0) {
			msg('Debe indicar la unidad / departamento propuesto.', NotifyType.Warning);
			return false;
		}

		if (!model.CORR_PUESTO_PROPUESTO || model.CORR_PUESTO_PROPUESTO <= 0) {
			msg('Debe indicar el cargo propuesto.', NotifyType.Warning);
			return false;
		}

		if (model.SALARIO_PROPUESTO != null && Number(model.SALARIO_PROPUESTO) < 0) {
			msg('El salario propuesto no puede ser negativo.', NotifyType.Warning);
			return false;
		}

		if (this.muestraFechaFinalizacion(model)) {
			if (!model.FECHA_FINALIZACION) {
				msg('En contratación eventual debe indicar la fecha de finalización.', NotifyType.Warning);
				return false;
			}
			if (
				model.FECHA_INGRESO_PROPUESTA &&
				new Date(model.FECHA_FINALIZACION) < new Date(model.FECHA_INGRESO_PROPUESTA)
			) {
				msg('La fecha de finalización no puede ser anterior a la de ingreso.', NotifyType.Warning);
				return false;
			}
		} else {
			model.FECHA_FINALIZACION = null;
		}

		if (tipo === 'ASCENSO' || tipo === 'TRASLADO') {
			if (!model.CORR_UNIDAD_ACTUAL || model.CORR_UNIDAD_ACTUAL <= 0
				|| !model.CORR_PUESTO_ACTUAL || model.CORR_PUESTO_ACTUAL <= 0) {
				msg('En ascenso o traslado debe indicar la posición actual.', NotifyType.Warning);
				return false;
			}
		}

		return true;
	}

	/**
	 * Fecha de finalización solo si el movimiento viene de requisición
	 * y esa requisición es contratación eventual (CORR_TIPO_CONTRATACION = 2).
	 */
	muestraFechaFinalizacion(model?: Partial<ScMovimientoPersonal> | null): boolean {
		const origen = `${model?.ORIGEN_MOVIMIENTO || ''}`.trim().toUpperCase();
		return origen === 'REQUISICION' && Number(model?.CORR_TIPO_CONTRATACION) === 2;
	}

	/** Editable solo Borrador (DI) o Devuelto (OB). */
	esEstadoEditable(estado?: string): boolean {
		const e = `${estado || 'DI'}`.trim().toUpperCase();
		return e === 'DI' || e === 'OB';
	}

	/** Enviable: mismos estados editables. */
	esEstadoEnviable(estado?: string): boolean {
		return this.esEstadoEditable(estado);
	}

	/**
	 * Confirmable: CONFIRMADO=0 y
	 * (REQUISICION desde que existe) o (DIRECTO solo si ESTADO=AP).
	 */
	esConfirmable(model?: Partial<ScMovimientoPersonal> | null): boolean {
		if (!model || (Number(model.CORR_MOVIMIENTO_PERSONAL) || 0) <= 0) {
			return false;
		}
		if (this.esConfirmado(model.CONFIRMADO)) {
			return false;
		}

		const origen = `${model.ORIGEN_MOVIMIENTO || ''}`.trim().toUpperCase();
		const estado = `${model.ESTADO_MOVIMIENTO || ''}`.trim().toUpperCase();

		if (origen === 'REQUISICION') {
			return true;
		}
		if (origen === 'DIRECTO') {
			return estado === 'AP';
		}
		return false;
	}

	esConfirmado(valor?: boolean | number | null): boolean {
		return valor === true || valor === 1;
	}

	getConfirmacionLabel(model?: Partial<ScMovimientoPersonal> | null): string {
		if (model?.NOMBRE_CONFIRMACION) {
			return model.NOMBRE_CONFIRMACION;
		}
		return this.esConfirmado(model?.CONFIRMADO) ? 'Confirmado' : 'En Evaluación';
	}

	getEstadoLabel(estado?: string): string {
		const e = `${estado || 'DI'}`.trim().toUpperCase();
		return this.estadosMovimiento.find((x) => x.CODIGO === e)?.NOMBRE ?? e;
	}

	getEstadoBadgeClass(estado?: string): string {
		switch (`${estado || 'DI'}`.trim().toUpperCase()) {
			case 'DI':
				return 'estado-mov--borrador';
			case 'SO':
				return 'estado-mov--solicitado';
			case 'OB':
				return 'estado-mov--devuelto';
			case 'AP':
				return 'estado-mov--aprobado';
			case 'DE':
				return 'estado-mov--denegado';
			case 'AN':
				return 'estado-mov--anulado';
			default:
				return 'estado-mov--borrador';
		}
	}
	//#endregion

	//#region CRUD
	getAll(param: any): Observable<IResult> {
		return this.repo.getAll([{ Parameter: 'CORR_MOVIMIENTO_PERSONAL', Value: param.CORR_MOVIMIENTO_PERSONAL ?? 0 }]);
	}

	insert(model: any): Observable<IResult> {
		return this.repo.create(model);
	}

	update(model: any): Observable<IResult> {
		return this.repo.update(model, [
			{ Parameter: 'CORR_MOVIMIENTO_PERSONAL', Value: model.CORR_MOVIMIENTO_PERSONAL },
		]);
	}

	delete(param: any): Observable<IResult> {
		return this.repo.delete([
			{ Parameter: 'CORR_MOVIMIENTO_PERSONAL', Value: param.CORR_MOVIMIENTO_PERSONAL },
		]);
	}

	autoriza(model: {
		CORR_MOVIMIENTO_PERSONAL: number;
		OPERACION: number;
		OBSERVACION: string;
		CORR_UNIDAD_DOCUMENTO?: number | null;
	}): Observable<IResult> {
		return this.repo.autoriza(model);
	}

	confirmar(model: {
		CORR_MOVIMIENTO_PERSONAL: number;
		FECHA_EFECTIVA?: Date | string | null;
	}): Observable<IResult> {
		return this.repo.confirmar(model);
	}

	getBitacora(param: any): Observable<IResult> {
		return this.repo.getBitacora([
			{ Parameter: 'CORR_MOVIMIENTO_PERSONAL', Value: param.CORR_MOVIMIENTO_PERSONAL },
		]);
	}
	//#endregion

	//#region Grid / Form
	getColumns(): any[] {
		return [
			{ dataField: 'CORR_MOVIMIENTO_PERSONAL', caption: 'Corr.', width: 90 },
			{ dataField: 'FECHA_ELABORACION', caption: 'Fecha', width: 120, dataType: 'date', format: 'dd/MM/yyyy' },
			{
				dataField: 'ESTADO_MOVIMIENTO',
				caption: 'Estado',
				width: 130,
				alignment: 'center',
				allowFiltering: true,
				calculateCellValue: (row: any) => this.getEstadoLabel(row?.ESTADO_MOVIMIENTO),
				cellTemplate: (container: HTMLElement, options: any) => {
					const estado = options?.data?.ESTADO_MOVIMIENTO;
					const chip = document.createElement('span');
					chip.className = `estado-mov-chip ${this.getEstadoBadgeClass(estado)}`;
					chip.textContent = this.getEstadoLabel(estado);
					chip.title = chip.textContent;
					container.appendChild(chip);
				},
			},
			{
				dataField: 'NOMBRE_CONFIRMACION',
				caption: 'Confirmación',
				width: 150,
				alignment: 'center',
				calculateCellValue: (row: any) => this.getConfirmacionLabel(row),
				cellTemplate: (container: HTMLElement, options: any) => {
					const row = options?.data;
					const confirmado = this.esConfirmado(row?.CONFIRMADO);
					const chip = document.createElement('span');
					chip.className = `estado-mov-chip ${confirmado ? 'estado-mov--confirmado' : 'estado-mov--evaluacion'}`;
					chip.textContent = this.getConfirmacionLabel(row);
					chip.title = chip.textContent;
					container.appendChild(chip);
				},
			},
			{ dataField: 'NOMBRE_TIPO_MOVIMIENTO', caption: 'Tipo', width: 100 },
			{ dataField: 'NOMBRE_COMPLETO', caption: 'Nombre', width: 250 },
			{ dataField: 'NUMERO_ID', caption: 'Documento', width: 130 },
			{ dataField: 'NOMBRE_UNIDAD_PROPUESTA', caption: 'Unidad propuesta', width: 200 },
			{ dataField: 'NOMBRE_PUESTO_PROPUESTO', caption: 'Puesto propuesto', width: 200 },
			{ dataField: 'SALARIO_PROPUESTO', caption: 'Salario prop.', width: 140, format: '#,##0.00' },
			{ dataField: 'NOMBRE_ORIGEN_MOVIMIENTO', caption: 'Origen', width: 140 },
			{ dataField: 'USUARIO_CREA', caption: 'Usuario crea', width: 140 },
			{ dataField: 'FECHA_CREA', caption: 'Fecha crea', width: 140, dataType: 'date', format: 'dd/MM/yyyy' },
		];
	}

	getSummary(): any {
		return {
			totalItems: [
				{
					column: 'CORR_MOVIMIENTO_PERSONAL',
					summaryType: 'count',
					valueFormat: '#,##0',
					displayFormat: 'Cant: {0}',
				},
			],
		};
	}

	getBitacoraColumns(): any[] {
		return [
			{ dataField: 'FECHA_ACCION', caption: 'Fecha', width: 160, dataType: 'datetime', format: 'dd/MM/yyyy HH:mm' },
			{ dataField: 'LOGIN_SISTEMA', caption: 'Usuario', width: 140 },
			{ dataField: 'ESTADO_DESTINO', caption: 'Estado', width: 160 },
			{ dataField: 'COMENTARIO', caption: 'Comentario', width: 400 },
		];
	}

	getItems(origenMovimiento: string = 'DIRECTO', corrTipoContratacion?: number | null): any[] {
		const esDirecto = `${origenMovimiento || 'DIRECTO'}`.trim().toUpperCase() === 'DIRECTO';
		const muestraFechaFinalizacion = this.muestraFechaFinalizacion({
			ORIGEN_MOVIMIENTO: origenMovimiento,
			CORR_TIPO_CONTRATACION: corrTipoContratacion,
		});
		const campoFechaFinalizacion = muestraFechaFinalizacion
			? {
					dataField: 'FECHA_FINALIZACION',
					label: { text: 'Fecha de finalización (eventual)' },
					colSpan: 2,
					editorType: 'dxDateBox',
					editorOptions: { displayFormat: 'dd/MM/yyyy', openOnFieldClick: true, showClearButton: true },
			  }
			: null;
		const campoPersona = esDirecto
			? {
					dataField: 'CORR_EMPLEADO',
					label: { text: 'Empleado' },
					colSpan: 8,
					template: 'CORR_EMPLEADOLookup',
			  }
			: {
					dataField: 'NOMBRE_COMPLETO',
					label: { text: 'Nombre completo' },
					colSpan: 4,
					editorOptions: { maxLength: 250, showClearButton: true },
			  };

		return [
			{
				itemType: 'group',
				colCount: 8,
				colSpan: 8,
				cssClass: 'movimiento-grupo-encabezado',
				items: [
					{
						itemType: 'simple',
						colSpan: 8,
						template: 'EncabezadoConFechaTemplate',
						cssClass: 'movimiento-encabezado-titulo-item',
					},
					{
						dataField: 'CORR_MOVIMIENTO_PERSONAL',
						label: { text: 'Corr.' },
						colSpan: 1,
						editorOptions: { readOnly: true },
					},
					{
						dataField: 'ESTADO_MOVIMIENTO',
						label: { text: 'Estado' },
						colSpan: 1,
						template: 'ESTADO_MOVIMIENTOChip',
					},
					{
						dataField: 'ORIGEN_MOVIMIENTO',
						label: { text: 'Origen' },
						colSpan: 2,
						editorType: 'dxSelectBox',
						editorOptions: {
							dataSource: [
								{ CODIGO: 'DIRECTO', NOMBRE: 'Desde cero' },
								{ CODIGO: 'REQUISICION', NOMBRE: 'Desde requisición' },
							],
							valueExpr: 'CODIGO',
							displayExpr: 'NOMBRE',
							readOnly: true,
						},
					},
					{
						dataField: 'FECHA_ELABORACION',
						label: { text: 'Fecha de elaboración' },
						colSpan: 2,
						editorType: 'dxDateBox',
						editorOptions: { displayFormat: 'dd/MM/yyyy', openOnFieldClick: true },
					},
					{
						dataField: 'TIPO_MOVIMIENTO',
						label: { text: 'Tipo de movimiento' },
						colSpan: 2,
						editorType: 'dxSelectBox',
						editorOptions: {
							dataSource: this.tiposMovimiento,
							valueExpr: 'CODIGO',
							displayExpr: 'NOMBRE',
							searchEnabled: false,
						},
					},
					campoPersona,
					{
						dataField: 'NUMERO_ID',
						label: { text: 'Número de ID / documento' },
						colSpan: 2,
						editorOptions: { maxLength: 50, showClearButton: true },
					},
					{
						dataField: 'FECHA_INGRESO_PROPUESTA',
						label: { text: 'Fecha de ingreso propuesta' },
						colSpan: 2,
						editorType: 'dxDateBox',
						editorOptions: { displayFormat: 'dd/MM/yyyy', openOnFieldClick: true, showClearButton: true },
					},
					...(campoFechaFinalizacion ? [campoFechaFinalizacion] : []),
				],
			},
			{
				itemType: 'group',
				caption: 'Posición actual',
				colCount: 8,
				colSpan: 8,
				items: [
					{
						dataField: 'GERENCIA_ACTUAL',
						label: { text: 'Gerencia / Vicerrectoría / Facultad' },
						colSpan: 4,
						editorOptions: { maxLength: 200, showClearButton: true },
					},
					{
						dataField: 'CORR_UNIDAD_ACTUAL',
						label: { text: 'Departamento / Unidad' },
						colSpan: 4,
						template: 'CORR_UNIDAD_ACTUALLookup',
					},
					{
						dataField: 'CORR_PUESTO_ACTUAL',
						label: { text: 'Cargo' },
						colSpan: 4,
						template: 'CORR_PUESTO_ACTUALLookup',
					},
					{
						dataField: 'SALARIO_ACTUAL',
						label: { text: 'Salario mensual' },
						colSpan: 2,
						editorType: 'dxNumberBox',
						editorOptions: { format: '#,##0.00', min: 0, showClearButton: true },
					},
					{
						dataField: 'CORR_TIPO_MODALIDAD_ACTUAL',
						label: { text: 'Modalidad de trabajo' },
						colSpan: 2,
						template: 'CORR_TIPO_MODALIDAD_ACTUALLookup',
					},
					{
						dataField: 'HORARIO_ACTUAL',
						label: { text: 'Horario de trabajo' },
						colSpan: 8,
						editorOptions: { maxLength: 250, showClearButton: true },
					},
				],
			},
			{
				itemType: 'group',
				caption: 'Posición propuesta',
				colCount: 8,
				colSpan: 8,
				items: [
					{
						dataField: 'GERENCIA_PROPUESTA',
						label: { text: 'Gerencia / Vicerrectoría / Facultad' },
						colSpan: 4,
						template: 'CORR_GERENCIA_PROPUESTALookup',
					},
					{
						dataField: 'CORR_UNIDAD_PROPUESTA',
						label: { text: 'Departamento / Unidad' },
						colSpan: 4,
						template: 'CORR_UNIDAD_PROPUESTALookup',
					},
					{
						dataField: 'CORR_PUESTO_PROPUESTO',
						label: { text: 'Cargo' },
						colSpan: 4,
						template: 'CORR_PUESTO_PROPUESTOLookup',
					},
					{
						dataField: 'SALARIO_PROPUESTO',
						label: { text: 'Salario mensual' },
						colSpan: 2,
						editorType: 'dxNumberBox',
						editorOptions: { format: '#,##0.00', min: 0, showClearButton: true },
					},
					{
						dataField: 'CORR_TIPO_MODALIDAD_PROPUESTA',
						label: { text: 'Modalidad de trabajo' },
						colSpan: 2,
						template: 'CORR_TIPO_MODALIDAD_PROPUESTALookup',
					},
					{
						dataField: 'HORARIO_PROPUESTO',
						label: { text: 'Horario de trabajo' },
						colSpan: 8,
						editorOptions: { maxLength: 250, showClearButton: true },
					},
				],
			},
			{
				itemType: 'group',
				caption: 'Justificación',
				colCount: 8,
				colSpan: 8,
				items: [
					{
						dataField: 'JUSTIFICACION',
						label: { text: 'Justificación' },
						colSpan: 8,
						editorType: 'dxTextArea',
						editorOptions: { height: 90, maxLength: 1000 },
					},
				],
			},
		];
	}
	//#endregion
}
