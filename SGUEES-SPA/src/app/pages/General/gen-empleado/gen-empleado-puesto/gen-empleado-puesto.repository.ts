// Qué hace: acceso HTTP al API anidado de puestos del empleado.
// Cómo: controller GEN_EMPLEADO_PUESTO (GetAll + SaveAll). HORARIO_LABORAL no se envía.
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CData } from 'src/app/FxAPI/CData';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class GenEmpleadoPuestoRepository {
	readonly xController = 'GEN_EMPLEADO_PUESTO';

	constructor(private objData: CData) {}

	getAll(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Get(this.xController, 'GetAll', xWhere, environment.UrlGENERALAPI);
	}

	saveAll(corrEmpleado: number, rows: any[]): Observable<IResult> {
		const body = (rows ?? []).map((r) => ({
			CORR_EMPLEADO: corrEmpleado,
			CORR_UNIDAD: Number(r.CORR_UNIDAD) > 0 ? Number(r.CORR_UNIDAD) : 0,
			CORR_PUESTO: Number(r.CORR_PUESTO) > 0 ? Number(r.CORR_PUESTO) : 0,
			FECHA_INGRESO: r.FECHA_INGRESO || null,
			SUELDO: r.SUELDO == null || r.SUELDO === '' ? null : Number(r.SUELDO),
			CORR_TIPO_CONTRATACION:
				Number(r.CORR_TIPO_CONTRATACION) > 0 ? Number(r.CORR_TIPO_CONTRATACION) : null,
			CORR_TIPO_MODALIDAD: Number(r.CORR_TIPO_MODALIDAD) > 0 ? Number(r.CORR_TIPO_MODALIDAD) : null,
		}));
		return this.objData.Put(
			body,
			this.xController,
			'SaveAll',
			[{ Parameter: 'CORR_EMPLEADO', Value: corrEmpleado ?? 0 }],
			environment.UrlGENERALAPI
		);
	}
}
