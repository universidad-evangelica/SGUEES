import { ViewChild } from '@angular/core';
import { BecaCuestionarioComponent } from './beca-cuestionario.component';
import { BecaCuestionarioCreado } from './models/beca-formulario';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { forkJoin } from 'rxjs';
import { finalize, take } from 'rxjs/operators';
import { confirm } from 'devextreme/ui/dialog';
import { DxDateBoxModule } from 'devextreme-angular/ui/date-box';
import { DxTextAreaModule } from 'devextreme-angular/ui/text-area';
import { DxTextBoxModule } from 'devextreme-angular/ui/text-box';
import { DxButtonModule } from 'devextreme-angular/ui/button';
import { DxFormComponent, DxFormModule } from 'devextreme-angular/ui/form';
import { DxSelectBoxModule } from 'devextreme-angular/ui/select-box';
import { DxLoadPanelModule } from 'devextreme-angular/ui/load-panel';
import { CBaseComponent } from 'src/app/FxAPI/CBaseComponent.component';
import { BarraDataMttoModule } from 'src/app/layouts/barra-data-mtto/barra-data-mtto.component';
import { DataGridMttoModule } from 'src/app/layouts/data-grid-mtto/data-grid-mtto.component';
import { AppInfoService } from 'src/app/shared/services/app-info.service';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { UpdateType } from 'src/app/shared/models/UpdateType.enum';
import { AcaBecTipoService } from './aca-bec-tipo.service';
import { BecaFormulario, BecaVersion, BecaAsignacion, BecaCiclo, BecaPlantilla, BecaFormularioCambio, BecaFormularioAccion } from './models/beca-formulario';

type FormularioItem = NonNullable<DxFormComponent['items']>[number];
export interface BecaAccionRapida { clave:number; tipo:'crear'|'modificar'|'asignar'|'copiar'; }
export interface BecaVersionContexto { formulario:number; version:number; }

@Component({
  selector: 'app-beca-formularios', standalone: true,
  imports: [BecaCuestionarioComponent, CommonModule, DxButtonModule, DxFormModule, DxSelectBoxModule, DxLoadPanelModule, DxDateBoxModule, DxTextAreaModule, DxTextBoxModule, DataGridMttoModule,BarraDataMttoModule],
  templateUrl: './beca-formularios.component.html',
  styles: [`.acciones { display:flex; flex-wrap:wrap; gap:12px; margin:16px 0; }
    .descripcion { margin:12px 0; overflow-wrap:anywhere; } h3{font-size:20px;line-height:1.4;margin:0 0 12px;}.bloque { margin-top:20px; }`],
})
export class BecaFormulariosComponent extends CBaseComponent implements OnChanges {
  @Input() corrBeca = 0;
  @Input() formularioInicialId = 0;
  @Input() versionInicialId = 0;
  @Input() accionInicial?:BecaAccionRapida;
  private accionAtendida=0;
  modoSencillo=false;
  mensajeAsignacion='';
  private consultaId = 0;
  @Output() pendiente = new EventEmitter<boolean>();
  @Output() actualizado = new EventEmitter<void>();
  @Output() versionActiva = new EventEmitter<BecaVersionContexto>();
  formularios: BecaFormulario[] = [];
  versiones: BecaVersion[] = [];
  asignaciones: BecaAsignacion[] = [];
  ciclos: BecaCiclo[] = [];
  plantillas: BecaPlantilla[] = [];
  formularioId = 0;
  versionEditorId = 0;
  private versionParaAbrir = 0;
  @ViewChild(BecaCuestionarioComponent) editorContenido?: BecaCuestionarioComponent;
  override permitirSalir(): boolean | Observable<boolean> | Promise<boolean> { return this.versionEditorId && this.editorContenido ? this.editorContenido.permitirSalir() : super.permitirSalir(); }
  abrirCuestionario(): void {
    if(this.versionSeleccionada&&!this.edicion&&!this.loadingVisible){
      this.versionEditorId=this.versionSeleccionada.CORR_FORMULARIO_VERSION;
      this.versionActiva.emit({formulario:this.versionSeleccionada.CORR_FORMULARIO_BECA,version:this.versionEditorId});
    }
  }
  volverVersiones(): void { this.versionEditorId=0;this.consultar(); }

