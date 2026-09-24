// Qué hace: servicio de negocio del catálogo Tipo Contacto.
// Cómo lo hace: valida, ejecuta CRUD vía repositorio y arma columnas/formulario.
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { buildAuditGridColumns } from 'src/app/shared/mtto/mtto-grid.helpers';
import { createEstadoColumnConfig, ESTADO_ACTIVO_INACTIVO_LABELS } from 'src/app/shared/utils/remote-grid-filter.util';
import { GenTipoContacto } from './models/gen-tipo-contacto';
import { GenTipoContactoRepository } from './gen-tipo-contacto.repository';

const ESTADO_FIELD = 'ACTIVO_TIPO_CONTACTO';

@Injectable({ providedIn: 'root' })
export class GenTipoContactoService {
	constructor(private repo: GenTipoContactoRepository) {}

	// Qué hace: valida el formulario antes de guardar.
	// Cómo lo hace: exige nombre (50), corto (15) único, formato y aplica para; si ACTIVO_CARACTERES, exige NUMERO_CARACTERES > 0.
	esValido(model: GenTipoContacto, msg: Function, existentes?: GenTipoContacto[]): boolean {
		if (!model.NOMBRE_TIPO_CONTACTO || model.NOMBRE_TIPO_CONTACTO.trim() === '') {
			msg('Debe ingresar el nombre del tipo de contacto.', NotifyType.Warning);
			return false;
		}
		if (model.NOMBRE_TIPO_CONTACTO.trim().length > 50) {
			msg('El nombre no puede superar 50 caracteres.', NotifyType.Warning);
			return false;
		}
		if (!model.NOMBRE_CORTO || model.NOMBRE_CORTO.trim() === '') {
			msg('Debe ingresar el nombre corto.', NotifyType.Warning);
			return false;
		}
		if (model.NOMBRE_CORTO.trim().length > 15) {
			msg('El nombre corto no puede superar 15 caracteres.', NotifyType.Warning);
			return false;
		}
		if (!model.FORMATO_CARACTERES || `${model.FORMATO_CARACTERES}`.trim() === '') {
			msg('Debe indicar el formato de caracteres (números, letras o ambos).', NotifyType.Warning);
			return false;
		}
		if (!model.APLICA_PARA || `${model.APLICA_PARA}`.trim() === '') {
			msg('Debe indicar si aplica para nacionales, extranjeros o ambos.', NotifyType.Warning);
			return false;
		}
		if (model.ACTIVO_CARACTERES) {
			const n = Number(model.NUMERO_CARACTERES ?? 0);
			if (!n || n <= 0) {
				msg('Debe indicar el número de caracteres cuando la validación está activa.', NotifyType.Warning);
				return false;
			}
		}

		const corr = Number(model.CORR_TIPO_CONTACTO ?? 0);
		const corto = model.NOMBRE_CORTO.trim().toUpperCase();
		const cortoDuplicado = (Array.isArray(existentes) ? existentes : []).some(
			(x) =>
				Number(x?.CORR_TIPO_CONTACTO ?? 0) !== corr &&
				`${x?.NOMBRE_CORTO ?? ''}`.trim().toUpperCase() === corto
		);
		if (cortoDuplicado) {
			msg('El nombre corto ingresado ya está registrado. Escriba otro nombre corto para continuar.', NotifyType.Warning);
			return false;
		}

		return true;
	}

	getAll(param: any): Observable<IResult> {
		return this.repo.getAll(this.buildWhere(param));
	}

	get(param: any): Observable<IResult> {
		return this.repo.get([{ Parameter: 'CORR_TIPO_CONTACTO', Value: param.CORR_TIPO_CONTACTO }]);
	}

	insert(model: any): Observable<IResult> {
		return this.repo.create(model);
	}

	update(model: any): Observable<IResult> {
		return this.repo.update(model, [
			{ Parameter: 'CORR_TIPO_CONTACTO', Value: model.CORR_TIPO_CONTACTO },
		]);
	}

	delete(model: any): Observable<IResult> {
		return this.repo.delete([
			{ Parameter: 'CORR_TIPO_CONTACTO', Value: model.CORR_TIPO_CONTACTO },
		]);
	}

