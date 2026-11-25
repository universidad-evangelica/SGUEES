import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { AppInfoService } from 'src/app/shared/services/app-info.service';
import { ConPartidaContrapartidaRepository } from './con-partida-contrapartida.repository';

@Injectable({ providedIn: 'root' })
export class ConPartidaContrapartidaService {
	constructor(
		private repo: ConPartidaContrapartidaRepository,
		private appInfoService: AppInfoService
	) {}

	getElegibles(param: {
		FECHA_INICIAL: Date;
		FECHA_FINAL: Date;
		FILTRO_ANIO_PERIODO?: number;
		FILTRO_MES_PERIODO?: number;
	}): Observable<IResult> {
		const xWhere: IParam[] = [
			{ Parameter: 'FECHA_INICIAL', Value: this.appInfoService.toDate(param.FECHA_INICIAL) },
			{ Parameter: 'FECHA_FINAL', Value: this.appInfoService.toDate(param.FECHA_FINAL) },
			{ Parameter: 'FILTRO_ANIO_PERIODO', Value: param.FILTRO_ANIO_PERIODO ?? 0 },
			{ Parameter: 'FILTRO_MES_PERIODO', Value: param.FILTRO_MES_PERIODO ?? 0 },
		];
		return this.repo.getElegibles(xWhere);
	}

	generar(origen: any, destino: { ANIO_PERIODO_DESTINO: number; MES_PERIODO_DESTINO: number }): Observable<IResult> {
		const payload = {
			ANIO_PERIODO: origen.ANIO_PERIODO,
			MES_PERIODO: origen.MES_PERIODO,
			CORR_CLASE_PARTIDA: origen.CORR_CLASE_PARTIDA,
			CORR_PARTIDA: origen.CORR_PARTIDA,
			ANIO_PERIODO_DESTINO: destino.ANIO_PERIODO_DESTINO,
			MES_PERIODO_DESTINO: destino.MES_PERIODO_DESTINO,
		};
		const xWhere: IParam[] = [
			{ Parameter: 'ANIO_PERIODO', Value: payload.ANIO_PERIODO },
			{ Parameter: 'MES_PERIODO', Value: payload.MES_PERIODO },
			{ Parameter: 'CORR_CLASE_PARTIDA', Value: payload.CORR_CLASE_PARTIDA },
			{ Parameter: 'CORR_PARTIDA', Value: payload.CORR_PARTIDA },
		];
		return this.repo.generar(payload, xWhere);
	}

	getColumns(): any[] {
		return [
			{ dataField: 'CORR_PARTIDA', caption: 'No.', width: 70, alignment: 'right' },
			{ dataField: 'FECHA_PARTIDA', caption: 'Fecha', dataType: 'date', format: 'dd/MM/yyyy', width: 100 },
			{ dataField: 'NOMBRE_CLASE_PARTIDA', caption: 'Clase', width: 120 },
			{ dataField: 'NOMBRE_ESTADO_PARTIDA', caption: 'Estado', width: 95 },
			{ dataField: 'NOMBRE_PARTIDA', caption: 'Concepto', width: 220 },
		];
	}

	getDetalleColumns(): any[] {
		return [
			{ dataField: 'CORR_PARTIDA_DETA', caption: 'Lín.', width: 55, alignment: 'center' },
			{ dataField: 'CUENTA_CONTABLE', caption: 'Cuenta', width: 115 },
			{ dataField: 'NOMBRE_CUENTA', caption: 'Nombre cuenta', width: 160 },
			{ dataField: 'NOMBRE_CENTRO', caption: 'Centro', width: 110 },
			{ dataField: 'NOMBRE_TRAN', caption: 'Concepto', width: 150 },
			{ dataField: 'MONTO_CARGO', caption: 'Cargo', format: '#,##0.00', width: 100, alignment: 'right' },
			{ dataField: 'MONTO_ABONO', caption: 'Abono', format: '#,##0.00', width: 100, alignment: 'right' },
		];
	}

	getDetalleSummary(): any {
		return {
			totalItems: [
				{
					column: 'MONTO_CARGO',
					summaryType: 'sum',
					valueFormat: '#,##0.00',
					displayFormat: '{0}',
					alignByColumn: true,
				},
				{
					column: 'MONTO_ABONO',
					summaryType: 'sum',
					valueFormat: '#,##0.00',
					displayFormat: '{0}',
					alignByColumn: true,
				},
			],
		};
	}
}
