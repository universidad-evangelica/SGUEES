import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { BanConciliaBancariaDetaRepository } from './ban-concilia-bancaria-deta.repository';
import { BanConciliaBancariaDeta } from '../models/ban-concilia-bancaria-deta';

@Injectable({ providedIn: 'root' })
export class BanConciliaBancariaDetaService {
	constructor(private repo: BanConciliaBancariaDetaRepository) {}

	getAll(param: any): Observable<IResult> {
		return this.repo.getAll([
			{ Parameter: 'CORR_CUENTA_BANCO', Value: param.CORR_CUENTA_BANCO },
			{ Parameter: 'CORR_CONCILIACION', Value: param.CORR_CONCILIACION },
		]);
	}

	insert(model: BanConciliaBancariaDeta): Observable<IResult> {
		return this.repo.create(model);
	}

	update(model: BanConciliaBancariaDeta): Observable<IResult> {
		return this.repo.update(model, this.buildKeyParams(model));
	}

	delete(model: BanConciliaBancariaDeta): Observable<IResult> {
		return this.repo.delete(this.buildKeyParams(model));
	}

	buildKeyParams(model: BanConciliaBancariaDeta): IParam[] {
		return [
			{ Parameter: 'CORR_EMPRESA', Value: model.CORR_EMPRESA },
			{ Parameter: 'CORR_CUENTA_BANCO', Value: model.CORR_CUENTA_BANCO },
			{ Parameter: 'CORR_CONCILIACION', Value: model.CORR_CONCILIACION },
			{ Parameter: 'CORR_CONCILIACION_DETA', Value: model.CORR_CONCILIACION_DETA },
		];
	}
}
