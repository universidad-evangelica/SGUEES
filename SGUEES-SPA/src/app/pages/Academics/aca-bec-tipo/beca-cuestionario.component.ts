import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { finalize, take } from 'rxjs/operators';
import { confirm } from 'devextreme/ui/dialog';
import { DxButtonModule } from 'devextreme-angular/ui/button';
import { DxFormComponent, DxFormModule } from 'devextreme-angular/ui/form';
import { DxTabsModule, DxTabsTypes } from 'devextreme-angular/ui/tabs';
import { DxSelectBoxModule } from 'devextreme-angular/ui/select-box';
import { DxTextBoxModule } from 'devextreme-angular/ui/text-box';
import { DxTextAreaModule } from 'devextreme-angular/ui/text-area';
import { DxNumberBoxModule } from 'devextreme-angular/ui/number-box';
import { DxDateBoxModule } from 'devextreme-angular/ui/date-box';
import { DxCheckBoxModule } from 'devextreme-angular/ui/check-box';
import { DxTagBoxModule } from 'devextreme-angular/ui/tag-box';
import { DxLoadPanelModule } from 'devextreme-angular/ui/load-panel';
import { CBaseComponent } from 'src/app/FxAPI/CBaseComponent.component';
import { BarraDataMttoModule } from 'src/app/layouts/barra-data-mtto/barra-data-mtto.component';
import { DataGridMttoModule } from 'src/app/layouts/data-grid-mtto/data-grid-mtto.component';
import { AppInfoService } from 'src/app/shared/services/app-info.service';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { UpdateType } from 'src/app/shared/models/UpdateType.enum';
import { AcaBecTipoService } from './aca-bec-tipo.service';
import { BecaCuestionarioContenido, BecaCuestionarioCambio, BecaElemento, BecaEditorAccion, BecaSeccion, BecaPregunta, BecaOpcion, BecaPuntaje, BecaDependencia, TipoRespuestaBeca } from './models/beca-formulario';

type Item = NonNullable<DxFormComponent['items']>[number];
type Fila = BecaSeccion | BecaPregunta | BecaOpcion | BecaPuntaje | BecaDependencia;
type VistaValor = string | number | boolean | Date | number[] | null;

@Component({
  selector: 'app-beca-cuestionario', standalone: true,
  imports: [CommonModule, DxButtonModule, DxFormModule, DxTabsModule, DxSelectBoxModule, DxTextBoxModule, DxTextAreaModule,
    DxNumberBoxModule, DxDateBoxModule, DxCheckBoxModule, DxTagBoxModule, DxLoadPanelModule, BarraDataMttoModule, DataGridMttoModule],
  templateUrl: './beca-cuestionario.component.html',
  styles: [`.acciones {display:flex;flex-wrap:wrap;gap:12px;margin:16px 0;} .contexto {display:grid;grid-template-columns:1fr 1fr;gap:16px;}
    .contexto > div {min-width:0;} .guia {margin:12px 0;line-height:1.6;} .pregunta-vista {margin:18px 0;}
    h3,p,label {overflow-wrap:anywhere;} .pregunta-vista label {display:block;margin-bottom:8px;}
    @media(max-width:700px){.contexto {grid-template-columns:1fr;}}`],
})
export class BecaCuestionarioComponent extends CBaseComponent implements OnChanges {
  @Input() corrBeca = 0;
  @Input() versionId = 0;
  @Output() volver = new EventEmitter<void>();
  @Output() pendiente = new EventEmitter<boolean>();
  @Output() actualizado = new EventEmitter<void>();
  contenido?: BecaCuestionarioContenido;
  seccionId = 0;
  preguntaId = 0;
  paso = 0;
  edicion: BecaEditorAccion | null = null;
  datos?: BecaCuestionarioCambio;
  itemsEditor: Item[] = [];
  tituloEditor = '';
  filas: Fila[] = [];
  secciones: BecaSeccion[] = [];
  preguntas: BecaPregunta[] = [];
  opciones: BecaOpcion[] = [];
  filaSeleccionada?: Fila;
  columnas: object[] = [];
  clave = 'CORR_SECCION_BECA';
  tabs = ['1. Secciones','2. Preguntas','3. Opciones de respuesta','4. Puntajes','5. Condiciones','6. Vista previa'].map(text=>({text,disabled:false}));
  readonly tipos: {id:TipoRespuestaBeca;text:string}[] = [
    {id:'TEXTO',text:'Texto corto'},{id:'TEXTO_LARGO',text:'Texto largo'},{id:'NUMERO',text:'Número entero'},
    {id:'DECIMAL',text:'Número decimal'},{id:'FECHA',text:'Fecha'},{id:'OPCION_UNICA',text:'Seleccionar una respuesta'},
    {id:'OPCION_MULTIPLE',text:'Seleccionar varias respuestas'},{id:'SI_NO',text:'Sí / No'},
    {id:'DOCUMENTO',text:'Adjuntar archivo'},{id:'ACEPTACION',text:'Casilla de aceptación'},
  ];
  private opcionesIndice = new Map<number,BecaOpcion[]>();
  private preguntasIndice = new Map<number,BecaPregunta[]>();
  private readonly sinOpciones: BecaOpcion[] = [];
  private readonly sinPreguntas: BecaPregunta[] = [];
  respuestasVista: Record<number,VistaValor> = {};

