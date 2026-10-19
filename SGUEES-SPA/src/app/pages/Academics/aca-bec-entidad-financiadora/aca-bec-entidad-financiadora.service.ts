import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { buildAuditGridColumns } from 'src/app/shared/mtto/mtto-grid.helpers';
import { createEstadoColumnConfig, ESTADO_ACTIVO_INACTIVO_LABELS } from 'src/app/shared/utils/remote-grid-filter.util';
import { AcaBecEntidadFinanciadora } from './models/aca-bec-entidad-financiadora';
import { AcaBecEntidadFinanciadoraRepository } from './aca-bec-entidad-financiadora.repository';

const ESTADO_FIELD = 'ACTIVO';

@Injectable({ providedIn: 'root' })
export class AcaBecEntidadFinanciadoraService {
	readonly tiposEntidad = ['UEES', 'FUNDACION', 'IGLESIA', 'EMPRESA', 'GOBIERNO', 'PERSONA', 'OTRO'];

	constructor(private repo: AcaBecEntidadFinanciadoraRepository) {}

	normalizar(model: AcaBecEntidadFinanciadora): AcaBecEntidadFinanciadora {
		return {
			...model,
			CODIGO_ENTIDAD: `${model.CODIGO_ENTIDAD ?? ''}`.trim().toUpperCase(),
			NOMBRE_ENTIDAD: `${model.NOMBRE_ENTIDAD ?? ''}`.trim(),
			TIPO_ENTIDAD: `${model.TIPO_ENTIDAD ?? ''}`.trim().toUpperCase(),
			CONTACTO: this.normalizarOpcional(model.CONTACTO),
			TELEFONO: this.normalizarOpcional(model.TELEFONO),
			CORREO: this.normalizarOpcional(model.CORREO)?.toLowerCase() ?? null,
			ACTIVO: model.ACTIVO ?? true,
		};
	}

	esValido(model: AcaBecEntidadFinanciadora, msg: Function): boolean {
		model = this.normalizar(model);

		if (!model.CODIGO_ENTIDAD) {
			msg('Debe ingresar el codigo de la entidad.', NotifyType.Warning);
			return false;
		}

		if (model.CODIGO_ENTIDAD.length > 30) {
			msg('El codigo de la entidad no puede superar 30 caracteres.', NotifyType.Warning);
			return false;
		}

		if (!model.NOMBRE_ENTIDAD) {
			msg('Debe ingresar el nombre de la entidad.', NotifyType.Warning);
			return false;
		}

		if (model.NOMBRE_ENTIDAD.length > 200) {
			msg('El nombre de la entidad no puede superar 200 caracteres.', NotifyType.Warning);
			return false;
		}

		if (!model.TIPO_ENTIDAD) {
			msg('Debe seleccionar o ingresar el tipo de entidad.', NotifyType.Warning);
			return false;
		}

		if (model.TIPO_ENTIDAD.length > 30) {
			msg('El tipo de entidad no puede superar 30 caracteres.', NotifyType.Warning);
			return false;
		}

		if (!this.tiposEntidad.includes(model.TIPO_ENTIDAD)) {
			msg('El tipo de entidad no es valido.', NotifyType.Warning);
			return false;
		}

		if (model.CONTACTO && model.CONTACTO.length > 150) {
			msg('El contacto no puede superar 150 caracteres.', NotifyType.Warning);
			return false;
		}

		if (model.TELEFONO && model.TELEFONO.length > 30) {
			msg('El telefono no puede superar 30 caracteres.', NotifyType.Warning);
			return false;
		}

		if (model.CORREO && model.CORREO.length > 150) {
			msg('El correo no puede superar 150 caracteres.', NotifyType.Warning);
			return false;
		}

		if (model.CORREO && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(model.CORREO)) {
			msg('Debe ingresar un correo valido.', NotifyType.Warning);
			return false;
		}

		return true;
	}

	getAll(param: any): Observable<IResult> {
		return this.repo.getAll(this.buildWhere(param));
	}

	get(param: any): Observable<IResult> {
		return this.repo.get([{ Parameter: 'CORR_ENTIDAD_FINANCIADORA', Value: param.CORR_ENTIDAD_FINANCIADORA }]);
	}

	insert(model: any): Observable<IResult> {
		return this.repo.create(model);
	}

	update(model: any): Observable<IResult> {
		return this.repo.update(model, [{ Parameter: 'CORR_ENTIDAD_FINANCIADORA', Value: model.CORR_ENTIDAD_FINANCIADORA }]);
	}

