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
    public class SC_COMPETENCIAS_TECNICASRepository : BaseRepository<SC_COMPETENCIAS_TECNICASTable>, ISC_COMPETENCIAS_TECNICASRepository
    {
        private const string _TableName = "SC_COMPETENCIAS_TECNICAS";

        public SC_COMPETENCIAS_TECNICASRepository(IConfiguration config) :
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
                    .Where(x => x.ParameterName == "CORR_EMPRESA")
                    .ToList();

                var estado = xWhere
                    .Where(x => x.ParameterName == "ESTADO_COMPETENCIAS_TECNICAS")
                    .Select(x => x.Value as bool?)
                    .FirstOrDefault();

                var busqueda = xWhere
                    .Where(x => x.ParameterName == "BUSQUEDA")
                    .Select(x => x.Value?.ToString())
                    .FirstOrDefault();

                var nivel = xWhere
                    .Where(x => x.ParameterName == "NIVEL")
                    .Select(x => x.Value?.ToString())
                    .FirstOrDefault();

                var nivelPadre = xWhere
                    .Where(x => x.ParameterName == "NIVEL_PADRE")
                    .Select(x => x.Value?.ToString())
                    .FirstOrDefault();

                var corrPadre = xWhere
                    .Where(x => x.ParameterName == "CORR_COMPETENCIAS_TECNICAS_PADRE")
                    .Select(x => x.Value as int?)
                    .FirstOrDefault();

                var columnFilters = new Dictionary<string, string>
                {
                    { "CORR_COMPETENCIAS_TECNICAS", GetFilterValue(xWhere, "CORR_COMPETENCIAS_TECNICAS") },
                    { "CODIGO_COMPETENCIAS_TECNICAS", GetFilterValue(xWhere, "CODIGO_COMPETENCIAS_TECNICAS") },
                    { "NOMBRE_COMPETENCIAS_TECNICAS", GetFilterValue(xWhere, "NOMBRE_COMPETENCIAS_TECNICAS") },
                    { "DESCRIPCION", GetFilterValue(xWhere, "DESCRIPCION") },
                    { "NIVEL", GetFilterValue(xWhere, "NIVEL") },
                    { "CODIGO_PADRE", GetFilterValue(xWhere, "CODIGO_PADRE") },
                    { "USUARIO_CREA", GetFilterValue(xWhere, "USUARIO_CREA") },
                    { "ESTACION_CREA", GetFilterValue(xWhere, "ESTACION_CREA") },
                    { "FECHA_CREA", GetFilterValue(xWhere, "FECHA_CREA") },
                    { "USUARIO_ACTU", GetFilterValue(xWhere, "USUARIO_ACTU") },
                    { "ESTACION_ACTU", GetFilterValue(xWhere, "ESTACION_ACTU") },
                    { "FECHA_ACTU", GetFilterValue(xWhere, "FECHA_ACTU") },
                }
                    .Where(x => !string.IsNullOrWhiteSpace(x.Value))
                    .ToList();

                var page = xWhere
                    .Where(x => x.ParameterName == "PAGE")
                    .Select(x => Convert.ToInt32(x.Value ?? 1))
                    .FirstOrDefault();

                var pageSize = xWhere
                    .Where(x => x.ParameterName == "PAGE_SIZE")
                    .Select(x => Convert.ToInt32(x.Value ?? 10))
                    .FirstOrDefault();

                page = page < 1 ? 1 : page;
                pageSize = pageSize < 1 ? 10 : Math.Min(pageSize, 100);

                var reader = await objData.GetDataReader("V_" + _TableName, dbWhere);
                var response = new List<SC_COMPETENCIAS_TECNICASView>().FromDataReader(reader).ToList();

                reader.Close();
                reader = null;

                if (estado.HasValue)
                {
                    response = response
                        .Where(x => (x.ESTADO_COMPETENCIAS_TECNICAS ?? false) == estado.Value)
                        .ToList();
                }

                if (!string.IsNullOrWhiteSpace(nivel))
                {
                    response = response
                        .Where(x => string.Equals(x.NIVEL, nivel.Trim(), StringComparison.OrdinalIgnoreCase))
                        .ToList();
                }

                if (!string.IsNullOrWhiteSpace(nivelPadre))
                {
                    response = response
                        .Where(x => string.Equals(x.NIVEL_PADRE, nivelPadre.Trim(), StringComparison.OrdinalIgnoreCase))
                        .ToList();
                }

                if (corrPadre.HasValue && corrPadre.Value > 0)
                {
                    response = response
                        .Where(x => x.CORR_COMPETENCIAS_TECNICAS_PADRE == corrPadre.Value)
                        .ToList();
                }

                if (!string.IsNullOrWhiteSpace(busqueda))
                {
                    var search = busqueda.Trim();
                    response = response
                        .Where(x =>
                            Contains(x.CORR_EMPRESA.ToString(), search) ||
                            Contains(x.CORR_COMPETENCIAS_TECNICAS.ToString(), search) ||
                            Contains(x.CORR_COMPETENCIAS_TECNICAS_PADRE?.ToString(), search) ||
                            Contains(x.CODIGO_COMPETENCIAS_TECNICAS, search) ||
                            Contains(x.NOMBRE_COMPETENCIAS_TECNICAS, search) ||
                            Contains(x.DESCRIPCION, search) ||
                            Contains(x.NIVEL, search) ||
                            Contains(x.CODIGO_PADRE, search) ||
                            Contains(x.NOMBRE_PADRE, search) ||
                            Contains(x.NIVEL_PADRE, search) ||
                            Contains((x.ESTADO_COMPETENCIAS_TECNICAS ?? false) ? "Activo" : "Inactivo", search) ||
                            Contains(x.USUARIO_CREA, search) ||
                            Contains(x.ESTACION_CREA, search) ||
                            Contains(x.FECHA_CREA?.ToString("dd/MM/yyyy HH:mm"), search) ||
                            Contains(x.USUARIO_ACTU, search) ||
                            Contains(x.ESTACION_ACTU, search) ||
                            Contains(x.FECHA_ACTU?.ToString("dd/MM/yyyy HH:mm"), search))
                        .ToList();
                }

                foreach (var columnFilter in columnFilters)
                {
                    response = response
                        .Where(x => Contains(GetColumnValue(x, columnFilter.Key), columnFilter.Value))
                        .ToList();
                }

                response = response
                    .OrderBy(x => x.CODIGO_COMPETENCIAS_TECNICAS)
                    .ThenBy(x => x.CORR_COMPETENCIAS_TECNICAS)
                    .ToList();

                var totalRows = response.Count;
                var pageData = response
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .ToList();

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
            return xWhere
                .Where(x => x.ParameterName == parameterName)
                .Select(x => x.Value?.ToString())
                .FirstOrDefault();
        }

        private static string GetColumnValue(SC_COMPETENCIAS_TECNICASView row, string columnName)
        {
            switch (columnName)
            {
                case "CORR_COMPETENCIAS_TECNICAS":
                    return row.CORR_COMPETENCIAS_TECNICAS.ToString();
                case "CORR_COMPETENCIAS_TECNICAS_PADRE":
                    return row.CORR_COMPETENCIAS_TECNICAS_PADRE?.ToString();
                case "CODIGO_COMPETENCIAS_TECNICAS":
                    return row.CODIGO_COMPETENCIAS_TECNICAS;
                case "NOMBRE_COMPETENCIAS_TECNICAS":
                    return row.NOMBRE_COMPETENCIAS_TECNICAS;
                case "DESCRIPCION":
                    return row.DESCRIPCION;
                case "NIVEL":
                    return row.NIVEL;
                case "ESTADO_COMPETENCIAS_TECNICAS":
                    return (row.ESTADO_COMPETENCIAS_TECNICAS ?? false) ? "Activo" : "Inactivo";
                case "CODIGO_PADRE":
                    return row.CODIGO_PADRE;
                case "NOMBRE_PADRE":
                    return row.NOMBRE_PADRE;
                case "NIVEL_PADRE":
                    return row.NIVEL_PADRE;
                case "USUARIO_CREA":
                    return row.USUARIO_CREA;
                case "ESTACION_CREA":
                    return row.ESTACION_CREA;
                case "FECHA_CREA":
                    return row.FECHA_CREA?.ToString("dd/MM/yyyy HH:mm");
                case "USUARIO_ACTU":
                    return row.USUARIO_ACTU;
                case "ESTACION_ACTU":
                    return row.ESTACION_ACTU;
                case "FECHA_ACTU":
                    return row.FECHA_ACTU?.ToString("dd/MM/yyyy HH:mm");
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
                var response = new List<SC_COMPETENCIAS_TECNICASView>().FromDataReader(reader).FirstOrDefault();

                reader.Close();
                reader = null;

                objResultado.Data = response;
                objResultado.Result = true;
                objResultado.RowsAffected = response == null ? 0 : 1;
                objResultado.CodeHelper = response?.CORR_COMPETENCIAS_TECNICAS ?? 0;
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

        public async Task<CResult> CreateAsync(SC_COMPETENCIAS_TECNICASTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            CResult objResultado = new();

            try
            {
                var p = new List<CParameter>
                {
                    new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
                    new CParameter() { ParameterName = "CORR_COMPETENCIAS_TECNICAS", Value = Data.CORR_COMPETENCIAS_TECNICAS, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput },
                    new CParameter() { ParameterName = "CORR_COMPETENCIAS_TECNICAS_PADRE", Value = Data.CORR_COMPETENCIAS_TECNICAS_PADRE, DbType = System.Data.DbType.Int32 },
                    new CParameter() { ParameterName = "CODIGO_COMPETENCIAS_TECNICAS", Value = Data.CODIGO_COMPETENCIAS_TECNICAS, DbType = System.Data.DbType.String },
                    new CParameter() { ParameterName = "NOMBRE_COMPETENCIAS_TECNICAS", Value = Data.NOMBRE_COMPETENCIAS_TECNICAS, DbType = System.Data.DbType.String },
                    new CParameter() { ParameterName = "DESCRIPCION", Value = Data.DESCRIPCION, DbType = System.Data.DbType.String },
                    new CParameter() { ParameterName = "NIVEL", Value = Data.NIVEL, DbType = System.Data.DbType.String },
                    new CParameter() { ParameterName = "ESTADO_COMPETENCIAS_TECNICAS", Value = Data.ESTADO_COMPETENCIAS_TECNICAS ?? true, DbType = System.Data.DbType.Boolean },
                    new CParameter() { ParameterName = "USUARIO_CREA", Value = Data.USUARIO_CREA, DbType = System.Data.DbType.String },
                    new CParameter() { ParameterName = "ESTACION_CREA", Value = Data.ESTACION_CREA, DbType = System.Data.DbType.String },
                    new CParameter() { ParameterName = "FECHA_CREA", Value = Data.FECHA_CREA, DbType = System.Data.DbType.DateTime },
                    new CParameter() { ParameterName = "USUARIO_ACTU", Value = Data.USUARIO_ACTU, DbType = System.Data.DbType.String },
                    new CParameter() { ParameterName = "ESTACION_ACTU", Value = Data.ESTACION_ACTU, DbType = System.Data.DbType.String },
                    new CParameter() { ParameterName = "FECHA_ACTU", Value = Data.FECHA_ACTU, DbType = System.Data.DbType.DateTime },
                };

                var pWhere = new List<CParameter>
                {
                    new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
                };

                var reader = await objData.Insert(_TableName, p, "CORR_COMPETENCIAS_TECNICAS", pWhere);
                var response = new List<SC_COMPETENCIAS_TECNICASView>().FromDataReader(reader).FirstOrDefault();

                reader.Close();
                reader = null;

                objResultado.Data = response;
                objResultado.Result = true;
                objResultado.RowsAffected = 1;
                objResultado.CodeHelper = response?.CORR_COMPETENCIAS_TECNICAS ?? 0;
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

        public async Task<CResult> UpdateAsync(SC_COMPETENCIAS_TECNICASTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            CResult objResultado = new();

            try
            {
                var p = new List<CParameter>
                {
                    new CParameter() { ParameterName = "CORR_COMPETENCIAS_TECNICAS_PADRE", Value = Data.CORR_COMPETENCIAS_TECNICAS_PADRE, DbType = System.Data.DbType.Int32 },
                    new CParameter() { ParameterName = "CODIGO_COMPETENCIAS_TECNICAS", Value = Data.CODIGO_COMPETENCIAS_TECNICAS, DbType = System.Data.DbType.String },
                    new CParameter() { ParameterName = "NOMBRE_COMPETENCIAS_TECNICAS", Value = Data.NOMBRE_COMPETENCIAS_TECNICAS, DbType = System.Data.DbType.String },
                    new CParameter() { ParameterName = "DESCRIPCION", Value = Data.DESCRIPCION, DbType = System.Data.DbType.String },
                    new CParameter() { ParameterName = "NIVEL", Value = Data.NIVEL, DbType = System.Data.DbType.String },
                    new CParameter() { ParameterName = "ESTADO_COMPETENCIAS_TECNICAS", Value = Data.ESTADO_COMPETENCIAS_TECNICAS ?? true, DbType = System.Data.DbType.Boolean },
                    new CParameter() { ParameterName = "USUARIO_ACTU", Value = Data.USUARIO_ACTU, DbType = System.Data.DbType.String },
                    new CParameter() { ParameterName = "ESTACION_ACTU", Value = Data.ESTACION_ACTU, DbType = System.Data.DbType.String },
                    new CParameter() { ParameterName = "FECHA_ACTU", Value = Data.FECHA_ACTU, DbType = System.Data.DbType.DateTime },
                };

                var pWhere = new List<CParameter>
                {
                    new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
                    new CParameter() { ParameterName = "CORR_COMPETENCIAS_TECNICAS", Value = Data.CORR_COMPETENCIAS_TECNICAS, DbType = System.Data.DbType.Int32 },
                };

                var reader = await objData.Update(_TableName, p, pWhere);
                var response = new List<SC_COMPETENCIAS_TECNICASView>().FromDataReader(reader).FirstOrDefault();

                reader.Close();
                reader = null;

                objResultado.Data = response;
                objResultado.Result = true;
                objResultado.RowsAffected = response == null ? 0 : 1;
                objResultado.CodeHelper = response?.CORR_COMPETENCIAS_TECNICAS ?? Data.CORR_COMPETENCIAS_TECNICAS;
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

        public async Task<CResult> DeleteAsync(SC_COMPETENCIAS_TECNICASTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            CResult objResultado = new();

            try
            {
                var pWhere = new List<CParameter>
                {
                    new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
                    new CParameter() { ParameterName = "CORR_COMPETENCIAS_TECNICAS", Value = Data.CORR_COMPETENCIAS_TECNICAS, DbType = System.Data.DbType.Int32 },
                };

                objResultado.RowsAffected = (int)await objData.Delete(_TableName, pWhere);
                objResultado.Data = null;
                objResultado.Result = true;
                objResultado.CodeHelper = Data.CORR_COMPETENCIAS_TECNICAS;
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
                objResultado.ErrorMessage = "No se puede eliminar la competencia porque tiene registros asociados en otras tablas.";
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
            return !string.IsNullOrWhiteSpace(value) &&
                value.Contains(search, StringComparison.OrdinalIgnoreCase);
        }

        private static bool IsDuplicateKeyError(Exception e)
        {
            return e.Message.Contains("duplicate key", StringComparison.OrdinalIgnoreCase) ||
                e.Message.Contains("PRIMARY KEY", StringComparison.OrdinalIgnoreCase) ||
                e.Message.Contains("UNIQUE KEY", StringComparison.OrdinalIgnoreCase);
        }
    }
}
