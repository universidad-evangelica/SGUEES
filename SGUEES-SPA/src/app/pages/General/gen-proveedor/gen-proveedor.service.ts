import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { buildAuditGridColumns } from 'src/app/shared/mtto/mtto-grid.helpers';
import { createEstadoColumnConfig, ESTADO_ACTIVO_INACTIVO_LABELS } from 'src/app/shared/utils/remote-grid-filter.util';

import { GenProveedorRepository } from './gen-proveedor.repository';
import { GenProveedorDocRepository } from './gen-proveedor-doc.repository';
import { GenPersonaBancoRepository } from './gen-persona-banco.repository';
import { GenProveedor } from './models/gen-proveedor';
import { GenProveedorPersona } from './models/gen-proveedor-persona';
import { GenProveedorDoc } from './models/gen-proveedor-doc';
import { GenPersonaBanco } from './models/gen-persona-banco';

const ESTADO_FIELD = 'ACTIVO_PROVEEDOR';

@Injectable({
	providedIn: 'root',
})
export class GenProveedorService {
	/** Máximo alineado con appsettings ProveedorDocumento:MaxBytes (10 MB). */
	readonly maxDocBytes = 10 * 1024 * 1024;

	constructor(
		private repo: GenProveedorRepository,
		private docRepo: GenProveedorDocRepository,
		private personaBancoRepo: GenPersonaBancoRepository,
	) {}

	esValido(model: GenProveedor, msg: Function): boolean {
		if (!model.CORR_PERSONA || model.CORR_PERSONA <= 0) {
			msg('Debe seleccionar una persona.', NotifyType.Warning);
			return false;
		}
		if (!model.CODIGO_PROVEEDOR?.trim()) {
			msg('Debe digitar el código del proveedor.', NotifyType.Warning);
			return false;
		}
		return true;
	}

	getAll(param: any): Observable<IResult> {
		const xWhere: IParam[] = [{ Parameter: 'CORR_PROVEEDOR', Value: param.CORR_PROVEEDOR ?? 0 }];
		return this.repo.get(xWhere);
	}

	getPersonas(param: any): Observable<IResult> {
		const xWhere: IParam[] = [
			{ Parameter: 'CORR_PERSONA', Value: param.CORR_PERSONA ?? 0 },
		];
		return this.repo.getPersonas(xWhere);
	}

	getPersona(corrPersona: number): Observable<IResult> {
		return this.repo.getPersona([{ Parameter: 'CORR_PERSONA', Value: corrPersona ?? 0 }]);
	}

	esValidaPersona(model: GenProveedorPersona, msg: Function): boolean {
		const tipo = (model?.TIPO_PERSONERIA ?? '').toUpperCase();
		if (tipo === 'N') {
			if (!model.PRIMER_NOMBRE?.trim() || !model.PRIMER_APELLIDO?.trim()) {
				msg('Primer nombre y primer apellido son obligatorios.', NotifyType.Warning);
				return false;
			}
			return true;
		}
		if (tipo === 'J') {
			if (!model.RAZON_SOCIAL?.trim() && !model.NOMBRE_EMPRESA?.trim()) {
				msg('Debe indicar Nombre empresa o Razón social.', NotifyType.Warning);
				return false;
			}
			return true;
		}
		msg('Seleccione si la persona es Natural o Jurídica.', NotifyType.Warning);
		return false;
	}

	crearPersonaNatural(model: GenProveedorPersona): Observable<IResult> {
		return this.repo.createPersonaNatural(model);
	}

	actualizarPersonaNatural(model: GenProveedorPersona): Observable<IResult> {
		return this.repo.updatePersonaNatural(model, [
			{ Parameter: 'CORR_PERSONA', Value: model.CORR_PERSONA },
		]);
	}

	crearPersonaJuridica(model: GenProveedorPersona): Observable<IResult> {
		return this.repo.createPersonaJuridica(model);
	}

	actualizarPersonaJuridica(model: GenProveedorPersona): Observable<IResult> {
		return this.repo.updatePersonaJuridica(model, [
			{ Parameter: 'CORR_PERSONA', Value: model.CORR_PERSONA },
		]);
	}

	insert(model: any): Observable<IResult> {
		return this.repo.create(model);
	}

	update(model: any): Observable<IResult> {
		const xWhere: IParam[] = [{ Parameter: 'CORR_PROVEEDOR', Value: model.CORR_PROVEEDOR }];
		return this.repo.update(model, xWhere);
	}

	delete(param: any): Observable<IResult> {
		const xWhere: IParam[] = [{ Parameter: 'CORR_PROVEEDOR', Value: param.CORR_PROVEEDOR }];
		return this.repo.delete(xWhere);
	}

	activarInactivar(model: any): Observable<IResult> {
		return this.repo.activarInactivar(model, [
			{ Parameter: 'CORR_PROVEEDOR', Value: model.CORR_PROVEEDOR },
		]);
	}

	getPersonaBancos(corrPersona: number): Observable<IResult> {
		return this.personaBancoRepo.getAll([{ Parameter: 'CORR_PERSONA', Value: corrPersona ?? 0 }]);
	}

	insertPersonaBanco(model: GenPersonaBanco): Observable<IResult> {
		return this.personaBancoRepo.create(model);
	}

	updatePersonaBanco(model: GenPersonaBanco): Observable<IResult> {
		return this.personaBancoRepo.update(model, [
			{ Parameter: 'CORR_PERSONA', Value: model.CORR_PERSONA },
			{ Parameter: 'CORR_PERSONA_BANCO', Value: model.CORR_PERSONA_BANCO },
		]);
	}

