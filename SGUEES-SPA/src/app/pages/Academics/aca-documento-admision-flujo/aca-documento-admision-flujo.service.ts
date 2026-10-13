// Qué hace: servicio de la vista Documentos por solicitud.
// Cómo: delega el HTTP y define las columnas del browse.
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IResult } from 'src/app/FxAPI/IResult';
import { AcaDocumentoAdmisionAsignacion } from './models/aca-documento-admision-flujo';
import { AcaDocumentoAdmisionFlujoRepository } from './aca-documento-admision-flujo.repository';

@Injectable({ providedIn: 'root' })
export class AcaDocumentoAdmisionFlujoService {
	constructor(private repo: AcaDocumentoAdmisionFlujoRepository) {}

	// Qué hace: obtiene las solicitudes ACA_PROSPECTO.
	// Cómo: llama GetAll.
	getAll(): Observable<IResult> {
		return this.repo.getAll();
	}

	// Qué hace: obtiene los documentos ya marcados.
	// Cómo: llama GetAsignaciones.
	getAsignaciones(): Observable<IResult> {
		return this.repo.getAsignaciones();
	}

	// Qué hace: obtiene el catálogo de documentos de admisión.
	// Cómo: llama GetDocumentos.
	getDocumentos(): Observable<IResult> {
		return this.repo.getDocumentos();
	}

	// Qué hace: asocia un documento.
	// Cómo: delega el modelo al repositorio.
	insert(model: AcaDocumentoAdmisionAsignacion): Observable<IResult> {
		return this.repo.create(model);
	}

	// Qué hace: quita un documento de la solicitud.
	// Cómo: usa el tipo de flujo y el documento como llave.
	delete(model: AcaDocumentoAdmisionAsignacion): Observable<IResult> {
		return this.repo.delete([
			{ Parameter: 'CORR_TIPO_DOCUMENTO', Value: model.CORR_TIPO_DOCUMENTO },
			{ Parameter: 'CORR_DOCUMENTO_ADMISION', Value: model.CORR_DOCUMENTO_ADMISION },
		]);
	}

	// Qué hace: configura las columnas del browse.
	// Cómo: muestra correlativo, nombre de la solicitud y cantidad de documentos.
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
			{ dataField: 'CORR_TIPO_DOCUMENTO', caption: 'Corr.', width: 90, dataType: 'number' },
			{ dataField: 'NOMBRE_TIPO', caption: 'Solicitud', width: 420, minWidth: 240 },
			{
				dataField: 'CANT_DOCUMENTOS',
				caption: 'Documentos',
				width: 130,
				dataType: 'number',
				alignment: 'center',
				filterOperations: ['=', '<', '>', '<=', '>='],
			},
		];
	}

	// Qué hace: configura el contador del browse.
	// Cómo: cuenta las solicitudes.
	getSummary(): any {
		return {
			totalItems: [
				{
					column: 'NOMBRE_TIPO',
					summaryType: 'count',
					valueFormat: '#,##0',
					displayFormat: 'Cant: {0}',
				},
			],
		};
	}
}
