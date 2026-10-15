using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using Microsoft.Extensions.Configuration;
using sguees.Models;
namespace sguees.Repositories
{
    public class ACA_PLANES_ACADEMICOSRepository : BaseRepository<ACA_PLANES_ACADEMICOSTable>, IACA_PLANES_ACADEMICOSRepository
    {
        public ACA_PLANES_ACADEMICOSRepository(IConfiguration config)
            :base(config.GetConnectionString("defaultConnection"),config["DbProvider:defaultProvider"]) { }
        private static List<CParameter> Where(ACA_PLANES_ACADEMICOSParam data)=>new() {
            new(){ParameterName="CORR_EMPRESA",Value=data.CORR_EMPRESA,DbType=DbType.Int32},
            new(){ParameterName="CORR_CARRERA",Value=data.CORR_CARRERA,DbType=DbType.Int32}
        };
        public async Task<CResult> GetAllAsync(ACA_PLANES_ACADEMICOSParam data)
        {
            try
            {
                if(data.CORR_EMPRESA<=0 || data.CORR_CARRERA<=0) return Error("Seleccione una carrera guardada en la empresa de la sesión.");
                var p=Where(data);
                if(data.CORR_PLAN_ACADEMICO>0)p.Add(new(){ParameterName="CORR_PLAN_ACADEMICO",Value=data.CORR_PLAN_ACADEMICO,DbType=DbType.Int32});
                using var reader=await objData.GetDataReader("V_ACA_PLANES_CARRERA",p,"ANIO_PLAN DESC, CODIGO_PLAN");
                var rows=new List<ACA_PLANES_ACADEMICOSView>().FromDataReader(reader).ToList();
                return new CResult{Result=true,Data=rows,RowsAffected=rows.Count};
            }
            catch(Exception ex){return Error(ex.Message);}
            finally{objData.objConnection.Close();}
        }
        public async Task<CResult> GetModalidadesAsync(ACA_PLANES_ACADEMICOSParam data)
        {
            try
            {
                if(data.CORR_EMPRESA<=0 || data.CORR_CARRERA<=0)return Error("Seleccione una carrera guardada.");
                using var reader=await objData.GetDataReader("V_ACA_MODALIDADES_CARRERA_LOOKUP",Where(data),"Value");
                var rows=new List<ACA_MODALIDADES_CARRERAView>().FromDataReader(reader).ToList();
                return new CResult{Result=true,Data=rows,RowsAffected=rows.Count};
            }
            catch(Exception ex){return Error(ex.Message);}
            finally{objData.objConnection.Close();}
        }
        public async Task<CResult> WriteAsync(int operation,ACA_PLANES_ACADEMICOSTable data,string user,string station)
        {
            try
            {
                var p=new List<CParameter>{
                    new(){ParameterName="TIPO_ACTUALIZA",Value=operation,DbType=DbType.Int32},
                    new(){ParameterName="CORR_EMPRESA",Value=data.CORR_EMPRESA,DbType=DbType.Int32},
                    new(){ParameterName="CORR_CARRERA",Value=data.CORR_CARRERA,DbType=DbType.Int32},
                    new(){ParameterName="CORR_PLAN_ACADEMICO",Value=operation==1?0:data.CORR_PLAN_ACADEMICO,DbType=DbType.Int32,Direction=ParameterDirection.InputOutput},
                    new(){ParameterName="CODIGO_PLAN",Value=(object)data.CODIGO_PLAN??DBNull.Value,DbType=DbType.String},
                    new(){ParameterName="CORR_MODALIDAD",Value=data.CORR_MODALIDAD,DbType=DbType.Int32},
                    new(){ParameterName="ANIO_PLAN",Value=data.ANIO_PLAN,DbType=DbType.Int32},
                    new(){ParameterName="FECHA_VIGENCIA_INICIO",Value=(object)data.FECHA_VIGENCIA_INICIO?.Date??DBNull.Value,DbType=DbType.Date},
                    new(){ParameterName="FECHA_VIGENCIA_FIN",Value=(object)data.FECHA_VIGENCIA_FIN?.Date??DBNull.Value,DbType=DbType.Date},
                    new(){ParameterName="@SYS_LOGIN_USUARIO",Value=user,DbType=DbType.String},
                    new(){ParameterName="@SYS_ESTACION",Value=station??"",DbType=DbType.String},
                    new(){ParameterName="@SYS_NUMERO_ERROR",Value=0,DbType=DbType.Int32,Direction=ParameterDirection.InputOutput},
                    new(){ParameterName="@SYS_MENSAJE_ERROR",Value="",Size=4000,DbType=DbType.String,Direction=ParameterDirection.InputOutput},
                    new(){ParameterName="@SYS_FILAS_AFECTADAS",Value=0,DbType=DbType.Int32,Direction=ParameterDirection.InputOutput}
                };
                await objData.ExecCmd(CommandType.StoredProcedure,"PRAL_MTTO_ACA_PLANES_ACADEMICOS",true,p);
                var code=Convert.ToInt32(objData.objCommand.Parameters["@SYS_NUMERO_ERROR"].Value);
                if(code!=0)return new CResult{ErrorCode=code,ErrorMessage=Convert.ToString(objData.objCommand.Parameters["@SYS_MENSAJE_ERROR"].Value)};
                var id=Convert.ToInt32(objData.objCommand.Parameters["CORR_PLAN_ACADEMICO"].Value);
                var read=await GetAllAsync(new(){CORR_EMPRESA=data.CORR_EMPRESA,CORR_CARRERA=data.CORR_CARRERA,CORR_PLAN_ACADEMICO=id});
                if(!read.Result)return read;
                var row=((IEnumerable<ACA_PLANES_ACADEMICOSView>)read.Data).SingleOrDefault();
                return new CResult{Result=row!=null,Data=row,CodeHelper=id,RowsAffected=row==null?0:1,
                    ErrorMessage=row==null?"No se encontró el plan guardado.":""};
            }
            catch(Exception ex){return Error(ex.Message);}
            finally{objData.objConnection.Close();}
        }
        private static CResult Error(string message)=>new(){ErrorCode=51000,ErrorMessage=message};
    }
}
