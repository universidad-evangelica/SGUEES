import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { IResult } from 'src/app/FxAPI/IResult';
import { ConContabilidadImportarExcelRepository } from './con-contabilidad-importar-excel.repository';
import {
	ConCatalogoCuentaImportParam,
	ConCentroCostoImportParam,
} from './models/con-contabilidad-importar-excel';

@Injectable({
	providedIn: 'root',
})
export class ConContabilidadImportarExcelService {
	constructor(private repo: ConContabilidadImportarExcelRepository) {}

	importarCuentas(model: ConCatalogoCuentaImportParam): Observable<IResult> {
		return this.repo.importarCuentas(model);
	}

	importarCentros(model: ConCentroCostoImportParam): Observable<IResult> {
		return this.repo.importarCentros(model);
	}

	getCuentaPreviewColumns(): any[] {
		return [
			{ dataField: 'CUENTA_CONTABLE', caption: 'Cuenta', width: 110 },
			{ dataField: 'NOMBRE_CUENTA', caption: 'Nombre', width: 220 },
			{ dataField: 'ES_DEBE', caption: 'Debe', dataType: 'boolean', width: 70 },
			{ dataField: 'ES_HABER', caption: 'Haber', dataType: 'boolean', width: 70 },
			{ dataField: 'ES_DETALLE', caption: 'Detalle', dataType: 'boolean', width: 80 },
			{ dataField: 'NIVEL', caption: 'Nivel', width: 70 },
			{ dataField: 'CUENTA_MAYOR', caption: 'Cuenta Mayor', width: 110 },
			{ dataField: 'CODIGO_RUBRO', caption: 'Rubro', width: 80 },
		];
	}

	getCentroPreviewColumns(): any[] {
		return [
			{ dataField: 'CORR_CENTRO_COSTO', caption: 'Corr.', width: 70 },
			{ dataField: 'CODIGO_CENTRO_COSTO', caption: 'Código', width: 100 },
			{ dataField: 'NOMBRE_CENTRO', caption: 'Nombre', width: 220 },
			{ dataField: 'CORR_TIPO_CENTRO_COSTO', caption: 'Tipo', width: 70 },
			{ dataField: 'ESTADO_CENTRO_COSTO', caption: 'Estado', width: 80 },
			{ dataField: 'CUENTA_CONTABLE', caption: 'Cuenta', width: 110 },
		];
	}
}
