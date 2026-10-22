import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IResult } from 'src/app/FxAPI/IResult';
import { AcaTiposPracticaRepository } from './aca-tipos-practica.repository';
import { TipoPractica } from './models/tipo-practica';
@Injectable({ providedIn: 'root' })
export class AcaTiposPracticaService {
    constructor(private repository: AcaTiposPracticaRepository) { }
    getAll(): Observable<IResult> { return this.repository.getAll(); }
    guardar(model: TipoPractica): Observable<IResult> { return this.repository.guardar(this.normalizar(model)); }
    normalizar(model: TipoPractica): TipoPractica {
        return { ...model, CODIGO_TIPO: model.CODIGO_TIPO.trim().toUpperCase(), NOMBRE_TIPO: model.NOMBRE_TIPO.trim() };
    }
    validar(model: TipoPractica): string | null {
        if (!/^[A-Z0-9_-]{1,30}$/.test(model.CODIGO_TIPO))
            return 'Código: de 1 a 30 caracteres, letras, números, guion o guion bajo, sin espacios.';
        if (!model.NOMBRE_TIPO || model.NOMBRE_TIPO.length > 80)
            return 'Ingrese un nombre de hasta 80 caracteres.';
        return null;
    }
}
