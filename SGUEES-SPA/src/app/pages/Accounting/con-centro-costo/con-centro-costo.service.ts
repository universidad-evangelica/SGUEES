import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';

import { ConCentroCostoRepository } from './con-centro-costo.repository';
import { ConCentroCosto } from './models/con-centro-costo';

@Injectable({
	providedIn: 'root',
})
// Qué hace: reglas, columnas y campos del formulario de centros de costo.
// Cómo lo hace: valida el modelo, ordena jerarquía en memoria y arma CRUD.
export class ConCentroCostoService {
	constructor(private repo: ConCentroCostoRepository) {}

	esValido(model: ConCentroCosto, msg: Function): boolean {
		return true;
	}

	// Qué hace: ordena la lista padre → hijas (igual que el API GetAll).
	// Cómo lo hace: DFS por CORR_CENTRO_COSTO_MAYOR; si no hay padres, por NIVEL/código.
	ordenarJerarquia(items: ConCentroCosto[] = []): ConCentroCosto[] {
		if (!items?.length) {
			return items ?? [];
		}

		const byCorr = new Map<number, ConCentroCosto>();
		for (const item of items) {
			byCorr.set(Number(item.CORR_CENTRO_COSTO), item);
		}

		const children = new Map<number, ConCentroCosto[]>();
		for (const item of items) {
			const mayor = Number(item.CORR_CENTRO_COSTO_MAYOR) || 0;
			if (mayor > 0 && byCorr.has(mayor)) {
				if (!children.has(mayor)) {
					children.set(mayor, []);
				}
				children.get(mayor)!.push(item);
			}
		}

		const sortSiblings = (a: ConCentroCosto, b: ConCentroCosto) => {
			const nivelDiff = (Number(a.NIVEL) || 0) - (Number(b.NIVEL) || 0);
			if (nivelDiff !== 0) {
				return nivelDiff;
			}
			const codigoDiff = (a.CODIGO_CENTRO_COSTO ?? '').localeCompare(b.CODIGO_CENTRO_COSTO ?? '');
			if (codigoDiff !== 0) {
				return codigoDiff;
			}
			return Number(a.CORR_CENTRO_COSTO) - Number(b.CORR_CENTRO_COSTO);
		};

		for (const kids of children.values()) {
			kids.sort(sortSiblings);
		}

		if (children.size === 0) {
			return [...items].sort(sortSiblings);
		}

		const roots = items
			.filter((x) => {
				const mayor = Number(x.CORR_CENTRO_COSTO_MAYOR) || 0;
				return mayor <= 0 || !byCorr.has(mayor);
			})
			.sort(sortSiblings);

		const ordered: ConCentroCosto[] = [];
		const visited = new Set<number>();

		const walk = (node: ConCentroCosto) => {
			const corr = Number(node.CORR_CENTRO_COSTO);
			if (visited.has(corr)) {
				return;
			}
			visited.add(corr);
			ordered.push(node);
			const kids = children.get(corr) ?? [];
			for (const child of kids) {
				walk(child);
			}
		};

		for (const root of roots) {
			walk(root);
		}

		for (const item of [...items].sort(sortSiblings)) {
			if (!visited.has(Number(item.CORR_CENTRO_COSTO))) {
				walk(item);
			}
		}

		return ordered;
	}

	getAll(param: any): Observable<IResult> {
		let xWhere: IParam[] = [{ Parameter: 'CORR_CENTRO_COSTO', Value: param.CORR_CENTRO_COSTO }];
		return this.repo.get(xWhere);
	}

	get(param: any): Observable<IResult> {
		let xWhere: IParam[] = [{ Parameter: 'CORR_CENTRO_COSTO', Value: param.CORR_CENTRO_COSTO }];
		return this.repo.get(xWhere);
	}

	insert(model: any): Observable<IResult> {
		return this.repo.create(model);
	}

	update(model: any): Observable<IResult> {
		let xWhere: IParam[] = [{ Parameter: 'CORR_CENTRO_COSTO', Value: model.CORR_CENTRO_COSTO }];
		return this.repo.update(model, xWhere);
	}

