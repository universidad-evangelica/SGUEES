import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { IResult } from 'src/app/FxAPI/IResult';
import { NotifyType } from 'src/app/shared/models/NotifyType';

import { ConPartidaImportarExcelRepository } from './con-partida-importar-excel.repository';
import { ConPartidaImportParam, ConPartidaImportRow } from './models/con-partida-importar-excel';

@Injectable({
	providedIn: 'root',
})
export class ConPartidaImportarExcelService {
	constructor(private repo: ConPartidaImportarExcelRepository) {}

	esValido(corrClasePartida: number, rows: ConPartidaImportRow[], msg: Function): boolean {
		if (!corrClasePartida || corrClasePartida <= 0) {
			msg('Debe seleccionar la clase de partida', NotifyType.Error);
			return false;
		}
		if (!rows || rows.length === 0) {
			msg('Debe cargar al menos una fila desde el archivo Excel', NotifyType.Error);
			return false;
		}
		return true;
	}

	importar(model: ConPartidaImportParam): Observable<IResult> {
		const payload: ConPartidaImportParam = {
			CORR_CLASE_PARTIDA: model.CORR_CLASE_PARTIDA,
			Rows: model.Rows.map(row => ({
				FECHA_PARTIDA: row.FECHA_PARTIDA,
				NUMERO_DOCUMENTO: row.NUMERO_DOCUMENTO,
				CUENTA_CONTABLE: row.CUENTA_CONTABLE,
				CODIGO_CENTRO_COSTO: row.CODIGO_CENTRO_COSTO,
				CORR_CENTRO_COSTO: row.CORR_CENTRO_COSTO,
				NOMBRE_TRAN: row.NOMBRE_TRAN,
				MONTO_CARGO: row.MONTO_CARGO || 0,
				MONTO_ABONO: row.MONTO_ABONO || 0,
			})),
		};
		return this.repo.importarExcel(payload);
	}

	getPreviewColumns(): any[] {
		return [
			{ dataField: 'FECHA_PARTIDA', caption: 'Fecha', dataType: 'date', width: 110 },
			{ dataField: 'NUMERO_DOCUMENTO', caption: 'No. Documento', width: 130 },
			{ dataField: 'CUENTA_CONTABLE', caption: 'Cuenta', width: 120 },
			{ dataField: 'CODIGO_CENTRO_COSTO', caption: 'Cod. CC', width: 90 },
			{ dataField: 'CORR_CENTRO_COSTO', caption: 'Corr. CC', width: 90 },
			{ dataField: 'NOMBRE_TRAN', caption: 'Concepto', width: 220 },
			{ dataField: 'MONTO_CARGO', caption: 'Cargo', dataType: 'number', format: '#,##0.00', width: 110 },
			{ dataField: 'MONTO_ABONO', caption: 'Abono', dataType: 'number', format: '#,##0.00', width: 110 },
		];
	}
}
