import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CData } from 'src/app/FxAPI/CData';
import { IParam } from 'src/app/FxAPI/IParam';
import { IResult } from 'src/app/FxAPI/IResult';
import { environment } from 'src/environments/environment';

@Injectable({
	providedIn: 'root',
})
export class GenEstructuraTerritorialRepository {
	readonly xController = 'GEN_ESTRUCTURA_TERRITORIAL';

	constructor(private objData: CData) {}

	getAllPaises(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Get(this.xController, 'GetAllPaises', xWhere, environment.UrlGENERALAPI);
	}

	getDistinctValuesPaises(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Get(this.xController, 'GetDistinctValuesPaises', xWhere, environment.UrlGENERALAPI);
	}

	createPais(model: any): Observable<IResult> {
		return this.objData.Post(model, this.xController, 'Pais', environment.UrlGENERALAPI);
	}

	updatePais(model: any): Observable<IResult> {
		return this.objData.Put(model, this.xController, 'Pais', [], environment.UrlGENERALAPI);
	}

	deletePais(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Delete(this.xController, 'Pais', xWhere, environment.UrlGENERALAPI);
	}

	getAllDeptos(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Get(this.xController, 'GetAllDeptos', xWhere, environment.UrlGENERALAPI);
	}

	getDistinctValuesDeptos(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Get(this.xController, 'GetDistinctValuesDeptos', xWhere, environment.UrlGENERALAPI);
	}

	createDepto(model: any): Observable<IResult> {
		return this.objData.Post(model, this.xController, 'Depto', environment.UrlGENERALAPI);
	}

	updateDepto(model: any): Observable<IResult> {
		return this.objData.Put(model, this.xController, 'Depto', [], environment.UrlGENERALAPI);
	}

	deleteDepto(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Delete(this.xController, 'Depto', xWhere, environment.UrlGENERALAPI);
	}

	getAllMunicipios(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Get(this.xController, 'GetAllMunicipios', xWhere, environment.UrlGENERALAPI);
	}

	getDistinctValuesMunicipios(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Get(this.xController, 'GetDistinctValuesMunicipios', xWhere, environment.UrlGENERALAPI);
	}

	createMunicipio(model: any): Observable<IResult> {
		return this.objData.Post(model, this.xController, 'Municipio', environment.UrlGENERALAPI);
	}

	updateMunicipio(model: any): Observable<IResult> {
		return this.objData.Put(model, this.xController, 'Municipio', [], environment.UrlGENERALAPI);
	}

	deleteMunicipio(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Delete(this.xController, 'Municipio', xWhere, environment.UrlGENERALAPI);
	}

	getAllDistritos(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Get(this.xController, 'GetAllDistritos', xWhere, environment.UrlGENERALAPI);
	}

	getDistinctValuesDistritos(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Get(this.xController, 'GetDistinctValuesDistritos', xWhere, environment.UrlGENERALAPI);
	}

	createDistrito(model: any): Observable<IResult> {
		return this.objData.Post(model, this.xController, 'Distrito', environment.UrlGENERALAPI);
	}

	updateDistrito(model: any): Observable<IResult> {
		return this.objData.Put(model, this.xController, 'Distrito', [], environment.UrlGENERALAPI);
	}

	deleteDistrito(xWhere: IParam[]): Observable<IResult> {
		return this.objData.Delete(this.xController, 'Distrito', xWhere, environment.UrlGENERALAPI);
	}
}
