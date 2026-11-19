using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;

namespace sguees.Repositories
{
    public partial class ACA_PROSPECTO_BECARepository
    {
        public Task<CResult> GetFlujoAsync(List<CParameter> p) => LeerAsync<BecaSolicitudFlujo>("V_ACA_BECA_FLUJO_USUARIO",p,"CORR_PROSPECTO_BECA");
        public Task<CResult> GetBitacoraFlujoAsync(List<CParameter> p) => LeerAsync<BecaBitacoraFlujo>("V_ACA_BECA_BITACORA_FLUJO",p,"FECHA DESC,CORR_BITACORA DESC");
        public Task<CResult> GetBitacoraEdicionAsync(List<CParameter> p) => LeerAsync<BecaBitacoraEdicion>("V_ACA_BECA_BITACORA_EDICION",p,"FECHA DESC,CORR_BITACORA_BECA DESC");

        public async Task<CResult> AccionFlujoAsync(int empresa, BecaSolicitudResolucion data, string operacion, string usuario, string estacion)
        {
            try
            {
                var p=new List<CParameter>
                {
                    new() { ParameterName="@CORR_EMPRESA", Value=empresa, DbType=DbType.Int32 },
                    new() { ParameterName="@SOLICITUD", Value=data.CORR_PROSPECTO_BECA, DbType=DbType.Int32 },
                    new() { ParameterName="@OPERACION", Value=operacion, DbType=DbType.AnsiString, Size=15 },
                    new() { ParameterName="@VERSION_REGISTRO", Value=data.VERSION_REGISTRO, DbType=DbType.Binary, Size=8 },
                    new() { ParameterName="@USUARIO", Value=usuario, DbType=DbType.AnsiString, Size=30 },
                    new() { ParameterName="@ESTACION", Value=estacion, DbType=DbType.AnsiString, Size=50 },
                    new() { ParameterName="@OBSERVACION", Value=data.OBSERVACION, DbType=DbType.String, Size=2000 },
                };
                using var reader=await objData.GetDataReader(CommandType.StoredProcedure,"PRAL_MTTO_ACA_PROSPECTO_BECA_FLUJO",p);
                var rows=new List<BecaSolicitudFlujo>().FromDataReader(reader).ToList();
                return new CResult { Result=true, Data=rows, RowsAffected=rows.Count };
            }
            catch(Exception ex) { return new CResult { Result=false, ErrorCode=-1, ErrorMessage=ex.Message }; }
            finally { objData.objConnection.Close(); }
        }
    }
}
