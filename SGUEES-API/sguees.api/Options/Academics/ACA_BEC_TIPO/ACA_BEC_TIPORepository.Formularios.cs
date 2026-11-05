using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Threading.Tasks;
using eFramework.Core;
using SGUEES.Models;
namespace SGUEES.Repositories {
 public partial class ACA_BEC_TIPORepository {
  private async Task<CResult> LeerConfiguracionAsync<T>(string vista,int empresa,int? beca=null,int? version=null) {
   try {
    var p=new List<CParameter>{new(){ParameterName="CORR_EMPRESA",Value=empresa,DbType=DbType.Int32}};
    if(beca.HasValue)p.Add(new(){ParameterName="CORR_BECA",Value=beca.Value,DbType=DbType.Int32});
    if(version.HasValue)p.Add(new(){ParameterName="CORR_FORMULARIO_VERSION",Value=version.Value,DbType=DbType.Int32});
    var reader=await objData.GetDataReader(vista,p);
    var rows=new List<T>().FromDataReader(reader).ToList();reader.Close();
    return new CResult{Result=true,Data=rows,RowsAffected=rows.Count};
   } catch(Exception ex){return new CResult{ErrorCode=-1,ErrorMessage=ex.Message};}
   finally{objData.objConnection.Close();}
  }
  public Task<CResult> CuestionariosAsync(int empresa)=>LeerConfiguracionAsync<BecaCuestionarioListado>("V_ACA_BECA_CUESTIONARIOS_MTTO",empresa);
  public Task<CResult> PlantillasFormularioAsync(int empresa)=>LeerConfiguracionAsync<BecaPlantillaFila>("V_ACA_BECA_VERSION_PLANTILLA_MTTO",empresa);
  public Task<CResult> FormulariosAsync(int empresa)=>LeerConfiguracionAsync<BecaFormularioFila>("V_ACA_BECA_FORMULARIO_MTTO",empresa);
  public Task<CResult> VersionesAsync(int empresa)=>LeerConfiguracionAsync<BecaVersionFila>("V_ACA_BECA_VERSION_MTTO",empresa);
  public Task<CResult> AsignacionesAsync(int empresa,int beca)=>LeerConfiguracionAsync<BecaAsignacionFila>("V_ACA_BECA_ASIGNACION_MTTO",empresa,beca);
  public async Task<CResult> CiclosFormularioAsync(int empresa) {
   try {
    var reader=await objData.GetDataReader("V_ACA_BECA_FORMULARIO_CICLO",new List<CParameter>());
    var rows=new List<BecaCicloFila>().FromDataReader(reader).ToList();reader.Close();
    return new CResult{Result=true,Data=rows,RowsAffected=rows.Count};
   }catch(Exception ex){return new CResult{ErrorCode=-1,ErrorMessage=ex.Message};}finally{objData.objConnection.Close();}
  }
  public async Task<CResult> GuardarFormularioAsync(string operacion,BecaFormularioCambio data,string usuario,string estacion) {
   try {
    var p=new List<CParameter>{
     new(){ParameterName="@OPERACION",Value=operacion,DbType=DbType.AnsiString,Size=20},
     new(){ParameterName="@CORR_EMPRESA",Value=data.CORR_EMPRESA,DbType=DbType.Int32},
     new(){ParameterName="@CORR_BECA",Value=data.CORR_BECA,DbType=DbType.Int32},
     new(){ParameterName="@ID",Value=data.ID,DbType=DbType.Int32,Direction=ParameterDirection.InputOutput},
     new(){ParameterName="@USUARIO",Value=usuario,DbType=DbType.AnsiString,Size=100},
     new(){ParameterName="@ESTACION",Value=estacion,DbType=DbType.AnsiString,Size=50},
     new(){ParameterName="@CORR_FORMULARIO_BECA",Value=(object)data.CORR_FORMULARIO_BECA??DBNull.Value,DbType=DbType.Int32,Direction=ParameterDirection.InputOutput},
     new(){ParameterName="@CORR_VERSION_ORIGEN",Value=(object)data.CORR_VERSION_ORIGEN??DBNull.Value,DbType=DbType.Int32},
     new(){ParameterName="@CORR_BECA_PLANTILLA",Value=(object)data.CORR_BECA_PLANTILLA??DBNull.Value,DbType=DbType.Int32},
     new(){ParameterName="@CODIGO_FORMULARIO",Value=(object)data.CODIGO_FORMULARIO??DBNull.Value,DbType=DbType.AnsiString,Size=30},
     new(){ParameterName="@NOMBRE_FORMULARIO",Value=(object)data.NOMBRE_FORMULARIO??DBNull.Value,DbType=DbType.AnsiString,Size=200},
     new(){ParameterName="@DESCRIPCION",Value=(object)data.DESCRIPCION??DBNull.Value,DbType=DbType.AnsiString,Size=1000},
     new(){ParameterName="@VERSION_FORMULARIO",Value=(object)data.VERSION_FORMULARIO??DBNull.Value,DbType=DbType.AnsiString,Size=20},
     new(){ParameterName="@FECHA_INICIO",Value=(object)data.FECHA_INICIO??DBNull.Value,DbType=DbType.Date},
     new(){ParameterName="@FECHA_FIN",Value=(object)data.FECHA_FIN??DBNull.Value,DbType=DbType.Date},
     new(){ParameterName="@ANIO_ADMISION",Value=(object)data.ANIO_ADMISION??DBNull.Value,DbType=DbType.Int16},
     new(){ParameterName="@NUMERO_PERIODO_ADMISION",Value=(object)data.NUMERO_PERIODO_ADMISION??DBNull.Value,DbType=DbType.Byte},
     new(){ParameterName="@VERSION_REGISTRO",Value=(object)data.VERSION_REGISTRO??DBNull.Value,DbType=DbType.Binary,Size=8},
    };
    await objData.ExecCmd(CommandType.StoredProcedure,"PRAL_MTTO_ACA_BECA_FORMULARIOS",true,p);
    var id=Convert.ToInt32(objData.objCommand.Parameters["@ID"].Value);
    return new CResult{Result=true,CodeHelper=id,RowsAffected=1,Data=new BecaCuestionarioCreado { CORR_FORMULARIO_BECA=objData.objCommand.Parameters["@CORR_FORMULARIO_BECA"].Value is DBNull ? null : Convert.ToInt32(objData.objCommand.Parameters["@CORR_FORMULARIO_BECA"].Value),CORR_FORMULARIO_VERSION=id }};
   }catch(Exception ex){return new CResult{ErrorCode=-1,ErrorMessage=ex.Message};}finally{objData.objConnection.Close();}
  }
 }
}
