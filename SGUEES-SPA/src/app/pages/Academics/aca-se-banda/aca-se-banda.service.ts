// Qué hace: servicio de negocio del catálogo bandas socioeconómico.
// Cómo lo hace: valida rango/código, ejecuta CRUD vía repositorio y arma columnas/formulario (patrón aca-se-version).
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { createEstadoColumnConfig, ESTADO_ACTIVO_INACTIVO_LABELS } from 'src/app/shared/utils/remote-grid-filter.util';
import { createDateTimeFilterExpression } from 'src/app/shared/utils/remote-header-filter.util';
import { AcaSeBanda } from './models/aca-se-banda';
import { AcaSeBandaRepository } from './aca-se-banda.repository';

const ESTADO_FIELD = 'ACTIVO';

@Injectable({ providedIn: 'root' })
export class AcaSeBandaService {
	constructor(private repo: AcaSeBandaRepository) {}

	// Qué hace: valida el formulario antes de guardar.
	// Cómo lo hace: exige código de regla (máx 30) y VALOR_HASTA > VALOR_DESDE.
	esValido(model: AcaSeBanda, msg: Function): boolean {
		if (!model.CODIGO_REGLA || model.CODIGO_REGLA.trim() === '') {
			msg('Debe ingresar el código de regla (código de pregunta MONTO).', NotifyType.Warning);
			return false;
		}
		if (model.CODIGO_REGLA.trim().length > 30) {
			msg('El código de regla no puede superar 30 caracteres.', NotifyType.Warning);
			return false;
		}
		if (model.VALOR_DESDE === null || model.VALOR_DESDE === undefined || isNaN(Number(model.VALOR_DESDE))) {
			msg('Debe ingresar el valor desde.', NotifyType.Warning);
			return false;
		}
		if (model.VALOR_HASTA === null || model.VALOR_HASTA === undefined || isNaN(Number(model.VALOR_HASTA))) {
			msg('Debe ingresar el valor hasta.', NotifyType.Warning);
			return false;
		}
		if (Number(model.VALOR_HASTA) <= Number(model.VALOR_DESDE)) {
			msg('El valor hasta debe ser mayor que el valor desde.', NotifyType.Warning);
			return false;
		}
		if (model.PUNTAJE === null || model.PUNTAJE === undefined || isNaN(Number(model.PUNTAJE))) {
			msg('Debe ingresar el puntaje.', NotifyType.Warning);
			return false;
		}
		return true;
	}

	getAll(param: any): Observable<IResult> {
		return this.repo.getAll(this.buildWhere(param));
	}

	get(param: any): Observable<IResult> {
		return this.repo.get([{ Parameter: 'CORR_BANDA', Value: param.CORR_BANDA }]);
	}

	insert(model: any): Observable<IResult> {
		return this.repo.create(this.normalizarPayload(model));
	}

	update(model: any): Observable<IResult> {
		return this.repo.update(this.normalizarPayload(model), [
			{ Parameter: 'CORR_BANDA', Value: model.CORR_BANDA },
		]);
	}

	delete(model: any): Observable<IResult> {
		return this.repo.delete([{ Parameter: 'CORR_BANDA', Value: model.CORR_BANDA }]);
	}

	activarInactivar(model: any): Observable<IResult> {
		return this.repo.activarInactivar(model, [{ Parameter: 'CORR_BANDA', Value: model.CORR_BANDA }]);
	}

