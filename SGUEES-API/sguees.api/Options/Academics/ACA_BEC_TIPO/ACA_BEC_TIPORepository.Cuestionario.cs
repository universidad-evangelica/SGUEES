using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Threading.Tasks;
using eFramework.Core;
using SGUEES.Models;
namespace SGUEES.Repositories {
 public partial class ACA_BEC_TIPORepository {
  public async Task<CResult> ContenidoCuestionarioAsync(int empresa,int beca,int version) {
   var titular=await GetAsync(new List<CParameter>{new(){ParameterName="CORR_EMPRESA",Value=empresa,DbType=DbType.Int32},new(){ParameterName="CORR_BECA",Value=beca,DbType=DbType.Int32}});
   if(!titular.Result)return titular;
   if(titular.Data==null)return new CResult{ErrorCode=51000,ErrorMessage="La beca no pertenece a su empresa."};
   var header=await LeerConfiguracionAsync<BecaVersionFila>("V_ACA_BECA_VERSION_MTTO",empresa,version:version);
   if(!header.Result)return header;
   var v=((List<BecaVersionFila>)header.Data).FirstOrDefault();
   if(v==null)return new CResult{ErrorCode=51000,ErrorMessage="La version no pertenece a su empresa."};
   var secciones=await LeerConfiguracionAsync<BecaSeccionFila>("V_ACA_BECA_EDITOR_SECCION",empresa,version:version);if(!secciones.Result)return secciones;
   var preguntas=await LeerConfiguracionAsync<BecaPreguntaFila>("V_ACA_BECA_EDITOR_PREGUNTA",empresa,beca:beca,version:version);if(!preguntas.Result)return preguntas;
   var opciones=await LeerConfiguracionAsync<BecaOpcionFila>("V_ACA_BECA_EDITOR_OPCION",empresa,version:version);if(!opciones.Result)return opciones;
   var puntajes=await LeerConfiguracionAsync<BecaPuntajeFila>("V_ACA_BECA_EDITOR_PUNTAJE",empresa,version:version);if(!puntajes.Result)return puntajes;
   var dependencias=await LeerConfiguracionAsync<BecaDependenciaFila>("V_ACA_BECA_EDITOR_DEPENDENCIA",empresa,version:version);if(!dependencias.Result)return dependencias;
   return new CResult{Result=true,Data=new BecaCuestionarioContenido { VERSION=v,SECCIONES=(List<BecaSeccionFila>)secciones.Data,PREGUNTAS=(List<BecaPreguntaFila>)preguntas.Data,OPCIONES=(List<BecaOpcionFila>)opciones.Data,PUNTAJES=(List<BecaPuntajeFila>)puntajes.Data,DEPENDENCIAS=(List<BecaDependenciaFila>)dependencias.Data }};
  }
  public async Task<CResult> GuardarCuestionarioAsync(string operacion,BecaCuestionarioCambio data,string usuario,string estacion) {
   try {
    var p=new List<CParameter>{
     new(){ParameterName="@OPERACION",Value=operacion,DbType=DbType.AnsiString,Size=10},
     new(){ParameterName="@ELEMENTO",Value=(byte)data.ELEMENTO,DbType=DbType.Byte},
     new(){ParameterName="@CORR_EMPRESA",Value=data.CORR_EMPRESA,DbType=DbType.Int32},
     new(){ParameterName="@CORR_BECA",Value=data.CORR_BECA,DbType=DbType.Int32},
     new(){ParameterName="@CORR_FORMULARIO_VERSION",Value=data.CORR_FORMULARIO_VERSION,DbType=DbType.Int32},
     new(){ParameterName="@ID",Value=data.ID,DbType=DbType.Int32,Direction=ParameterDirection.InputOutput},
     new(){ParameterName="@VERSION_REGISTRO",Value=(object)data.VERSION_REGISTRO??DBNull.Value,DbType=DbType.Binary,Size=8},
     new(){ParameterName="@USUARIO",Value=usuario,DbType=DbType.AnsiString,Size=100},
     new(){ParameterName="@ESTACION",Value=estacion,DbType=DbType.AnsiString,Size=50},
     new(){ParameterName="@CORR_SECCION_BECA",Value=(object)data.CORR_SECCION_BECA??DBNull.Value,DbType=DbType.Int32},
     new(){ParameterName="@CORR_PREGUNTA_BECA",Value=(object)data.CORR_PREGUNTA_BECA??DBNull.Value,DbType=DbType.Int32},
     new(){ParameterName="@CORR_OPCION_BECA",Value=(object)data.CORR_OPCION_BECA??DBNull.Value,DbType=DbType.Int32},
     new(){ParameterName="@NOMBRE_SECCION",Value=(object)data.NOMBRE_SECCION??DBNull.Value,DbType=DbType.AnsiString,Size=200},
     new(){ParameterName="@DESCRIPCION",Value=(object)data.DESCRIPCION??DBNull.Value,DbType=DbType.AnsiString,Size=1000},
     new(){ParameterName="@ORDEN",Value=(object)data.ORDEN??DBNull.Value,DbType=DbType.Int32},
     new(){ParameterName="@PUNTAJE_MAXIMO",Value=(object)data.PUNTAJE_MAXIMO??DBNull.Value,DbType=DbType.Decimal},
     new(){ParameterName="@PORCENTAJE_SECCION",Value=(object)data.PORCENTAJE_SECCION??DBNull.Value,DbType=DbType.Decimal},
     new(){ParameterName="@CODIGO_PREGUNTA",Value=(object)data.CODIGO_PREGUNTA??DBNull.Value,DbType=DbType.AnsiString,Size=50},
     new(){ParameterName="@TEXTO_PREGUNTA",Value=(object)data.TEXTO_PREGUNTA??DBNull.Value,DbType=DbType.AnsiString,Size=-1},
     new(){ParameterName="@AYUDA",Value=(object)data.AYUDA??DBNull.Value,DbType=DbType.AnsiString,Size=1000},
     new(){ParameterName="@TIPO_RESPUESTA",Value=(object)data.TIPO_RESPUESTA??DBNull.Value,DbType=DbType.AnsiString,Size=30},
     new(){ParameterName="@REQUERIDO",Value=(object)data.REQUERIDO??DBNull.Value,DbType=DbType.Boolean},
     new(){ParameterName="@TEXTO_OPCION",Value=(object)data.TEXTO_OPCION??DBNull.Value,DbType=DbType.AnsiString,Size=500},
     new(){ParameterName="@PUNTAJE",Value=(object)data.PUNTAJE??DBNull.Value,DbType=DbType.Decimal},
     new(){ParameterName="@PORCENTAJE",Value=(object)data.PORCENTAJE??DBNull.Value,DbType=DbType.Decimal},
     new(){ParameterName="@FECHA_INICIO",Value=(object)data.FECHA_INICIO??DBNull.Value,DbType=DbType.Date},
     new(){ParameterName="@FECHA_FIN",Value=(object)data.FECHA_FIN??DBNull.Value,DbType=DbType.Date},
     new(){ParameterName="@CORR_PREGUNTA_PADRE",Value=(object)data.CORR_PREGUNTA_PADRE??DBNull.Value,DbType=DbType.Int32},
     new(){ParameterName="@CORR_OPCION_PADRE",Value=(object)data.CORR_OPCION_PADRE??DBNull.Value,DbType=DbType.Int32},
     new(){ParameterName="@CORR_PREGUNTA_HIJA",Value=(object)data.CORR_PREGUNTA_HIJA??DBNull.Value,DbType=DbType.Int32},
    };
    await objData.ExecCmd(CommandType.StoredProcedure,"PRAL_MTTO_ACA_BECA_CUESTIONARIO",true,p);
    return new CResult{Result=true,CodeHelper=Convert.ToInt32(objData.objCommand.Parameters["@ID"].Value),RowsAffected=1};
   }catch(Exception ex){return new CResult{ErrorCode=-1,ErrorMessage=ex.Message};}finally{objData.objConnection.Close();}
  }
 }
}
