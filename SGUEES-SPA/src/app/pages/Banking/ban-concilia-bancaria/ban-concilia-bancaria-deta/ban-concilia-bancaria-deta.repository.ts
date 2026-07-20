import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { IResult } from 'src/app/FxAPI/IResult';
import { IParam } from 'src/app/FxAPI/IParam';
import { CData } from 'src/app/FxAPI/CData';
import { BanConciliaBancariaDeta } from '../models/ban-concilia-bancaria-deta';

@Injectable({ providedIn: 'root' })
export class BanConciliaBancariaDetaRepository {
	readonly xController = 'BAN_CONCILIA_BANCARIA_DETA';

	constructor(private objData: CData) {}

	getAll(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Get(this.xController, 'GetAll', xWhere, environment.UrlCONTAAPI);
	}

	create(model: BanConciliaBancariaDeta): Observable<IResult> {
		return this.objData.Post(model, this.xController, 'Post', environment.UrlCONTAAPI);
	}

	update(model: BanConciliaBancariaDeta, xWhere: IParam[]): Observable<IResult> {
		return this.objData.Put(model, this.xController, 'Put', xWhere, environment.UrlCONTAAPI);
	}

	delete(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Delete(this.xController, 'Delete', xWhere, environment.UrlCONTAAPI);
	}
}
