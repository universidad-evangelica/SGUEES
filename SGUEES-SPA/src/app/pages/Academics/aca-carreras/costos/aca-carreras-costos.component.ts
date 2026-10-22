import { Component, Input, OnChanges, OnDestroy, SimpleChanges, ViewChild } from '@angular/core';
import { DxFormComponent } from 'devextreme-angular';
import { forkJoin } from 'rxjs';
import { finalize,take } from 'rxjs/operators';
import { AcaCarrerasConfigService } from '../aca-carreras-config.service';
import { AcaCarrerasSedesService } from '../sedes/aca-carreras-sedes.service';
import { SgueesNotificationService } from 'src/app/shared/services/sguees-notification.service';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { getApiErrorMessage } from 'src/app/shared/mtto/mtto-api-messages';
@Component({selector:'app-aca-carreras-costos',templateUrl:'./aca-carreras-costos.component.html'})
export class AcaCarrerasCostosComponent implements OnChanges,OnDestroy {
    @Input() carreraId=0;@Input() bloqueado=false;@Input() permiteCrear=false;@Input() permiteEditar=false;
    @ViewChild('formCosto') form?:DxFormComponent;
    costos:any[]=[];sedes:any[]=[];monedas:any[]=[];seleccion:any=null;draft:any={};editorVisible=false;cargando=false;cargado=false;private secuencia=0;
    readonly montos=[['MATRICULA_NACIONAL','Matrícula nacional'],['MATRICULA_EXTRANJERA','Matrícula extranjera'],['INSCRIPCION','Inscripción'],['INSCRIPCION_TUTORIA','Inscripción de tutoría'],['COSTO_CARNE','Costo de carné']];
    readonly impuestos=[{id:'GRAVADO',text:'Gravado'},{id:'EXENTO',text:'Exento'},{id:'NO_SUJETO',text:'No sujeto'}];readonly politicas=[{id:'NUNCA',text:'No cobrar nunca'},{id:'SIEMPRE',text:'Cobrar siempre'}];
    readonly pagos=[{id:'EFECTIVO',text:'Efectivo'},{id:'CREDITO',text:'Crédito'}];readonly tipos=[{id:'ASIGNATURA',text:'Por asignatura'},{id:'CREDITO',text:'Por crédito'}];
    readonly columns:any[]=[{dataField:'NOMBRE_SEDE',caption:'Sede',width:190},{dataField:'FECHA_INICIO',caption:'Desde',dataType:'date',format:'dd/MM/yyyy',width:110},{dataField:'FECHA_FIN',caption:'Hasta',dataType:'date',format:'dd/MM/yyyy',width:110},{dataField:'NOMBRE_MONEDA',caption:'Moneda',width:110},{dataField:'MATRICULA_NACIONAL',caption:'Matrícula nacional',dataType:'number',format:'#,##0.00',width:150},{dataField:'MATRICULA_EXTRANJERA',caption:'Matrícula extranjera',dataType:'number',format:'#,##0.00',width:150},{dataField:'ACTIVO',caption:'Activo',dataType:'boolean',width:90}];
    get puedeOperar(){return !!this.carreraId&&!this.bloqueado&&!this.cargando&&this.cargado;}
    get tieneSedesActivas(){return this.sedes.some(s=>s.ACTIVO&&s.ESTADO_SEDE==='A');}
    private sedesCache?:{source:any[];id:number;rows:any[]};private monedasCache?:{source:any[];id:number;rows:any[]};
    get sedesDisponibles(){const id=this.draft.CORR_SEDE;if(this.sedesCache?.source===this.sedes&&this.sedesCache.id===id)return this.sedesCache.rows;const rows=this.sedes.filter(s=>(s.ACTIVO&&s.ESTADO_SEDE==='A')||s.CORR_SEDE===id);this.sedesCache={source:this.sedes,id,rows};return rows;}
    get monedasDisponibles(){const id=this.draft.CORR_MONEDA;if(this.monedasCache?.source===this.monedas&&this.monedasCache.id===id)return this.monedasCache.rows;const rows=this.monedas.filter(m=>m.ACTIVO||m.Key===id);this.monedasCache={source:this.monedas,id,rows};return rows;}
    constructor(private service:AcaCarrerasConfigService,private sedesService:AcaCarrerasSedesService,private notify:SgueesNotificationService){}
    ngOnChanges(changes:SimpleChanges){if(changes['carreraId']){this.editorVisible=false;this.cargar();}}
    ngOnDestroy(){this.secuencia++;}
    cargar(){const seq=++this.secuencia;this.costos=[];this.seleccion=null;this.cargado=false;this.cargando=false;if(!this.carreraId)return;
        this.cargando=true;forkJoin([this.service.costos(this.carreraId),this.service.catalogos(),this.sedesService.getAll(this.carreraId)]).pipe(take(1),finalize(()=>{if(seq===this.secuencia)this.cargando=false;})).subscribe({next:([a,b,c])=>{if(seq!==this.secuencia)return;const error=[a,b,c].find(x=>!x.Result);if(error){this.mensaje(error.ErrorMessage,NotifyType.Error);return;}this.costos=a.Data;this.monedas=b.Data.Monedas;this.sedes=c.Data;this.cargado=true;},error:e=>this.mensaje(getApiErrorMessage(e),NotifyType.Error)});
    }
    nuevo(){if(!this.puedeOperar||!this.permiteCrear||!this.tieneSedesActivas)return;const hoy=new Date();this.draft={CORR_COSTO:0,CORR_CARRERA:this.carreraId,CORR_SEDE:null,CORR_MONEDA:this.monedas.find(m=>m.ACTIVO&&m.Value==='DOLAR')?.Key??null,FECHA_INICIO:`${hoy.getFullYear()}-${String(hoy.getMonth()+1).padStart(2,'0')}-${String(hoy.getDate()).padStart(2,'0')}`,FECHA_FIN:null,MATRICULA_NACIONAL:0,MATRICULA_EXTRANJERA:0,INSCRIPCION:0,INSCRIPCION_TUTORIA:0,COSTO_CARNE:0,COBRA_DIFERENCIA_INSCRIPCION:false,TIPO_IMPUESTO:'GRAVADO',REFERENCIA_FINANCIAMIENTO:null,MONTO_FINANCIAMIENTO:0,PORCENTAJE_RECUPERACION:0,CARGO_CAMBIO_ASIGNATURA:0,POLITICA_CARGO:'NUNCA',MODALIDAD_PAGO:'EFECTIVO',TIPO_COBRO_ASIGNATURA:'ASIGNATURA',ACTIVO:true};this.editorVisible=true;}
    editar(){if(!this.puedeOperar||!this.permiteEditar||!this.seleccion)return;this.draft={...this.seleccion};for(const key of ['FECHA_INICIO','FECHA_FIN'])this.draft[key]=this.draft[key]?String(this.draft[key]).slice(0,10):null;this.editorVisible=true;}
    guardar(){if(!this.puedeOperar||!this.form?.instance.validate().isValid||(this.draft.CORR_COSTO?!this.permiteEditar:!this.permiteCrear))return;
        if(!this.draft.FECHA_INICIO||(this.draft.FECHA_FIN&&this.draft.FECHA_FIN<this.draft.FECHA_INICIO)){this.mensaje('La fecha final no puede ser anterior al inicio.',NotifyType.Warning);return;}
        const seq=this.secuencia;this.cargando=true;this.service.guardarCosto({...this.draft,CORR_CARRERA:this.carreraId}).pipe(take(1),finalize(()=>{if(seq===this.secuencia)this.cargando=false;})).subscribe({next:r=>{if(seq!==this.secuencia)return;if(!r.Result){this.mensaje(r.ErrorMessage,NotifyType.Error);return;}this.costos=r.Data;this.editorVisible=false;this.seleccion=null;this.mensaje('Matrícula y costos guardados para la sede y vigencia.',NotifyType.Success);},error:e=>this.mensaje(getApiErrorMessage(e),NotifyType.Error)});
    }
    private mensaje(text:string,type:NotifyType){this.notify.show(text,type);}
}
