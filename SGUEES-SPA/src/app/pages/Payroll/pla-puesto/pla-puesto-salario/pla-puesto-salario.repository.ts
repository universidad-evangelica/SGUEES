// Qué hace: acceso HTTP a los salarios del puesto.
// Cómo: controller PLA_PUESTO_SALARIO (GetAll, Post, Put, Delete).
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CData } from 'src/app/FxAPI/CData';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class PlaPuestoSalarioRepository {
	readonly xController = 'PLA_PUESTO_SALARIO';

	constructor(private objData: CData) {}

	getAll(corrPuesto: number): Observable<IResult> {
		return this.objData.Get(
			this.xController,
			'GetAll',
			[{ Parameter: 'CORR_PUESTO', Value: corrPuesto ?? 0 }],
			environment.UrlTALENTOHUMANONAPI
		);
	}

	create(row: any): Observable<IResult> {
		return this.objData.Post(this.body(row), this.xController, '', environment.UrlTALENTOHUMANONAPI);
	}

	update(row: any): Observable<IResult> {
		return this.objData.Put(
			this.body(row),
			this.xController,
			'',
			[{ Parameter: 'CORR_PUESTO_SALARIO', Value: row?.CORR_PUESTO_SALARIO ?? 0 }],
			environment.UrlTALENTOHUMANONAPI
		);
	}

	delete(corrPuestoSalario: number): Observable<IResult> {
		return this.objData.Delete(
			this.xController,
			'',
			[{ Parameter: 'CORR_PUESTO_SALARIO', Value: corrPuestoSalario ?? 0 }],
			environment.UrlTALENTOHUMANONAPI
		);
	}

	private body(row: any): any {
		return {
			CORR_PUESTO_SALARIO: Number(row?.CORR_PUESTO_SALARIO) > 0 ? Number(row.CORR_PUESTO_SALARIO) : 0,
			CORR_PUESTO: Number(row?.CORR_PUESTO) > 0 ? Number(row.CORR_PUESTO) : 0,
			CORR_UNIDAD: Number(row?.CORR_UNIDAD) > 0 ? Number(row.CORR_UNIDAD) : null,
			SALARIO_INICIAL: this.numero(row?.SALARIO_INICIAL),
			SALARIO_FINAL: this.numero(row?.SALARIO_FINAL),
			FECHA_INGRESO: row?.FECHA_INGRESO || null,
			ACTIVO_PUESTO_SALARIO: row?.ACTIVO_PUESTO_SALARIO !== false && row?.ACTIVO_PUESTO_SALARIO !== 0,
		};
	}

	private numero(valor: any): number | null {
		if (valor == null || valor === '' || Number.isNaN(Number(valor))) {
			return null;
		}
		return Number(valor);
	}
}
