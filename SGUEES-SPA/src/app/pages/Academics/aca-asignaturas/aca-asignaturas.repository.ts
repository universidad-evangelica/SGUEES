import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CData } from 'src/app/FxAPI/CData';
import { IResult } from 'src/app/FxAPI/IResult';
import { environment } from 'src/environments/environment';
import { Asignatura, AsociacionPlanInput } from './models/asignatura';
import { AsignarPracticaInput } from './models/asignatura-practica';
@Injectable({ providedIn: 'root' })
export class AcaAsignaturasRepository {
    private readonly controller = 'ACA_ASIGNATURAS';
    constructor(private data: CData) { }
    getAll(): Observable<IResult> { return this.data.Get(this.controller, 'GetAll', [], environment.UrlGENERALAPI); }
    guardar(model: Asignatura): Observable<IResult> {
        return model.CORR_ASIGNATURA > 0
            ? this.data.Put(model, this.controller, '', [], environment.UrlGENERALAPI)
            : this.data.Post(model, this.controller, '', environment.UrlGENERALAPI);
    }
    carreras(): Observable<IResult> { return this.data.Get(this.controller, 'Carreras', [], environment.UrlGENERALAPI); }
    materiasPractica(facultad: number, carrera: number): Observable<IResult> {
        return this.data.Get(this.controller, 'Practicas', [{ Parameter: 'CORR_FACULTAD', Value: facultad }, { Parameter: 'CORR_CARRERA', Value: carrera }], environment.UrlGENERALAPI);
    }
    asignarPractica(model: AsignarPracticaInput): Observable<IResult> { return this.data.Put(model, this.controller, 'Practicas', [], environment.UrlGENERALAPI); }
    planes(id: number): Observable<IResult> { return this.data.Get(this.controller, 'Planes', [{ Parameter: 'CORR_ASIGNATURA', Value: id }], environment.UrlGENERALAPI); }
    guardarPlan(model: AsociacionPlanInput): Observable<IResult> { return this.data.Put(model, this.controller, 'Planes', [], environment.UrlGENERALAPI); }
}
