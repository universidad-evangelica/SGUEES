// Qué hace: servicio de la vista Documentos por período.
// Cómo: delega el HTTP y define las columnas del browse.
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IResult } from 'src/app/FxAPI/IResult';
import { AcaDocumentoPeriodoAsignacion } from './models/aca-documento-admision-periodos-academicos';
import { AcaDocumentoAdmisionPeriodosAcademicosRepository } from './aca-documento-admision-periodos-academicos.repository';

@Injectable({ providedIn: 'root' })
export class AcaDocumentoAdmisionPeriodosAcademicosService {
	constructor(private repo: AcaDocumentoAdmisionPeriodosAcademicosRepository) {}

	// Qué hace: obtiene los documentos de admisión.
	// Cómo: llama GetAll.
	getAll(): Observable<IResult> {
		return this.repo.getAll();
	}

	// Qué hace: obtiene los períodos ya marcados.
	// Cómo: llama GetAsignaciones.
	getAsignaciones(): Observable<IResult> {
		return this.repo.getAsignaciones();
	}

	// Qué hace: marca un documento en un período.
	// Cómo: delega el modelo al repositorio.
	insert(model: AcaDocumentoPeriodoAsignacion): Observable<IResult> {
		return this.repo.create(model);
	}

	// Qué hace: quita un período del documento.
	// Cómo: usa el documento y el período como llave.
	delete(model: AcaDocumentoPeriodoAsignacion): Observable<IResult> {
		return this.repo.delete([
			{ Parameter: 'CORR_DOCUMENTO_ADMISION', Value: model.CORR_DOCUMENTO_ADMISION },
			{ Parameter: 'CORR_PERIODO_ACADEMICO', Value: model.CORR_PERIODO_ACADEMICO },
		]);
	}

	// Qué hace: configura las columnas del browse.
	// Cómo: muestra código, nombre del documento y cuántos períodos lo muestran.
	getColumns(): any[] {
		return [
			{
				name: 'btnAcciones',
				type: 'buttons',
				visible: false,
				allowFiltering: false,
				allowSorting: false,
				buttons: [],
			},
			{ dataField: 'CODIGO', caption: 'Código', width: 110 },
			{ dataField: 'NOMBRE_DOCUMENTO', caption: 'Documento', width: 420, minWidth: 240 },
			{ dataField: 'ORDEN', caption: 'Orden', width: 90, dataType: 'number', alignment: 'center' },
			{
				dataField: 'OBLIGATORIO_TEXTO',
				caption: 'Obligatorio',
				width: 120,
				calculateCellValue: (row: any) => (row?.OBLIGATORIO ? 'Sí' : 'No'),
			},
			{
				dataField: 'ACTIVO_TEXTO',
				caption: 'Activo',
				width: 100,
				calculateCellValue: (row: any) => (row?.ACTIVO !== false ? 'Sí' : 'No'),
			},
			{
				dataField: 'CANT_PERIODOS',
				caption: 'Períodos',
				width: 120,
				dataType: 'number',
				alignment: 'center',
				filterOperations: ['=', '<', '>', '<=', '>='],
			},
		];
	}

	// Qué hace: configura el contador del browse.
	// Cómo: cuenta los documentos.
	getSummary(): any {
		return {
			totalItems: [
				{
					column: 'NOMBRE_DOCUMENTO',
					summaryType: 'count',
					valueFormat: '#,##0',
					displayFormat: 'Cant: {0}',
				},
			],
		};
	}
}
