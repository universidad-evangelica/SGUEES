import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { BanChequeDetaRepository } from './ban-cheque-deta.repository';
import { BanChequeDeta } from '../models/ban-cheque-deta';

@Injectable({
	providedIn: 'root',
})
export class BanChequeDetaService {
	constructor(private repo: BanChequeDetaRepository) {}

	getAll(param: any): Observable<IResult> {
		const xWhere: IParam[] = [
			{ Parameter: 'ANIO_PERIODO', Value: param.ANIO_PERIODO },
			{ Parameter: 'MES_PERIODO', Value: param.MES_PERIODO },
			{ Parameter: 'CORR_TIPO_MOVIMIENTO', Value: param.CORR_TIPO_MOVIMIENTO },
			{ Parameter: 'CORR_DOCUMENTO', Value: param.CORR_DOCUMENTO },
		];
		return this.repo.get(xWhere);
	}

	insert(model: BanChequeDeta): Observable<IResult> {
		return this.repo.create(model);
	}

	update(model: BanChequeDeta): Observable<IResult> {
		const xWhere: IParam[] = [
			{ Parameter: 'ANIO_PERIODO', Value: model.ANIO_PERIODO },
			{ Parameter: 'MES_PERIODO', Value: model.MES_PERIODO },
			{ Parameter: 'CORR_TIPO_MOVIMIENTO', Value: model.CORR_TIPO_MOVIMIENTO },
			{ Parameter: 'CORR_DOCUMENTO', Value: model.CORR_DOCUMENTO },
			{ Parameter: 'CORR_DOCUMENTO_DETA', Value: model.CORR_DOCUMENTO_DETA },
		];
		return this.repo.update(model, xWhere);
	}

	delete(model: BanChequeDeta): Observable<IResult> {
		const xWhere: IParam[] = [
			{ Parameter: 'ANIO_PERIODO', Value: model.ANIO_PERIODO },
			{ Parameter: 'MES_PERIODO', Value: model.MES_PERIODO },
			{ Parameter: 'CORR_TIPO_MOVIMIENTO', Value: model.CORR_TIPO_MOVIMIENTO },
			{ Parameter: 'CORR_DOCUMENTO', Value: model.CORR_DOCUMENTO },
			{ Parameter: 'CORR_DOCUMENTO_DETA', Value: model.CORR_DOCUMENTO_DETA },
		];
		return this.repo.delete(xWhere);
	}
}
