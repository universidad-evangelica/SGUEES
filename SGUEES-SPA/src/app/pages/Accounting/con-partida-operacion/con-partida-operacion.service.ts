import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { ConPartidaOperacionRepository } from './con-partida-operacion.repository';

export type ConPartidaOperacionModo = 'aplicar' | 'desaplicar' | 'anular';

@Injectable({
	providedIn: 'root',
})
export class ConPartidaOperacionService {
	constructor(private repo: ConPartidaOperacionRepository) {}

	getAll(modo: ConPartidaOperacionModo, param: any): Observable<IResult> {
		const xWhere: IParam[] = [
			{ Parameter: 'FECHA_INICIAL', Value: param.FECHA_INICIAL },
			{ Parameter: 'FECHA_FINAL', Value: param.FECHA_FINAL },
		];
		if (modo === 'aplicar') {
			return this.repo.getAllAplicar(xWhere);
		}
		if (modo === 'desaplicar') {
			return this.repo.getAllDesAplicar(xWhere);
		}
		return this.repo.getAllAnular(xWhere);
	}

	ejecutar(modo: ConPartidaOperacionModo, model: any): Observable<IResult> {
		const xWhere: IParam[] = [
			{ Parameter: 'ANIO_PERIODO', Value: model.ANIO_PERIODO },
			{ Parameter: 'MES_PERIODO', Value: model.MES_PERIODO },
			{ Parameter: 'CORR_CLASE_PARTIDA', Value: model.CORR_CLASE_PARTIDA },
			{ Parameter: 'CORR_PARTIDA', Value: model.CORR_PARTIDA },
		];
		if (modo === 'aplicar') {
			return this.repo.aplicar(model, xWhere);
		}
		if (modo === 'desaplicar') {
			return this.repo.desAplicar(model, xWhere);
		}
		return this.repo.anular(model, xWhere);
	}

	getAccionLabel(modo: ConPartidaOperacionModo): string {
		if (modo === 'aplicar') return 'Aplicar';
		if (modo === 'desaplicar') return 'Des Aplicar';
		return 'Anular';
	}
}
