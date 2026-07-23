import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { buildAuditGridColumns } from 'src/app/shared/mtto/mtto-grid.helpers';
import { createEstadoColumnConfig, ESTADO_ACTIVO_INACTIVO_LABELS } from 'src/app/shared/utils/remote-grid-filter.util';

import { BanTipoMoviBancarioRepository } from './ban-tipo-movi-bancario.repository';
import { BanTipoMoviBancario } from './models/ban-tipo-movi-bancario';

const ESTADO_FIELD = 'ESTADO_TIPO_MOVIMIENTO';

@Injectable({
	providedIn: 'root',
})
export class BanTipoMoviBancarioService {
	constructor(private repo: BanTipoMoviBancarioRepository) {}

	esValido(model: BanTipoMoviBancario, msg: Function): boolean {
		if (!model.NOMBRE_TIPO_MOVIMIENTO?.trim()) {
			msg('Debe digitar el nombre del tipo de movimiento', NotifyType.Warning);
			return false;
		}
		if (!model.NOMBRE_TIPO_CORTO?.trim()) {
			msg('Debe digitar el nombre corto del tipo de movimiento', NotifyType.Warning);
			return false;
		}
		return true;
	}

	getAll(param: any): Observable<IResult> {
		const xWhere: IParam[] = [{ Parameter: 'CORR_TIPO_MOVIMIENTO', Value: param.CORR_TIPO_MOVIMIENTO }];
		return this.repo.get(xWhere);
	}

	get(param: any): Observable<IResult> {
		const xWhere: IParam[] = [{ Parameter: 'CORR_TIPO_MOVIMIENTO', Value: param.CORR_TIPO_MOVIMIENTO }];
		return this.repo.get(xWhere);
	}

	insert(model: any): Observable<IResult> {
		return this.repo.create(model);
	}

	update(model: any): Observable<IResult> {
		const xWhere: IParam[] = [{ Parameter: 'CORR_TIPO_MOVIMIENTO', Value: model.CORR_TIPO_MOVIMIENTO }];
		return this.repo.update(model, xWhere);
	}

	delete(model: any): Observable<IResult> {
		const xWhere: IParam[] = [{ Parameter: 'CORR_TIPO_MOVIMIENTO', Value: model.CORR_TIPO_MOVIMIENTO }];
		return this.repo.delete(xWhere);
	}

	activarInactivar(model: any): Observable<IResult> {
		return this.repo.activarInactivar(model, [
			{ Parameter: 'CORR_TIPO_MOVIMIENTO', Value: model.CORR_TIPO_MOVIMIENTO },
		]);
	}

	getColumns(): any {
		return [
			{ dataField: 'CORR_TIPO_MOVIMIENTO', caption: 'Corr.', width: 80 },
			{ dataField: 'NOMBRE_TIPO_MOVIMIENTO', caption: 'Nombre tipo movimiento' },
			{ dataField: 'NOMBRE_TIPO_CORTO', caption: 'Nombre corto', width: 100 },
			{ dataField: 'NOMBRE_LINEA_TRABAJO', caption: 'Línea trabajo', width: 160 },
			{ dataField: 'NOMBRE_CLASE_PARTIDA', caption: 'Clase partida', width: 160 },
			{ dataField: 'NOMBRE_SUMA_RESTA', caption: 'Suma / Resta', width: 110 },
			{ dataField: 'NOMBRE_CLASE_MOVIMIENTO', caption: 'Clase movimiento', width: 180 },
			{ dataField: 'USA_CHEQUE_PROPIO', caption: 'Usa cheque propio', width: 120, dataType: 'boolean' },
			createEstadoColumnConfig(ESTADO_FIELD, ESTADO_ACTIVO_INACTIVO_LABELS),
			...buildAuditGridColumns(),
		];
	}

	getSummary(): any {
		return {
			totalItems: [{ column: 'CORR_TIPO_MOVIMIENTO', summaryType: 'count', valueFormat: '#,##0', displayFormat: 'Cant: {0}' }],
		};
	}

	getItems(): any {
		return [
			{ dataField: 'CORR_TIPO_MOVIMIENTO', label: { text: 'Corr.' }, colSpan: 2, editorOptions: { readOnly: true } },
			{
				dataField: 'NOMBRE_TIPO_MOVIMIENTO',
				label: { text: 'Nombre tipo movimiento' },
				colSpan: 4,
				editorOptions: { showClearButton: true, maxLength: 100 },
			},
			{
				dataField: 'NOMBRE_TIPO_CORTO',
				label: { text: 'Nombre corto' },
				colSpan: 2,
				editorOptions: { showClearButton: true, maxLength: 5 },
			},
			{
				dataField: 'CORR_LINEA',
				label: { text: 'Línea trabajo' },
				colSpan: 4,
				template: 'CORR_LINEALookup',
			},
			{
				dataField: 'CORR_CLASE_PARTIDA',
				label: { text: 'Clase partida' },
				colSpan: 4,
				template: 'CORR_CLASE_PARTIDALookup',
			},
			{
				dataField: 'SUMA_RESTA',
				label: { text: 'Suma / Resta' },
				colSpan: 4,
				template: 'SUMA_RESTALookup',
			},
			{
				dataField: 'CLASE_MOVIMIENTO',
				label: { text: 'Clase movimiento' },
				colSpan: 4,
				template: 'CLASE_MOVIMIENTOLookup',
			},
			{
				dataField: 'CUENTA_CONTABLE_GASTO',
				label: { text: 'Cuenta contable gasto' },
				colSpan: 4,
				template: 'CUENTA_CONTABLE_GASTOLookup',
			},
			{
				dataField: 'NOMBRE_REPORTE',
				label: { text: 'Nombre reporte' },
				colSpan: 4,
				editorOptions: { showClearButton: true, maxLength: 50 },
			},
			{
				dataField: 'USA_CHEQUE_PROPIO',
				label: { text: 'Usa cheque propio' },
				colSpan: 2,
				editorType: 'dxCheckBox',
			},
			{ dataField: 'ESTADO_TIPO_MOVIMIENTO', label: { text: 'Activo' }, editorType: 'dxCheckBox', colSpan: 2 },
		];
	}
}
