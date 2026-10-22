using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using Microsoft.Extensions.Configuration;
using SGUEES.Models;

namespace SGUEES.Repositories
{
    public class ACA_BEC_ORIGEN_BECARepository : BaseRepository<ACA_BEC_ORIGEN_BECATable>, IACA_BEC_ORIGEN_BECARepository
    {
        private const string _TableName = "ACA_BEC_ORIGEN_BECA";
        private const string _ViewName = "V_ACA_BEC_ORIGEN_BECA";
        private const string _CampoPk = "CORR_ORIGEN_BECA";
        private const string _CampoEstado = "ACTIVO";
        private const bool _UsaEmpresa = true;

        public ACA_BEC_ORIGEN_BECARepository(IConfiguration config) :
            base(config.GetConnectionString("defaultConnection"),
                config.GetSection("DbProvider:defaultProvider").Value)
        {
        }

        public async Task<CResult> GetAllAsync(List<CParameter> xWhere)
        {
            CResult objResultado = new();

            try
            {
                var dbWhere = xWhere
                    .Where(x => x.ParameterName == "CORR_EMPRESA" ||
                        x.ParameterName == "CORR_ORIGEN_BECA" ||
                        x.ParameterName == "CODIGO_ORIGEN" ||
                        x.ParameterName == "NOMBRE_ORIGEN" ||
                        x.ParameterName == "ACTIVO")
                    .ToList();

                var reader = await objData.GetDataReader(_ViewName, dbWhere);
                var response = new List<ACA_BEC_ORIGEN_BECAView>().FromDataReader(reader)
                    .OrderBy(x => x.CORR_ORIGEN_BECA)
                    .ToList();

                reader.Close();
                reader = null;

                objResultado.Data = response;
                objResultado.Result = true;
                objResultado.RowsAffected = response.Count;
                objResultado.CodeHelper = 0;
                objResultado.ErrorCode = 0;
                objResultado.ErrorMessage = "";
                objResultado.ErrorSource = "";
            }
            catch (Exception e)
            {
                objResultado.Data = null;
                objResultado.Result = false;
                objResultado.CodeHelper = 0;
                objResultado.ErrorCode = -1;
                objResultado.ErrorMessage = e.Message;
                objResultado.ErrorSource += $"[{e.Source}]";
            }
            finally
            {
                objData.objConnection.Close();
            }

            return objResultado;
        }

        public async Task<CResult> GetAsync(List<CParameter> xWhere)
        {
            CResult objResultado = new();

            try
            {
                var reader = await objData.GetDataReader(_ViewName, xWhere);
                var response = new List<ACA_BEC_ORIGEN_BECAView>().FromDataReader(reader).FirstOrDefault();

                reader.Close();
                reader = null;

                objResultado.Data = response;
                objResultado.Result = true;
                objResultado.RowsAffected = response == null ? 0 : 1;
                objResultado.CodeHelper = response?.CORR_ORIGEN_BECA ?? 0;
                objResultado.ErrorCode = 0;
                objResultado.ErrorMessage = "";
                objResultado.ErrorSource = "";
            }
            catch (Exception e)
            {
                objResultado.Data = null;
                objResultado.Result = false;
                objResultado.CodeHelper = 0;
                objResultado.ErrorCode = -1;
                objResultado.ErrorMessage = e.Message;
                objResultado.ErrorSource += $"[{e.Source}]";
            }
            finally
            {
                objData.objConnection.Close();
            }

            return objResultado;
        }

        public Task<CResult> CreateAsync(ACA_BEC_ORIGEN_BECATable Data, string vLOGIN_SISTEMA, string vESTACION)
            => WriteAsync(1, Data, vLOGIN_SISTEMA, vESTACION);

        public Task<CResult> UpdateAsync(ACA_BEC_ORIGEN_BECATable Data, string vLOGIN_SISTEMA, string vESTACION)
            => WriteAsync(2, Data, vLOGIN_SISTEMA, vESTACION);

        public Task<CResult> DeleteAsync(ACA_BEC_ORIGEN_BECATable Data, string vLOGIN_SISTEMA, string vESTACION)
            => WriteAsync(3, Data, vLOGIN_SISTEMA, vESTACION);

        public Task<CResult> ActivarInactivarAsync(ACA_BEC_ORIGEN_BECATable Data, string vLOGIN_SISTEMA, string vESTACION)
            => WriteAsync(4, Data, vLOGIN_SISTEMA, vESTACION);

        private static bool IsDuplicateKeyError(Exception e)
        {
            return e.Message.Contains("duplicate key", StringComparison.OrdinalIgnoreCase) ||
                e.Message.Contains("PRIMARY KEY", StringComparison.OrdinalIgnoreCase) ||
                e.Message.Contains("UNIQUE KEY", StringComparison.OrdinalIgnoreCase);
        }

        private async Task<CResult> WriteAsync(int operation, ACA_BEC_ORIGEN_BECATable Data, string user, string station)
        {
            if (Data == null) return new CResult { ErrorCode = 51000, ErrorMessage = "No se recibieron datos." };
            try
            {
                var p = new List<CParameter> {
                    new() { ParameterName="@TIPO_ACTUALIZA",Value=operation,DbType=System.Data.DbType.Int32 },
                    new() { ParameterName="@CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32 },
                    new() { ParameterName="@ID",Value=Data.CORR_ORIGEN_BECA,DbType=System.Data.DbType.Int32,Direction=System.Data.ParameterDirection.InputOutput },
                    new() { ParameterName="@USUARIO",Value=user??"",DbType=System.Data.DbType.AnsiString },
                    new() { ParameterName="@ESTACION",Value=station??"",DbType=System.Data.DbType.AnsiString },
                    new() { ParameterName="@CODIGO_ORIGEN",Value=(object)Data.CODIGO_ORIGEN??DBNull.Value,DbType=System.Data.DbType.AnsiString },
                    new() { ParameterName="@NOMBRE_ORIGEN",Value=(object)Data.NOMBRE_ORIGEN??DBNull.Value,DbType=System.Data.DbType.AnsiString },
                    new() { ParameterName="@DESCRIPCION",Value=(object)Data.DESCRIPCION??DBNull.Value,DbType=System.Data.DbType.AnsiString },
                    new() { ParameterName="@ACTIVO",Value=(object)Data.ACTIVO??DBNull.Value,DbType=System.Data.DbType.Boolean }
                };
                await objData.ExecCmd(System.Data.CommandType.StoredProcedure, "PRAL_MTTO_ACA_BEC_ORIGEN_BECA", true, p);
                Data.CORR_ORIGEN_BECA = Convert.ToInt32(objData.objCommand.Parameters["@ID"].Value);
                objData.objConnection.Close();
                if (operation == 3) return new CResult { Result = true, CodeHelper = Data.CORR_ORIGEN_BECA, RowsAffected = 1 };
                var result = await GetAsync(new List<CParameter>{
                    new(){ParameterName="CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
                    new(){ParameterName="CORR_ORIGEN_BECA",Value=Data.CORR_ORIGEN_BECA,DbType=System.Data.DbType.Int32}
                });
                result.CodeHelper = Data.CORR_ORIGEN_BECA; result.RowsAffected = result.Data == null ? 0 : 1; return result;
            }
            catch (Exception ex) { return new CResult { ErrorCode = -1, ErrorMessage = ex.Message }; }
            finally { objData.objConnection.Close(); }
        }
    }
}
