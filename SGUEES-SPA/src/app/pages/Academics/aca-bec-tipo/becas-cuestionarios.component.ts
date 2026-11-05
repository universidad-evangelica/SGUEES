import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize, take } from 'rxjs/operators';
import { DxButtonModule } from 'devextreme-angular/ui/button';
import { DxLoadPanelModule } from 'devextreme-angular/ui/load-panel';
import { CBaseComponent } from 'src/app/FxAPI/CBaseComponent.component';
import { AppInfoService } from 'src/app/shared/services/app-info.service';
import { BarraDataMttoModule } from 'src/app/layouts/barra-data-mtto/barra-data-mtto.component';
import { DxSelectBoxModule } from 'devextreme-angular/ui/select-box';
import { BecasConfiguracionTabsComponent } from '../becas-configuracion/becas-configuracion-tabs.component';
import { leerBecaSeleccionada } from '../becas-configuracion/becas-configuracion.navigation';
import { BecaCuestionarioComponent } from './beca-cuestionario.component';
import { BecaFormulariosComponent, BecaAccionRapida, BecaVersionContexto } from './beca-formularios.component';
import { AcaBecTipoService } from './aca-bec-tipo.service';
import { BecaCuestionarioListado } from './models/beca-formulario';

type Fila = BecaCuestionarioListado & { CLAVE:string; ESTADO_USO:string; ETIQUETA:string };

