import { Observable } from 'rxjs';

import { Injectable } from '@angular/core';

import { IParam } from 'src/app/FxAPI/IParam';

import { IResult } from 'src/app/FxAPI/IResult';



import { ConPartidaDetaRepository } from './con-partida-deta.repository';

import { ConPartidaDeta } from './models/con-partida-deta';



@Injectable({

	providedIn: 'root',

})

export class ConPartidaDetaService {

	constructor(private repo: ConPartidaDetaRepository) {}



	esValido(model: ConPartidaDeta, msg: Function): boolean {

		return true;

	}



	getAll(param: any): Observable<IResult> {

		return this.repo.get(this.buildWhere(param));

	}



	get(param: any): Observable<IResult> {

		return this.repo.get(this.buildWhere(param, true));

	}



	insert(model: any): Observable<IResult> {

		return this.repo.create(model);

	}



	update(model: any): Observable<IResult> {

		return this.repo.update(model, this.buildWhere(model, true));

	}



	delete(model: any): Observable<IResult> {

		return this.repo.delete(this.buildWhere(model, true));

	}



	private buildWhere(param: any, includeLine = false): IParam[] {

		const xWhere: IParam[] = [

			{ Parameter: 'ANIO_PERIODO', Value: param.ANIO_PERIODO },

			{ Parameter: 'MES_PERIODO', Value: param.MES_PERIODO },

			{ Parameter: 'CORR_CLASE_PARTIDA', Value: param.CORR_CLASE_PARTIDA },

			{ Parameter: 'CORR_PARTIDA', Value: param.CORR_PARTIDA },

		];

		if (includeLine && param.CORR_PARTIDA_DETA) {

			xWhere.push({ Parameter: 'CORR_PARTIDA_DETA', Value: param.CORR_PARTIDA_DETA });

		}

		return xWhere;

	}



	getColumns(): any {

		return [

			{ dataField: 'CORR_PARTIDA_DETA', caption: 'Línea', width: 70 },

			{ dataField: 'CUENTA_CONTABLE', caption: 'Cuenta', width: 130 },

			{ dataField: 'NOMBRE_CUENTA', caption: 'Nombre Cuenta', width: 250 },

			{ dataField: 'NOMBRE_CENTRO', caption: 'Centro Costo', width: 150 },

			{ dataField: 'NOMBRE_TRAN', caption: 'Concepto', width: 300 },

			{ dataField: 'MONTO_CARGO', caption: 'Cargo', width: 120, format: '#,##0.00' },

			{ dataField: 'MONTO_ABONO', caption: 'Abono', width: 120, format: '#,##0.00' },

		];

	}



	getSummary(): any {

		return {

			totalItems: [{ column: 'CORR_PARTIDA_DETA', summaryType: 'count', valueFormat: '#,##0', displayFormat: 'Cant: {0}' }],

		};

	}



	getItems(): any {

		return [

			{ dataField: 'CORR_PARTIDA_DETA', label: { text: 'Línea' }, colSpan: 2, editorOptions: { placeholder: 'Línea...', showClearButton: true } },

			{ dataField: 'CUENTA_CONTABLE', label: { text: 'Cuenta' }, colSpan: 2, editorOptions: { placeholder: 'Cuenta...', showClearButton: true } },

			{ dataField: 'NOMBRE_CUENTA', label: { text: 'Nombre Cuenta' }, colSpan: 2, editorOptions: { placeholder: 'Nombre Cuenta...', showClearButton: true } },

			{ dataField: 'NOMBRE_CENTRO', label: { text: 'Centro Costo' }, colSpan: 2, editorOptions: { placeholder: 'Centro Costo...', showClearButton: true } },

			{ dataField: 'NOMBRE_TRAN', label: { text: 'Concepto' }, colSpan: 2, editorOptions: { placeholder: 'Concepto...', showClearButton: true } },

			{ dataField: 'MONTO_CARGO', label: { text: 'Cargo' }, colSpan: 2, editorOptions: { placeholder: 'Cargo...', showClearButton: true } },

			{ dataField: 'MONTO_ABONO', label: { text: 'Abono' }, colSpan: 2, editorOptions: { placeholder: 'Abono...', showClearButton: true } },

		];

	}

}

