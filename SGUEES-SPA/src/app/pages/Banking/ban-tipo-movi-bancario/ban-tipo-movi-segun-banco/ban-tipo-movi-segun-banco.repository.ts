import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { IResult } from 'src/app/FxAPI/IResult';
import { IParam } from 'src/app/FxAPI/IParam';
import { CData } from 'src/app/FxAPI/CData';
import { BanTipoMoviSegunBanco } from '../models/ban-tipo-movi-segun-banco';

@Injectable({ providedIn: 'root' })
export class BanTipoMoviSegunBancoRepository {
	readonly xController = 'BAN_TIPO_MOVI_SEGUN_BANCO';

	constructor(private objData: CData) {}

	getAll(corrTipoMovimiento: number): Observable<IResult> {
		return this.objData.Get(
			this.xController,
			'GetAll',
			[{ Parameter: 'CORR_TIPO_MOVIMIENTO', Value: corrTipoMovimiento }],
			environment.UrlCONTAAPI
		);
	}

	create(model: BanTipoMoviSegunBanco): Observable<IResult> {
		return this.objData.Post(model, this.xController, 'Post', environment.UrlCONTAAPI);
	}

	update(model: BanTipoMoviSegunBanco): Observable<IResult> {
		return this.objData.Put(model, this.xController, 'Put', this.buildKeyParams(model), environment.UrlCONTAAPI);
	}

	delete(model: BanTipoMoviSegunBanco): Observable<IResult> {
		return this.objData.Delete(this.xController, 'Delete', this.buildKeyParams(model), environment.UrlCONTAAPI);
	}

	buildKeyParams(model: BanTipoMoviSegunBanco): IParam[] {
		return [
			{ Parameter: 'CORR_EMPRESA', Value: model.CORR_EMPRESA },
			{ Parameter: 'CORR_TIPO_MOVIMIENTO', Value: model.CORR_TIPO_MOVIMIENTO },
			{ Parameter: 'CORR_BANCO', Value: model.CORR_BANCO },
			{ Parameter: 'CODIGO_MOVIMIENTO', Value: model.CODIGO_MOVIMIENTO },
		];
	}
}
