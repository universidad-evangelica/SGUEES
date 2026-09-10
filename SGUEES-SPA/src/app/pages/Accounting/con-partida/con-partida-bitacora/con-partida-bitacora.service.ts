import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { ConPartidaBitacoraRepository } from './con-partida-bitacora.repository';

@Injectable({
	providedIn: 'root',
})
export class ConPartidaBitacoraService {
	// Qué hace: consulta la bitácora de una partida.
	// Cómo lo hace: arma where por llave de partida y llama GetAll del repo.
	constructor(private repo: ConPartidaBitacoraRepository) {}

	getAll(param: any): Observable<IResult> {
		return this.repo.get(this.buildWhere(param));
	}

	// Qué hace: columnas de la grilla de bitácora (solo lectura).
	// Cómo lo hace: Usuario / Tipo evento / Estado / Observaciones / Fecha.
	getColumns(): any[] {
		return [
			{ dataField: 'USUARIO_CREA', caption: 'Usuario', width: 140 },
			{ dataField: 'TIPO_EVENTO', caption: 'Tipo evento', width: 170 },
			{ dataField: 'NOMBRE_ESTADO_NUEVO', caption: 'Estado', width: 140 },
			{
				dataField: 'OBSERVACION',
				caption: 'Observaciones',
				minWidth: 260,
				// Qué hace: texto completo en consulta (sin truncar con "...").
				// Cómo lo hace: el grid usa wordWrapEnabled; la celda hace wrap.
			},
			{
				dataField: 'FECHA_EVENTO',
				caption: 'Fecha',
				width: 170,
				dataType: 'datetime',
				format: 'dd/MM/yyyy HH:mm',
			},
		];
	}

	private buildWhere(param: any): IParam[] {
		return [
			{ Parameter: 'ANIO_PERIODO', Value: param.ANIO_PERIODO },
			{ Parameter: 'MES_PERIODO', Value: param.MES_PERIODO },
			{ Parameter: 'CORR_CLASE_PARTIDA', Value: param.CORR_CLASE_PARTIDA },
			{ Parameter: 'CORR_PARTIDA', Value: param.CORR_PARTIDA },
		];
	}
}
