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
		const payload = {
			CORR_EMPRESA: model.CORR_EMPRESA,
			ANIO_PERIODO: model.ANIO_PERIODO,
			MES_PERIODO: model.MES_PERIODO,
			CORR_CLASE_PARTIDA: model.CORR_CLASE_PARTIDA,
			CORR_PARTIDA: model.CORR_PARTIDA,
		};
		const xWhere: IParam[] = [
			{ Parameter: 'ANIO_PERIODO', Value: payload.ANIO_PERIODO },
			{ Parameter: 'MES_PERIODO', Value: payload.MES_PERIODO },
			{ Parameter: 'CORR_CLASE_PARTIDA', Value: payload.CORR_CLASE_PARTIDA },
			{ Parameter: 'CORR_PARTIDA', Value: payload.CORR_PARTIDA },
		];
		if (modo === 'aplicar') {
			return this.repo.aplicar(payload, xWhere);
		}
		if (modo === 'desaplicar') {
			return this.repo.desAplicar(payload, xWhere);
		}
		return this.repo.anular(payload, xWhere);
	}

	getAccionLabel(modo: ConPartidaOperacionModo): string {
		if (modo === 'aplicar') return 'Aplicar';
		if (modo === 'desaplicar') return 'Des Aplicar';
		return 'Anular';
	}
}
