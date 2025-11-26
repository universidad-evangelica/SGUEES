import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { ComCotizacionConsultaRepository } from './com-cotizacion-consulta.repository';

@Injectable({
	providedIn: 'root',
})
export class ComCotizacionConsultaService {

	constructor(private repo: ComCotizacionConsultaRepository) {}

	getAll(param: any): Observable<IResult> {
		let xWhere: IParam[] = [
      { Parameter: 'FECHA_INICIAL', Value: param.FECHA_INICIAL },
      { Parameter: 'FECHA_FINAL', Value: param.FECHA_FINAL }
    ];

		return this.repo.get(xWhere);
	}
}