  constructor(public override appInfoService: AppInfoService, public override router: ActivatedRoute, private service:AcaBecTipoService) { super(appInfoService, router); this.getPermisos(appInfoService.getPermiso('/aca-bec-tipo') ?? ''); }
  ngOnChanges():void { if(this.corrBeca>0&&this.versionId>0&&!this.edicion)this.consultar(); }
  get soloLectura():boolean { return this.contenido?.VERSION.ESTADO_VERSION!=='BORRADOR'; }
  get preguntaActual():BecaPregunta|undefined { return this.contenido?.PREGUNTAS.find(p=>p.CORR_PREGUNTA_BECA===this.preguntaId); }
  get usaOpciones():boolean { return !!this.preguntaActual && ['OPCION_UNICA','OPCION_MULTIPLE','SI_NO'].includes(this.preguntaActual.TIPO_RESPUESTA); }
  get nombreElemento():string { return ['sección','pregunta','opción','regla de puntaje','condición'][this.paso] ?? ''; }

  consultar():void {
    if(this.edicion||this.versionId<=0)return;
    const version=this.versionId,beca=this.corrBeca;
    this.loadingVisible=true;
    this.service.contenidoCuestionario(beca,version).pipe(take(1),finalize(()=>{if(version===this.versionId&&beca===this.corrBeca)this.loadingVisible=false;})).subscribe({
      next:data=>{
        if(version!==this.versionId||beca!==this.corrBeca)return;
        this.contenido=data;
        this.opcionesIndice=new Map();this.preguntasIndice=new Map();
        for(const opcion of data.OPCIONES){const grupo=this.opcionesIndice.get(opcion.CORR_PREGUNTA_BECA) ?? [];grupo.push(opcion);this.opcionesIndice.set(opcion.CORR_PREGUNTA_BECA,grupo);}
        for(const grupo of this.opcionesIndice.values())grupo.sort((a,b)=>a.ORDEN-b.ORDEN||a.CORR_OPCION_BECA-b.CORR_OPCION_BECA);
        for(const pregunta of data.PREGUNTAS){const grupo=this.preguntasIndice.get(pregunta.CORR_SECCION_BECA) ?? [];grupo.push(pregunta);this.preguntasIndice.set(pregunta.CORR_SECCION_BECA,grupo);}
        for(const grupo of this.preguntasIndice.values())grupo.sort((a,b)=>a.ORDEN-b.ORDEN||a.CORR_PREGUNTA_BECA-b.CORR_PREGUNTA_BECA);
        this.secciones=[...data.SECCIONES].sort((a,b)=>a.ORDEN-b.ORDEN||a.CORR_SECCION_BECA-b.CORR_SECCION_BECA);
        if(!this.secciones.some(s=>s.CORR_SECCION_BECA===this.seccionId))this.seccionId=this.secciones[0]?.CORR_SECCION_BECA ?? 0;
        this.refrescarContexto();
      },error:error=>this.notifyApiError(error),
    });
  }
  cambiarPaso(event:DxTabsTypes.ItemClickEvent):void { if(event.itemIndex!==undefined)this.irPaso(event.itemIndex); }
  irPaso(index:number):void { if(!this.edicion&&!this.loadingVisible&&!this.tabs[index]?.disabled){this.paso=index;this.refrescarFilas();} }
  cambiarSeccion(id:number):void {if(this.edicion||this.loadingVisible||id===this.seccionId||!this.secciones.some(s=>s.CORR_SECCION_BECA===id))return;this.seccionId=id;this.preguntaId=0;this.refrescarContexto();}
  cambiarPregunta(id:number):void {if(this.edicion||this.loadingVisible||id===this.preguntaId||!this.preguntas.some(p=>p.CORR_PREGUNTA_BECA===id))return;this.preguntaId=id;this.refrescarContexto();}
  get filaClave():number|null {return this.filaSeleccionada ? Number((this.filaSeleccionada as unknown as Record<string,unknown>)[this.clave]) : null;}
  seleccionarFila(event:{row?:{data?:Fila}}):void {
    const fila=event.row?.data;
    if(this.edicion||this.loadingVisible||!fila||!this.filas.some(f=>(f as unknown as Record<string,unknown>)[this.clave]===(fila as unknown as Record<string,unknown>)[this.clave]))return;
    if(fila&&this.paso===0&&(fila as BecaSeccion).CORR_SECCION_BECA!==this.seccionId){this.seccionId=(fila as BecaSeccion).CORR_SECCION_BECA;this.preguntaId=0;this.refrescarContexto();}
    if(fila&&this.paso===1&&(fila as BecaPregunta).CORR_PREGUNTA_BECA!==this.preguntaId){this.preguntaId=(fila as BecaPregunta).CORR_PREGUNTA_BECA;this.refrescarContexto();}
    this.filaSeleccionada=fila;
  }
  abrirFila(event:{data?:Fila;row?:{data?:Fila}}):void {
    const fila=event.data ?? event.row?.data;if(!fila)return;this.filaSeleccionada=fila;
    if(this.paso===0){this.seccionId=(fila as BecaSeccion).CORR_SECCION_BECA;this.preguntaId=0;this.paso=1;this.refrescarContexto();}
    else if(this.paso===1){this.preguntaId=(fila as BecaPregunta).CORR_PREGUNTA_BECA;this.refrescarContexto();if(this.usaOpciones){this.paso=2;this.refrescarFilas();}else if(!this.soloLectura&&this.permiteEdit){this.filaSeleccionada=fila;this.abrirEditor(false);}}
    else if(!this.soloLectura&&this.permiteEdit)this.abrirEditor(false);
  }
  private refrescarContexto():void {
    this.preguntas=(this.contenido?.PREGUNTAS ?? []).filter(p=>p.CORR_SECCION_BECA===this.seccionId).sort((a,b)=>a.ORDEN-b.ORDEN||a.CORR_PREGUNTA_BECA-b.CORR_PREGUNTA_BECA);
    if(!this.preguntas.some(p=>p.CORR_PREGUNTA_BECA===this.preguntaId))this.preguntaId=this.preguntas[0]?.CORR_PREGUNTA_BECA ?? 0;
    this.opciones=this.opcionesDe(this.preguntaId);
    this.tabs=this.tabs.map((tab,i)=>({...tab,disabled:i===1?!this.seccionId:i===2?!this.preguntaId||!this.usaOpciones:i===3||i===4?!this.preguntaId:false}));
    if(this.tabs[this.paso]?.disabled)this.paso=this.seccionId?1:0;
    this.refrescarFilas();
  }
  private refrescarFilas():void {
    this.filaSeleccionada=undefined;
    if(this.paso===0){this.clave='CORR_SECCION_BECA';this.filas=this.secciones;this.columnas=[{dataField:'ORDEN',caption:'Orden',width:90},{dataField:'NOMBRE_SECCION',caption:'Sección',minWidth:260},{dataField:'PUNTAJE_MAXIMO',caption:'Puntaje máximo'},{dataField:'PORCENTAJE_SECCION',caption:'Peso (%)'}];}
    if(this.paso===1){this.clave='CORR_PREGUNTA_BECA';this.filas=this.preguntas;this.columnas=[{dataField:'ORDEN',caption:'Orden',width:90},{dataField:'TEXTO_PREGUNTA',caption:'Pregunta',minWidth:340},{dataField:'TIPO_RESPUESTA',caption:'Tipo de respuesta',lookup:{dataSource:this.tipos,valueExpr:'id',displayExpr:'text'}},{dataField:'REQUERIDO',caption:'Obligatoria',dataType:'boolean'}];}
    if(this.paso===2){this.clave='CORR_OPCION_BECA';this.filas=this.opciones;this.columnas=[{dataField:'ORDEN',caption:'Orden',width:90},{dataField:'TEXTO_OPCION',caption:'Opción de respuesta',minWidth:350}];}
    if(this.paso===3){this.clave='CORR_PUNTAJE_BECA';this.filas=(this.contenido?.PUNTAJES ?? []).filter(p=>p.CORR_PREGUNTA_BECA===this.preguntaId);this.columnas=[{dataField:'TEXTO_OPCION',caption:'Respuesta (vacía: puntaje general)',minWidth:250},{dataField:'PUNTAJE',caption:'Puntaje'},{dataField:'PORCENTAJE',caption:'Porcentaje'},{dataField:'FECHA_INICIO',caption:'Inicio',dataType:'date',format:'dd/MM/yyyy'},{dataField:'FECHA_FIN',caption:'Fin',dataType:'date',format:'dd/MM/yyyy'}];}
    if(this.paso===4){this.clave='CORR_DEPENDENCIA_BECA';this.filas=(this.contenido?.DEPENDENCIAS ?? []).filter(d=>d.CORR_PREGUNTA_HIJA===this.preguntaId);this.columnas=[{dataField:'PREGUNTA_PADRE',caption:'Pregunta anterior',minWidth:300},{dataField:'OPCION_PADRE',caption:'Respuesta que muestra esta pregunta',minWidth:250}];}
    if(this.paso===0)this.filaSeleccionada=this.secciones.find(s=>s.CORR_SECCION_BECA===this.seccionId);
    if(this.paso===1)this.filaSeleccionada=this.preguntas.find(p=>p.CORR_PREGUNTA_BECA===this.preguntaId);
  }
  abrirEditor(nuevo:boolean):void {
    if(this.soloLectura||this.loadingVisible||this.edicion||this.paso>4||(nuevo?!this.permiteAdd:!this.permiteEdit)||(!nuevo&&!this.filaSeleccionada))return;
    const elemento=(this.paso+1) as BecaElemento;
    const fila=this.filaSeleccionada;
    const id=nuevo?0:Number((fila as unknown as Record<string,unknown>)[this.clave]);
    this.datos={CORR_BECA:this.corrBeca,CORR_FORMULARIO_VERSION:this.versionId,VERSION_REGISTRO:this.contenido!.VERSION.VERSION_REGISTRO,ELEMENTO:elemento,ID:id,
      CORR_SECCION_BECA:this.seccionId,CORR_PREGUNTA_BECA:this.preguntaId};
    const orden=this.filas.reduce((max,row)=>Math.max(max,'ORDEN' in row?row.ORDEN:0),0)+1;
    if(elemento===BecaElemento.Seccion){
      Object.assign(this.datos,nuevo?{NOMBRE_SECCION:'',DESCRIPCION:'',ORDEN:orden,PUNTAJE_MAXIMO:0,PORCENTAJE_SECCION:0}:fila);
      this.itemsEditor=[this.texto('NOMBRE_SECCION','Nombre de la sección',200),this.numero('ORDEN','Orden',1),this.texto('DESCRIPCION','Descripción (opcional)',1000,false,true),this.numero('PUNTAJE_MAXIMO','Puntaje máximo',0),this.numero('PORCENTAJE_SECCION','Peso de la sección (%)',0,100)];
    } else if(elemento===BecaElemento.Pregunta){
      Object.assign(this.datos,nuevo?{TEXTO_PREGUNTA:'',AYUDA:'',ORDEN:orden,TIPO_RESPUESTA:'TEXTO',REQUERIDO:true}:fila);
      this.itemsEditor=[this.texto('TEXTO_PREGUNTA','¿Qué desea preguntar?',20000,true,true),this.texto('AYUDA','Ayuda para el aspirante (opcional)',1000,false,true),
        {dataField:'TIPO_RESPUESTA',label:{text:'¿Cómo responderá el aspirante?'},editorType:'dxSelectBox',editorOptions:{dataSource:this.tipos,valueExpr:'id',displayExpr:'text'},validationRules:[{type:'required'}]},
        this.numero('ORDEN','Orden',1),{dataField:'REQUERIDO',label:{visible:false},editorType:'dxCheckBox',editorOptions:{text:'Respuesta obligatoria'}}];
    } else if(elemento===BecaElemento.Opcion){
      Object.assign(this.datos,nuevo?{TEXTO_OPCION:'',ORDEN:orden}:fila);
      this.itemsEditor=[this.texto('TEXTO_OPCION','Texto de la respuesta que podrá seleccionar',500,true,true),this.numero('ORDEN','Orden',1)];
    } else if(elemento===BecaElemento.Puntaje){
      Object.assign(this.datos,nuevo?{CORR_OPCION_BECA:null,PUNTAJE:0,PORCENTAJE:0,FECHA_INICIO:this.contenido!.VERSION.FECHA_INICIO,FECHA_FIN:this.contenido!.VERSION.FECHA_FIN}:fila);
      this.itemsEditor=[...(this.usaOpciones?[this.selector('CORR_OPCION_BECA','Opción de respuesta',this.opciones,'CORR_OPCION_BECA','TEXTO_OPCION')]:[]),this.numero('PUNTAJE','Puntaje de la respuesta',0),this.numero('PORCENTAJE','Porcentaje',0,100),this.fecha('FECHA_INICIO','Fecha inicio',true),this.fecha('FECHA_FIN','Fecha fin (opcional)',false)];
    } else {
      Object.assign(this.datos,nuevo?{CORR_PREGUNTA_HIJA:this.preguntaId}:fila);
      const padres=(this.contenido?.PREGUNTAS ?? []).filter(p=>p.CORR_PREGUNTA_BECA!==this.preguntaId&&['OPCION_UNICA','OPCION_MULTIPLE','SI_NO'].includes(p.TIPO_RESPUESTA));
      const padre=this.selector('CORR_PREGUNTA_PADRE','Mostrar esta pregunta según la respuesta de',padres,'CORR_PREGUNTA_BECA','TEXTO_PREGUNTA');
      padre.editorOptions={...padre.editorOptions,onValueChanged:(e:{value:number;previousValue?:number})=>{
        if(e.previousValue!==undefined&&e.previousValue!==e.value)this.datos!.CORR_OPCION_PADRE=undefined;
        this.dataForm?.instance?.getEditor('CORR_OPCION_PADRE')?.option('dataSource',this.opcionesDe(e.value));
      }};
      this.itemsEditor=[padre,this.selector('CORR_OPCION_PADRE','Cuando el aspirante seleccione',this.opcionesDe(this.datos.CORR_PREGUNTA_PADRE ?? 0),'CORR_OPCION_BECA','TEXTO_OPCION')];
    }
    this.edicion=nuevo?'AgregarElemento':'EditarElemento';this.tituloEditor=(nuevo?'Agregar ':'Editar ')+this.nombreElemento;
    this.AsignaStatus(UpdateType.Update);this.pendiente.emit(true);
  }
  guardar():void {
    if(!this.edicion||!this.datos||this.loadingVisible||!this.dataForm?.instance?.validate().isValid)return;
    this.ejecutar(this.edicion,this.datos);
  }
  override cancelar():void {if(this.loadingVisible)return;this.edicion=null;this.datos=undefined;this.AsignaStatus(UpdateType.Browse);this.pendiente.emit(false);}
  async quitar():Promise<void> {
    if(this.soloLectura||!this.permiteDele||!this.filaSeleccionada||this.loadingVisible||this.edicion||this.paso>4)return;
    if(!await confirm('¿Desea quitar esta '+this.nombreElemento+' del borrador?','Quitar del cuestionario'))return;
    const id=Number((this.filaSeleccionada as unknown as Record<string,unknown>)[this.clave]);
    this.ejecutar('QuitarElemento',{CORR_BECA:this.corrBeca,CORR_FORMULARIO_VERSION:this.versionId,VERSION_REGISTRO:this.contenido!.VERSION.VERSION_REGISTRO,ELEMENTO:this.paso+1,ID:id});
  }
  private ejecutar(accion:BecaEditorAccion,data:BecaCuestionarioCambio):void {
    this.loadingVisible=true;
    this.service.guardarElemento(accion,data).pipe(take(1),finalize(()=>this.loadingVisible=false)).subscribe({next:result=>{
      if(!result.Result){this.notifyApiResponse(result);return;}
      if(accion==='AgregarElemento'&&data.ELEMENTO===BecaElemento.Seccion)this.seccionId=Number(result.CodeHelper);
      if(accion==='AgregarElemento'&&data.ELEMENTO===BecaElemento.Pregunta)this.preguntaId=Number(result.CodeHelper);
      this.edicion=null;this.datos=undefined;this.AsignaStatus(UpdateType.Browse);this.pendiente.emit(false);
      this.notifyFx('Contenido guardado correctamente.',NotifyType.Success);this.respuestasVista={};queueMicrotask(()=>{this.consultar();this.actualizado.emit();});
    },error:error=>this.notifyApiError(error)});
  }
  async publicar():Promise<void> {
    if(this.soloLectura||!this.permiteEdit||this.loadingVisible||this.edicion)return;
    if(!await confirm('Revise la vista previa. Al publicar ya no se podrá cambiar este contenido. ¿Desea publicar?','Publicar cuestionario'))return;
    this.loadingVisible=true;
    this.service.guardarFormulario('PublicarVersion',{CORR_BECA:this.corrBeca,ID:this.versionId,VERSION_REGISTRO:this.contenido!.VERSION.VERSION_REGISTRO}).pipe(take(1),finalize(()=>this.loadingVisible=false)).subscribe({next:result=>{
      if(!result.Result){this.notifyApiResponse(result);return;}
      this.notifyFx('Cuestionario publicado. Ahora puede asignarlo a la beca y ciclo desde Versiones.',NotifyType.Success);
      queueMicrotask(()=>{this.consultar();this.actualizado.emit();});
    },error:error=>this.notifyApiError(error)});
  }
  salir():void {if(!this.edicion&&!this.loadingVisible)this.volver.emit();}
  opcionesDe(id:number):BecaOpcion[] {return this.opcionesIndice.get(id) ?? this.sinOpciones;}
  preguntasDe(id:number):BecaPregunta[] {return this.preguntasIndice.get(id) ?? this.sinPreguntas;}
  visible(p:BecaPregunta,visitados=new Set<number>()):boolean {
    if(visitados.has(p.CORR_PREGUNTA_BECA))return false;
    visitados=new Set(visitados).add(p.CORR_PREGUNTA_BECA);
    const deps=(this.contenido?.DEPENDENCIAS ?? []).filter(d=>d.CORR_PREGUNTA_HIJA===p.CORR_PREGUNTA_BECA);
    if(!deps.length)return true;
    return deps.some(d=>{const padre=this.contenido?.PREGUNTAS.find(q=>q.CORR_PREGUNTA_BECA===d.CORR_PREGUNTA_PADRE);const value=this.respuestasVista[d.CORR_PREGUNTA_PADRE];return !!padre&&this.visible(padre,visitados)&&(Array.isArray(value)?value.includes(d.CORR_OPCION_PADRE):value===d.CORR_OPCION_PADRE);});
  }
  responder(id:number,value:VistaValor):void {this.respuestasVista[id]=value;}
  textoVista(id:number):string {return String(this.respuestasVista[id] ?? '');}
  numeroVista(id:number):number|null {const v=this.respuestasVista[id];return typeof v==='number'?v:null;}
  fechaVista(id:number):Date|string|null {const v=this.respuestasVista[id];return v instanceof Date||typeof v==='string'?v:null;}
  multiplesVista(id:number):number[] {const v=this.respuestasVista[id];return Array.isArray(v)?v:[];}
  booleanVista(id:number):boolean {return this.respuestasVista[id]===true;}
  private texto(dataField:string,text:string,maxLength:number,required=true,largo=false):Item {return {dataField,label:{text},editorType:largo?'dxTextArea':'dxTextBox',colSpan:largo?2:1,editorOptions:{maxLength,minHeight:largo?110:undefined,width:'100%'},validationRules:required?[{type:'required'}]:[]};}
  private numero(dataField:string,text:string,min:number,max?:number):Item {return {dataField,label:{text},editorType:'dxNumberBox',editorOptions:{min,max,showSpinButtons:true,width:'100%'},validationRules:[{type:'required'}]};}
  private fecha(dataField:string,text:string,required:boolean):Item {return {dataField,label:{text},editorType:'dxDateBox',editorOptions:{type:'date',displayFormat:'dd/MM/yyyy',showClearButton:!required},validationRules:required?[{type:'required'}]:[]};}
  private selector(dataField:string,text:string,dataSource:object[],valueExpr:string,displayExpr:string):NonNullable<DxFormComponent['items']>[number]&{editorOptions?:Record<string,unknown>} {
    return {dataField,label:{text},editorType:'dxSelectBox',editorOptions:{dataSource,valueExpr,displayExpr,searchEnabled:true,width:'100%'},validationRules:[{type:'required'}]};
  }
}
