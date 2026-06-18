import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { NotifyType } from 'src/app/shared/models/NotifyType';

import { GenEmpresaRepository } from './gen-empresa.repository';
import { GenEmpresa } from './models/gen-empresa';

@Injectable({
	providedIn: 'root',
})
export class GenEmpresaService {
	constructor(private repo: GenEmpresaRepository) {}

	private getImageSrc(value: any): string {
		if (!value) {
			return '';
		}

		const imageValue = String(value);
		if (imageValue.startsWith('data:image')) {
			return imageValue;
		}

		return `data:image/png;base64,${imageValue}`;
	}

	private buildImageColumn(dataField: string, caption: string, width: number = 150): any {
		return {
			dataField,
			caption,
			width,
			allowFiltering: false,
			allowSorting: false,
			cellTemplate: (cellElement: any, cellInfo: any) => {
				const src = this.getImageSrc(cellInfo?.value);

				if (!src) {
					cellElement.textContent = '';
					return;
				}

				const img = document.createElement('img');
				img.src = src;
				img.alt = caption;
				img.style.maxWidth = '120px';
				img.style.maxHeight = '48px';
				img.style.objectFit = 'contain';
				cellElement.appendChild(img);
			},
		};
	}

	//#region <Validadores>
	esValido(model: GenEmpresa, msg: Function): boolean {
		// if (model.NOMBRE_ROL == '') {
		// msg('Debe digitar el nombre del Rol', NotifyType.Error)
		// return false;
		// }

		return true;
	}
	// #endregion

	getAll(param: any): Observable<IResult> {
		let xWhere: IParam[] = [{ Parameter: 'CORR_EMPRESA', Value: param.CORR_EMPRESA }];

		return this.repo.get(xWhere);
	}

	get(param: any): Observable<IResult> {
		let xWhere: IParam[] = [{ Parameter: 'CORR_EMPRESA', Value: param.CORR_EMPRESA }];

		return this.repo.get(xWhere);
	}

	insert(model: any): Observable<IResult> {
		return this.repo.create(model);
	}

	insertWithImages(model: FormData): Observable<IResult> {
		return this.repo.createWithImages(model);
	}

	update(model: any): Observable<IResult> {
		let xWhere: IParam[] = [{ Parameter: 'CORR_EMPRESA', Value: model.CORR_EMPRESA }];

		return this.repo.update(model, xWhere);
	}

	updateWithImages(model: FormData, corrEmpresa: number): Observable<IResult> {
		let xWhere: IParam[] = [{ Parameter: 'CORR_EMPRESA', Value: corrEmpresa }];

		return this.repo.updateWithImages(model, xWhere);
	}

	delete(model: any): Observable<IResult> {
		let xWhere: IParam[] = [{ Parameter: 'CORR_EMPRESA', Value: model.CORR_EMPRESA }];

		return this.repo.delete(xWhere);
	}

