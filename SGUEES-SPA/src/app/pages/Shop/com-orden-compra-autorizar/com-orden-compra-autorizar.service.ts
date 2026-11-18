import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';

import { ComOrdenCompraAutorizarRepository } from './com-orden-compra-autorizar.repository';

@Injectable({
	providedIn: 'root',
})
export class ComOrdenCompraAutorizarService {
	constructor(private repo: ComOrdenCompraAutorizarRepository) {}

	private pkWhere(model: any): IParam[] {
		return [
			{ Parameter: 'ANIO_PERIODO', Value: model.ANIO_PERIODO },
			{ Parameter: 'CORR_ORDEN_COMPRA', Value: model.CORR_ORDEN_COMPRA },
		];
	}

	private toTable(model: any): any {
		return {
			ANIO_PERIODO: model.ANIO_PERIODO,
			CORR_ORDEN_COMPRA: model.CORR_ORDEN_COMPRA || 0,
			CORR_TIPO_DOC: model.CORR_TIPO_DOC || null,
			CORR_PROVEEDOR: model.CORR_PROVEEDOR,
			ATENCION_A: model.ATENCION_A || null,
			FECHA_ORDEN: model.FECHA_ORDEN_COMPRA || model.FECHA_ORDEN,
			ESTADO_ORDEN: model.ESTADO_ORDEN_COMPRA || model.ESTADO_ORDEN || 'SO',
			OBSERVACIONES: model.OBSERVACIONES || null,
			COMPRA_TOTAL: model.COMPRA_TOTAL ?? model.TOTAL_ORDEN ?? model.MONTO_SUBTOTAL ?? 0,
			MONTO_EN_LETRAS: model.TOTAL_EN_LETRAS || null,
			NUMERO_ORDEN_COMPRA: model.NUMERO_ORDEN_COMPRA || null,
			CORR_CONDICION_PAGO: model.CORR_CONDICION_PAGO || null,
			CORR_FORMA_PAGO: model.CORR_FORMA_PAGO || null,
			DETALLE_FORMA_PAGO: model.DETALLE_FORMA_PAGO || null,
		};
	}

	getPendientesAutorizar(param: any): Observable<IResult> {
		const xWhere: IParam[] = [
			{ Parameter: 'FECHA_INICIAL', Value: param.FECHA_INICIAL },
			{ Parameter: 'FECHA_FINAL', Value: param.FECHA_FINAL },
		];
		return this.repo.getPendientesAutorizar(xWhere);
	}

	Autorizar(model: any): Observable<IResult> {
		return this.repo.Autorizar(this.toTable(model), this.pkWhere(model));
	}

	Anular(model: any): Observable<IResult> {
		return this.repo.Anular(this.toTable(model), this.pkWhere(model));
	}

	getDetalle(param: any): Observable<IResult> {
		return this.repo.getDetalle(this.pkWhere(param));
	}
}