	deletePersonaBanco(corrPersona: number, corrPersonaBanco: number): Observable<IResult> {
		return this.personaBancoRepo.delete([
			{ Parameter: 'CORR_PERSONA', Value: corrPersona },
			{ Parameter: 'CORR_PERSONA_BANCO', Value: corrPersonaBanco },
		]);
	}

	getDocumentos(corrProveedor: number): Observable<IResult> {
		return this.docRepo.getAll([{ Parameter: 'CORR_PROVEEDOR', Value: corrProveedor ?? 0 }]);
	}

	uploadDocumento(corrProveedor: number, file: File): Observable<IResult> {
		const form = new FormData();
		form.append('CORR_PROVEEDOR', String(corrProveedor));
		form.append('ARCHIVO', file, file.name);
		return this.docRepo.postDoc(form);
	}

	deleteDocumento(corrProveedor: number, corrDocumento: number): Observable<IResult> {
		return this.docRepo.delete([
			{ Parameter: 'CORR_PROVEEDOR', Value: corrProveedor },
			{ Parameter: 'CORR_DOCUMENTO', Value: corrDocumento },
		]);
	}

	getDocumentoBlob(doc: GenProveedorDoc, download = false): Observable<Blob> {
		const params = [
			{ Parameter: 'CORR_PROVEEDOR', Value: doc.CORR_PROVEEDOR },
			{ Parameter: 'CORR_DOCUMENTO', Value: doc.CORR_DOCUMENTO },
			{ Parameter: 'NOMBRE_ARCHIVO', Value: doc.NOMBRE_ARCHIVO ?? '' },
		];
		if (download) {
			params.push({ Parameter: 'download', Value: 'true' });
		}
		return this.docRepo.getDoc(params);
	}

	esExtensionDocumentoPermitida(fileName: string): boolean {
		const ext = (fileName.split('.').pop() ?? '').toLowerCase();
		const allowed = new Set([
			'pdf', 'jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp',
			'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx',
			'txt', 'rtf', 'csv',
		]);
		return allowed.has(ext);
	}

	getDocumentoColumns(): any[] {
		return [
			{
				caption: 'Options',
				width: 150,
				allowSorting: false,
				allowFiltering: false,
				cellTemplate: 'docActionsTemplate',
				alignment: 'center',
			},
			{ dataField: 'CORR_DOCUMENTO', caption: 'Corr.', width: 70 },
			{ dataField: 'NOMBRE_ARCHIVO', caption: 'Archivo', minWidth: 220 },
			{
				dataField: 'FECHA_CREA',
				caption: 'Fecha carga',
				width: 150,
				dataType: 'datetime',
				format: 'dd/MM/yyyy HH:mm',
			},
			{ dataField: 'USUARIO_CREA', caption: 'Usuario', width: 120 },
		];
	}

	getColumns(): any {
		return [
			{ dataField: 'CORR_PROVEEDOR', caption: 'Corr.', width: 85 },
			{ dataField: 'CODIGO_PROVEEDOR', caption: 'Código', width: 120 },
			createEstadoColumnConfig(ESTADO_FIELD, ESTADO_ACTIVO_INACTIVO_LABELS),
			{ dataField: 'NOMBRE_COMERCIAL', caption: 'Nombre / Razón social', width: 320 },
			{ dataField: 'NOMBRE_PROVEEDOR', caption: 'Nombre persona', width: 280 },
			{ dataField: 'NOMBRE_TIPO_PERSONERIA', caption: 'Personería', width: 110 },
			...buildAuditGridColumns(),
		];
	}

	getSummary(): any {
		return {
			totalItems: [
				{ column: 'CORR_PROVEEDOR', summaryType: 'count', valueFormat: '#,##0', displayFormat: 'Cant: {0}' },
			],
		};
	}

	getItems(): any {
		return [
			{ dataField: 'CORR_PROVEEDOR', label: { text: 'Corr.' }, colSpan: 1, editorOptions: { readOnly: true } },
			{
				dataField: 'CORR_PERSONA',
				label: { text: 'Persona' },
				colSpan: 3,
				template: 'CORR_PERSONALookup',
				editorOptions: { placeholder: 'seleccionar persona...', showClearButton: true, maxLength: 20 },
				validationRules: [{ type: 'required', message: 'La persona es obligatoria' }]
			},

			{
				dataField: 'NOMBRE_COMERCIAL',
				label: { text: 'Nombre / Razón social' },
				colSpan: 4,
				editorOptions: { placeholder: 'Describa el nombre o razón social...', maxLength: 150 },
			},

			{
				dataField: 'CODIGO_PROVEEDOR',
				label: { text: 'Código proveedor' },
				colSpan: 2,
				editorOptions: { placeholder: 'Código...', showClearButton: true, maxLength: 20 },
				validationRules: [{ type: 'required', message: 'El código es obligatorio' }],
			},

			{
				dataField: 'CORR_FORMA_PAGO',
				label: { text: 'Forma de pago' },
				colSpan: 2,
				template: 'CORR_FORMA_PAGOLookup',
			},

			{
				dataField: 'CORR_CONDICION_PAGO',
				label: { text: 'Condición de pago' },
				colSpan: 2,
				template: 'CORR_CONDICION_PAGOLookup',
			},

			{
				dataField: 'NOMBRE_TIPO_PERSONERIA',
				label: { text: 'Personería' },
				colSpan: 1,
				editorOptions: { readOnly: true },
			},

			{
				dataField: 'ACTIVO_PROVEEDOR',
				label: { text: 'Activo' },
				editorType: 'dxCheckBox',
				colSpan: 1,
			},
		];
	}
}
