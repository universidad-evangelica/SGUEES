// Qué hace: servicio de negocio del browse de Empleado.
// Cómo lo hace: consulta GetAll/Get y define columnas/summary de la grilla (estándar mtto).
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { buildAuditGridColumns } from 'src/app/shared/mtto/mtto-grid.helpers';
import { createEstadoColumnConfig, ESTADO_ACTIVO_INACTIVO_LABELS } from 'src/app/shared/utils/remote-grid-filter.util';
import { GenEmpleadoRepository } from './gen-empleado.repository';

const ESTADO_FIELD = 'ACTIVO_EMPLEADO';

@Injectable({ providedIn: 'root' })
export class GenEmpleadoService {
	constructor(private repo: GenEmpleadoRepository) {}

	getAll(param: any): Observable<IResult> {
		return this.repo.getAll(this.buildWhere(param));
	}

	get(param: any): Observable<IResult> {
		return this.repo.get([{ Parameter: 'CORR_EMPLEADO', Value: param.CORR_EMPLEADO }]);
	}

	// Qué hace: columnas de la grilla browse de empleados.
	// Cómo lo hace: anchos fijos + estado ACTIVO/INACTIVO + auditoría.
	getColumns(): any {
		return [
			{
				dataField: 'CORR_EMPLEADO',
				caption: 'Corr.',
				width: 90,
				dataType: 'number',
				filterOperations: ['=', '<', '>', '<=', '>='],
			},
			{ dataField: 'CODIGO_EMPLEADO', caption: 'Código', width: 110, minWidth: 90 },
			{ dataField: 'NOMBRE_EMPLEADO', caption: 'Persona', width: 280, minWidth: 200 },
			{ dataField: 'DUI', caption: 'DUI', width: 120, minWidth: 100 },
			{
				dataField: 'FECHA_INGRESO',
				caption: 'Fecha ingreso',
				width: 130,
				dataType: 'date',
				format: 'dd/MM/yyyy',
			},
			{ dataField: 'CORREO_INSTITUCIONAL', caption: 'Correo', width: 220, minWidth: 160 },
			{ dataField: 'TELEFONO_INSTITUCIONAL', caption: 'Teléfono', width: 130, minWidth: 110 },
			{ dataField: 'LOGIN_SISTEMA_WEB', caption: 'Login', width: 140, minWidth: 110 },
			createEstadoColumnConfig(ESTADO_FIELD, ESTADO_ACTIVO_INACTIVO_LABELS, { caption: 'Estado' }),
			...buildAuditGridColumns({ withDateTimeFilter: true }),
		];
	}

	getSummary(): any {
		return {
			totalItems: [
				{
					column: 'CORR_EMPLEADO',
					summaryType: 'count',
					valueFormat: '#,##0',
					displayFormat: 'Cant: {0}',
				},
			],
		};
	}

	private buildWhere(param: any): IParam[] {
		const xWhere: IParam[] = [];
		if (param?.CORR_EMPLEADO) {
			xWhere.push({ Parameter: 'CORR_EMPLEADO', Value: param.CORR_EMPLEADO });
		}
		return xWhere;
	}
}