	getColumns(): any {
		return [
			{ dataField: 'NOMBRE_EMPRESA', caption: 'Nombre Empresa', width: 250 },
			{ dataField: 'NOMBRE_COMERCIAL', caption: 'Nombre Comercial', width: 250 },
			{ dataField: 'NOMBRE_REPRESENTANTE_LEGAL', caption: 'Nombre Representante Legal', width: 250 },
			{ dataField: 'GIRO_EMPRESA', caption: 'Giro Empresa', width: 150 },
			{ dataField: 'DIRECCION_EMPRESA', caption: 'Direccion Empresa', width: 150 },
			{ dataField: 'NUMERO_NIT', caption: 'Numero Nit', width: 150 },
			{ dataField: 'NUMERO_NRC', caption: 'Numero Nrc', width: 150 },
			{ dataField: 'NOMBRE_CONTACTO', caption: 'Nombre Contacto', width: 250 },
			{ dataField: 'TELEFONO_1', caption: 'Telefono 1', width: 150 },
			{ dataField: 'TELEFONO_2', caption: 'Telefono 2', width: 150 },
			{ dataField: 'FAX', caption: 'Fax', width: 150 },
			{ dataField: 'CORREO_ELECTRONICO', caption: 'Correo Electronico', width: 150 },
			this.buildImageColumn('LOGO_1', 'Logo 1', 150),
			this.buildImageColumn('LOGO_2', 'Logo 2', 150),
			{ dataField: 'TAMANO_EMPRESA', caption: 'Tamano Empresa', width: 150 },
			{ dataField: 'NATURAL_JURIDICO', caption: 'Natural Juridico', width: 150 },
			{ dataField: 'CODIGO_EMPRESA', caption: 'Codigo Empresa', width: 150 },
			{ dataField: 'NOMBRE_EMPRESA_LARGO', caption: 'Nombre Empresa Largo', width: 250 },
			{ dataField: 'DIRECCION_EMPRESA_LARGO', caption: 'Direccion Empresa Largo', width: 150 },
			this.buildImageColumn('SELLO', 'Sello', 150),
			{ dataField: 'CODIGO_POSTAL', caption: 'Codigo Postal', width: 150 },
			{ dataField: 'TIPO_INGRESO_ISR', caption: 'Tipo Ingreso Isr', width: 150 },
			{ dataField: 'USA_CAMPOS_LIBRO_IVA', caption: 'Usa Campos Libro Iva', width: 150 },
			{ dataField: 'PERMITE_EDITAR_CAMPOS_LIBRO_IVA', caption: 'Permite Editar Campos Libro Iva', width: 150 },
			{ dataField: 'USUARIO_CREA', caption: 'Usuario Crea', width: 150 },
			{ dataField: 'FECHA_CREA', caption: 'Fecha Crea', width: 115, dataType: 'datetime', format: 'dd/MM/yyyy HH:mm' },
			{ dataField: 'ESTACION_CREA', caption: 'Estacion Crea', width: 150 },
			{ dataField: 'USUARIO_ACTU', caption: 'Usuario Actu', width: 150 },
			{ dataField: 'FECHA_ACTU', caption: 'Fecha Actu', width: 115, dataType: 'datetime', format: 'dd/MM/yyyy HH:mm' },
			{ dataField: 'ESTACION_ACTU', caption: 'Estacion Actu', width: 150 },
			{ dataField: 'NOMBRE_PAIS', caption: 'Nombre Pais', width: 250 },
			{ dataField: 'NOMBRE_DEPTO', caption: 'Nombre Depto', width: 250 },
			{ dataField: 'NOMBRE_MUNICIPIO', caption: 'Nombre Municipio', width: 250 },
			{ dataField: 'NOMBRE_SECTOR_ECONOMICO', caption: 'Nombre Sector Economico', width: 250 },
		];
	}

	getSummary(): any {
		return {
			totalItems: [{ column: 'CORR_EMPRESA', summaryType: 'count', valueFormat: '#,##0', displayFormat: 'Cant: {0}' }],
		};
	}

