import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { take, finalize } from 'rxjs/operators';
import { confirm } from 'devextreme/ui/dialog';
import { CBaseComponent } from 'src/app/FxAPI/CBaseComponent.component';
import { AppInfoService } from 'src/app/shared/services/app-info.service';
import { AcaCiclosService } from '../aca-periodos-academicos/ciclos/aca-ciclos.service';
import { AcaOfertaAdmisionComponent } from '../aca-periodos-academicos/ciclos/aca-oferta-admision.component';
interface OfertaCiclo { CORR_CICLO_ACADEMICO:number; CORR_AREA_ACADEMICA:number; NOMBRE_AREA:string; ANIO:number; NUMERO_PERIODO:number; ESTADO:string; FECHA_INICIO_INSCRIPCION:string; FECHA_FIN_INSCRIPCION:string; }
@Component({ standalone:false,selector:'app-aca-oferta-nuevo-ingreso',templateUrl:'./aca-oferta-nuevo-ingreso.component.html',styleUrls:['./aca-oferta-nuevo-ingreso.component.scss'] })
export class AcaOfertaNuevoIngresoComponent extends CBaseComponent implements OnInit,OnDestroy {
 @ViewChild(AcaOfertaAdmisionComponent) editor?: AcaOfertaAdmisionComponent;
 ciclos:OfertaCiclo[]=[];cicloId=0;ciclo:OfertaCiclo | null=null;
 sedes:{CORR_SEDE:number;NOMBRE_SEDE:string;ACTIVO:boolean}[]=[];
 private secuencia=0;
 constructor(public override appInfoService:AppInfoService,public override router:ActivatedRoute,private service:AcaCiclosService){super(appInfoService,router);}
 ngOnInit():void {
  this.loadingVisible=true;
  this.service.ciclos(0).pipe(take(1),finalize(()=>this.loadingVisible=false)).subscribe({
   next:r=>{if(r.Result)this.ciclos=r.Data ?? [];else this.notifyApiResponse(r);},error:e=>this.notifyApiError(e)
  });
 }
 ngOnDestroy():void {this.secuencia++;}
 override permitirSalir(){this.permiteSalir=!this.editor?.pendiente;return super.permitirSalir();}
 async seleccionar(value:string):Promise<void>{
  if(this.loadingVisible || this.editor?.cargando)return;
  const id=Number(value);if(id===this.cicloId)return;
  if(this.editor?.pendiente && !await confirm('Se descartarán los cambios sin guardar. ¿Desea cambiar de período?','Cambiar período'))return;
  const seq=++this.secuencia;this.cicloId=id;this.ciclo=null;this.sedes=[];
  if(!id)return;
  this.loadingVisible=true;
  this.service.detalle(id).pipe(take(1),finalize(()=>{if(seq===this.secuencia)this.loadingVisible=false;})).subscribe({
   next:r=>{if(seq!==this.secuencia)return;if(r.Result){this.ciclo=r.Data.Cabecera;this.sedes=r.Data.Sedes ?? [];}else{this.cicloId=0;this.notifyApiResponse(r);}},
   error:e=>{if(seq===this.secuencia){this.cicloId=0;this.notifyApiError(e);}}
  });
 }
}
