import type { AcaCarreraCosto } from './models/aca-carrera-costo';
import { Injectable } from '@angular/core';
import { CData } from 'src/app/FxAPI/CData';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class AcaCarrerasConfigRepository {
    constructor(private data: CData) {}
    catalogos(){return this.data.Get('ACA_CARRERAS_CONFIG','Catalogos',[],environment.UrlGENERALAPI);}
    facultad(id:number){return this.data.Get('ACA_CARRERAS_CONFIG','Facultad',[{Parameter:'CORR_FACULTAD',Value:id}],environment.UrlGENERALAPI);}
    costos(id:number){return this.data.Get('ACA_CARRERAS_CONFIG','Costos',[{Parameter:'CORR_CARRERA',Value:id}],environment.UrlGENERALAPI);}
    guardarCosto(d:AcaCarreraCosto){return d.CORR_COSTO?this.data.Put(d,'ACA_CARRERAS_CONFIG','Costos',[],environment.UrlGENERALAPI):this.data.Post(d,'ACA_CARRERAS_CONFIG','Costos',environment.UrlGENERALAPI);}
}
