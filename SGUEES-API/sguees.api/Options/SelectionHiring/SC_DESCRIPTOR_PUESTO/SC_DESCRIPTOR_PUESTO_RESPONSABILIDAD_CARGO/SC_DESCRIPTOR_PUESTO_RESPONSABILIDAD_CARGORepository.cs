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
    public class SC_DESCRIPTOR_PUESTO_RESPONSABILIDAD_CARGORepository : BaseRepository<SC_DESCRIPTOR_PUESTO_RESPONSABILIDAD_CARGOTable>, ISC_DESCRIPTOR_PUESTO_RESPONSABILIDAD_CARGORepository
    {
        private const string _TableName = "SC_DESCRIPTOR_PUESTO_RESPONSABILIDAD_CARGO";
        private const string _ViewName = "V_SC_DESCRIPTOR_PUESTO_RESPONSABILIDAD_CARGO";

        public SC_DESCRIPTOR_PUESTO_RESPONSABILIDAD_CARGORepository(IConfiguration config) :
            base(config.GetConnectionString("defaultConnection"),
                config.GetSection("DbProvider:defaultProvider").Value)
        {
        }

        public async Task<CResult> GetAllAsync(List<CParameter> xWhere)
        {
            CResult objResultado = new();

            try
            {
                const string sql = @"SELECT D.*
                    FROM V_SC_DESCRIPTOR_PUESTO_RESPONSABILIDAD_CARGO D
                    WHERE D.CORR_EMPRESA = @CORR_EMPRESA
                      AND D.CORR_DESCRIPTOR_PUESTO = @CORR_DESCRIPTOR_PUESTO
                      AND (
                        ISNULL(D.APLICA_DESCRIPTOR, 'AMBOS') = 'AMBOS'
                        OR D.APLICA_DESCRIPTOR = @FORMATO
                      )";
                var reader = await objData.GetDataReader(System.Data.CommandType.Text, sql, xWhere);
                var response = new List<SC_DESCRIPTOR_PUESTO_RESPONSABILIDAD_CARGOView>().FromDataReader(reader)
                    .OrderBy(x => x.CORR_DESCRIPTOR_RESPONSABILIDAD)
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

        public async Task<List<SC_DESCRIPTOR_PUESTO_RESPONSABILIDAD_CARGOView>> GetAllSinFiltroFormatoAsync(
            int corrEmpresa,
            int corrDescriptor)
        {
            try
            {
                var reader = await objData.GetDataReader(_ViewName, new List<CParameter>
                {
                    new CParameter() { ParameterName = "CORR_EMPRESA", Value = corrEmpresa, DbType = System.Data.DbType.Int32 },
                    new CParameter() { ParameterName = "CORR_DESCRIPTOR_PUESTO", Value = corrDescriptor, DbType = System.Data.DbType.Int32 },
                });
                var response = new List<SC_DESCRIPTOR_PUESTO_RESPONSABILIDAD_CARGOView>()
                    .FromDataReader(reader)
                    .OrderBy(x => x.CORR_DESCRIPTOR_RESPONSABILIDAD)
                    .ToList();
                reader.Close();
                return response;
            }
            finally
            {
                objData.objConnection.Close();
            }
        }

        public async Task<string> GetFormatoDescriptorAsync(int corrEmpresa, int corrDescriptor)
        {
            const string sql = @"SELECT TOP 1 FORMATO
                FROM SC_DESCRIPTOR_PUESTO
                WHERE CORR_EMPRESA = @CORR_EMPRESA
                  AND CORR_DESCRIPTOR_PUESTO = @CORR_DESCRIPTOR_PUESTO";

            try
            {
                var reader = await objData.GetDataReader(System.Data.CommandType.Text, sql, new List<CParameter>
                {
                    new CParameter() { ParameterName = "CORR_EMPRESA", Value = corrEmpresa, DbType = System.Data.DbType.Int32 },
                    new CParameter() { ParameterName = "CORR_DESCRIPTOR_PUESTO", Value = corrDescriptor, DbType = System.Data.DbType.Int32 },
                });
                var formato = reader.Read() ? reader["FORMATO"]?.ToString() : null;
                reader.Close();
                return formato?.Trim().ToUpperInvariant();
            }
            finally
            {
                objData.objConnection.Close();
            }
        }

        public async Task<CResult> GetAsync(List<CParameter> xWhere)
        {
            CResult objResultado = new();

            try
            {
                var reader = await objData.GetDataReader(_ViewName, xWhere);
                var response = new List<SC_DESCRIPTOR_PUESTO_RESPONSABILIDAD_CARGOView>().FromDataReader(reader).FirstOrDefault();

                reader.Close();
                reader = null;

                objResultado.Data = response;
                objResultado.Result = true;
                objResultado.RowsAffected = response == null ? 0 : 1;
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

        public async Task<CResult> CreateAsync(SC_DESCRIPTOR_PUESTO_RESPONSABILIDAD_CARGOTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            CResult objResultado = new();

            try
            {
                var p = BuildWriteParameters(Data);
                var pWhere = new List<CParameter>
                {
                    new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
                };

                var reader = await objData.Insert(_TableName, p, "CORR_DESCRIPTOR_RESPONSABILIDAD", pWhere);
                var response = new List<SC_DESCRIPTOR_PUESTO_RESPONSABILIDAD_CARGOView>().FromDataReader(reader).FirstOrDefault();

                reader.Close();
                reader = null;

                objResultado.Data = response;
                objResultado.Result = true;
                objResultado.RowsAffected = 1;
                objResultado.CodeHelper = response?.CORR_DESCRIPTOR_RESPONSABILIDAD ?? 0;
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

        public async Task<CResult> UpdateAsync(SC_DESCRIPTOR_PUESTO_RESPONSABILIDAD_CARGOTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            CResult objResultado = new();

            try
            {
                var p = new List<CParameter>
                {
                    new CParameter() { ParameterName = "NOMBRE_RESPONSABILIDAD", Value = Data.NOMBRE_RESPONSABILIDAD, DbType = System.Data.DbType.String },
                    new CParameter() { ParameterName = "INFORMACION", Value = Data.INFORMACION, DbType = System.Data.DbType.String },
                    new CParameter() { ParameterName = "CORR_RESPONSABILIDAD", Value = Data.CORR_RESPONSABILIDAD, DbType = System.Data.DbType.Int32 },
                    new CParameter() { ParameterName = "USUARIO_ACTU", Value = Data.USUARIO_ACTU, DbType = System.Data.DbType.String },
                    new CParameter() { ParameterName = "ESTACION_ACTU", Value = Data.ESTACION_ACTU, DbType = System.Data.DbType.String },
                    new CParameter() { ParameterName = "FECHA_ACTU", Value = Data.FECHA_ACTU, DbType = System.Data.DbType.DateTime },
                };

                var pWhere = new List<CParameter>
                {
                    new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
                    new CParameter() { ParameterName = "CORR_DESCRIPTOR_RESPONSABILIDAD", Value = Data.CORR_DESCRIPTOR_RESPONSABILIDAD, DbType = System.Data.DbType.Int32 },
                };

                var reader = await objData.Update(_TableName, p, pWhere);
                var response = new List<SC_DESCRIPTOR_PUESTO_RESPONSABILIDAD_CARGOView>().FromDataReader(reader).FirstOrDefault();

                reader.Close();
                reader = null;

                objResultado.Data = response;
                objResultado.Result = true;
                objResultado.RowsAffected = response == null ? 0 : 1;
                objResultado.CodeHelper = response?.CORR_DESCRIPTOR_RESPONSABILIDAD ?? Data.CORR_DESCRIPTOR_RESPONSABILIDAD;
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

        public async Task<CResult> DeleteAsync(SC_DESCRIPTOR_PUESTO_RESPONSABILIDAD_CARGOTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            CResult objResultado = new();

            try
            {
                var pWhere = new List<CParameter>
                {
                    new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
                    new CParameter() { ParameterName = "CORR_DESCRIPTOR_RESPONSABILIDAD", Value = Data.CORR_DESCRIPTOR_RESPONSABILIDAD, DbType = System.Data.DbType.Int32 },
                };

                await objData.Delete(_TableName, pWhere);

                objResultado.Data = null;
                objResultado.Result = true;
                objResultado.RowsAffected = 1;
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

        private static List<CParameter> BuildWriteParameters(SC_DESCRIPTOR_PUESTO_RESPONSABILIDAD_CARGOTable Data)
        {
            return new List<CParameter>
            {
                new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
                new CParameter() { ParameterName = "CORR_DESCRIPTOR_RESPONSABILIDAD", Value = Data.CORR_DESCRIPTOR_RESPONSABILIDAD, DbType = System.Data.DbType.Int32 },
                new CParameter() { ParameterName = "NOMBRE_RESPONSABILIDAD", Value = Data.NOMBRE_RESPONSABILIDAD, DbType = System.Data.DbType.String },
                new CParameter() { ParameterName = "INFORMACION", Value = Data.INFORMACION, DbType = System.Data.DbType.String },
                new CParameter() { ParameterName = "APLICA_DESCRIPTOR", Value = Data.APLICA_DESCRIPTOR, DbType = System.Data.DbType.String },
                new CParameter() { ParameterName = "CORR_DESCRIPTOR_PUESTO", Value = Data.CORR_DESCRIPTOR_PUESTO, DbType = System.Data.DbType.Int32 },
                new CParameter() { ParameterName = "CORR_RESPONSABILIDAD", Value = Data.CORR_RESPONSABILIDAD, DbType = System.Data.DbType.Int32 },
                new CParameter() { ParameterName = "USUARIO_CREA", Value = Data.USUARIO_CREA, DbType = System.Data.DbType.String },
                new CParameter() { ParameterName = "ESTACION_CREA", Value = Data.ESTACION_CREA, DbType = System.Data.DbType.String },
                new CParameter() { ParameterName = "FECHA_CREA", Value = Data.FECHA_CREA, DbType = System.Data.DbType.DateTime },
                new CParameter() { ParameterName = "USUARIO_ACTU", Value = Data.USUARIO_ACTU, DbType = System.Data.DbType.String },
                new CParameter() { ParameterName = "ESTACION_ACTU", Value = Data.ESTACION_ACTU, DbType = System.Data.DbType.String },
                new CParameter() { ParameterName = "FECHA_ACTU", Value = Data.FECHA_ACTU, DbType = System.Data.DbType.DateTime },
            };
        }
    }
}
