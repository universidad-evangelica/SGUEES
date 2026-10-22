import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IResult } from 'src/app/FxAPI/IResult';
import { AcaPeriodosCursoRepository } from './aca-periodos-curso.repository';
import { PeriodoCurso } from './models/periodo-curso';
@Injectable({ providedIn: 'root' })
export class AcaPeriodosCursoService {
    constructor(private repository: AcaPeriodosCursoRepository) { }
    getAll(): Observable<IResult> { return this.repository.getAll(); }
    guardar(model: PeriodoCurso): Observable<IResult> { return this.repository.guardar(this.normalizar(model)); }
    normalizar(model: PeriodoCurso): PeriodoCurso {
        return { ...model, CODIGO_PERIODO: model.CODIGO_PERIODO.trim().toUpperCase(), NOMBRE_PERIODO: model.NOMBRE_PERIODO.trim() };
    }
    validar(model: PeriodoCurso): string | null {
        if (!/^[A-Z0-9_-]{1,20}$/.test(model.CODIGO_PERIODO))
            return 'Código: de 1 a 20 caracteres, letras, números, guion o guion bajo, sin espacios.';
        if (!model.NOMBRE_PERIODO || model.NOMBRE_PERIODO.length > 80)
            return 'Ingrese un nombre de hasta 80 caracteres.';
        if (!Number.isInteger(model.DURACION_MESES) || model.DURACION_MESES < 1 || model.DURACION_MESES > 120)
            return 'La duración debe ser de 1 a 120 meses enteros.';
        return null;
    }
}
