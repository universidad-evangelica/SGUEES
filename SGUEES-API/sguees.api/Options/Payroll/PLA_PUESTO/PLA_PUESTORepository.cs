// Qué hace: acceso a datos de PLA_PUESTO (catálogo de puestos).
// Cómo: lee V_PLA_PUESTO y escribe en PLA_PUESTO vía CData; ActivarInactivar usa PRAL_MTTO_CATALOGO_ESTADO_BIT.
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
    public class PLA_PUESTORepository : BaseRepository<PLA_PUESTOTable>, IPLA_PUESTORepository
    {
        private const string _TableName = "PLA_PUESTO";
        private const string _ViewName = "V_PLA_PUESTO";
        private const string _CampoPk = "CORR_PUESTO";
        private const string _CampoEstado = "ESTADO_PUESTO";
        private const bool _UsaEmpresa = true;

        public PLA_PUESTORepository(IConfiguration config) :
            base(config.GetConnectionString("defaultConnection"),
                config.GetSection("DbProvider:defaultProvider").Value)
        {
        }

        // Qué hace: lista los puestos de la empresa.
        // Cómo: lee V_PLA_PUESTO por CORR_EMPRESA, deduplica por CORR_PUESTO y ordena.
        public async Task<CResult> GetAllAsync(List<CParameter> xWhere)
        {
            CResult objResultado = new();

            try
            {
                var dbWhere = xWhere
                    .Where(x => x.ParameterName == "CORR_EMPRESA")
                    .ToList();

                var reader = await objData.GetDataReader(_ViewName, dbWhere);
                var response = new List<PLA_PUESTOView>().FromDataReader(reader)
                    .GroupBy(x => x.CORR_PUESTO)
                    .Select(g => g.First())
                    .OrderBy(x => x.CORR_PUESTO)
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

        // Qué hace: obtiene un puesto por filtros.
        // Cómo: lee V_PLA_PUESTO con xWhere y toma el primer registro.
        public async Task<CResult> GetAsync(List<CParameter> xWhere)
        {
            CResult objResultado = new();

            try
            {
                var reader = await objData.GetDataReader(_ViewName, xWhere);
                var response = new List<PLA_PUESTOView>().FromDataReader(reader).FirstOrDefault();
                reader.Close();
                reader = null;

                objResultado.Data = response;
                objResultado.Result = true;
                objResultado.RowsAffected = response == null ? 0 : 1;
                objResultado.CodeHelper = response?.CORR_PUESTO ?? 0;
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

        // Qué hace: inserta un puesto nuevo.
        // Cómo: Insert sobre PLA_PUESTO con CORR_PUESTO InputOutput y devuelve la fila desde la vista.
        public async Task<CResult> CreateAsync(PLA_PUESTOTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            CResult objResultado = new();

            try
            {
                var p = BuildWriteParameters(Data, includePkOutput: true);
                var pWhere = new List<CParameter>
                {
                    new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
                };

                var reader = await objData.Insert(_TableName, p, _CampoPk, pWhere);
                var response = new List<PLA_PUESTOView>().FromDataReader(reader).FirstOrDefault();
                reader.Close();
                reader = null;

                objResultado.Data = response;
                objResultado.Result = true;
                objResultado.RowsAffected = 1;
                objResultado.CodeHelper = response?.CORR_PUESTO ?? 0;
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

        // Qué hace: actualiza un puesto existente.
        // Cómo: Update sobre PLA_PUESTO por CORR_EMPRESA y CORR_PUESTO; no actualiza ESTADO (va por ActivarInactivar).
        public async Task<CResult> UpdateAsync(PLA_PUESTOTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            CResult objResultado = new();

            try
            {
                var p = new List<CParameter>
                {
                    new CParameter() { ParameterName = "NOMBRE_PUESTO", Value = Data.NOMBRE_PUESTO, DbType = System.Data.DbType.String },
                    new CParameter() { ParameterName = "CORR_GERENCIA", Value = Data.CORR_GERENCIA, DbType = System.Data.DbType.Int32 },
                    new CParameter() { ParameterName = "CORR_NIVEL_ACADEMICO", Value = Data.CORR_NIVEL_ACADEMICO, DbType = System.Data.DbType.Int32 },
                    new CParameter() { ParameterName = "CORR_TIPO_PUESTO", Value = Data.CORR_TIPO_PUESTO, DbType = System.Data.DbType.Int32 },
                    new CParameter() { ParameterName = "APROBACION_PUESTO", Value = Data.APROBACION_PUESTO ?? false, DbType = System.Data.DbType.Boolean },
                    new CParameter() { ParameterName = "SALARIO_INICIAL", Value = Data.SALARIO_INICIAL, DbType = System.Data.DbType.Decimal },
                    new CParameter() { ParameterName = "SALARIO_FINAL", Value = Data.SALARIO_FINAL, DbType = System.Data.DbType.Decimal },
                    new CParameter() { ParameterName = "USUARIO_VALIDA", Value = Data.USUARIO_VALIDA, DbType = System.Data.DbType.String },
                    new CParameter() { ParameterName = "USUARIO_AUTORIZA", Value = Data.USUARIO_AUTORIZA, DbType = System.Data.DbType.String },
                    new CParameter() { ParameterName = "MISION_PUESTO", Value = Data.MISION_PUESTO, DbType = System.Data.DbType.String },
                    new CParameter() { ParameterName = "OTROS_ASPECTOS", Value = Data.OTROS_ASPECTOS, DbType = System.Data.DbType.String },
                    new CParameter() { ParameterName = "CODIGO_PUESTO", Value = Data.CODIGO_PUESTO, DbType = System.Data.DbType.String },
                    new CParameter() { ParameterName = "CODIGO_FORMATO", Value = Data.CODIGO_FORMATO, DbType = System.Data.DbType.String },
                    new CParameter() { ParameterName = "VERSION_FORMATO", Value = Data.VERSION_FORMATO, DbType = System.Data.DbType.String },
                    new CParameter() { ParameterName = "USUARIO_ACTU", Value = Data.USUARIO_ACTU, DbType = System.Data.DbType.String },
                    new CParameter() { ParameterName = "FECHA_ACTU", Value = Data.FECHA_ACTU, DbType = System.Data.DbType.DateTime },
                    new CParameter() { ParameterName = "ESTACION_ACTU", Value = Data.ESTACION_ACTU, DbType = System.Data.DbType.String },
                };

                var pWhere = new List<CParameter>
                {
                    new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
                    new CParameter() { ParameterName = "CORR_PUESTO", Value = Data.CORR_PUESTO, DbType = System.Data.DbType.Int32 },
                };

                var reader = await objData.Update(_TableName, p, pWhere);
                var response = new List<PLA_PUESTOView>().FromDataReader(reader).FirstOrDefault();
                reader.Close();
                reader = null;

                objResultado.Data = response;
                objResultado.Result = true;
                objResultado.RowsAffected = response == null ? 0 : 1;
                objResultado.CodeHelper = response?.CORR_PUESTO ?? Data.CORR_PUESTO;
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

        // Qué hace: elimina un puesto.
        // Cómo: Delete sobre PLA_PUESTO por CORR_EMPRESA y CORR_PUESTO.
        public async Task<CResult> DeleteAsync(PLA_PUESTOTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            CResult objResultado = new();

            try
            {
                var pWhere = new List<CParameter>
                {
                    new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
                    new CParameter() { ParameterName = "CORR_PUESTO", Value = Data.CORR_PUESTO, DbType = System.Data.DbType.Int32 },
                };

                objResultado.RowsAffected = (int)await objData.Delete(_TableName, pWhere);
                objResultado.Data = null;
                objResultado.Result = true;
                objResultado.CodeHelper = Data.CORR_PUESTO;
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
                objResultado.ErrorMessage = "No se puede eliminar el puesto porque tiene registros asociados.";
                objResultado.ErrorSource += $"[{e.Source}]";
            }
            finally
            {
                objData.objConnection.Close();
            }

            return objResultado;
        }

        // Qué hace: cambia el estado activo/inactivo del puesto.
        // Cómo: ejecuta PRAL_MTTO_CATALOGO_ESTADO_BIT y recarga desde V_PLA_PUESTO.
        public async Task<CResult> ActivarInactivarAsync(PLA_PUESTOTable Data, string vLOGIN_SISTEMA, string vESTACION)
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
                    new CParameter() { ParameterName = "CORR_RELATIVO", Value = Data.CORR_PUESTO, DbType = System.Data.DbType.Int32 },
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
                        new CParameter() { ParameterName = "CORR_PUESTO", Value = Data.CORR_PUESTO, DbType = System.Data.DbType.Int32 },
                    };

                    var readerGet = await objData.GetDataReader(_ViewName, xWhere);
                    var response = new List<PLA_PUESTOView>().FromDataReader(readerGet).FirstOrDefault();
                    readerGet.Close();

                    objResultado.Data = response;
                    objResultado.Result = true;
                    objResultado.RowsAffected = 1;
                    objResultado.CodeHelper = response?.CORR_PUESTO ?? Data.CORR_PUESTO;
                    objResultado.ErrorCode = 0;
                    objResultado.ErrorMessage = string.Empty;
                    objResultado.ErrorSource = string.Empty;
                }
                else
                {
                    objResultado.Data = null;
                    objResultado.Result = false;
                    objResultado.RowsAffected = 0;
                    objResultado.CodeHelper = Data.CORR_PUESTO;
                    objResultado.ErrorCode = (int)objData.objCommand.Parameters["@SYS_NUMERO_ERROR"].Value;
                    objResultado.ErrorMessage = (string)objData.objCommand.Parameters["@SYS_MENSAJE_ERROR"].Value;
                    objResultado.ErrorSource = "C" + _TableName + ".Mtto(" + UpdateType.Update.ToString() + ")";
                }
            }
            catch (Exception e)
            {
                objResultado.Data = null;
                objResultado.Result = false;
                objResultado.CodeHelper = Data.CORR_PUESTO;
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

        // Qué hace: verifica si otro puesto de la empresa ya usa el mismo nombre.
        // Cómo: consulta V_PLA_PUESTO con SQL directo excluyendo el correlativo indicado.
        public async Task<bool> ExistsNombreAsync(int corrEmpresa, string nombre, int excludeCorr)
        {
            if (corrEmpresa <= 0 || string.IsNullOrWhiteSpace(nombre))
            {
                return false;
            }

            const string sql = @"SELECT TOP 1 1 AS FOUND
                FROM V_PLA_PUESTO
                WHERE CORR_EMPRESA = @CORR_EMPRESA
                AND UPPER(LTRIM(RTRIM(NOMBRE_PUESTO))) = UPPER(LTRIM(RTRIM(@NOMBRE)))
                AND (@EXCLUDE_CORR <= 0 OR CORR_PUESTO <> @EXCLUDE_CORR)";

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

        private static List<CParameter> BuildWriteParameters(PLA_PUESTOTable Data, bool includePkOutput)
        {
            var p = new List<CParameter>
            {
                new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
            };

            if (includePkOutput)
            {
                p.Add(new CParameter()
                {
                    ParameterName = "CORR_PUESTO",
                    Value = Data.CORR_PUESTO,
                    DbType = System.Data.DbType.Int32,
                    Direction = System.Data.ParameterDirection.InputOutput
                });
            }
            else
            {
                p.Add(new CParameter() { ParameterName = "CORR_PUESTO", Value = Data.CORR_PUESTO, DbType = System.Data.DbType.Int32 });
            }

            p.AddRange(new[]
            {
                new CParameter() { ParameterName = "NOMBRE_PUESTO", Value = Data.NOMBRE_PUESTO, DbType = System.Data.DbType.String },
                new CParameter() { ParameterName = "CORR_GERENCIA", Value = Data.CORR_GERENCIA, DbType = System.Data.DbType.Int32 },
                new CParameter() { ParameterName = "CORR_NIVEL_ACADEMICO", Value = Data.CORR_NIVEL_ACADEMICO, DbType = System.Data.DbType.Int32 },
                new CParameter() { ParameterName = "CORR_TIPO_PUESTO", Value = Data.CORR_TIPO_PUESTO, DbType = System.Data.DbType.Int32 },
                new CParameter() { ParameterName = "ESTADO_PUESTO", Value = Data.ESTADO_PUESTO ?? true, DbType = System.Data.DbType.Boolean },
                new CParameter() { ParameterName = "APROBACION_PUESTO", Value = Data.APROBACION_PUESTO ?? false, DbType = System.Data.DbType.Boolean },
                new CParameter() { ParameterName = "SALARIO_INICIAL", Value = Data.SALARIO_INICIAL, DbType = System.Data.DbType.Decimal },
                new CParameter() { ParameterName = "SALARIO_FINAL", Value = Data.SALARIO_FINAL, DbType = System.Data.DbType.Decimal },
                new CParameter() { ParameterName = "USUARIO_VALIDA", Value = Data.USUARIO_VALIDA, DbType = System.Data.DbType.String },
                new CParameter() { ParameterName = "USUARIO_AUTORIZA", Value = Data.USUARIO_AUTORIZA, DbType = System.Data.DbType.String },
                new CParameter() { ParameterName = "MISION_PUESTO", Value = Data.MISION_PUESTO, DbType = System.Data.DbType.String },
                new CParameter() { ParameterName = "OTROS_ASPECTOS", Value = Data.OTROS_ASPECTOS, DbType = System.Data.DbType.String },
                new CParameter() { ParameterName = "CODIGO_PUESTO", Value = Data.CODIGO_PUESTO, DbType = System.Data.DbType.String },
                new CParameter() { ParameterName = "CODIGO_FORMATO", Value = Data.CODIGO_FORMATO, DbType = System.Data.DbType.String },
                new CParameter() { ParameterName = "VERSION_FORMATO", Value = Data.VERSION_FORMATO, DbType = System.Data.DbType.String },
                new CParameter() { ParameterName = "USUARIO_CREA", Value = Data.USUARIO_CREA, DbType = System.Data.DbType.String },
                new CParameter() { ParameterName = "FECHA_CREA", Value = Data.FECHA_CREA, DbType = System.Data.DbType.DateTime },
                new CParameter() { ParameterName = "ESTACION_CREA", Value = Data.ESTACION_CREA, DbType = System.Data.DbType.String },
                new CParameter() { ParameterName = "USUARIO_ACTU", Value = Data.USUARIO_ACTU, DbType = System.Data.DbType.String },
                new CParameter() { ParameterName = "FECHA_ACTU", Value = Data.FECHA_ACTU, DbType = System.Data.DbType.DateTime },
                new CParameter() { ParameterName = "ESTACION_ACTU", Value = Data.ESTACION_ACTU, DbType = System.Data.DbType.String },
            });

            return p;
        }

        private static bool IsDuplicateKeyError(Exception e)
        {
            return e.Message.Contains("duplicate key", StringComparison.OrdinalIgnoreCase) ||
                e.Message.Contains("PRIMARY KEY", StringComparison.OrdinalIgnoreCase) ||
                e.Message.Contains("UNIQUE KEY", StringComparison.OrdinalIgnoreCase);
        }
    }
}