	getItems(): any {
		return [
			{
				dataField: 'NOMBRE_EMPRESA',
				label: { text: 'Nombre Empresa' },
				colSpan: 3,
				editorOptions: { placeholder: 'Nombre Empresa...', showClearButton: true, maxLength: 100 },
			},
			{
				dataField: 'GIRO_EMPRESA',
				label: { text: 'Giro Empresa' },
				colSpan: 1,
				editorOptions: { placeholder: 'Giro Empresa...', showClearButton: true, maxLength: 255  },
			},
			{
				dataField: 'DIRECCION_EMPRESA',
				label: { text: 'Direccion Empresa' },
				colSpan: 1,
				editorOptions: { placeholder: 'Direccion Empresa...', showClearButton: true, maxLength: 100  },
			},
			{
				dataField: 'NUMERO_NIT',
				label: { text: 'Numero Nit' },
				colSpan: 1,
				editorOptions: { placeholder: 'Numero Nit...', showClearButton: true, maxLength: 30  },
			},
			{
				dataField: 'NUMERO_NRC',
				label: { text: 'Numero Nrc' },
				colSpan: 1,
				editorOptions: { placeholder: 'Numero Nrc...', showClearButton: true, maxLength: 30  },
			},
			{
				dataField: 'TELEFONO_1',
				label: { text: 'Telefono 1' },
				colSpan: 1,
				editorOptions: { placeholder: 'Telefono 1...', showClearButton: true, maxLength: 30  },
			},
			{
				dataField: 'TELEFONO_2',
				label: { text: 'Telefono 2' },
				colSpan: 1,
				editorOptions: { placeholder: 'Telefono 2...', showClearButton: true, maxLength: 30  },
			},
			{
				dataField: 'FAX',
				label: { text: 'Fax' },
				colSpan: 1,
				editorOptions: { placeholder: 'Fax...', showClearButton: true, maxLength: 30  },
			},
			{
				dataField: 'CORREO_ELECTRONICO',
				label: { text: 'Correo Electronico' },
				colSpan: 1,
				editorOptions: { placeholder: 'Correo Electronico...', showClearButton: true, maxLength: 100  },
			},
			{
				dataField: 'LOGO_1',
				label: { text: 'Logo 1' },
				colSpan: 2,
				template: 'LOGO_1Uploader',
			},
			{
				dataField: 'LOGO_2',
				label: { text: 'Logo 2' },
				colSpan: 2,
				template: 'LOGO_2Uploader',
			},
			{
				dataField: 'TAMANO_EMPRESA',
				label: { text: 'Tamano Empresa' },
				colSpan: 1,
				editorOptions: { placeholder: 'Tamano Empresa...', showClearButton: true, maxLength: 1  },
			},
			{
				dataField: 'NATURAL_JURIDICO',
				label: { text: 'Natural Juridico' },
				colSpan: 1,
				editorOptions: { placeholder: 'Natural Juridico...', showClearButton: true, maxLength: 1  },
			},
			{
				dataField: 'CODIGO_EMPRESA',
				label: { text: 'Codigo Empresa' },
				colSpan: 1,
				editorOptions: { placeholder: 'Codigo Empresa...', showClearButton: true, maxLength: 10  },
			},
			{
				dataField: 'CORR_PAIS',
				label: { text: 'Corr Pais' },
				colSpan: 2,
				editorOptions: { placeholder: 'Corr Pais...', showClearButton: false },
				template: 'CORR_PAISLookup',
			},
			{
				dataField: 'CORR_DEPTO',
				label: { text: 'Corr Depto' },
				colSpan: 2,
				editorOptions: { placeholder: 'Corr Depto...', showClearButton: false },
				template: 'CORR_DEPTOLookup',
			},
			{
				dataField: 'CORR_MUNICIPIO',
				label: { text: 'Corr Municipio' },
				colSpan: 2,
				editorOptions: { placeholder: 'Corr Municipio...', showClearButton: false },
				template: 'CORR_MUNICIPIOLookup',
			},
			{
				dataField: 'DIRECCION_EMPRESA_LARGO',
				label: { text: 'Direccion Empresa Largo' },
				colSpan: 1,
				editorOptions: { placeholder: 'Direccion Empresa Largo...', showClearButton: true, maxLength: 1000  },
			},
			{
				dataField: 'SELLO',
				label: { text: 'Sello' },
				colSpan: 2,
				template: 'SELLOUploader',
			},
			{
				dataField: 'CODIGO_POSTAL',
				label: { text: 'Codigo Postal' },
				colSpan: 1,
				editorOptions: { placeholder: 'Codigo Postal...', showClearButton: true, maxLength: 25  },
			},
			{
				dataField: 'TIPO_INGRESO_ISR',
				label: { text: 'Tipo Ingreso Isr' },
				colSpan: 1,
				editorOptions: { placeholder: 'Tipo Ingreso Isr...', showClearButton: true },
			},
			{
				dataField: 'CORR_SECTOR_ECONOMICO',
				label: { text: 'Corr Sector Economico' },
				colSpan: 2,
				editorOptions: { placeholder: 'Corr Sector Economico...', showClearButton: false },
				template: 'CORR_SECTOR_ECONOMICOLookup',
			},
			{
				dataField: 'USA_CAMPOS_LIBRO_IVA',
				label: { text: 'Usa Campos Libro Iva' },
				colSpan: 1,
				editorOptions: { placeholder: 'Usa Campos Libro Iva...', showClearButton: true },
			},
			{
				dataField: 'PERMITE_EDITAR_CAMPOS_LIBRO_IVA',
				label: { text: 'Permite Editar Campos Libro Iva' },
				colSpan: 1,
				editorOptions: { placeholder: 'Permite Editar Campos Libro Iva...', showClearButton: true },
			},
		];
	}
}
