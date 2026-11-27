import type { OfertaAdmisionInput } from './aca-oferta-admision.model';
import type { AcaCicloInput, AcaCicloAsignacion } from './aca-ciclo-input';
import { Injectable } from '@angular/core';
import { AcaCiclosRepository } from './aca-ciclos.repository';
@Injectable({ providedIn: 'root' })
export class AcaCiclosService {
    constructor(private repo: AcaCiclosRepository) {}
    ofertaAdmision(id: number, sede: number) { return this.repo.ofertaAdmision(id, sede); }
    guardarOfertaAdmision(model: OfertaAdmisionInput) { return this.repo.guardarOfertaAdmision(model); }
    areas() { return this.repo.areas(); }
    ciclos(area: number) { return this.repo.ciclos(area); }
    detalle(id: number) { return this.repo.detalle(id); }
    catalogos() { return this.repo.catalogos(); }
    faltantes(id: number, version: string) { return this.repo.faltantes(id, version); }
    candidatas(area: number, inicio: string) { return this.repo.candidatas(area, inicio); }
    guardar(model: AcaCicloInput) { return this.repo.guardar(model); }
    asignar(accion: string, model: AcaCicloAsignacion) { return this.repo.asignar(accion, model); }
    oferta(id: number, sede: number, fecha: string) { return this.repo.oferta(id, sede, fecha); }
}