	delete(model: any): Observable<IResult> {
		let xWhere: IParam[] = [{ Parameter: 'CORR_CENTRO_COSTO', Value: model.CORR_CENTRO_COSTO }];
		return this.repo.delete(xWhere);
	}

	getColumns(): any {
		return [
			{ dataField: 'CORR_CENTRO_COSTO', caption: 'Corr.' },
			{ dataField: 'CODIGO_CENTRO_COSTO', caption: 'Código' },
			{ dataField: 'NOMBRE_CENTRO', caption: 'Nombre del Centro' },
			{ dataField: 'NOMBRE_NIVEL', caption: 'Nivel' },
			{ dataField: 'NOMBRE_CENTRO_COSTO_MAYOR', caption: 'Centro Mayor' },
			{ dataField: 'CUENTA_CONTABLE', caption: 'Cuenta Contable' },
			{ dataField: 'NOMBRE_TIPO_CENTRO_COSTO', caption: 'Tipo' },
			{ dataField: 'NOMBRE_ESTADO_CENTRO_COSTO', caption: 'Estado' },
			{ dataField: 'NOMBRE_UNIDAD_NEGOCIO', caption: 'Unidad de Negocio' },
			{ dataField: 'CODIGO_TERMINACION', caption: 'Código de Terminación' },
		];
	}

	getSummary(): any {
		return {
			totalItems: [{ column: 'CORR_CENTRO_COSTO', summaryType: 'count', valueFormat: '#,##0', displayFormat: 'Cant: {0}' }],
		};
	}

	getItems(): any {
		return [
			{ dataField: 'CORR_CENTRO_COSTO', label: { text: 'Corr.' }, colSpan: 1, editorOptions: { readOnly: true } },
			{
				dataField: 'ESTADO_CENTRO_COSTO',
				label: { text: 'Estado' },
				colSpan: 2,
				editorOptions: { showClearButton: false },
				template: 'ESTADO_CENTRO_COSTOLookup',
			},
			{
				dataField: 'CORR_TIPO_CENTRO_COSTO',
				label: { text: 'Tipo' },
				colSpan: 2,
				editorOptions: { showClearButton: false },
				template: 'CORR_TIPO_CENTRO_COSTOLookup',
			},
			{
				dataField: 'CODIGO_CENTRO_COSTO',
				label: { text: 'Código' },
				colSpan: 3,
				editorOptions: { showClearButton: true, maxLength: 30 },
			},
			{
				dataField: 'NOMBRE_CENTRO',
				label: { text: 'Centro' },
				colSpan: 8,
				editorOptions: { showClearButton: true },
			},
			{
				dataField: 'CODIGO_TERMINACION',
				label: { text: 'Terminación' },
				colSpan: 2,
				editorOptions: { showClearButton: true, maxLength: 30 },
			},
			{
				dataField: 'CUENTA_CONTABLE',
				label: { text: 'Cuenta Contable' },
				colSpan: 2,
				editorOptions: { showClearButton: true, maxLength: 30 },
			},
			{
				dataField: 'CORR_CENTRO_COSTO_NIVEL',
				label: { text: 'Nivel' },
				colSpan: 2,
				editorOptions: { showClearButton: true },
				template: 'CORR_CENTRO_COSTO_NIVELLookup',
			},
			{
				dataField: 'CORR_CENTRO_COSTO_MAYOR',
				label: { text: 'Centro de Costo Mayor' },
				colSpan: 2,
				editorOptions: { showClearButton: true },
				template: 'CORR_CENTRO_COSTO_MAYORLookup',
			},
			{
				dataField: 'CORR_UNIDAD_NEGOCIO',
				label: { text: 'Unidad de Negocio' },
				colSpan: 4,
				editorOptions: { showClearButton: false },
				template: 'CORR_UNIDAD_NEGOCIOLookup',
			},
			{
				dataField: 'CORR_AREA_FUNCIONAL',
				label: { text: 'Área Funcional' },
				colSpan: 4,
				editorOptions: { showClearButton: false },
				template: 'CORR_AREA_FUNCIONALLookup',
			},
		];
	}
}