	getColumns(): any {
		return [
			{
				dataField: 'CORR_BANDA',
				caption: 'Corr.',
				width: 90,
				dataType: 'number',
				filterOperations: ['=', '<', '>', '<=', '>='],
			},
			{ dataField: 'CODIGO_REGLA', caption: 'Código regla', width: 160, minWidth: 120 },
			{
				dataField: 'VALOR_DESDE',
				caption: 'Valor desde',
				width: 130,
				dataType: 'number',
				format: '#,##0.00',
				filterOperations: ['=', '<', '>', '<=', '>='],
			},
			{
				dataField: 'VALOR_HASTA',
				caption: 'Valor hasta',
				width: 130,
				dataType: 'number',
				format: '#,##0.00',
				filterOperations: ['=', '<', '>', '<=', '>='],
			},
			{
				dataField: 'PUNTAJE',
				caption: 'Puntaje',
				width: 110,
				dataType: 'number',
				format: '#,##0.00',
				filterOperations: ['=', '<', '>', '<=', '>='],
			},
			createEstadoColumnConfig(ESTADO_FIELD, ESTADO_ACTIVO_INACTIVO_LABELS, { caption: 'Estado' }),
			{ dataField: 'USUARIO_CREA', caption: 'Usuario crea', width: 160 },
			{
				dataField: 'FECHA_CREA',
				caption: 'Fecha crea',
				width: 180,
				dataType: 'datetime',
				format: 'dd/MM/yyyy HH:mm',
				calculateFilterExpression: createDateTimeFilterExpression('FECHA_CREA'),
			},
		];
	}

	getSummary(): any {
		return {
			totalItems: [
				{
					column: 'CORR_BANDA',
					summaryType: 'count',
					valueFormat: '#,##0',
					displayFormat: 'Cant: {0}',
				},
			],
		};
	}

	getItems(): any {
		return [
			{ dataField: 'CORR_BANDA', label: { text: 'Corr.' }, colSpan: 2, editorOptions: { readOnly: true } },
			{
				dataField: 'CODIGO_REGLA',
				label: { text: 'Código regla' },
				colSpan: 2,
				editorOptions: {
					placeholder: 'Ej. ING_EST_LIQ...',
					showClearButton: true,
					maxLength: 30,
				},
				validationRules: [{ type: 'required', message: 'Este campo es obligatorio' }],
			},
			{
				dataField: 'VALOR_DESDE',
				label: { text: 'Valor desde' },
				editorType: 'dxNumberBox',
				colSpan: 2,
				editorOptions: { format: '#,##0.00', showSpinButtons: true },
				validationRules: [{ type: 'required', message: 'Este campo es obligatorio' }],
			},
			{
				dataField: 'VALOR_HASTA',
				label: { text: 'Valor hasta' },
				editorType: 'dxNumberBox',
				colSpan: 2,
				editorOptions: { format: '#,##0.00', showSpinButtons: true },
				validationRules: [{ type: 'required', message: 'Este campo es obligatorio' }],
			},
			{
				dataField: 'PUNTAJE',
				label: { text: 'Puntaje' },
				editorType: 'dxNumberBox',
				colSpan: 2,
				editorOptions: { format: '#,##0.00', showSpinButtons: true },
				validationRules: [{ type: 'required', message: 'Este campo es obligatorio' }],
			},
			{ dataField: 'ACTIVO', label: { text: 'Activo' }, editorType: 'dxCheckBox', colSpan: 2 },
		];
	}

	private normalizarPayload(model: any): any {
		return {
			CORR_BANDA: model?.CORR_BANDA ?? 0,
			CODIGO_REGLA: typeof model?.CODIGO_REGLA === 'string' ? model.CODIGO_REGLA.trim() : model?.CODIGO_REGLA,
			VALOR_DESDE: Number(model?.VALOR_DESDE ?? 0),
			VALOR_HASTA: Number(model?.VALOR_HASTA ?? 0),
			PUNTAJE: Number(model?.PUNTAJE ?? 0),
			ACTIVO: model?.ACTIVO,
			CORR_EMPRESA: model?.CORR_EMPRESA ?? 1,
		};
	}

	private buildWhere(param: any): IParam[] {
		const xWhere: IParam[] = [];
		if (param.CORR_BANDA) {
			xWhere.push({ Parameter: 'CORR_BANDA', Value: param.CORR_BANDA });
		}
		if (param.CODIGO_REGLA) {
			xWhere.push({ Parameter: 'CODIGO_REGLA', Value: param.CODIGO_REGLA });
		}
		return xWhere;
	}
}