@Component({
  selector:'app-becas-cuestionarios', standalone:true,
  imports:[CommonModule,DxButtonModule,DxLoadPanelModule,BarraDataMttoModule,DxSelectBoxModule,
    BecasConfiguracionTabsComponent,BecaCuestionarioComponent,BecaFormulariosComponent],
  templateUrl:'./becas-cuestionarios.component.html',
  styles:[`.acciones{display:flex;flex-wrap:wrap;gap:12px;margin:16px 0;} h3,p{overflow-wrap:anywhere;}
    .selector-fila{display:flex;align-items:center;gap:12px;margin-top:8px;}.selector-control{flex:1;min-width:0;}
    .resumen{margin:12px 0;} summary{cursor:pointer;} details p{margin:8px 0 12px;}`],
})
export class BecasCuestionariosComponent extends CBaseComponent implements OnInit {
  @ViewChild(BecaCuestionarioComponent) cuestionario?:BecaCuestionarioComponent;
  @ViewChild(BecaFormulariosComponent) gestor?:BecaFormulariosComponent;
  filas:Fila[]=[];
  readonly camposBusqueda=['NOMBRE_BECA','NOMBRE_FORMULARIO','VERSION_FORMULARIO'];
  readonly etiquetaActualizar={'aria-label':'Actualizar opciones de beca y cuestionario'};
  seleccionada?:Fila;
  cambiosPendientes=false;
  mostrarVersiones=false;
  accionInicial?:BecaAccionRapida;
  contextoGestor?:BecaVersionContexto;
  private versionPreferida?:BecaVersionContexto;
  private accionClave=0;
  get becasAsignadas():string {
    if(!this.seleccionada?.CORR_FORMULARIO_VERSION)return 'Sin asignación';
    return [...new Set(this.filas.filter(f=>f.CORR_FORMULARIO_VERSION===this.seleccionada?.CORR_FORMULARIO_VERSION&&f.CANT_ASIGNACIONES>0)
      .map(f=>f.NOMBRE_BECA))].join(', ')||'Sin asignación';
  }
  constructor(public override appInfoService:AppInfoService,public override router:ActivatedRoute,private service:AcaBecTipoService){
    super(appInfoService,router);
    this.getPermisos(appInfoService.getPermiso('/aca-bec-tipo')??'');
  }
  ngOnInit():void {this.consultar();}
  override permitirSalir():boolean|Observable<boolean>|Promise<boolean> {
    return this.gestor?.permitirSalir() ?? this.cuestionario?.permitirSalir() ?? super.permitirSalir();
  }
  consultar():void {
    if(this.cambiosPendientes||this.loadingVisible)return;
    this.loadingVisible=true;
    this.service.cuestionarios().pipe(take(1),finalize(()=>this.loadingVisible=false)).subscribe({next:rows=>{
      this.filas=rows.map(r=>({...r,CLAVE:r.CORR_BECA+'-'+(r.CORR_FORMULARIO_VERSION??0),
        ETIQUETA:r.NOMBRE_BECA+' · '+(r.NOMBRE_FORMULARIO?r.NOMBRE_FORMULARIO+' / '+r.VERSION_FORMULARIO:'Sin cuestionario'),
        ESTADO_USO:!r.CORR_FORMULARIO_VERSION?'Sin cuestionario':r.ESTADO_VERSION==='BORRADOR'?'Borrador':r.CANT_ASIGNACIONES>0?'Asignado':'Publicado sin asignar'}))
        .sort((a,b)=>a.NOMBRE_BECA.localeCompare(b.NOMBRE_BECA)||(b.CORR_FORMULARIO_VERSION??0)-(a.CORR_FORMULARIO_VERSION??0));
      const anterior=this.seleccionada?.CLAVE;
      const preferida=this.versionPreferida&&this.seleccionada?this.seleccionada.CORR_BECA+'-'+this.versionPreferida.version:undefined;
      const beca=leerBecaSeleccionada(this.router.snapshot.queryParamMap.get('beca'));
      this.seleccionada=this.filas.find(r=>r.CLAVE===preferida)??this.filas.find(r=>r.CLAVE===anterior)??this.filas.find(r=>r.CORR_BECA===beca)
        ??this.filas.find(r=>r.CORR_FORMULARIO_VERSION&&r.CANT_ASIGNACIONES>0)??this.filas[0];
    },error:error=>this.notifyApiError(error)});
  }
  seleccionarClave(clave:string):void {
    const row=this.filas.find(f=>f.CLAVE===clave);
    if(this.cambiosPendientes||this.loadingVisible||!row||row.CLAVE===this.seleccionada?.CLAVE)return;
    this.seleccionada=row;this.versionPreferida=undefined;this.contextoGestor=undefined;this.accionInicial=undefined;this.mostrarVersiones=false;
  }
  cambiarVista(versiones:boolean):void {
    if(!this.cambiosPendientes&&!this.loadingVisible){
      this.accionInicial=undefined;this.contextoGestor={formulario:this.seleccionada?.CORR_FORMULARIO_BECA??0,version:this.seleccionada?.CORR_FORMULARIO_VERSION??0};this.mostrarVersiones=versiones;
    }
  }
  registrarVersion(contexto:BecaVersionContexto):void {
    this.versionPreferida=contexto;
    const fila=this.filas.find(f=>f.CORR_BECA===this.seleccionada?.CORR_BECA&&f.CORR_FORMULARIO_VERSION===contexto.version);
    if(fila)this.seleccionada=fila;
  }
  iniciarAccion(tipo:BecaAccionRapida['tipo']):void {
    if(this.cambiosPendientes||this.loadingVisible||!this.seleccionada)return;
    if((tipo==='crear'||tipo==='copiar')&&!this.permiteAdd)return;
    if(tipo==='modificar'&&(!this.seleccionada.CORR_FORMULARIO_VERSION||(this.seleccionada.ESTADO_VERSION==='BORRADOR'?!this.permiteEdit:!this.permiteAdd)))return;
    if(tipo==='asignar'&&(!this.permiteEdit||this.seleccionada.ESTADO_VERSION!=='PUBLICADA'))return;
    this.contextoGestor={formulario:this.seleccionada.CORR_FORMULARIO_BECA??0,version:this.seleccionada.CORR_FORMULARIO_VERSION??0};
    this.accionInicial={clave:++this.accionClave,tipo};this.mostrarVersiones=true;
  }
}
