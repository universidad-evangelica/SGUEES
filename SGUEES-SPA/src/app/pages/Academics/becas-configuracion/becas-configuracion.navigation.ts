import { BecasMenuItem } from '../becas-convenios/becas-convenios.navigation';

export type BecaConfiguracionTabId = 'tipos' | 'formularios' | 'origenes' | 'requisitos' | 'documentos' | 'financiadores';
type Tab = { id:BecaConfiguracionTabId; text:string; path:string; icon:string; requiereBeca?:boolean };
export const BECAS_CUESTIONARIO_PATH='/aca-bec-tipo/cuestionarios';
export const BECAS_CONFIGURACION_TABS:readonly Tab[]=[
  {id:'tipos',text:'Tipos de beca',path:'/aca-bec-tipo',icon:'edit'},
  {id:'origenes',text:'Orígenes de beca',path:'/aca-bec-origen-beca',icon:'folder'},
];
export const BECAS_CUESTIONARIO_TABS:readonly Tab[]=[
  {id:'formularios',text:'Formularios y versiones',path:BECAS_CUESTIONARIO_PATH,icon:'copy'},
  {id:'documentos',text:'Documentos requeridos',path:'/aca-bec-documento-requerido',icon:'doc',requiereBeca:true},
  {id:'requisitos',text:'Requisitos',path:'/aca-bec-requisito',icon:'check',requiereBeca:true},
];

export function leerBecaSeleccionada(value: string | null): number {
  if (!value || !/^\d+$/.test(value)) return 0;
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 && id <= 2147483647 ? id : 0;
}

export function agruparMenuConfiguracionBecas(items:readonly BecasMenuItem[],puedeLeer:(path:string)=>boolean):BecasMenuItem[] {
  const path=(item:BecasMenuItem):string=>item.path?'/'+item.path.replace(/^\/+/, '').replace(/\/$/, ''):'';
  const rutas=['/aca-bec-tipo','/aca-bec-origen-beca','/aca-bec-requisito','/aca-bec-documento-requerido'];
  const hijos=items.map(item=>({...item,...(item.items?{items:agruparMenuConfiguracionBecas(item.items,puedeLeer)}:{})}));
  const candidatos=hijos.filter(item=>!item.items?.length&&rutas.includes(path(item)));
  if(!candidatos.length)return hijos;
  const permitidos=candidatos.filter(item=>puedeLeer(path(item)));
  const tipo=permitidos.find(item=>path(item)==='/aca-bec-tipo');
  const configuracion=permitidos.filter(item=>['/aca-bec-tipo','/aca-bec-origen-beca'].includes(path(item)));
  const cuestionarios=permitidos.filter(item=>['/aca-bec-tipo','/aca-bec-requisito','/aca-bec-documento-requerido'].includes(path(item)));
  const grupo=(miembros:BecasMenuItem[],text:string,cuestionario:boolean):BecasMenuItem[]=>{
    if(!miembros.length)return [];
    const principal=tipo??miembros[0];
    return [{...principal,code:String(principal['code']??'becas')+(cuestionario?'-cuestionarios':'-configuracion'),text,
      path:cuestionario&&tipo?BECAS_CUESTIONARIO_PATH:principal.path,
      order:Math.min(...miembros.map(item=>typeof item['order']==='number'?item['order']:0))+(cuestionario?0.1:0),
      workspacePaths:cuestionario?[...(tipo?[BECAS_CUESTIONARIO_PATH]:[]),...miembros.filter(item=>path(item)!=='/aca-bec-tipo').map(path)]:miembros.map(path)}];
  };
  const grupos=[...grupo(configuracion,'Configuración de becas',false),...grupo(cuestionarios,'Cuestionario de becas',true)];
  let agregado=false;
  return hijos.flatMap(item=>{if(!candidatos.includes(item))return [item];if(agregado)return [];agregado=true;return grupos;});
}
