import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { NotifyType } from 'src/app/shared/models/NotifyType';

import { ConCentroCostoNivelRepository } from './con-centro-costo-nivel.repository';
import { ConCentroCostoNivel } from './models/con-centro-costo-nivel';

@Injectable({
	providedIn: 'root',
})
// Qué hace: reglas y columnas del mtto de niveles de centro de costo.
// Cómo lo hace: valida solo el nombre; NIVEL es autoincremental (solo lectura en UI).
export class ConCentroCostoNivelService {
	constructor(private repo: ConCentroCostoNivelRepository) {}

	// Qué hace: valida nombre único antes de guardar.
	// Cómo lo hace: revisa vacío/largo y duplicado de nombre en la lista local.
	esValido(model: ConCentroCostoNivel, msg: Function, lista: ConCentroCostoNivel[] = []): boolean {
		const nombre = (model.NOMBRE_NIVEL ?? '').trim();
		if (!nombre) {
			msg('Ingrese el nombre del nivel', NotifyType.Warning);
			return false;
		}
		if (nombre.length > 30) {
			msg('El nombre del nivel no puede superar 30 caracteres', NotifyType.Warning);
			return false;
		}

		const otros = (lista ?? []).filter(
			(x) => Number(x.CORR_CENTRO_COSTO_NIVEL) !== Number(model.CORR_CENTRO_COSTO_NIVEL)
		);
		const nombreNorm = nombre.toUpperCase();
		if (otros.some((x) => (x.NOMBRE_NIVEL ?? '').trim().toUpperCase() === nombreNorm)) {
			msg(
				`Ya existe un nivel con el nombre ${nombre}. Escriba otro nombre para continuar.`,
				NotifyType.Warning
			);
			return false;
		}

		return true;
	}

	// Qué hace: calcula el siguiente número de nivel (1, 2, 3...).
	// Cómo lo hace: MAX de la lista en memoria + 1.
	siguienteNivel(lista: ConCentroCostoNivel[] = []): number {
		const nums = (lista ?? []).map((x) => Number(x.NIVEL) || 0);
		return (nums.length ? Math.max(...nums) : 0) + 1;
	}

	getAll(param: any): Observable<IResult> {
		const xWhere: IParam[] = [{ Parameter: 'CORR_CENTRO_COSTO_NIVEL', Value: param.CORR_CENTRO_COSTO_NIVEL }];
		return this.repo.get(xWhere);
	}

	insert(model: any): Observable<IResult> {
		return this.repo.create(model);
	}

	update(model: any): Observable<IResult> {
		const xWhere: IParam[] = [{ Parameter: 'CORR_CENTRO_COSTO_NIVEL', Value: model.CORR_CENTRO_COSTO_NIVEL }];
		return this.repo.update(model, xWhere);
	}

	delete(model: any): Observable<IResult> {
		const xWhere: IParam[] = [{ Parameter: 'CORR_CENTRO_COSTO_NIVEL', Value: model.CORR_CENTRO_COSTO_NIVEL }];
		return this.repo.delete(xWhere);
	}

	getColumns(): any {
		return [
			{ dataField: 'CORR_CENTRO_COSTO_NIVEL', caption: 'Corr.', width: 90 },
			{ dataField: 'NIVEL', caption: 'Nivel', width: 90 },
			{ dataField: 'NOMBRE_NIVEL', caption: 'Nombre', minWidth: 200 },
		];
	}

	getSummary(): any {
		return {
			totalItems: [
				{
					column: 'CORR_CENTRO_COSTO_NIVEL',
					summaryType: 'count',
					valueFormat: '#,##0',
					displayFormat: 'Cant: {0}',
				},
			],
		};
	}

	getItems(): any {
		return [
			{
				dataField: 'CORR_CENTRO_COSTO_NIVEL',
				label: { text: 'Corr.' },
				colSpan: 2,
				editorOptions: { placeholder: 'Corr....', readOnly: true },
			},
			{
				dataField: 'NIVEL',
				label: { text: 'Nivel' },
				colSpan: 2,
				editorType: 'dxNumberBox',
				editorOptions: { placeholder: 'Auto...', readOnly: true },
			},
			{
				dataField: 'NOMBRE_NIVEL',
				label: { text: 'Nombre' },
				colSpan: 4,
				editorOptions: { placeholder: 'Nombre del nivel...', showClearButton: true, maxLength: 30 },
			},
		];
	}
}
