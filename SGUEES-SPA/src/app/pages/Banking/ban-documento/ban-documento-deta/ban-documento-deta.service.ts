import { Observable } from 'rxjs';

import { Injectable } from '@angular/core';

import { IParam } from 'src/app/FxAPI/IParam';

import { IResult } from 'src/app/FxAPI/IResult';



import {

	BanDocumentoDetaApiScope,

	BanDocumentoDetaRepository,

} from './ban-documento-deta.repository';

import { BanDocumentoDeta } from '../models/ban-documento-deta';



@Injectable({

	providedIn: 'root',

})

export class BanDocumentoDetaService {

	constructor(private repo: BanDocumentoDetaRepository) {}



	getAll(scope: BanDocumentoDetaApiScope, param: any): Observable<IResult> {

		const xWhere: IParam[] = [

			{ Parameter: 'ANIO_PERIODO', Value: param.ANIO_PERIODO },

			{ Parameter: 'MES_PERIODO', Value: param.MES_PERIODO },

			{ Parameter: 'CORR_TIPO_MOVIMIENTO', Value: param.CORR_TIPO_MOVIMIENTO },

			{ Parameter: 'CORR_DOCUMENTO', Value: param.CORR_DOCUMENTO },

		];

		return this.repo.get(scope, xWhere);

	}



	insert(scope: BanDocumentoDetaApiScope, model: BanDocumentoDeta): Observable<IResult> {

		return this.repo.create(scope, model);

	}



	update(scope: BanDocumentoDetaApiScope, model: BanDocumentoDeta): Observable<IResult> {

		const xWhere: IParam[] = [

			{ Parameter: 'ANIO_PERIODO', Value: model.ANIO_PERIODO },

			{ Parameter: 'MES_PERIODO', Value: model.MES_PERIODO },

			{ Parameter: 'CORR_TIPO_MOVIMIENTO', Value: model.CORR_TIPO_MOVIMIENTO },

			{ Parameter: 'CORR_DOCUMENTO', Value: model.CORR_DOCUMENTO },

			{ Parameter: 'CORR_DOCUMENTO_DETA', Value: model.CORR_DOCUMENTO_DETA },

		];

		return this.repo.update(scope, model, xWhere);

	}



	delete(scope: BanDocumentoDetaApiScope, model: BanDocumentoDeta): Observable<IResult> {

		const xWhere: IParam[] = [

			{ Parameter: 'ANIO_PERIODO', Value: model.ANIO_PERIODO },

			{ Parameter: 'MES_PERIODO', Value: model.MES_PERIODO },

			{ Parameter: 'CORR_TIPO_MOVIMIENTO', Value: model.CORR_TIPO_MOVIMIENTO },

			{ Parameter: 'CORR_DOCUMENTO', Value: model.CORR_DOCUMENTO },

			{ Parameter: 'CORR_DOCUMENTO_DETA', Value: model.CORR_DOCUMENTO_DETA },

		];

		return this.repo.delete(scope, xWhere);

	}

}


