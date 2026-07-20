// Persistencia SQL del catálogo responsabilidad del cargo (tabla/vista SC).
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
    // Qué hace: ejecuta el CRUD y las consultas SQL sobre la tabla y la vista de responsabilidad del cargo.
    public class SC_RESPONSABILIDAD_CARGORepository : BaseRepository<SC_RESPONSABILIDAD_CARGOTable>, ISC_RESPONSABILIDAD_CARGORepository
    {
        private const string _TableName = "SC_RESPONSABILIDAD_CARGO";
        private const string _ViewName = "V_SC_RESPONSABILIDAD_CARGO";
        private const string _CampoPk = "CORR_RESPONSABILIDAD";
        private const string _CampoEstado = "ESTADO_RESPONSABILIDAD";
        private const bool _UsaEmpresa = true;

        public SC_RESPONSABILIDAD_CARGORepository(IConfiguration config) :
            base(config.GetConnectionString("defaultConnection"),
                config.GetSection("DbProvider:defaultProvider").Value)
        {
        }

        // Qué hace: lista las responsabilidades del cargo de la vista V_SC_RESPONSABILIDAD_CARGO.
        // Cómo: filtra por CORR_EMPRESA y ordena por CORR_RESPONSABILIDAD.
        public async Task<CResult> GetAllAsync(List<CParameter> xWhere)
        {
            CResult objResultado = new();

            try
            {
                var dbWhere = xWhere
                    .Where(x => x.ParameterName == "CORR_EMPRESA")
                    .ToList();

                var reader = await objData.GetDataReader(_ViewName, dbWhere);
                var response = new List<SC_RESPONSABILIDAD_CARGOView>().FromDataReader(reader)
                    .OrderBy(x => x.CORR_RESPONSABILIDAD)
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

        // Qué hace: obtiene una responsabilidad del cargo de la vista V_SC_RESPONSABILIDAD_CARGO.
        // Cómo: lee con los filtros recibidos en xWhere (empresa e id).
        public async Task<CResult> GetAsync(List<CParameter> xWhere)
        {
            CResult objResultado = new();

            try
            {
                var reader = await objData.GetDataReader(_ViewName, xWhere);
                var response = new List<SC_RESPONSABILIDAD_CARGOView>().FromDataReader(reader).FirstOrDefault();

                reader.Close();
                reader = null;

                objResultado.Data = response;
                objResultado.Result = true;
                objResultado.RowsAffected = response == null ? 0 : 1;
                objResultado.CodeHelper = response?.CORR_RESPONSABILIDAD ?? 0;
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

        // Qué hace: inserta una responsabilidad del cargo nueva.
        // Cómo: llama a Insert sobre SC_RESPONSABILIDAD_CARGO y devuelve el registro creado leído desde la vista; controla claves duplicadas.
        public async Task<CResult> CreateAsync(SC_RESPONSABILIDAD_CARGOTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            CResult objResultado = new();

            try
            {
                var p = new List<CParameter>
                {
                    new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
                    new CParameter() { ParameterName = "CORR_RESPONSABILIDAD", Value = Data.CORR_RESPONSABILIDAD, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput },
                    new CParameter() { ParameterName = "NOMBRE_RESPONSABILIDAD", Value = Data.NOMBRE_RESPONSABILIDAD, DbType = System.Data.DbType.String },
                    new CParameter() { ParameterName = "ESTADO_RESPONSABILIDAD", Value = Data.ESTADO_RESPONSABILIDAD ?? true, DbType = System.Data.DbType.Boolean },
                    new CParameter() { ParameterName = "APLICA_DESCRIPTOR", Value = Data.APLICA_DESCRIPTOR, DbType = System.Data.DbType.String },
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

                var reader = await objData.Insert(_TableName, p, _CampoPk, pWhere);
                var response = new List<SC_RESPONSABILIDAD_CARGOView>().FromDataReader(reader).FirstOrDefault();

                reader.Close();
                reader = null;

                objResultado.Data = response;
                objResultado.Result = true;
                objResultado.RowsAffected = 1;
                objResultado.CodeHelper = response?.CORR_RESPONSABILIDAD ?? 0;
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

        // Qué hace: actualiza una responsabilidad del cargo existente.
        // Cómo: llama a Update sobre SC_RESPONSABILIDAD_CARGO por CORR_EMPRESA y CORR_RESPONSABILIDAD; controla claves duplicadas.
        public async Task<CResult> UpdateAsync(SC_RESPONSABILIDAD_CARGOTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            CResult objResultado = new();

            try
            {
                var p = new List<CParameter>
                {
                    new CParameter() { ParameterName = "NOMBRE_RESPONSABILIDAD", Value = Data.NOMBRE_RESPONSABILIDAD, DbType = System.Data.DbType.String },
                    new CParameter() { ParameterName = "APLICA_DESCRIPTOR", Value = Data.APLICA_DESCRIPTOR, DbType = System.Data.DbType.String },
                    new CParameter() { ParameterName = "USUARIO_ACTU", Value = Data.USUARIO_ACTU, DbType = System.Data.DbType.String },
                    new CParameter() { ParameterName = "ESTACION_ACTU", Value = Data.ESTACION_ACTU, DbType = System.Data.DbType.String },
                    new CParameter() { ParameterName = "FECHA_ACTU", Value = Data.FECHA_ACTU, DbType = System.Data.DbType.DateTime },
                };

                var pWhere = new List<CParameter>
                {
                    new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
                    new CParameter() { ParameterName = "CORR_RESPONSABILIDAD", Value = Data.CORR_RESPONSABILIDAD, DbType = System.Data.DbType.Int32 },
                };

                var reader = await objData.Update(_TableName, p, pWhere);
                var response = new List<SC_RESPONSABILIDAD_CARGOView>().FromDataReader(reader).FirstOrDefault();

                reader.Close();
                reader = null;

                objResultado.Data = response;
                objResultado.Result = true;
                objResultado.RowsAffected = response == null ? 0 : 1;
                objResultado.CodeHelper = response?.CORR_RESPONSABILIDAD ?? Data.CORR_RESPONSABILIDAD;
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

        // Qué hace: elimina una responsabilidad del cargo.
        // Cómo: llama a Delete sobre SC_RESPONSABILIDAD_CARGO por CORR_EMPRESA y CORR_RESPONSABILIDAD; informa si hay registros relacionados.
        public async Task<CResult> DeleteAsync(SC_RESPONSABILIDAD_CARGOTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            CResult objResultado = new();

            try
            {
                var pWhere = new List<CParameter>
                {
                    new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
                    new CParameter() { ParameterName = "CORR_RESPONSABILIDAD", Value = Data.CORR_RESPONSABILIDAD, DbType = System.Data.DbType.Int32 },
                };

                objResultado.RowsAffected = (int)await objData.Delete(_TableName, pWhere);
                objResultado.Data = null;
                objResultado.Result = true;
                objResultado.CodeHelper = Data.CORR_RESPONSABILIDAD;
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
                objResultado.ErrorMessage = "No se puede eliminar la responsabilidad de cargo porque tiene registros asociados en otras tablas.";
                objResultado.ErrorSource += $"[{e.Source}]";
            }
            finally
            {
                objData.objConnection.Close();
            }

            return objResultado;
        }

        // Qué hace: cambia el estado activo/inactivo de una responsabilidad del cargo.
        // Cómo: ejecuta el stored procedure PRAL_MTTO_CATALOGO_ESTADO_BIT y devuelve el registro actualizado leído desde la vista.
        public async Task<CResult> ActivarInactivarAsync(SC_RESPONSABILIDAD_CARGOTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            CResult objResultado = new();

            try
            {
                var p = new List<CParameter>
                {
                    new CParameter() { ParameterName = "NOMBRE_TABLA", Value = _TableName, DbType = System.Data.DbType.String },
                    new CParameter() { ParameterName = "CAMPO_PK", Value = _CampoPk, DbType = System.Data.DbType.String },
                    new CParameter() { ParameterName = "CAMPO_ESTADO", Value = _CampoEstado, DbType = System.Data.DbType.String },
                    new CParameter() { ParameterName = "USA_EMPRESA", Value = _UsaEmpresa, DbType = System.Data.DbType.Boolean },
                    new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
                    new CParameter() { ParameterName = "CORR_RELATIVO", Value = Data.CORR_RESPONSABILIDAD, DbType = System.Data.DbType.Int32 },
                    new CParameter() { ParameterName = "@SYS_LOGIN_USUARIO", Value = vLOGIN_SISTEMA, DbType = System.Data.DbType.String },
                    new CParameter() { ParameterName = "@SYS_ESTACION", Value = vESTACION ?? string.Empty, DbType = System.Data.DbType.String },
                    new CParameter() { ParameterName = "@SYS_FILAS_AFECTADAS", Value = 0, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput },
                    new CParameter() { ParameterName = "@SYS_NUMERO_ERROR", Value = 0, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput },
                    new CParameter() { ParameterName = "@SYS_MENSAJE_ERROR", Value = string.Empty, DbType = System.Data.DbType.String, Direction = System.Data.ParameterDirection.InputOutput, Size = 4000 },
                };

                await objData.ExecCmd(System.Data.CommandType.StoredProcedure, "PRAL_MTTO_CATALOGO_ESTADO_BIT", true, p);

                if ((int)objData.objCommand.Parameters["@SYS_NUMERO_ERROR"].Value == 0)
                {
                    var xWhere = new List<CParameter>
                    {
                        new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
                        new CParameter() { ParameterName = "CORR_RESPONSABILIDAD", Value = Data.CORR_RESPONSABILIDAD, DbType = System.Data.DbType.Int32 },
                    };

                    var readerGet = await objData.GetDataReader(_ViewName, xWhere);
                    var response = new List<SC_RESPONSABILIDAD_CARGOView>().FromDataReader(readerGet).FirstOrDefault();

                    readerGet.Close();

                    objResultado.Data = response;
                    objResultado.Result = true;
                    objResultado.RowsAffected = 1;
                    objResultado.CodeHelper = response?.CORR_RESPONSABILIDAD ?? Data.CORR_RESPONSABILIDAD;
                    objResultado.ErrorCode = 0;
                    objResultado.ErrorMessage = string.Empty;
                    objResultado.ErrorSource = string.Empty;
                }
                else
                {
                    objResultado.Data = null;
                    objResultado.Result = false;
                    objResultado.RowsAffected = 0;
                    objResultado.CodeHelper = Data.CORR_RESPONSABILIDAD;
                    objResultado.ErrorCode = (int)objData.objCommand.Parameters["@SYS_NUMERO_ERROR"].Value;
                    objResultado.ErrorMessage = (string)objData.objCommand.Parameters["@SYS_MENSAJE_ERROR"].Value;
                    objResultado.ErrorSource = "C" + _TableName + ".Mtto(" + UpdateType.Update.ToString() + ")";
                }
            }
            catch (Exception e)
            {
                objResultado.Data = null;
                objResultado.Result = false;
                objResultado.CodeHelper = Data.CORR_RESPONSABILIDAD;
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

        // Qué hace: recupera las responsabilidades del cargo activas para el lookup del descriptor.
        // Cómo: SELECT directo a la vista filtrando por empresa y ESTADO_RESPONSABILIDAD, ordenado por nombre.
        public async Task<List<SC_RESPONSABILIDAD_CARGOView>> GetCatalogoDescriptorAsync(int corrEmpresa)
        {
            if (corrEmpresa <= 0)
            {
                return new List<SC_RESPONSABILIDAD_CARGOView>();
            }

            const string sql = @"SELECT
                  A.CORR_EMPRESA,
                  A.CORR_RESPONSABILIDAD,
                  A.NOMBRE_RESPONSABILIDAD,
                  A.ESTADO_RESPONSABILIDAD,
                  A.APLICA_DESCRIPTOR,
                  A.USUARIO_CREA,
                  A.ESTACION_CREA,
                  A.FECHA_CREA,
                  A.USUARIO_ACTU,
                  A.ESTACION_ACTU,
                  A.FECHA_ACTU
                FROM V_SC_RESPONSABILIDAD_CARGO A
                WHERE A.CORR_EMPRESA = @CORR_EMPRESA
                  AND ISNULL(A.ESTADO_RESPONSABILIDAD, 1) = 1
                ORDER BY A.NOMBRE_RESPONSABILIDAD, A.CORR_RESPONSABILIDAD";

            try
            {
                var reader = await objData.GetDataReader(System.Data.CommandType.Text, sql, new List<CParameter>
                {
                    new CParameter() { ParameterName = "CORR_EMPRESA", Value = corrEmpresa, DbType = System.Data.DbType.Int32 },
                });

                var response = new List<SC_RESPONSABILIDAD_CARGOView>().FromDataReader(reader).ToList();
                reader.Close();
                return response;
            }
            finally
            {
                objData.objConnection.Close();
            }
        }

        // Qué hace: comprueba si otra responsabilidad del cargo utiliza el mismo nombre.
        // Cómo: SELECT TOP 1 sobre la vista comparando nombre normalizado y excluyendo el correlativo indicado.
        public async Task<bool> ExistsNombreAsync(int corrEmpresa, string nombre, int excludeCorr)
        {
            if (corrEmpresa <= 0 || string.IsNullOrWhiteSpace(nombre))
            {
                return false;
            }

            const string sql = @"SELECT TOP 1 1 AS FOUND
                FROM V_SC_RESPONSABILIDAD_CARGO
                WHERE CORR_EMPRESA = @CORR_EMPRESA
                AND UPPER(LTRIM(RTRIM(NOMBRE_RESPONSABILIDAD))) = UPPER(LTRIM(RTRIM(@NOMBRE)))
                AND (@EXCLUDE_CORR <= 0 OR CORR_RESPONSABILIDAD <> @EXCLUDE_CORR)";

            try
            {
                var reader = await objData.GetDataReader(System.Data.CommandType.Text, sql, new List<CParameter>
                {
                    new CParameter() { ParameterName = "CORR_EMPRESA", Value = corrEmpresa, DbType = System.Data.DbType.Int32 },
                    new CParameter() { ParameterName = "NOMBRE", Value = nombre.Trim(), DbType = System.Data.DbType.String },
                    new CParameter() { ParameterName = "EXCLUDE_CORR", Value = excludeCorr, DbType = System.Data.DbType.Int32 },
                });

                var exists = reader.Read();
                reader.Close();
                return exists;
            }
            finally
            {
                objData.objConnection.Close();
            }
        }

        // Qué hace: detecta errores de clave duplicada de SQL Server.
        private static bool IsDuplicateKeyError(Exception e)
        {
            return e.Message.Contains("duplicate key", StringComparison.OrdinalIgnoreCase) ||
                e.Message.Contains("PRIMARY KEY", StringComparison.OrdinalIgnoreCase) ||
                e.Message.Contains("UNIQUE KEY", StringComparison.OrdinalIgnoreCase);
        }
    }
}

