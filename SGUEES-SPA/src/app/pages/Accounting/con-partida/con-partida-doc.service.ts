import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';

import { ConPartidaRepository } from './con-partida.repository';
import { ConPartidaDoc } from './models/con-partida-doc';

@Injectable({
	providedIn: 'root',
})
export class ConPartidaDocService {
	constructor(private repo: ConPartidaRepository) {}

	getAllDetaDoc(param: any): Observable<IResult> {
		const xWhere: IParam[] = [
			{ Parameter: 'ANIO_PERIODO', Value: param.ANIO_PERIODO },
			{ Parameter: 'MES_PERIODO', Value: param.MES_PERIODO },
			{ Parameter: 'CORR_CLASE_PARTIDA', Value: param.CORR_CLASE_PARTIDA },
			{ Parameter: 'CORR_PARTIDA', Value: param.CORR_PARTIDA },
		];
		return this.repo.getAllDetaDoc(xWhere);
	}

	getColumns(): any[] {
		return [
			{ dataField: 'CORR_PARTIDA_DETA', caption: 'No. Detalle', width: 100 },
			{ dataField: 'TIPO_DOCUMENTO', caption: 'Tipo Documento', width: 130 },
			{ dataField: 'FECHA_DOCUMENTO', caption: 'Fecha Documento', dataType: 'date', width: 130 },
			{ dataField: 'NUMERO_DOCUMENTO', caption: 'No. Documento', width: 130 },
			{ dataField: 'FORMA', caption: 'Forma', width: 150 },
			{ dataField: 'ID_DOCUMENTO', caption: 'Id Documento', width: 130 },
		];
	}
}
