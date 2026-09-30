// Qué hace: servicio de negocio del catálogo Puesto.
// Cómo: valida datos, ejecuta CRUD vía repositorio y arma columnas/items del formulario.
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { buildAuditGridColumns } from 'src/app/shared/mtto/mtto-grid.helpers';
import { createEstadoColumnConfig, ESTADO_ACTIVO_INACTIVO_LABELS } from 'src/app/shared/utils/remote-grid-filter.util';
import { PlaPuesto } from './models/pla-puesto';
import { PlaPuestoRepository } from './pla-puesto.repository';
import { PlaPuestoSalarioRepository } from './pla-puesto-salario/pla-puesto-salario.repository';

const ESTADO_FIELD = 'ACTIVO_PUESTO';

@Injectable({ providedIn: 'root' })
export class PlaPuestoService {
	constructor(
		private repo: PlaPuestoRepository,
		private salarioRepo: PlaPuestoSalarioRepository
	) {}

	esValido(model: PlaPuesto, msg: Function): boolean {
		if (!model.NOMBRE_PUESTO || model.NOMBRE_PUESTO.trim() === '') {
			msg('Debe ingresar el nombre del puesto.', NotifyType.Warning);
			return false;
		}

		if (model.NOMBRE_PUESTO.trim().length > 100) {
			msg('El nombre del puesto no puede superar 100 caracteres.', NotifyType.Warning);
			return false;
		}

		if (model.CODIGO_PUESTO && model.CODIGO_PUESTO.trim().length > 15) {
			msg('El codigo del puesto no puede superar 15 caracteres.', NotifyType.Warning);
			return false;
		}

		if (model.MISION_PUESTO && model.MISION_PUESTO.trim().length > 255) {
			msg('La mision del puesto no puede superar 255 caracteres.', NotifyType.Warning);
			return false;
		}

		if (model.OTROS_ASPECTOS && model.OTROS_ASPECTOS.trim().length > 255) {
			msg('Otros aspectos no puede superar 255 caracteres.', NotifyType.Warning);
			return false;
		}

		return true;
	}

	getAll(param: any): Observable<IResult> {
		return this.repo.getAll(this.buildWhere(param));
	}

	get(param: any): Observable<IResult> {
		return this.repo.get([{ Parameter: 'CORR_PUESTO', Value: param.CORR_PUESTO }]);
	}

	insert(model: any): Observable<IResult> {
		return this.repo.create(model);
	}

	update(model: any): Observable<IResult> {
		return this.repo.update(model, [{ Parameter: 'CORR_PUESTO', Value: model.CORR_PUESTO }]);
	}

	delete(model: any): Observable<IResult> {
		return this.repo.delete([{ Parameter: 'CORR_PUESTO', Value: model.CORR_PUESTO }]);
	}

	activarInactivar(model: any): Observable<IResult> {
		return this.repo.activarInactivar(model, [{ Parameter: 'CORR_PUESTO', Value: model.CORR_PUESTO }]);
	}

	getSalarios(corrPuesto: number): Observable<IResult> {
		return this.salarioRepo.getAll(corrPuesto);
	}

	insertSalario(row: any): Observable<IResult> {
		return this.salarioRepo.create(row);
	}

	updateSalario(row: any): Observable<IResult> {
		return this.salarioRepo.update(row);
	}

	deleteSalario(corrPuestoSalario: number): Observable<IResult> {
		return this.salarioRepo.delete(corrPuestoSalario);
	}

	// Qué hace: asocia una unidad al puesto abierto.
	// Cómo: inserta en GEN_UNIDADES_PUESTO y el API devuelve la fila.
	asignarUnidad(corrUnidad: number, corrPuesto: number): Observable<IResult> {
		return this.repo.asignarUnidad({ CORR_UNIDAD: corrUnidad, CORR_PUESTO: corrPuesto });
	}

	// Qué hace: quita la asociación de una unidad con el puesto.
	// Cómo: elimina la fila de GEN_UNIDADES_PUESTO por las dos llaves.
	quitarUnidad(corrUnidad: number, corrPuesto: number): Observable<IResult> {
		return this.repo.quitarUnidad(corrUnidad, corrPuesto);
	}

	getColumns(): any {
		return [
			{ dataField: 'CODIGO_PUESTO', caption: 'Codigo', width: 120 },
			{ dataField: 'NOMBRE_PUESTO', caption: 'Puesto', width: 260, minWidth: 180 },
			{ dataField: 'NOMBRE_TIPO_PUESTO', caption: 'Tipo', width: 180 },
			createEstadoColumnConfig(ESTADO_FIELD, ESTADO_ACTIVO_INACTIVO_LABELS),
			...buildAuditGridColumns({ withDateTimeFilter: true }),
		];
	}

	getSummary(): any {
		return {
			totalItems: [
				{
					column: 'NOMBRE_PUESTO',
					summaryType: 'count',
					valueFormat: '#,##0',
					displayFormat: 'Cant: {0}',
				},
			],
		};
	}

	getItems(): any {
		return [
			{ dataField: 'CORR_PUESTO', label: { text: 'Corr.' }, colSpan: 1, editorOptions: { readOnly: true } },
			{
				dataField: 'CODIGO_PUESTO',
				label: { text: 'Codigo' },
				colSpan: 2,
				editorOptions: { placeholder: 'Codigo puesto...', showClearButton: true, maxLength: 15 },
			},
			{
				dataField: 'NOMBRE_PUESTO',
				label: { text: 'Nombre puesto' },
				colSpan: 3,
				editorOptions: { placeholder: 'Nombre puesto...', showClearButton: true, maxLength: 100 },
				validationRules: [{ type: 'required', message: 'Este campo es obligatorio' }],
			},
			{
				dataField: 'CORR_TIPO_PUESTO',
				label: { text: 'Tipo de puesto' },
				colSpan: 2,
				editorOptions: { placeholder: 'Seleccione tipo...', showClearButton: true },
				template: 'CORR_TIPO_PUESTOLookup',
			},
			{
				dataField: 'MISION_PUESTO',
				label: { text: 'Mision' },
				colSpan: 4,
				editorType: 'dxTextArea',
				editorOptions: { height: 70, maxLength: 255, showClearButton: true },
			},
			{
				dataField: 'OTROS_ASPECTOS',
				label: { text: 'Otros aspectos' },
				colSpan: 4,
				editorType: 'dxTextArea',
				editorOptions: { height: 70, maxLength: 255, showClearButton: true },
			},
			{ dataField: 'APROBACION_PUESTO', label: { text: 'Aprobado' }, editorType: 'dxCheckBox', colSpan: 2 },
			{ dataField: 'ACTIVO_PUESTO', label: { text: 'Activo' }, editorType: 'dxCheckBox', colSpan: 2 },
		];
	}

	private buildWhere(param: any): IParam[] {
		const xWhere: IParam[] = [];
		if (param.CORR_PUESTO) {
			xWhere.push({ Parameter: 'CORR_PUESTO', Value: param.CORR_PUESTO });
		}
		return xWhere;
	}
}