	activarInactivar(model: any): Observable<IResult> {
		return this.repo.activarInactivar(model, [
			{ Parameter: 'CORR_TIPO_CONTACTO', Value: model.CORR_TIPO_CONTACTO },
		]);
	}

	getColumns(): any {
		return [
			{
				dataField: 'CORR_TIPO_CONTACTO',
				caption: 'Corr.',
				width: 90,
				dataType: 'number',
				filterOperations: ['=', '<', '>', '<=', '>='],
			},
			{ dataField: 'NOMBRE_TIPO_CONTACTO', caption: 'Tipo contacto', width: 240, minWidth: 160 },
			{ dataField: 'NOMBRE_CORTO', caption: 'Nombre corto', width: 140, minWidth: 100 },
			{
				dataField: 'NUMERO_CARACTERES',
				caption: 'N° caracteres',
				width: 120,
				dataType: 'number',
				filterOperations: ['=', '<', '>', '<=', '>='],
			},
			createEstadoColumnConfig('ACTIVO_CARACTERES', ESTADO_ACTIVO_INACTIVO_LABELS, { caption: 'Valida caracteres' }),
			{ dataField: 'NOMBRE_FORMATO_CARACTERES', caption: 'Formato caracteres', width: 160, minWidth: 120 },
			{ dataField: 'NOMBRE_APLICA_PARA', caption: 'Aplica para', width: 130, minWidth: 100 },
			createEstadoColumnConfig(ESTADO_FIELD, ESTADO_ACTIVO_INACTIVO_LABELS, { caption: 'Estado' }),
			...buildAuditGridColumns({ withDateTimeFilter: true }),
		];
	}

	getSummary(): any {
		return {
			totalItems: [
				{
					column: 'CORR_TIPO_CONTACTO',
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
				dataField: 'CORR_TIPO_CONTACTO',
				label: { text: 'Corr.' },
				colSpan: 1,
				editorOptions: { readOnly: true },
			},
			{
				dataField: 'NOMBRE_TIPO_CONTACTO',
				label: { text: 'Nombre' },
				colSpan: 4,
				editorOptions: { placeholder: 'Nombre tipo contacto...', showClearButton: true, maxLength: 50 },
				validationRules: [{ type: 'required', message: 'Este campo es obligatorio' }],
			},
			{
				dataField: 'NOMBRE_CORTO',
				label: { text: 'Nombre corto' },
				colSpan: 2,
				editorOptions: { placeholder: 'Corto...', showClearButton: true, maxLength: 15 },
				validationRules: [{ type: 'required', message: 'Este campo es obligatorio' }],
			},
			{
				dataField: 'FORMATO_CARACTERES',
				label: { text: 'Formato caracteres' },
				colSpan: 2,
				template: 'FORMATO_CARACTERESLookup',
				validationRules: [{ type: 'required', message: 'Este campo es obligatorio' }],
			},
			{
				dataField: 'APLICA_PARA',
				label: { text: 'Aplica para' },
				colSpan: 2,
				template: 'APLICA_PARALookup',
				validationRules: [{ type: 'required', message: 'Este campo es obligatorio' }],
			},
			{
				dataField: 'NUMERO_CARACTERES',
				label: { text: 'N° caracteres' },
				colSpan: 2,
				editorType: 'dxNumberBox',
				editorOptions: { min: 0, max: 32767, showSpinButtons: true },
			},
			{ dataField: 'ACTIVO_CARACTERES', label: { text: 'Valida caracteres' }, editorType: 'dxCheckBox', colSpan: 2 },
			{ dataField: 'ACTIVO_TIPO_CONTACTO', label: { text: 'Activo' }, editorType: 'dxCheckBox', colSpan: 2 },
		];
	}

	private buildWhere(param: any): IParam[] {
		const xWhere: IParam[] = [];
		if (param.CORR_TIPO_CONTACTO) {
			xWhere.push({ Parameter: 'CORR_TIPO_CONTACTO', Value: param.CORR_TIPO_CONTACTO });
		}
		return xWhere;
	}
}

