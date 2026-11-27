import { CommonModule } from '@angular/common';
import { DxButtonModule, DxDataGridModule } from 'devextreme-angular';
import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { take, finalize } from 'rxjs/operators';
import { confirm } from 'devextreme/ui/dialog';
import { AcaCiclosService } from './aca-ciclos.service';
import { OfertaAdmisionFila, OfertaAdmisionInput, OfertaAdmisionCarrera, OfertaAdmisionModalidad } from './aca-oferta-admision.model';
@Component({ standalone: true, imports: [CommonModule, DxButtonModule, DxDataGridModule], selector: 'app-aca-oferta-admision', templateUrl: './aca-oferta-admision.component.html', styleUrls: ['./aca-oferta-admision.component.scss'] })
export class AcaOfertaAdmisionComponent implements OnInit, OnDestroy {
 @Input() ciclo!: { CORR_CICLO_ACADEMICO: number; CORR_AREA_ACADEMICA: number; ANIO: number; NUMERO_PERIODO: number; ESTADO: string; FECHA_INICIO_INSCRIPCION: string; FECHA_FIN_INSCRIPCION: string };
 @Input() sedes: { CORR_SEDE: number; NOMBRE_SEDE: string; ACTIVO: boolean }[] = [];
 @Input() puedeEditar = false;
 sedeId=0; facultadId=0; publicarEnAdmision=false;usaPeriodosVigentes=false;
 carreras: OfertaAdmisionCarrera[]=[]; facultades: {id:number;nombre:string}[]=[];
 filas: OfertaAdmisionFila[]=[]; cargando=false; pendiente=false; guardado=false; conflicto=false; mensaje='';
 private secuencia=0;
 constructor(private service: AcaCiclosService) {}
 ngOnInit(): void { this.sedeId=this.sedes.find(s=>s.ACTIVO)?.CORR_SEDE ?? 0; this.cargar(); }
 ngOnDestroy(): void { this.secuencia++; }
 get sedesActivas() { return this.sedes.filter(s=>s.ACTIVO); }
 visibles: OfertaAdmisionCarrera[]=[];
 readonly estadoCarrera=(c: OfertaAdmisionCarrera): string => c.elegible ? c.modalidades.length+' modalidades' : c.diagnostico;
 filtrarFacultad(value: string | number): void {
   this.facultadId=Number(value);
   this.visibles=this.carreras.filter(c=>!this.facultadId || c.facultad===this.facultadId);
 }
 get editando() { return this.puedeEditar && this.ciclo.ESTADO!=='CERRADO' && !this.cargando && !this.conflicto; }
 get resumen() { return this.carreras.filter(c=>c.publicar && c.elegible).flatMap(c=>c.modalidades.filter(m=>m.publicar).flatMap(m=>m.planes.filter(p=>p.PUBLICAR_PLAN && p.PLAN_ELEGIBLE))); }
 get modalidadesPublicables() { return new Set(this.resumen.map(p=>`${p.CORR_CARRERA}:${p.CORR_MODALIDAD}`)).size; }
 get carrerasPublicables() { return new Set(this.resumen.map(p=>p.CORR_CARRERA)).size; }
 async cambiarSede(id: string): Promise<void> {
   if (Number(id)===this.sedeId) return;
   if (this.pendiente && !await confirm('Se descartarán los cambios sin guardar. ¿Desea cambiar de sede?', 'Cambiar sede')) return;
   this.sedeId=Number(id); this.facultadId=0; this.cargar();
 }
 async actualizar(): Promise<void> {
   if (this.pendiente && !await confirm('Se descartarán los cambios sin guardar. ¿Desea actualizar?', 'Actualizar oferta')) return;
   this.cargar();
 }
 private cargar(guardado=false): void {
   if (!this.sedeId) { this.mensaje='Seleccione una sede participante del ciclo.'; return; }
   const seq=++this.secuencia;
   this.cargando=true; this.mensaje=''; this.guardado=false; this.filas=[]; this.carreras=[]; this.visibles=[]; this.pendiente=false;
   this.service.ofertaAdmision(this.ciclo.CORR_CICLO_ACADEMICO,this.sedeId)
    .pipe(take(1),finalize(()=>{if(seq===this.secuencia)this.cargando=false;})).subscribe({
      next: oferta=>{
       if(seq!==this.secuencia)return;
       if(!oferta.Result){this.mensaje=oferta.ErrorMessage;return;}
       this.conflicto=false;
       this.filas=oferta.Data ?? [];this.publicarEnAdmision=this.filas[0]?.PUBLICAR_NUEVO_INGRESO ?? false;this.usaPeriodosVigentes=this.filas[0]?.USA_PERIODOS_VIGENTES ?? false;
       const fac=new Map<number,string>();
       for(const fila of this.filas){
        fac.set(fila.CORR_FACULTAD,fila.NOMBRE_FACULTAD);
        let c=this.carreras.find(c=>c.id===fila.CORR_CARRERA);
        if(!c){c={id:fila.CORR_CARRERA,nombre:fila.NOMBRE_CARRERA,facultad:fila.CORR_FACULTAD,publicar:fila.PUBLICAR_CARRERA,elegible:fila.CARRERA_ELEGIBLE,modalidades:[],diagnostico:fila.DIAGNOSTICO};this.carreras.push(c);}
        if(fila.CORR_MODALIDAD && fila.CORR_PLAN_ACADEMICO){
         let m=c.modalidades.find(m=>m.id===fila.CORR_MODALIDAD);
         if(!m){m={id:fila.CORR_MODALIDAD,nombre:fila.NOMBRE_MODALIDAD ?? '',publicar:fila.PUBLICAR_MODALIDAD,principal:null,planes:[]};c.modalidades.push(m);}
         m.planes.push(fila);if(fila.ES_PRINCIPAL)m.principal=fila.CORR_PLAN_ACADEMICO;
        }
       }
       this.facultades=Array.from(fac,([id,nombre])=>({id,nombre}));this.filtrarFacultad(this.facultadId);this.guardado=guardado;
      },error: e=>{if(seq===this.secuencia)this.mensaje=e?.error?.ErrorMessage ?? 'No se pudo cargar la oferta. Actualice la pantalla.';}
    });
 }
 marcarPlan(m: OfertaAdmisionModalidad, p: OfertaAdmisionFila, value: boolean): void {
   p.PUBLICAR_PLAN=value;m.principal=this.planAsignado(m);this.pendiente=true;this.mensaje='';this.guardado=false;
 }
 planesElegibles(m: OfertaAdmisionModalidad) { return m.planes.filter(p=>p.PUBLICAR_PLAN && p.PLAN_ELEGIBLE); }
 private planAsignado(m: OfertaAdmisionModalidad): number | null {
   const planes=this.planesElegibles(m);
   return planes.find(p=>p.CORR_PLAN_ACADEMICO===m.principal)?.CORR_PLAN_ACADEMICO ?? planes[0]?.CORR_PLAN_ACADEMICO ?? null;
 }
 cambiarPublicacion(value: boolean): void { this.publicarEnAdmision=value;this.pendiente=true; }
 async guardar(): Promise<void> {
   if(!this.editando || !this.filas.length || !this.pendiente)return;
   const aviso=this.publicarEnAdmision
     ? (this.usaPeriodosVigentes ? 'Se actualizarán las opciones de nuevo ingreso de este período vigente. Solo se retirarán las carreras, modalidades o planes que haya desmarcado. ¿Desea guardar?'
       : 'Se guardará la oferta completa de esta sede y se publicará con el ciclo habilitado y la inscripción abierta. ¿Desea continuar?')
     : 'La oferta quedará sin publicar para nuevos registros. Las solicitudes existentes se conservan. ¿Desea guardar?';
   if(!await confirm(aviso, 'Guardar oferta de nuevo ingreso'))return;
   const primera=this.filas[0];
   const data: OfertaAdmisionInput={CORR_CICLO_ACADEMICO:this.ciclo.CORR_CICLO_ACADEMICO,CORR_SEDE:this.sedeId,PUBLICAR_NUEVO_INGRESO:this.publicarEnAdmision,
    VERSION_CICLO:primera.VERSION_CICLO,VERSION_OFERTA:primera.VERSION_OFERTA,
    CARRERAS:this.carreras.map(c=>({id:c.id,publicar:c.publicar})),
    MODALIDADES:this.carreras.flatMap(c=>c.modalidades.map(m=>({carrera:c.id,modalidad:m.id,publicar:m.publicar,principal:this.planAsignado(m)}))),
    PLANES:this.filas.filter(p=>p.CORR_PLAN_ACADEMICO!=null).map(p=>({id:p.CORR_PLAN_ACADEMICO!,publicar:p.PUBLICAR_PLAN}))};
   this.cargando=true;
   this.service.guardarOfertaAdmision(data).pipe(take(1)).subscribe({
    next:r=>{this.cargando=false;if(r.Result){this.cargar(true);}else{this.mensaje=r.ErrorMessage;this.conflicto=r.ErrorCode===51009;}},
    error:e=>{this.cargando=false;this.conflicto=e.status===409;this.mensaje=e?.error?.ErrorMessage ?? 'No se pudo guardar. Actualice para comprobar el estado de la oferta.';}
   });
 }
}