  versionSeleccionada?: BecaVersion;
  asignacionSeleccionada?: BecaAsignacion;
  edicion: BecaFormularioAccion | null = null;
  datos: BecaFormularioCambio = { CORR_BECA: 0, ID: 0 };
  tituloEdicion = '';
  formularioItems: FormularioItem[] = [];
  readonly columnasVersiones = [
    { dataField: 'CORR_FORMULARIO_VERSION', caption: 'N.º', width: 80 },
    { dataField: 'VERSION_FORMULARIO', caption: 'Versión', minWidth: 150 },
    { dataField: 'ESTADO_VERSION', caption: 'Estado', width: 140 },
    { dataField: 'FECHA_INICIO', caption: 'Inicio', dataType: 'date', format: 'dd/MM/yyyy' },
    { dataField: 'FECHA_FIN', caption: 'Fin', dataType: 'date', format: 'dd/MM/yyyy' },
    { dataField: 'CANT_SECCIONES', caption: 'Secciones', width: 100 },
    { dataField: 'CANT_PREGUNTAS', caption: 'Preguntas', width: 100 },
    { dataField: 'CANT_SOLICITUDES', caption: 'Solicitudes', width: 110 },
  ];
  readonly columnasAsignaciones = [
    { dataField: 'NOMBRE_FORMULARIO', caption: 'Formulario', minWidth: 230 },
    { dataField: 'VERSION_FORMULARIO', caption: 'Versión', minWidth: 130 },
    { dataField: 'ANIO_ADMISION', caption: 'Año', width: 100, customizeText: (e: {value: number|null}) => e.value ?? 'General' },
    { dataField: 'NUMERO_PERIODO_ADMISION', caption: 'Período', width: 100 },
    { dataField: 'ACTIVO', caption: 'Activa', dataType: 'boolean', width: 100 },
  ];

  constructor(public override appInfoService: AppInfoService, public override router: ActivatedRoute, private service: AcaBecTipoService) {
    super(appInfoService, router); this.getPermisos(appInfoService.getPermiso('/aca-bec-tipo') ?? '');
  }
  ngOnChanges(): void { if (this.corrBeca > 0 && !this.edicion) { this.modoSencillo=!!this.accionInicial;this.versionEditorId=0;this.formularioId=this.formularioInicialId;this.versionParaAbrir=0;this.consultar(); } }
  versionesDelFormulario: BecaVersion[] = [];
  private filtrarVersiones(): void { this.versionesDelFormulario = this.versiones.filter(v => v.CORR_FORMULARIO_BECA === this.formularioId); }
  get formularioSeleccionado(): BecaFormulario | undefined { return this.formularios.find(f => f.CORR_FORMULARIO_BECA === this.formularioId); }
  get puedeEditarFormulario(): boolean { return this.permiteEdit && !!this.formularioSeleccionado && !this.versionesDelFormulario.some(v => v.ESTADO_VERSION === 'PUBLICADA'); }

