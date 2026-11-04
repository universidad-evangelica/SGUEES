import type { AcaCarreraCosto } from './models/aca-carrera-costo';
import { Injectable } from '@angular/core';
import { AcaCarrerasConfigRepository } from './aca-carreras-config.repository';
@Injectable({providedIn:'root'})
export class AcaCarrerasConfigService {
    constructor(private repo: AcaCarrerasConfigRepository) {}
    catalogos() { return this.repo.catalogos(); }
    facultad(id:number) { return this.repo.facultad(id); }
    costos(id:number) { return this.repo.costos(id); }
    guardarCosto(d:AcaCarreraCosto) { return this.repo.guardarCosto(d); }
}