	delete(model: any): Observable<IResult> {
		return this.repo.delete([{ Parameter: 'CORR_ENTIDAD_FINANCIADORA', Value: model.CORR_ENTIDAD_FINANCIADORA }]);
	}

	activarInactivar(model: any): Observable<IResult> {
		return this.repo.activarInactivar(model, [{ Parameter: 'CORR_ENTIDAD_FINANCIADORA', Value: model.CORR_ENTIDAD_FINANCIADORA }]);
	}

	getColumns(): any {
		return [
			{
				dataField: 'CORR_ENTIDAD_FINANCIADORA',
				caption: 'Corr.',
				width: 90,
				dataType: 'number',
				filterOperations: ['=', '<', '>', '<=', '>='],
			},
			{ dataField: 'CODIGO_ENTIDAD', caption: 'Codigo', width: 150 },
			{ dataField: 'NOMBRE_ENTIDAD', caption: 'Entidad financiadora', minWidth: 320 },
			{ dataField: 'TIPO_ENTIDAD', caption: 'Tipo', width: 140 },
			{ dataField: 'CONTACTO', caption: 'Contacto', width: 200 },
			{ dataField: 'CORREO', caption: 'Correo', width: 220 },
			createEstadoColumnConfig(ESTADO_FIELD, ESTADO_ACTIVO_INACTIVO_LABELS),
			...buildAuditGridColumns({ withDateTimeFilter: true }),
		];
	}

	getSummary(): any {
		return {
			totalItems: [
				{
					column: 'CORR_ENTIDAD_FINANCIADORA',
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
				itemType: 'group',
				caption: 'Datos generales',
				colCount: 12,
				colSpan: 8,
				items: [
					{ dataField: 'CORR_ENTIDAD_FINANCIADORA', label: { text: 'Corr.' }, colSpan: 2, editorOptions: { readOnly: true } },
					{
						dataField: 'CODIGO_ENTIDAD',
						label: { text: 'Codigo' },
						colSpan: 3,
						editorOptions: { placeholder: 'Codigo...', showClearButton: true, maxLength: 30 },
						validationRules: [{ type: 'required', message: 'Este campo es obligatorio' }],
					},
					{
						dataField: 'TIPO_ENTIDAD',
						label: { text: 'Tipo entidad' },
						editorType: 'dxSelectBox',
						colSpan: 3,
						editorOptions: {
							dataSource: this.tiposEntidad,
							acceptCustomValue: true,
							searchEnabled: true,
							showClearButton: true,
							placeholder: 'Tipo...',
							maxLength: 30,
						},
						validationRules: [{ type: 'required', message: 'Este campo es obligatorio' }],
					},
					{
						dataField: 'NOMBRE_ENTIDAD',
						label: { text: 'Entidad financiadora' },
						colSpan: 12,
						editorOptions: { placeholder: 'Entidad financiadora...', showClearButton: true, maxLength: 200 },
						validationRules: [{ type: 'required', message: 'Este campo es obligatorio' }],
					},
				],
			},
			{
				itemType: 'group',
				caption: 'Contacto',
				colCount: 12,
				colSpan: 8,
				items: [
					{
						dataField: 'CONTACTO',
						label: { text: 'Contacto' },
						colSpan: 5,
						editorOptions: { placeholder: 'Contacto...', showClearButton: true, maxLength: 150 },
					},
					{
						dataField: 'TELEFONO',
						label: { text: 'Telefono' },
						colSpan: 3,
						editorOptions: { placeholder: 'Telefono...', showClearButton: true, maxLength: 30 },
					},
					{
						dataField: 'CORREO',
						label: { text: 'Correo' },
						colSpan: 4,
						editorOptions: { placeholder: 'Correo...', showClearButton: true, maxLength: 150 },
					},
				],
			},
			{
				itemType: 'group',
				caption: 'Configuracion',
				colCount: 12,
				colSpan: 8,
				items: [
					{
						dataField: 'ACTIVO',
						label: { visible: false },
						editorType: 'dxCheckBox',
						colSpan: 4,
						editorOptions: { text: 'Activo' },
					},
				],
			},
		];
	}

	private normalizarOpcional(value: string | null | undefined): string | null {
		const normalizado = `${value ?? ''}`.trim();
		return normalizado ? normalizado : null;
	}

	private buildWhere(param: any): IParam[] {
		const xWhere: IParam[] = [];

		if (param.CORR_ENTIDAD_FINANCIADORA) {
			xWhere.push({ Parameter: 'CORR_ENTIDAD_FINANCIADORA', Value: param.CORR_ENTIDAD_FINANCIADORA });
		}

		return xWhere;
	}
}