  consultar(): void {
    if (this.edicion || this.corrBeca <= 0) return;
    const consulta=++this.consultaId,beca=this.corrBeca;
    this.loadingVisible = true;
    forkJoin({ formularios: this.service.formularios(), versiones: this.service.versiones(), asignaciones: this.service.asignaciones(this.corrBeca),
      ciclos: this.service.ciclosFormulario(), plantillas: this.service.plantillasFormulario() })
      .pipe(take(1), finalize(() => {if(consulta===this.consultaId)this.loadingVisible = false;})).subscribe({
        next: data => {
          if(consulta!==this.consultaId||beca!==this.corrBeca)return;
          this.formularios = data.formularios; this.versiones = data.versiones;
          this.asignaciones = data.asignaciones; this.ciclos = data.ciclos; this.plantillas = data.plantillas;
          if (!this.formularios.some(f => f.CORR_FORMULARIO_BECA === this.formularioId))
            this.formularioId = this.asignaciones.find(a => a.ACTIVO)?.CORR_FORMULARIO_BECA ?? this.formularios[0]?.CORR_FORMULARIO_BECA ?? 0;
          this.filtrarVersiones();this.versionSeleccionada = this.versionesDelFormulario.find(v=>v.CORR_FORMULARIO_VERSION===(this.versionParaAbrir || this.versionInicialId)) ?? this.versionesDelFormulario[0]; this.asignacionSeleccionada = undefined;
          if(this.versionParaAbrir){this.versionEditorId=this.versionParaAbrir;this.versionParaAbrir=0;}
          if(this.accionInicial&&this.accionInicial.clave!==this.accionAtendida){
            const accion=this.accionInicial;this.accionAtendida=accion.clave;
            queueMicrotask(()=>{if(consulta===this.consultaId&&beca===this.corrBeca)this.accionRapida(accion.tipo);});
          }
        }, error: error => this.notifyApiError(error),
      });
  }
  seleccionarFormulario(id: number): void { this.formularioId = id; this.filtrarVersiones();this.versionSeleccionada = undefined; }
  seleccionarVersion(event: { row?: { data?: BecaVersion } }): void { this.versionSeleccionada = event.row?.data; }
  seleccionarAsignacion(event: { row?: { data?: BecaAsignacion } }): void { this.asignacionSeleccionada = event.row?.data; }

