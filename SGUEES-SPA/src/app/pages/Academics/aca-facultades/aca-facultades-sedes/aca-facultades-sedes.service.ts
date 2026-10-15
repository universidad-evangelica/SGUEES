// Qué hace: servicio de la sección "Sedes de la Facultad".
// Cómo lo hace: arma columnas/formulario de la sección y llama al repositorio con la llave facultad + sede.
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { buildAuditGridColumns } from 'src/app/shared/mtto/mtto-grid.helpers';
import { createEstadoColumnConfig, ESTADO_ACTIVO_INACTIVO_LABELS } from 'src/app/shared/utils/remote-grid-filter.util';
import { AcaFacultadesSedes } from './models/aca-facultades-sedes';
import { AcaFacultadesSedesRepository } from './aca-facultades-sedes.repository';

@Injectable({ providedIn: 'root' })
export class AcaFacultadesSedesService {
	constructor(private repo: AcaFacultadesSedesRepository) {}

	esValido(model: AcaFacultadesSedes, msg: Function): boolean {
		if (!model.CORR_SEDE) {
			msg('Debe seleccionar la sede.', NotifyType.Warning);
			return false;
		}
		return true;
	}

	getAll(corrFacultad: number): Observable<IResult> {
		return this.repo.getAll([{ Parameter: 'CORR_FACULTAD', Value: corrFacultad }]);
	}

	insert(model: AcaFacultadesSedes): Observable<IResult> {
		return this.repo.create(model);
	}

	update(model: AcaFacultadesSedes): Observable<IResult> {
		return this.repo.update(model, this.llave(model));
	}

	delete(model: AcaFacultadesSedes): Observable<IResult> {
		return this.repo.delete(this.llave(model));
	}

	getColumns(): any {
		return [
			{ dataField: 'NOMBRE_SEDE', caption: 'Sede', width: 260, minWidth: 180 },
			createEstadoColumnConfig('ACTIVO', ESTADO_ACTIVO_INACTIVO_LABELS, { caption: 'Estado' }),
			...buildAuditGridColumns({ withDateTimeFilter: true }),
		];
	}

	// Qué hace: formulario de la sección. La sede es parte de la llave: se elige al crear y queda fija al editar.
	getItems(): any {
		return [
			{ dataField: 'CORR_SEDE', label: { text: 'Sede' }, colSpan: 4, template: 'CORR_SEDETemplate' },
			{ dataField: 'ACTIVO', label: { text: 'Activo' }, editorType: 'dxCheckBox', colSpan: 1 },
		];
	}

	private llave(model: AcaFacultadesSedes): IParam[] {
		return [
			{ Parameter: 'CORR_FACULTAD', Value: model.CORR_FACULTAD },
			{ Parameter: 'CORR_SEDE', Value: model.CORR_SEDE },
		];
	}
}
