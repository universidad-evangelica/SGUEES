import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';

import { NotifyType } from 'src/app/shared/models/NotifyType';

import { ConPartidaRepository } from './con-partida.repository';
import { ConPartida } from './models/con-partida';

@Injectable({
	providedIn: 'root',
})
export class ConPartidaService {
	constructor(private repo: ConPartidaRepository) {}

	esValido(model: ConPartida, msg: Function): boolean {
		if (!model.CORR_CLASE_PARTIDA || model.CORR_CLASE_PARTIDA <= 0) {
			msg('Debe seleccionar la clase de partida', NotifyType.Error);
			return false;
		}
		if (!model.ANIO_PERIODO || model.ANIO_PERIODO <= 0) {
			msg('Debe indicar el año del periodo', NotifyType.Error);
			return false;
		}
		if (!model.MES_PERIODO || model.MES_PERIODO <= 0) {
			msg('Debe seleccionar el mes del periodo', NotifyType.Error);
			return false;
		}
		if (!model.NOMBRE_PARTIDA?.trim()) {
			msg('Debe digitar el concepto de la partida', NotifyType.Error);
			return false;
		}
		return true;
	}

	getAll(param: any): Observable<IResult> {
		let xWhere: IParam[] = [
			{ Parameter: 'CORR_PARTIDA', Value: param.CORR_PARTIDA },
			{ Parameter: 'FECHA_INICIAL', Value: param.FECHA_INICIAL },
			{ Parameter: 'FECHA_FINAL', Value: param.FECHA_FINAL },
		];
		return this.repo.get(xWhere);
	}

	get(param: any): Observable<IResult> {
		let xWhere: IParam[] = [{ Parameter: 'CORR_PARTIDA', Value: param.CORR_PARTIDA }];
		return this.repo.get(xWhere);
	}

	insert(model: any): Observable<IResult> {
		return this.repo.create(model);
	}

	update(model: any): Observable<IResult> {
		let xWhere: IParam[] = [{ Parameter: 'CORR_PARTIDA', Value: model.CORR_PARTIDA }];
		return this.repo.update(model, xWhere);
	}

	delete(model: any): Observable<IResult> {
		let xWhere: IParam[] = [{ Parameter: 'CORR_PARTIDA', Value: model.CORR_PARTIDA }];
		return this.repo.delete(xWhere);
	}

	aplicar(model: any): Observable<IResult> {
		let xWhere: IParam[] = [
			{ Parameter: 'ANIO_PERIODO', Value: model.ANIO_PERIODO },
			{ Parameter: 'MES_PERIODO', Value: model.MES_PERIODO },
			{ Parameter: 'CORR_CLASE_PARTIDA', Value: model.CORR_CLASE_PARTIDA },
			{ Parameter: 'CORR_PARTIDA', Value: model.CORR_PARTIDA },
		];
		return this.repo.aplicar(model, xWhere);
	}

	crearModelo(model: any): Observable<IResult> {
		let xWhere: IParam[] = [
			{ Parameter: 'ANIO_PERIODO', Value: model.ANIO_PERIODO },
			{ Parameter: 'MES_PERIODO', Value: model.MES_PERIODO },
			{ Parameter: 'CORR_CLASE_PARTIDA', Value: model.CORR_CLASE_PARTIDA },
			{ Parameter: 'CORR_PARTIDA', Value: model.CORR_PARTIDA },
		];
		return this.repo.crearModelo(model, xWhere);
	}

	getColumns(): any {
		return [
			{ dataField: 'ANIO_PERIODO', caption: 'Año' },
			{ dataField: 'MES_PERIODO', caption: 'Mes' },
			{ dataField: 'NOMBRE_CLASE_PARTIDA', caption: 'Clase' },
			{ dataField: 'CORR_PARTIDA', caption: 'No. Partida' },
			{ dataField: 'FECHA_PARTIDA', caption: 'Fecha', dataType: 'date' },
			{ dataField: 'NUMERO_DOCUMENTO', caption: 'No. Documento' },
			{ dataField: 'NOMBRE_PARTIDA', caption: 'Concepto' },
			{ dataField: 'NOMBRE_ESTADO_PARTIDA', caption: 'Estado' },
		];
	}

	getSummary(): any {
		return {
			totalItems: [{ column: 'ANIO_PERIODO', summaryType: 'count', valueFormat: '#,##0', displayFormat: 'Cant: {0}' }],
		};
	}

	getItems(): any {
		return [
			{
				dataField: 'ANIO_PERIODO',
				label: { text: 'Año' },
				colSpan: 2,
				editorOptions: { readOnly: true },
			},
			{
				dataField: 'MES_PERIODO',
				label: { text: 'Mes' },
				colSpan: 2,
				template: 'MES_PERIODOLookup',
			},
			{
				dataField: 'FECHA_PARTIDA',
				label: { text: 'Fecha' },
				colSpan: 2,
				editorType: 'dxDateBox',
				editorOptions: { type: 'date', displayFormat: 'dd/MM/yyyy' },
			},
			{
				dataField: 'CORR_CLASE_PARTIDA',
				label: { text: 'Clase' },
				colSpan: 2,
				template: 'CORR_CLASE_PARTIDALookup',
			},
			{
				dataField: 'ESTADO_PARTIDA',
				label: { text: 'Estado' },
				colSpan: 2,
				template: 'ESTADO_PARTIDALookup',
			},
			{
				dataField: 'CORR_PARTIDA',
				label: { text: 'No. Partida' },
				colSpan: 2,
				editorOptions: { readOnly: true },
			},
			{
				dataField: 'NUMERO_DOCUMENTO',
				label: { text: 'No. Documento' },
				colSpan: 2,
				editorOptions: { placeholder: 'No. Documento...' },
			},
			{
				dataField: 'NOMBRE_PARTIDA',
				label: { text: 'Concepto' },
				colSpan: 4,
				editorType: 'dxTextArea',
				editorOptions: { height: 64, placeholder: 'Concepto...' },
			},
		];
	}
}
