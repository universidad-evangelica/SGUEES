import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { BanSoliChequeDetaRepository } from './ban-soli-cheque-deta.repository';
import { BanSoliChequeDeta } from '../models/ban-soli-cheque-deta';

@Injectable({
	providedIn: 'root',
})
export class BanSoliChequeDetaService {
	constructor(private repo: BanSoliChequeDetaRepository) {}

	getAll(param: any): Observable<IResult> {
		const xWhere: IParam[] = [
			{ Parameter: 'ANIO_PERIODO', Value: param.ANIO_PERIODO },
			{ Parameter: 'MES_PERIODO', Value: param.MES_PERIODO },
			{ Parameter: 'CORR_TIPO_MOVIMIENTO', Value: param.CORR_TIPO_MOVIMIENTO },
			{ Parameter: 'CORR_DOCUMENTO', Value: param.CORR_DOCUMENTO },
		];
		return this.repo.get(xWhere);
	}

	insert(model: BanSoliChequeDeta): Observable<IResult> {
		return this.repo.create(model);
	}

	update(model: BanSoliChequeDeta): Observable<IResult> {
		const xWhere: IParam[] = [
			{ Parameter: 'ANIO_PERIODO', Value: model.ANIO_PERIODO },
			{ Parameter: 'MES_PERIODO', Value: model.MES_PERIODO },
			{ Parameter: 'CORR_TIPO_MOVIMIENTO', Value: model.CORR_TIPO_MOVIMIENTO },
			{ Parameter: 'CORR_DOCUMENTO', Value: model.CORR_DOCUMENTO },
			{ Parameter: 'CORR_DOCUMENTO_DETA', Value: model.CORR_DOCUMENTO_DETA },
		];
		return this.repo.update(model, xWhere);
	}

	delete(model: BanSoliChequeDeta): Observable<IResult> {
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