  private async accionRapida(tipo:BecaAccionRapida['tipo']):Promise<void> {
    this.modoSencillo=true;
    if(tipo==='crear'){
      this.editarFormulario(true);
      if(this.edicion!=='CrearFormularioVacio')return;
      this.datos.CODIGO_FORMULARIO='FB-'+Date.now().toString(36).toUpperCase()+'-'+Math.random().toString(36).slice(2,8).toUpperCase();
      this.tituloEdicion='Crear cuestionario';
      this.formularioItems=this.formularioItems.filter(i=>!['CODIGO_FORMULARIO','VERSION_FORMULARIO'].includes(('dataField' in i?i.dataField:'')??''));
    }else if(tipo==='modificar'){
      if(this.versionSeleccionada?.ESTADO_VERSION==='BORRADOR'){this.abrirCuestionario();return;}
      if(this.versionSeleccionada?.CANT_SOLICITUDES===0){await this.reabrirVersion();return;}
      if(!this.versionSeleccionada||!this.permiteAdd)return;
      this.editarVersion(true);
      if(this.edicion!=='CrearVersion')return;
      this.datos.CORR_VERSION_ORIGEN=this.versionSeleccionada.CORR_FORMULARIO_VERSION;this.datos.CORR_BECA_PLANTILLA=this.corrBeca;
      this.datos.VERSION_FORMULARIO='V-'+Date.now().toString(36).toUpperCase()+'-'+Math.random().toString(36).slice(2,6).toUpperCase();
      this.tituloEdicion='Preparar copia para modificar';
      this.formularioItems=this.formularioItems.filter(i=>!['VERSION_FORMULARIO','CORR_VERSION_ORIGEN','CORR_BECA_PLANTILLA'].includes(('dataField' in i?i.dataField:'')??''));
    }else if(tipo==='copiar'){
      this.editarVersion(true);
      if(this.edicion!=='CrearVersion')return;
      this.datos.VERSION_FORMULARIO='V-'+Date.now().toString(36).toUpperCase()+'-'+Math.random().toString(36).slice(2,6).toUpperCase();
      this.tituloEdicion='Usar un cuestionario existente como base';
      this.formularioItems=this.formularioItems.filter(i=>!('dataField' in i&&i.dataField==='VERSION_FORMULARIO'));
    }else{
      if(this.versionSeleccionada?.ESTADO_VERSION!=='PUBLICADA'){
        this.notifyFx('Primero revise y publique el cuestionario. Después podrá asignarlo a la beca.',NotifyType.Warning);return;
      }
      this.asignar(true);
      if(this.edicion!=='AsignarVersion')return;
      this.tituloEdicion='Asignar cuestionario a esta beca';
      this.formularioItems=this.formularioItems.filter(i=>'dataField' in i&&i.dataField==='CICLO');
      const cicloItem=this.formularioItems[0] as {editorOptions?:Record<string,unknown>};
      cicloItem.editorOptions={...cicloItem.editorOptions,onValueChanged:()=>this.prepararAsignacionRapida()};
      this.prepararAsignacionRapida();
    }
  }
  async reabrirVersion():Promise<void> {
    const version=this.versionSeleccionada;
    if(!version||version.CANT_SOLICITUDES!==0||version.ESTADO_VERSION!=='PUBLICADA'||!this.permiteEdit||this.loadingVisible||this.edicion)return;
    if(!await confirm('Se editará esta misma versión, sin crear una copia. Mientras esté en borrador dejará de estar disponible en todas las becas que la utilizan. Sus asignaciones se conservan y volverán a aplicarse al publicarla. ¿Desea continuar?','Modificar versión sin solicitudes'))return;
    this.ejecutar('ReabrirVersion',{CORR_BECA:this.corrBeca,ID:version.CORR_FORMULARIO_VERSION,VERSION_REGISTRO:version.VERSION_REGISTRO});
  }
  private prepararAsignacionRapida():void {
    const ciclo=this.ciclos.find(c=>c.CORR_PERIODO_ACADEMICO===this.datos.CICLO);
    const actual=this.asignaciones.find(a=>a.ACTIVO&&(a.ANIO_ADMISION??null)===(ciclo?.ANIO??null)
      &&(a.NUMERO_PERIODO_ADMISION??null)===(ciclo?.NUMERO_PERIODO??null));
    this.datos.ID=actual?.CORR_TIPO_FORMULARIO??0;this.datos.VERSION_REGISTRO=actual?.VERSION_REGISTRO;
    this.mensajeAsignacion=actual?'Al guardar, este cuestionario reemplazará la asignación de ese ciclo para nuevas solicitudes. Las anteriores conservan su formulario.':'Al guardar, este cuestionario quedará asignado a la beca para el ciclo elegido.';
  }

