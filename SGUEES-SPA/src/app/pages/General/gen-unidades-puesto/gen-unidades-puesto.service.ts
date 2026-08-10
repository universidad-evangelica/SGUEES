// Qué hace: servicio de negocio de puestos por unidad.
// Cómo: valida datos, arma filtros y llama a GenUnidadesPuestoRepository; configura columnas/summary del grid de unidades.
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { GenUnidadesPuesto, GenUnidadesPuestoUnidad } from './models/gen-unidades-puesto';
import { GenUnidadesPuestoRepository } from './gen-unidades-puesto.repository';

@Injectable({ providedIn: 'root' })
// Qué hace: servicio de puestos por unidad.
// Cómo: valida la unidad/puesto y delega getAll, insert y delete en el repositorio.
export class GenUnidadesPuestoService {
	constructor(private repo: GenUnidadesPuestoRepository) {}

	// Qué hace: obtiene las asignaciones (todas o por unidad).
	// Cómo: arma xWhere con CORR_UNIDAD si viene y llama a getAll del repositorio.
	getAll(corrUnidad?: number): Observable<IResult> {
		const xWhere: IParam[] = [];
		if (corrUnidad != null && corrUnidad > 0) {
			xWhere.push({ Parameter: 'CORR_UNIDAD', Value: corrUnidad });
		}
		return this.repo.getAll(xWhere);
	}

	// Qué hace: crea una asignación de puesto a una unidad.
	// Cómo: llama a create del repositorio con el modelo recibido.
	insert(model: GenUnidadesPuesto): Observable<IResult> {
		return this.repo.create(model);
	}

	// Qué hace: elimina una asignación unidad-puesto.
	// Cómo: llama a delete del repositorio filtrando por CORR_UNIDAD y CORR_PUESTO.
	delete(model: GenUnidadesPuesto): Observable<IResult> {
		const xWhere: IParam[] = [
			{ Parameter: 'CORR_UNIDAD', Value: model.CORR_UNIDAD },
			{ Parameter: 'CORR_PUESTO', Value: model.CORR_PUESTO },
		];
		return this.repo.delete(xWhere);
	}

	// Qué hace: valida la línea de puesto antes de guardar.
	// Cómo: exige CORR_UNIDAD y CORR_PUESTO mayores a cero, notificando con msg cuando falla.
	esValidoPuesto(model: GenUnidadesPuesto, msg: Function): boolean {
		if (!model.CORR_UNIDAD || Number(model.CORR_UNIDAD) <= 0) {
			msg('Debe indicar la unidad.', NotifyType.Warning);
			return false;
		}
		if (!model.CORR_PUESTO || Number(model.CORR_PUESTO) <= 0) {
			msg('Debe seleccionar un puesto.', NotifyType.Warning);
			return false;
		}
		return true;
	}

	// Qué hace: columnas de la grilla global de unidades (mismo patrón mtto).
	// Cómo: arma Codigo, Nombre de unidad y la celda Asignar puesto (solo si canAsignar/permiteAdd).
	getColumns(
		onAsignar: (unidad: GenUnidadesPuestoUnidad) => void,
		canAsignar: () => boolean = () => true
	): any[] {
		return [
			{
				dataField: 'CORR_UNIDAD',
				caption: 'Codigo',
				width: 100,
				dataType: 'number',
				filterOperations: ['=', '<', '>', '<=', '>='],
			},
			{ dataField: 'CODIGO_UNIDAD', caption: 'Codigo unidad', width: 130 },
			{ dataField: 'NOMBRE_UNIDAD', caption: 'Unidad', width: 320 },
			{
				caption: 'Puestos',
				width: 220,
				minWidth: 200,
				allowSorting: false,
				allowFiltering: false,
				cellTemplate: (cellElement: HTMLElement, cellInfo: any) => {
					cellElement.innerHTML = '';
					const cant = String(cellInfo?.data?.CANT_PUESTOS ?? 0);
					if (!canAsignar()) {
						const badge = document.createElement('span');
						badge.className = 'descriptor-actividades-badge';
						badge.textContent = cant;
						cellElement.appendChild(badge);
						return;
					}
					const button = document.createElement('button');
					button.type = 'button';
					button.className = 'descriptor-actividades-trigger';
					const label = document.createElement('span');
					label.textContent = 'Asignar puesto';
					const badge = document.createElement('span');
					badge.className = 'descriptor-actividades-badge';
					badge.textContent = cant;
					button.appendChild(label);
					button.appendChild(badge);
					button.addEventListener('click', (ev) => {
						ev.preventDefault();
						ev.stopPropagation();
						onAsignar(cellInfo?.data);
					});
					cellElement.appendChild(button);
				},
			},
		];
	}

	// Qué hace: resumen total de la grilla de unidades.
	// Cómo: cuenta filas sobre la columna CORR_UNIDAD.
	getSummary(): any {
		return {
			totalItems: [
				{
					column: 'CORR_UNIDAD',
					summaryType: 'count',
					valueFormat: '#,##0',
					displayFormat: 'Cant: {0}',
				},
			],
		};
	}
}
