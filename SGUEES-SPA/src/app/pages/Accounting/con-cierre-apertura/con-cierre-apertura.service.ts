import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';

import { ConCierreAperturaRepository } from './con-cierre-apertura.repository';
import { ConCierreAperturaModulo, ConCierreAperturaOperacion } from './models/con-cierre-apertura';
import { MESES_PERIODO } from '../con-periodo-contable/con-periodo-contable.service';

@Injectable({
	providedIn: 'root',
})
export class ConCierreAperturaService {
	readonly modulos: ConCierreAperturaModulo[] = [
		{ code: 'CON', label: 'Contabilidad' },
		{ code: 'BAN', label: 'Bancos' },
		{ code: 'VEN', label: 'Ventas' },
		{ code: 'ACT', label: 'Activo Fijo' },
		{ code: 'INV', label: 'Inventario' },
		{ code: 'PLA', label: 'Planilla' },
		{ code: 'COM', label: 'Compras' },
	];

	readonly estadosNombre: { [key: string]: string } = {
		AB: 'Abierto',
		PC: 'Proceso de Cierre',
		CE: 'Cerrado',
	};

	constructor(private repo: ConCierreAperturaRepository) {}

	enriquecer(row: any): any {
		if (!row) {
			return row;
		}
		const mes = MESES_PERIODO.find((m) => m.MES_PERIODO === row.MES_PERIODO);
		row.NOMBRE_MES_PERIODO = mes ? mes.NOMBRE_MES_PERIODO : '';
		row.NOMBRE_ESTADO_PERIODO_CON = this.estadosNombre[row.ESTADO_PERIODO_CON] || '';
		row.NOMBRE_ESTADO_PERIODO_BAN = this.estadosNombre[row.ESTADO_PERIODO_BAN] || '';
		row.NOMBRE_ESTADO_PERIODO_VEN = this.estadosNombre[row.ESTADO_PERIODO_VEN] || '';
		row.NOMBRE_ESTADO_PERIODO_ACT = this.estadosNombre[row.ESTADO_PERIODO_ACT] || '';
		row.NOMBRE_ESTADO_PERIODO_INV = this.estadosNombre[row.ESTADO_PERIODO_INV] || '';
		row.NOMBRE_ESTADO_PERIODO_PLA = this.estadosNombre[row.ESTADO_PERIODO_PLA] || '';
		row.NOMBRE_ESTADO_PERIODO_COM = this.estadosNombre[row.ESTADO_PERIODO_COM] || '';
		return row;
	}

	getAll(param: any): Observable<IResult> {
		const xWhere: IParam[] = [{ Parameter: 'ANIO_PERIODO', Value: param.ANIO_PERIODO }];
		return this.repo.getAll(xWhere);
	}

	buildOperacion(model: any, tipoPeriodo: string): ConCierreAperturaOperacion {
		return {
			CORR_EMPRESA: model.CORR_EMPRESA,
			ANIO_PERIODO: model.ANIO_PERIODO,
			MES_PERIODO: model.MES_PERIODO,
			TIPO_PERIODO: tipoPeriodo,
		};
	}

	generarCierre(model: any, tipoPeriodo: string): Observable<IResult> {
		const operacion = this.buildOperacion(model, tipoPeriodo);
		const xWhere: IParam[] = [
			{ Parameter: 'ANIO_PERIODO', Value: operacion.ANIO_PERIODO },
			{ Parameter: 'MES_PERIODO', Value: operacion.MES_PERIODO },
		];
		return this.repo.generarCierre(operacion, xWhere);
	}

	generarApertura(model: any, tipoPeriodo: string): Observable<IResult> {
		const operacion = this.buildOperacion(model, tipoPeriodo);
		const xWhere: IParam[] = [
			{ Parameter: 'ANIO_PERIODO', Value: operacion.ANIO_PERIODO },
			{ Parameter: 'MES_PERIODO', Value: operacion.MES_PERIODO },
		];
		return this.repo.generarApertura(operacion, xWhere);
	}

	getColumns(): any {
		return [
			{ dataField: 'ANIO_PERIODO', caption: 'Año', width: 90, alignment: 'center' },
			{ dataField: 'NOMBRE_MES_PERIODO', caption: 'Mes', width: 130 },
			{ dataField: 'NOMBRE_ESTADO_PERIODO_CON', caption: 'Estado Contabilidad', minWidth: 170 },
			{ dataField: 'NOMBRE_ESTADO_PERIODO_BAN', caption: 'Estado Bancos', minWidth: 150 },
			{ dataField: 'NOMBRE_ESTADO_PERIODO_VEN', caption: 'Estado Ventas', minWidth: 150 },
			{ dataField: 'NOMBRE_ESTADO_PERIODO_ACT', caption: 'Estado Activo Fijo', minWidth: 170 },
			{ dataField: 'NOMBRE_ESTADO_PERIODO_INV', caption: 'Estado Inventario', minWidth: 160 },
			{ dataField: 'NOMBRE_ESTADO_PERIODO_PLA', caption: 'Estado Planilla', minWidth: 150 },
			{ dataField: 'NOMBRE_ESTADO_PERIODO_COM', caption: 'Estado Compras', minWidth: 150 },
		];
	}

	getSummary(): any {
		return {
			totalItems: [{ column: 'ANIO_PERIODO', summaryType: 'count', valueFormat: '#,##0', displayFormat: 'Cant: {0}' }],
		};
	}
}
