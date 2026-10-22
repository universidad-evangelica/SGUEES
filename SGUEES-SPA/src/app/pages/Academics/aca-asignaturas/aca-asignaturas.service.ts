import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IResult } from 'src/app/FxAPI/IResult';
import { AcaAsignaturasRepository } from './aca-asignaturas.repository';
import { Asignatura, AsociacionPlanInput } from './models/asignatura';
import { AsignarPracticaInput } from './models/asignatura-practica';
@Injectable({ providedIn: 'root' })
export class AcaAsignaturasService {
    constructor(private repository: AcaAsignaturasRepository) { }
    getAll(): Observable<IResult> { return this.repository.getAll(); }
    guardar(model: Asignatura): Observable<IResult> { return this.repository.guardar(this.normalizar(model)); }
    normalizar(model: Asignatura): Asignatura {
        return { ...model, CODIGO_ASIGNATURA: model.CODIGO_ASIGNATURA.trim().toUpperCase(),
            NOMBRE_ASIGNATURA: model.NOMBRE_ASIGNATURA.trim(), ALIAS: model.ALIAS?.trim() || null };
    }
    validar(model: Asignatura): string | null {
        if (!/^[A-Z0-9_-]{1,30}$/.test(model.CODIGO_ASIGNATURA))
            return 'Código: de 1 a 30 caracteres, letras, números, guion o guion bajo, sin espacios.';
        if (!model.NOMBRE_ASIGNATURA || model.NOMBRE_ASIGNATURA.length > 250 || (model.ALIAS?.length ?? 0) > 60)
            return 'Ingrese el nombre (máximo 250 caracteres) y revise el alias (máximo 60).';
        if (!model.CORR_FACULTAD || !model.CORR_CARRERA || !model.CORR_PERIODO_CURSO || !model.FECHA_APERTURA)
            return 'Seleccione facultad, carrera, período y fecha de apertura.';
        const uv = model.UNIDADES_VALORATIVAS;
        if (uv == null || !Number.isFinite(uv) || uv < 0 || uv > 9999.99 || Math.abs(uv * 100 - Math.round(uv * 100)) > 0.000001)
            return 'Ingrese UV entre 0 y 9999.99 con máximo dos decimales. El cero es válido; el campo vacío no.';
        return null;
    }
    carreras(): Observable<IResult> { return this.repository.carreras(); }
    materiasPractica(facultad: number, carrera: number): Observable<IResult> { return this.repository.materiasPractica(facultad, carrera); }
    asignarPractica(model: AsignarPracticaInput): Observable<IResult> { return this.repository.asignarPractica(model); }
    planes(id: number): Observable<IResult> { return this.repository.planes(id); }
    guardarPlan(model: AsociacionPlanInput): Observable<IResult> { return this.repository.guardarPlan(model); }
}
