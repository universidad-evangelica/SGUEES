// Qué hace: servicio de negocio del catálogo de documentos de admisión.
// Cómo lo hace: valida, ejecuta CRUD vía repositorio y arma columnas/formulario.
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { buildAuditGridColumns } from 'src/app/shared/mtto/mtto-grid.helpers';
import { createEstadoColumnConfig, ESTADO_ACTIVO_INACTIVO_LABELS } from 'src/app/shared/utils/remote-grid-filter.util';
import { AcaDocumentoAdmision } from './models/aca-documento-admision';
import { AcaDocumentoAdmisionRepository } from './aca-documento-admision.repository';

const ESTADO_FIELD = 'ACTIVO';

@Injectable({ providedIn: 'root' })
export class AcaDocumentoAdmisionService {
	constructor(private repo: AcaDocumentoAdmisionRepository) {}

	// Qué hace: valida el formulario antes de guardar.
	// Cómo lo hace: exige código, nombre, formatos y un tamaño entre 1 y 25 MB.
	esValido(model: AcaDocumentoAdmision, msg: Function): boolean {
		const codigo = (model.CODIGO || '').trim();
		const nombre = (model.NOMBRE_DOCUMENTO || '').trim();
		const formatos = (model.FORMATOS_PERMITIDOS || '').trim();
		const tamano = Number(model.TAMANO_MAXIMO_MB);

		if (!codigo) {
			msg('Debe ingresar el código del documento.', NotifyType.Warning);
			return false;
		}
		if (codigo.length > 5) {
			msg('El código no puede superar 5 caracteres.', NotifyType.Warning);
			return false;
		}
		if (!nombre) {
			msg('Debe ingresar el nombre del documento.', NotifyType.Warning);
			return false;
		}
		if (nombre.length > 200) {
			msg('El nombre no puede superar 200 caracteres.', NotifyType.Warning);
			return false;
		}
		if (!formatos) {
			msg('Debe ingresar los formatos permitidos.', NotifyType.Warning);
			return false;
		}
		if (formatos.length > 50) {
			msg('Los formatos no pueden superar 50 caracteres.', NotifyType.Warning);
			return false;
		}
		if (!Number.isInteger(tamano) || tamano < 1 || tamano > 25) {
			msg('El tamaño máximo debe estar entre 1 y 25 MB.', NotifyType.Warning);
			return false;
		}
		return true;
	}

	getAll(param: any): Observable<IResult> {
		return this.repo.getAll(this.buildWhere(param));
	}

	get(param: any): Observable<IResult> {
		return this.repo.get([{ Parameter: 'CORR_DOCUMENTO_ADMISION', Value: param.CORR_DOCUMENTO_ADMISION }]);
	}

	insert(model: any): Observable<IResult> {
		return this.repo.create(model);
	}

	update(model: any): Observable<IResult> {
		return this.repo.update(model, [{ Parameter: 'CORR_DOCUMENTO_ADMISION', Value: model.CORR_DOCUMENTO_ADMISION }]);
	}

	delete(model: any): Observable<IResult> {
		return this.repo.delete([{ Parameter: 'CORR_DOCUMENTO_ADMISION', Value: model.CORR_DOCUMENTO_ADMISION }]);
	}

	activarInactivar(model: any): Observable<IResult> {
		return this.repo.activarInactivar(model, [{ Parameter: 'CORR_DOCUMENTO_ADMISION', Value: model.CORR_DOCUMENTO_ADMISION }]);
	}

	getColumns(): any {
		return [
			{
				dataField: 'CORR_DOCUMENTO_ADMISION',
				caption: 'Corr.',
				width: 90,
				dataType: 'number',
				filterOperations: ['=', '<', '>', '<=', '>='],
			},
			{ dataField: 'CODIGO', caption: 'Código', width: 110 },
			{ dataField: 'NOMBRE_DOCUMENTO', caption: 'Documento', width: 320, minWidth: 200 },
			{ dataField: 'OBLIGATORIO', caption: 'Obligatorio', width: 120, dataType: 'boolean' },
			{ dataField: 'ORDEN', caption: 'Orden', width: 90, dataType: 'number' },
			{ dataField: 'FORMATOS_PERMITIDOS', caption: 'Formatos', width: 160 },
			{ dataField: 'TAMANO_MAXIMO_MB', caption: 'Máx. MB', width: 100, dataType: 'number' },
			createEstadoColumnConfig(ESTADO_FIELD, ESTADO_ACTIVO_INACTIVO_LABELS, { caption: 'Estado' }),
			...buildAuditGridColumns({ withDateTimeFilter: true }),
		];
	}

	getSummary(): any {
		return {
			totalItems: [
				{
					column: 'CORR_DOCUMENTO_ADMISION',
					summaryType: 'count',
					valueFormat: '#,##0',
					displayFormat: 'Cant: {0}',
				},
			],
		};
	}

	getItems(): any {
		return [
			{ dataField: 'CORR_DOCUMENTO_ADMISION', label: { text: 'Corr.' }, colSpan: 2, editorOptions: { readOnly: true } },
			{
				dataField: 'CODIGO',
				label: { text: 'Código' },
				colSpan: 2,
				editorOptions: { placeholder: 'Código...', showClearButton: true, maxLength: 5 },
				validationRules: [{ type: 'required', message: 'Este campo es obligatorio' }],
			},
			{
				dataField: 'ORDEN',
				label: { text: 'Orden' },
				colSpan: 2,
				editorType: 'dxNumberBox',
				editorOptions: { min: 0, showSpinButtons: true },
			},
			{
				dataField: 'NOMBRE_DOCUMENTO',
				label: { text: 'Nombre' },
				colSpan: 6,
				editorOptions: { placeholder: 'Nombre del documento...', showClearButton: true, maxLength: 200 },
				validationRules: [{ type: 'required', message: 'Este campo es obligatorio' }],
			},
			{
				dataField: 'FORMATOS_PERMITIDOS',
				label: { text: 'Formatos' },
				colSpan: 4,
				editorOptions: { placeholder: 'PDF,JPG,PNG', showClearButton: true, maxLength: 50 },
				validationRules: [{ type: 'required', message: 'Este campo es obligatorio' }],
			},
			{
				dataField: 'TAMANO_MAXIMO_MB',
				label: { text: 'Tamaño máx. (MB)' },
				colSpan: 2,
				editorType: 'dxNumberBox',
				editorOptions: { min: 1, max: 25, showSpinButtons: true },
				validationRules: [{ type: 'required', message: 'Este campo es obligatorio' }],
			},
			{ dataField: 'OBLIGATORIO', label: { text: 'Obligatorio' }, editorType: 'dxCheckBox', colSpan: 2 },
			{ dataField: 'ACTIVO', label: { text: 'Activo' }, editorType: 'dxCheckBox', colSpan: 2 },
		];
	}

	private buildWhere(param: any): IParam[] {
		const xWhere: IParam[] = [];
		if (param.CORR_DOCUMENTO_ADMISION) {
			xWhere.push({ Parameter: 'CORR_DOCUMENTO_ADMISION', Value: param.CORR_DOCUMENTO_ADMISION });
		}
		return xWhere;
	}
}
