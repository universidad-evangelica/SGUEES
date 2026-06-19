import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';

import { ConCatalogoCuentaCentroCostoRepository } from './con-catalogo-cuenta-centro-costo.repository';
import { ConCatalogoCuentaCentroCosto } from './models/con-catalogo-cuenta-centro-costo';

@Injectable({
	providedIn: 'root',
})
export class ConCatalogoCuentaCentroCostoService {
	constructor(private repo: ConCatalogoCuentaCentroCostoRepository) {}

	getAll(cuentaContable: string): Observable<IResult> {
		const xWhere: IParam[] = [{ Parameter: 'CUENTA_CONTABLE', Value: cuentaContable || '' }];
		return this.repo.get(xWhere);
	}

	getCatalogoCuentas(): Observable<IResult> {
		return this.repo.getCatalogoCuentas();
	}

	getCentrosCosto(): Observable<IResult> {
		return this.repo.getCentrosCosto();
	}

	asignar(model: ConCatalogoCuentaCentroCosto): Observable<IResult> {
		return this.repo.create({
			CORR_EMPRESA: model.CORR_EMPRESA,
			CUENTA_CONTABLE: model.CUENTA_CONTABLE,
			CORR_CENTRO_COSTO: model.CORR_CENTRO_COSTO,
		});
	}

	desasignar(model: ConCatalogoCuentaCentroCosto): Observable<IResult> {
		const xWhere: IParam[] = [
			{ Parameter: 'CORR_EMPRESA', Value: model.CORR_EMPRESA },
			{ Parameter: 'CUENTA_CONTABLE', Value: model.CUENTA_CONTABLE },
			{ Parameter: 'CORR_CENTRO_COSTO', Value: model.CORR_CENTRO_COSTO },
		];
		return this.repo.delete(xWhere);
	}

	getCatalogoColumns(): any[] {
		return [
			{ dataField: 'CUENTA_CONTABLE', caption: 'Cuenta Contable', width: 120 },
			{ dataField: 'NOMBRE_CUENTA', caption: 'Nombre de Cuenta', width: 220 },
			{ dataField: 'ES_DETALLE', caption: 'Es Detalle', dataType: 'boolean', width: 90 },
			{ dataField: 'NOMBRE_RUBRO', caption: 'Rubro', width: 120 },
		];
	}

	getCentroColumns(): any[] {
		return [
			{ dataField: 'CORR_CENTRO_COSTO', caption: 'Corr.', width: 70 },
			{ dataField: 'CODIGO_CENTRO_COSTO', caption: 'Código', width: 100 },
			{ dataField: 'NOMBRE_CENTRO', caption: 'Nombre', width: 180 },
			{ dataField: 'NOMBRE_TIPO_CENTRO_COSTO', caption: 'Tipo', width: 120 },
		];
	}
}