  private abrir(accion: BecaFormularioAccion, titulo: string, datos: BecaFormularioCambio, items: FormularioItem[]): void {
    if (this.loadingVisible || this.edicion) return;
    this.edicion = accion; this.tituloEdicion = titulo; this.datos = datos; this.formularioItems = items;
    this.AsignaStatus(UpdateType.Update); this.pendiente.emit(true);
  }
  editarFormulario(nuevo: boolean): void {
    if (nuevo ? !this.permiteAdd : !this.puedeEditarFormulario) return;
    const f = this.formularioSeleccionado;
    this.abrir(nuevo ? 'CrearFormularioVacio' : 'EditarFormulario', nuevo ? 'Crear formulario desde cero' : 'Editar formulario',
      { CORR_BECA: this.corrBeca, ID: nuevo ? 0 : f!.CORR_FORMULARIO_BECA, CODIGO_FORMULARIO: nuevo ? '' : f!.CODIGO_FORMULARIO,
        VERSION_FORMULARIO:nuevo?'1':undefined, FECHA_INICIO:nuevo?new Date():undefined, FECHA_FIN:null,
        NOMBRE_FORMULARIO: nuevo ? '' : f!.NOMBRE_FORMULARIO, DESCRIPCION: nuevo ? '' : f!.DESCRIPCION, VERSION_REGISTRO: nuevo ? undefined : f!.VERSION_REGISTRO },
      [this.campo('CODIGO_FORMULARIO','Código',30), this.campo('NOMBRE_FORMULARIO','Nombre',200),
        { dataField: 'DESCRIPCION', label: {text:'Descripción'}, editorType:'dxTextArea', colSpan:2, editorOptions:{maxLength:1000,minHeight:100} },
        ...(nuevo?[this.campo('VERSION_FORMULARIO','Nombre de la versión inicial',20),{dataField:'FECHA_INICIO',label:{text:'Vigente desde'},editorType:'dxDateBox',editorOptions:{type:'date',displayFormat:'dd/MM/yyyy'},validationRules:[{type:'required'}]} as FormularioItem,{dataField:'FECHA_FIN',label:{text:'Vigente hasta (opcional)'},editorType:'dxDateBox',editorOptions:{type:'date',displayFormat:'dd/MM/yyyy',showClearButton:true}} as FormularioItem]:[])]);
  }
  editarVersion(nueva: boolean, usarPlantilla = true): void {
    if (nueva ? !this.permiteAdd || !this.formularioSeleccionado : !this.permiteEdit || this.versionSeleccionada?.ESTADO_VERSION !== 'BORRADOR') return;
    const v = this.versionSeleccionada;
    const origen = v?.ESTADO_VERSION === 'PUBLICADA' ? v : this.versiones.find(x => x.ESTADO_VERSION === 'PUBLICADA');
    const plantilla = this.plantillas.filter(p => p.CORR_FORMULARIO_VERSION === origen?.CORR_FORMULARIO_VERSION);
    const datos: BecaFormularioCambio = nueva ? { CORR_BECA:this.corrBeca, ID:0, CORR_FORMULARIO_BECA:this.formularioId,
      CORR_VERSION_ORIGEN:usarPlantilla?origen?.CORR_FORMULARIO_VERSION:undefined, CORR_BECA_PLANTILLA:usarPlantilla?(plantilla.find(p=>p.CORR_BECA===this.corrBeca)?.CORR_BECA ?? plantilla[0]?.CORR_BECA):undefined,
      VERSION_FORMULARIO:'', FECHA_INICIO:new Date(), FECHA_FIN:null } : { CORR_BECA:this.corrBeca, ID:v!.CORR_FORMULARIO_VERSION,
      CORR_FORMULARIO_BECA:v!.CORR_FORMULARIO_BECA, VERSION_FORMULARIO:v!.VERSION_FORMULARIO, FECHA_INICIO:v!.FECHA_INICIO, FECHA_FIN:v!.FECHA_FIN,
      VERSION_REGISTRO:v!.VERSION_REGISTRO };
    const items: FormularioItem[] = [this.campo('VERSION_FORMULARIO','Identificador de versión',20),
      { dataField:'FECHA_INICIO',label:{text:'Fecha inicio'},editorType:'dxDateBox',editorOptions:{type:'date',displayFormat:'dd/MM/yyyy'},validationRules:[{type:'required'}] },
      { dataField:'FECHA_FIN',label:{text:'Fecha fin (opcional)'},editorType:'dxDateBox',editorOptions:{type:'date',displayFormat:'dd/MM/yyyy',showClearButton:true} }];
    if (nueva && usarPlantilla) items.push(
      { dataField:'CORR_VERSION_ORIGEN',label:{text:'Versión publicada de origen'},editorType:'dxSelectBox', editorOptions:{dataSource:this.versiones.filter(x=>x.ESTADO_VERSION==='PUBLICADA').map(x=>({...x,ETIQUETA:x.NOMBRE_FORMULARIO+' / '+x.VERSION_FORMULARIO})),valueExpr:'CORR_FORMULARIO_VERSION',displayExpr:'ETIQUETA',searchEnabled:true,
        onValueChanged:(e:{value:number;previousValue?:number})=>{ if(e.previousValue !== undefined && e.previousValue !== e.value) this.datos.CORR_BECA_PLANTILLA=undefined; this.dataForm?.instance?.getEditor('CORR_BECA_PLANTILLA')?.option('dataSource',this.plantillas.filter(p=>p.CORR_FORMULARIO_VERSION===e.value)); } },validationRules:[{type:'required'}] },
      { dataField:'CORR_BECA_PLANTILLA',label:{text:'Cuestionario de la beca plantilla'},editorType:'dxSelectBox',editorOptions:{dataSource:plantilla,valueExpr:'CORR_BECA',displayExpr:'NOMBRE_BECA',searchEnabled:true},validationRules:[{type:'required'}] });
    this.abrir(nueva ? 'CrearVersion' : 'EditarVersion', nueva ? (usarPlantilla?'Copiar preguntas de una versión existente':'Crear versión vacía para agregar preguntas') : 'Editar datos de la versión en borrador', datos, items);
  }
  asignar(nueva: boolean): void {
    if (!this.permiteEdit || (!nueva && !this.asignacionSeleccionada)) return;
    const a = nueva ? undefined : this.asignacionSeleccionada;
    const ciclo = this.ciclos.find(c=>c.ANIO===a?.ANIO_ADMISION && c.NUMERO_PERIODO===a?.NUMERO_PERIODO_ADMISION);
    this.abrir('AsignarVersion',nueva ? 'Asignar versión a esta beca' : 'Cambiar asignación seleccionada',
      {CORR_BECA:this.corrBeca, ID:a?.CORR_TIPO_FORMULARIO ?? 0, CORR_VERSION_ORIGEN:a?.CORR_FORMULARIO_VERSION ?? this.versionSeleccionada?.CORR_FORMULARIO_VERSION,
        CICLO:ciclo?.CORR_PERIODO_ACADEMICO ?? 0,VERSION_REGISTRO:a?.VERSION_REGISTRO},
      [{dataField:'CORR_VERSION_ORIGEN',label:{text:'Versión publicada'},editorType:'dxSelectBox',editorOptions:{dataSource:this.versiones.filter(v=>v.ESTADO_VERSION==='PUBLICADA'&&v.ACTIVO&&this.plantillas.some(p=>p.CORR_FORMULARIO_VERSION===v.CORR_FORMULARIO_VERSION&&p.CORR_BECA===this.corrBeca)).map(v=>({...v,ETIQUETA:v.NOMBRE_FORMULARIO+' / '+v.VERSION_FORMULARIO})),valueExpr:'CORR_FORMULARIO_VERSION',displayExpr:'ETIQUETA',searchEnabled:true},validationRules:[{type:'required'}]},
        {dataField:'CICLO',label:{text:'Ciclo de admisión'},editorType:'dxSelectBox',editorOptions:{dataSource:[{CORR_PERIODO_ACADEMICO:0,ETIQUETA:'General (sin ciclo específico)'},...this.ciclos.map(c=>({...c,ETIQUETA:c.ANIO+' - '+c.NUMERO_PERIODO}))],valueExpr:'CORR_PERIODO_ACADEMICO',displayExpr:'ETIQUETA',searchEnabled:true},validationRules:[{type:'required'}]}]);
  }
  async publicar(): Promise<void> {
    const v=this.versionSeleccionada;
    if (!this.permiteEdit || this.loadingVisible || this.edicion || v?.ESTADO_VERSION !== 'BORRADOR') return;
    if (!await confirm('La versión estará disponible para asignarla a becas. Cuando tenga solicitudes, quedará protegida contra cambios. ¿Desea publicarla?','Publicar versión')) return;
    this.ejecutar('PublicarVersion',{CORR_BECA:this.corrBeca,ID:v.CORR_FORMULARIO_VERSION,VERSION_REGISTRO:v.VERSION_REGISTRO});
  }
  async retirar(): Promise<void> {
    const a=this.asignacionSeleccionada;
    if (!this.permiteEdit || this.loadingVisible || this.edicion || !a?.ACTIVO) return;
    if (!await confirm('Se retirará esta asignación para nuevas postulaciones. Las solicitudes existentes conservarán su versión. ¿Continuar?','Retirar asignación')) return;
    this.ejecutar('RetirarAsignacion',{CORR_BECA:this.corrBeca,ID:a.CORR_TIPO_FORMULARIO,VERSION_REGISTRO:a.VERSION_REGISTRO});
  }
  guardar(): void {
    if (!this.edicion || this.loadingVisible || !this.dataForm?.instance?.validate().isValid) return;
    if(this.modoSencillo&&this.accionInicial?.tipo==='copiar'&&this.edicion==='CrearVersion'){
      const origen=this.versiones.find(v=>v.CORR_FORMULARIO_VERSION===this.datos.CORR_VERSION_ORIGEN);
      if(!origen){this.notifyFx('Seleccione el cuestionario de origen.',NotifyType.Warning);return;}
      this.datos.CORR_FORMULARIO_BECA=origen.CORR_FORMULARIO_BECA;
    }
    if (this.edicion==='AsignarVersion') {
      const ciclo=this.ciclos.find(c=>c.CORR_PERIODO_ACADEMICO===this.datos.CICLO);
      if(this.datos.CICLO && !ciclo) { this.notifyFx('Seleccione un ciclo válido.',NotifyType.Warning); return; }
      this.datos.ANIO_ADMISION=ciclo?.ANIO ?? null; this.datos.NUMERO_PERIODO_ADMISION=ciclo?.NUMERO_PERIODO ?? null;
    }
    this.ejecutar(this.edicion,this.datos);
  }
  override cancelar(): void { if(this.loadingVisible)return;this.edicion=null;this.AsignaStatus(UpdateType.Browse);this.pendiente.emit(false); }
  private ejecutar(accion:BecaFormularioAccion,data:BecaFormularioCambio):void {
    this.loadingVisible=true;
    this.service.guardarFormulario(accion,data).pipe(take(1),finalize(()=>this.loadingVisible=false)).subscribe({
      next: result=>{
        if(!result.Result){this.notifyApiResponse(result);return;}
        if(accion==='CrearFormulario')this.formularioId=Number(result.CodeHelper);
        if(accion==='CrearFormularioVacio'){this.formularioId=Number((result.Data as BecaCuestionarioCreado).CORR_FORMULARIO_BECA);this.versionParaAbrir=Number(result.CodeHelper);}
        if(accion==='CrearVersion'){this.formularioId=data.CORR_FORMULARIO_BECA??this.formularioId;this.versionParaAbrir=Number(result.CodeHelper);}
        if(accion==='ReabrirVersion')this.versionParaAbrir=data.ID;
        if(this.versionParaAbrir)this.versionActiva.emit({formulario:this.formularioId,version:this.versionParaAbrir});
        if(accion==='AsignarVersion'&&data.CORR_VERSION_ORIGEN){
          const version=this.versiones.find(v=>v.CORR_FORMULARIO_VERSION===data.CORR_VERSION_ORIGEN);
          if(version)this.versionActiva.emit({formulario:version.CORR_FORMULARIO_BECA,version:version.CORR_FORMULARIO_VERSION});
        }
        this.edicion=null;this.AsignaStatus(UpdateType.Browse);this.pendiente.emit(false);
        this.notifyFx('Configuración guardada correctamente.',NotifyType.Success);queueMicrotask(()=>{this.consultar();this.actualizado.emit();});
      },error:error=>this.notifyApiError(error),
    });
  }
  private campo(dataField:string,text:string,maxLength:number):FormularioItem {
    return {dataField,label:{text},editorOptions:{maxLength,width:'100%'},validationRules:[{type:'required'}]};
  }
}
