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
    public class PLA_TIPO_PUESTORepository : BaseRepository<PLA_TIPO_PUESTOTable>, IPLA_TIPO_PUESTORepository
    {
        private const string _TableName = "PLA_TIPO_PUESTO";

        public PLA_TIPO_PUESTORepository(IConfiguration config) :
            base(config.GetConnectionString("defaultConnection"),
                config.GetSection("DbProvider:defaultProvider").Value)
        {
        }

        public async Task<CResult> GetAllAsync(List<CParameter> xWhere)
        {
            CResult objResultado = new();

            try
            {
                var dbWhere = xWhere.Where(x => x.ParameterName == "CORR_EMPRESA").ToList();
                var estado = xWhere.Where(x => x.ParameterName == "ESTADO_TIPO_PUESTO").Select(x => x.Value as bool?).FirstOrDefault();
                var busqueda = xWhere.Where(x => x.ParameterName == "BUSQUEDA").Select(x => x.Value?.ToString()).FirstOrDefault();
                var columnFilters = new Dictionary<string, string>
                {
                    { "CORR_TIPO_PUESTO", GetFilterValue(xWhere, "CORR_TIPO_PUESTO") },
                    { "NOMBRE_TIPO_PUESTO", GetFilterValue(xWhere, "NOMBRE_TIPO_PUESTO") },
                    { "USUARIO_CREA", GetFilterValue(xWhere, "USUARIO_CREA") },
                    { "FECHA_CREA", GetFilterValue(xWhere, "FECHA_CREA") },
                    { "ESTACION_CREA", GetFilterValue(xWhere, "ESTACION_CREA") },
                    { "USUARIO_ACTU", GetFilterValue(xWhere, "USUARIO_ACTU") },
                    { "FECHA_ACTU", GetFilterValue(xWhere, "FECHA_ACTU") },
                    { "ESTACION_ACTU", GetFilterValue(xWhere, "ESTACION_ACTU") },
                }.Where(x => !string.IsNullOrWhiteSpace(x.Value)).ToList();

                var page = xWhere.Where(x => x.ParameterName == "PAGE").Select(x => Convert.ToInt32(x.Value ?? 1)).FirstOrDefault();
                var pageSize = xWhere.Where(x => x.ParameterName == "PAGE_SIZE").Select(x => Convert.ToInt32(x.Value ?? 10)).FirstOrDefault();
                page = page < 1 ? 1 : page;
                pageSize = pageSize < 1 ? 10 : Math.Min(pageSize, 100);

                var reader = await objData.GetDataReader("V_" + _TableName, dbWhere);
                var response = new List<PLA_TIPO_PUESTOView>().FromDataReader(reader).ToList();
                reader.Close();
                reader = null;

                if (estado.HasValue)
                {
                    response = response.Where(x => (x.ESTADO_TIPO_PUESTO ?? false) == estado.Value).ToList();
                }

                if (!string.IsNullOrWhiteSpace(busqueda))
                {
                    var search = busqueda.Trim();
                    response = response.Where(x =>
                        Contains(x.CORR_EMPRESA.ToString(), search) ||
                        Contains(x.CORR_TIPO_PUESTO.ToString(), search) ||
                        Contains(x.NOMBRE_TIPO_PUESTO, search) ||
                        Contains((x.ESTADO_TIPO_PUESTO ?? false) ? "Activo" : "Inactivo", search) ||
                        Contains(x.USUARIO_CREA, search) ||
                        Contains(x.FECHA_CREA?.ToString("dd/MM/yyyy HH:mm"), search) ||
                        Contains(x.ESTACION_CREA, search) ||
                        Contains(x.USUARIO_ACTU, search) ||
                        Contains(x.FECHA_ACTU?.ToString("dd/MM/yyyy HH:mm"), search) ||
                        Contains(x.ESTACION_ACTU, search)).ToList();
                }

                foreach (var columnFilter in columnFilters)
                {
                    response = response.Where(x => Contains(GetColumnValue(x, columnFilter.Key), columnFilter.Value)).ToList();
                }

                response = response.OrderBy(x => x.CORR_EMPRESA).ThenBy(x => x.CORR_TIPO_PUESTO).ToList();
                var totalRows = response.Count;
                var pageData = response.Skip((page - 1) * pageSize).Take(pageSize).ToList();

                objResultado.Data = pageData;
                objResultado.Result = true;
                objResultado.RowsAffected = totalRows;
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

        private static string GetFilterValue(List<CParameter> xWhere, string parameterName)
        {
            return xWhere.Where(x => x.ParameterName == parameterName).Select(x => x.Value?.ToString()).FirstOrDefault();
        }

        private static string GetColumnValue(PLA_TIPO_PUESTOView row, string columnName)
        {
            switch (columnName)
            {
                case "CORR_TIPO_PUESTO":
                    return row.CORR_TIPO_PUESTO.ToString();
                case "NOMBRE_TIPO_PUESTO":
                    return row.NOMBRE_TIPO_PUESTO;
                case "USUARIO_CREA":
                    return row.USUARIO_CREA;
                case "FECHA_CREA":
                    return row.FECHA_CREA?.ToString("dd/MM/yyyy HH:mm");
                case "ESTACION_CREA":
                    return row.ESTACION_CREA;
                case "USUARIO_ACTU":
                    return row.USUARIO_ACTU;
                case "FECHA_ACTU":
                    return row.FECHA_ACTU?.ToString("dd/MM/yyyy HH:mm");
                case "ESTACION_ACTU":
                    return row.ESTACION_ACTU;
                default:
                    return null;
            }
        }

        public async Task<CResult> GetAsync(List<CParameter> xWhere)
        {
            CResult objResultado = new();

            try
            {
                var reader = await objData.GetDataReader("V_" + _TableName, xWhere);
                var response = new List<PLA_TIPO_PUESTOView>().FromDataReader(reader).FirstOrDefault();
                reader.Close();
                reader = null;

                objResultado.Data = response;
                objResultado.Result = true;
                objResultado.RowsAffected = response == null ? 0 : 1;
                objResultado.CodeHelper = response?.CORR_TIPO_PUESTO ?? 0;
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

        public async Task<CResult> CreateAsync(PLA_TIPO_PUESTOTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            CResult objResultado = new();

            try
            {
                var p = new List<CParameter>
                {
                    new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
                    new CParameter() { ParameterName = "CORR_TIPO_PUESTO", Value = Data.CORR_TIPO_PUESTO, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput },
                    new CParameter() { ParameterName = "NOMBRE_TIPO_PUESTO", Value = Data.NOMBRE_TIPO_PUESTO, DbType = System.Data.DbType.String },
                    new CParameter() { ParameterName = "ESTADO_TIPO_PUESTO", Value = Data.ESTADO_TIPO_PUESTO ?? true, DbType = System.Data.DbType.Boolean },
                    new CParameter() { ParameterName = "USUARIO_CREA", Value = Data.USUARIO_CREA, DbType = System.Data.DbType.String },
                    new CParameter() { ParameterName = "FECHA_CREA", Value = Data.FECHA_CREA, DbType = System.Data.DbType.DateTime },
                    new CParameter() { ParameterName = "ESTACION_CREA", Value = Data.ESTACION_CREA, DbType = System.Data.DbType.String },
                    new CParameter() { ParameterName = "USUARIO_ACTU", Value = Data.USUARIO_ACTU, DbType = System.Data.DbType.String },
                    new CParameter() { ParameterName = "FECHA_ACTU", Value = Data.FECHA_ACTU, DbType = System.Data.DbType.DateTime },
                    new CParameter() { ParameterName = "ESTACION_ACTU", Value = Data.ESTACION_ACTU, DbType = System.Data.DbType.String },
                };

                var pWhere = new List<CParameter>
                {
                    new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
                };

                var reader = await objData.Insert(_TableName, p, "CORR_TIPO_PUESTO", pWhere);
                var response = new List<PLA_TIPO_PUESTOView>().FromDataReader(reader).FirstOrDefault();
                reader.Close();
                reader = null;

                objResultado.Data = response;
                objResultado.Result = true;
                objResultado.RowsAffected = 1;
                objResultado.CodeHelper = response?.CORR_TIPO_PUESTO ?? 0;
                objResultado.ErrorCode = 0;
                objResultado.ErrorMessage = "";
                objResultado.ErrorSource = "";
            }
            catch (Exception e)
            {
                var duplicateKey = IsDuplicateKeyError(e);
                objResultado.Data = null;
                objResultado.Result = false;
                objResultado.CodeHelper = 0;
                objResultado.ErrorCode = duplicateKey ? 2627 : -1;
                objResultado.ErrorMessage = duplicateKey
                    ? "No se pudo guardar el registro porque otro usuario guardo un registro al mismo tiempo. Intente nuevamente."
                    : e.Message;
                objResultado.ErrorSource += $"[{e.Source}]";
            }
            finally
            {
                objData.objConnection.Close();
            }

            return objResultado;
        }

        public async Task<CResult> UpdateAsync(PLA_TIPO_PUESTOTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            CResult objResultado = new();

            try
            {
                var p = new List<CParameter>
                {
                    new CParameter() { ParameterName = "NOMBRE_TIPO_PUESTO", Value = Data.NOMBRE_TIPO_PUESTO, DbType = System.Data.DbType.String },
                    new CParameter() { ParameterName = "ESTADO_TIPO_PUESTO", Value = Data.ESTADO_TIPO_PUESTO ?? true, DbType = System.Data.DbType.Boolean },
                    new CParameter() { ParameterName = "USUARIO_ACTU", Value = Data.USUARIO_ACTU, DbType = System.Data.DbType.String },
                    new CParameter() { ParameterName = "FECHA_ACTU", Value = Data.FECHA_ACTU, DbType = System.Data.DbType.DateTime },
                    new CParameter() { ParameterName = "ESTACION_ACTU", Value = Data.ESTACION_ACTU, DbType = System.Data.DbType.String },
                };

                var pWhere = new List<CParameter>
                {
                    new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
                    new CParameter() { ParameterName = "CORR_TIPO_PUESTO", Value = Data.CORR_TIPO_PUESTO, DbType = System.Data.DbType.Int32 },
                };

                var reader = await objData.Update(_TableName, p, pWhere);
                var response = new List<PLA_TIPO_PUESTOView>().FromDataReader(reader).FirstOrDefault();
                reader.Close();
                reader = null;

                objResultado.Data = response;
                objResultado.Result = true;
                objResultado.RowsAffected = response == null ? 0 : 1;
                objResultado.CodeHelper = response?.CORR_TIPO_PUESTO ?? Data.CORR_TIPO_PUESTO;
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

        public async Task<CResult> DeleteAsync(PLA_TIPO_PUESTOTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            CResult objResultado = new();

            try
            {
                var pWhere = new List<CParameter>
                {
                    new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
                    new CParameter() { ParameterName = "CORR_TIPO_PUESTO", Value = Data.CORR_TIPO_PUESTO, DbType = System.Data.DbType.Int32 },
                };

                objResultado.RowsAffected = (int)await objData.Delete(_TableName, pWhere);
                objResultado.Data = null;
                objResultado.Result = true;
                objResultado.CodeHelper = Data.CORR_TIPO_PUESTO;
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
                objResultado.ErrorMessage = "No se puede eliminar el tipo de puesto porque tiene registros asociados.";
                objResultado.ErrorSource += $"[{e.Source}]";
            }
            finally
            {
                objData.objConnection.Close();
            }

            return objResultado;
        }

        private static bool Contains(string value, string search)
        {
            return !string.IsNullOrWhiteSpace(value) && value.Contains(search, StringComparison.OrdinalIgnoreCase);
        }

        private static bool IsDuplicateKeyError(Exception e)
        {
            return e.Message.Contains("duplicate key", StringComparison.OrdinalIgnoreCase) ||
                e.Message.Contains("PRIMARY KEY", StringComparison.OrdinalIgnoreCase) ||
                e.Message.Contains("UNIQUE KEY", StringComparison.OrdinalIgnoreCase);
        }
    }
}
