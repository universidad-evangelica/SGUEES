import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { ComPagoDesAplicarRepository } from './com-pago-desaplicar.repository';

@Injectable({
	providedIn: 'root',
})
export class ComPagoDesAplicarService {
	constructor(private repo: ComPagoDesAplicarRepository) {}

	getAllDesAplicar(param: any): Observable<IResult> {
		const xWhere: IParam[] = [
			{ Parameter: 'FECHA_INICIAL', Value: param.FECHA_INICIAL },
			{ Parameter: 'FECHA_FINAL', Value: param.FECHA_FINAL },
		];
		return this.repo.getAllDesAplicar(xWhere);
	}

	DesAplicar(model: any): Observable<IResult> {
		const xWhere: IParam[] = [
			{ Parameter: 'ANIO_PERIODO', Value: model.ANIO_PERIODO },
			{ Parameter: 'MES_PERIODO', Value: model.MES_PERIODO },
			{ Parameter: 'CORR_PAGO', Value: model.CORR_PAGO },
		];
		return this.repo.DesAplicar(model, xWhere);
	}
}
