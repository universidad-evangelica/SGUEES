using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using Microsoft.Extensions.Configuration;
using sguees.Models;

namespace sguees.Repositories
{
    // Qué hace: acceso a dbo.ACA_FACULTADES y su vista V_ACA_FACULTADES.
    // Cómo lo hace: patrón A+ con estado de catálogo. CORR_FACULTAD es IDENTITY, así que el alta no genera la
    //               llave (MAX+1) y relee la fila nueva por su código, que es único por empresa.
    public class ACA_FACULTADESRepository : BaseRepository<ACA_FACULTADESTable>, IACA_FACULTADESRepository
    {
        private const string _TableName = "ACA_FACULTADES";
        private const string _ViewName = "V_ACA_FACULTADES";
        private const string _CampoPk = "CORR_FACULTAD";
        private const string _CampoEstado = "ACTIVO";
        private const bool _UsaEmpresa = true;

        // Qué hace: elimina la facultad y sus sedes en una sola transacción.
        // Cómo lo hace: las sedes no tienen otros dependientes; el servicio ya validó carreras y períodos.
        private const string _SqlDelete =
            "SET XACT_ABORT ON; " +
            "BEGIN TRANSACTION; " +
            "DELETE S FROM dbo.ACA_FACULTADES_SEDES S " +
            "INNER JOIN dbo.ACA_FACULTADES F ON F.CORR_FACULTAD = S.CORR_FACULTAD " +
            "WHERE F.CORR_EMPRESA = @CORR_EMPRESA AND F.CORR_FACULTAD = @CORR_FACULTAD; " +
            "DELETE FROM dbo.ACA_FACULTADES WHERE CORR_EMPRESA = @CORR_EMPRESA AND CORR_FACULTAD = @CORR_FACULTAD; " +
            "COMMIT TRANSACTION;";

        public ACA_FACULTADESRepository(IConfiguration config) :
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
                        x.ParameterName == "CORR_FACULTAD" ||
                        x.ParameterName == "CODIGO_FACULTAD" ||
                        x.ParameterName == "NOMBRE_FACULTAD" ||
                        x.ParameterName == "ACTIVO")
                    .ToList();

                var reader = await objData.GetDataReader(_ViewName, dbWhere);
                var response = new List<ACA_FACULTADESView>().FromDataReader(reader)
                    .OrderBy(x => x.CORR_FACULTAD)
                    .ToList();
                reader.Close();
                reader = null;

                objResultado = Ok(response, response.Count, 0);
            }
            catch (Exception e)
            {
                objResultado = Error(-1, e.Message, e.Source);
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
                var response = new List<ACA_FACULTADESView>().FromDataReader(reader).FirstOrDefault();
                reader.Close();
                reader = null;

                objResultado = Ok(response, response == null ? 0 : 1, response?.CORR_FACULTAD ?? 0);
            }
            catch (Exception e)
            {
                objResultado = Error(-1, e.Message, e.Source);
            }
            finally
            {
                objData.objConnection.Close();
            }

            return objResultado;
        }

        public async Task<CResult> CreateAsync(ACA_FACULTADESTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            CResult objResultado = new();
            try
            {
                // Sin CORR_FACULTAD: lo asigna la base (IDENTITY).
                var p = new List<CParameter>
                {
                    new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
                    new CParameter() { ParameterName = "CODIGO_FACULTAD", Value = Data.CODIGO_FACULTAD, DbType = System.Data.DbType.String },
                    new CParameter() { ParameterName = "NOMBRE_FACULTAD", Value = Data.NOMBRE_FACULTAD, DbType = System.Data.DbType.String },
                    new CParameter() { ParameterName = "ACTIVO", Value = Data.ACTIVO ?? true, DbType = System.Data.DbType.Boolean },
                    new CParameter() { ParameterName = "USUARIO_CREA", Value = Data.USUARIO_CREA, DbType = System.Data.DbType.String },
                    new CParameter() { ParameterName = "ESTACION_CREA", Value = Data.ESTACION_CREA, DbType = System.Data.DbType.String },
                    new CParameter() { ParameterName = "FECHA_CREA", Value = Data.FECHA_CREA, DbType = System.Data.DbType.DateTime },
                    new CParameter() { ParameterName = "USUARIO_ACTU", Value = Data.USUARIO_ACTU, DbType = System.Data.DbType.String },
                    new CParameter() { ParameterName = "ESTACION_ACTU", Value = Data.ESTACION_ACTU, DbType = System.Data.DbType.String },
                    new CParameter() { ParameterName = "FECHA_ACTU", Value = Data.FECHA_ACTU, DbType = System.Data.DbType.DateTime },
                };
                // Relectura por la llave natural (UQ_ACA_FACULTADES_CODIGO = empresa + código).
                var pWhere = new List<CParameter>
                {
                    new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
                    new CParameter() { ParameterName = "CODIGO_FACULTAD", Value = Data.CODIGO_FACULTAD, DbType = System.Data.DbType.String },
                };

                var reader = await objData.Insert(_TableName, p, "", pWhere);
                var response = new List<ACA_FACULTADESView>().FromDataReader(reader).FirstOrDefault();
                reader.Close();
                reader = null;

                objResultado = Ok(response, 1, response?.CORR_FACULTAD ?? 0);
            }
            catch (Exception e)
            {
                objResultado = IsDuplicateKeyError(e)
                    ? Error(2627, "Ya existe una facultad con ese código. Ingrese otro código para continuar.", e.Source)
                    : Error(-1, e.Message, e.Source);
            }
            finally
            {
                objData.objConnection.Close();
            }

            return objResultado;
        }

        public async Task<CResult> UpdateAsync(ACA_FACULTADESTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            CResult objResultado = new();
            try
            {
                // El código y el estado no se editan aquí: el código queda fijo y el estado cambia con ActivarInactivar.
                var p = new List<CParameter>
                {
                    new CParameter() { ParameterName = "NOMBRE_FACULTAD", Value = Data.NOMBRE_FACULTAD, DbType = System.Data.DbType.String },
                    new CParameter() { ParameterName = "USUARIO_ACTU", Value = Data.USUARIO_ACTU, DbType = System.Data.DbType.String },
                    new CParameter() { ParameterName = "ESTACION_ACTU", Value = Data.ESTACION_ACTU, DbType = System.Data.DbType.String },
                    new CParameter() { ParameterName = "FECHA_ACTU", Value = Data.FECHA_ACTU, DbType = System.Data.DbType.DateTime },
                };
                var pWhere = new List<CParameter>
                {
                    new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
                    new CParameter() { ParameterName = "CORR_FACULTAD", Value = Data.CORR_FACULTAD, DbType = System.Data.DbType.Int32 },
                };

                var reader = await objData.Update(_TableName, p, pWhere);
                var response = new List<ACA_FACULTADESView>().FromDataReader(reader).FirstOrDefault();
                reader.Close();
                reader = null;

                objResultado = Ok(response, response == null ? 0 : 1, response?.CORR_FACULTAD ?? Data.CORR_FACULTAD);
            }
            catch (Exception e)
            {
                objResultado = Error(-1, e.Message, e.Source);
            }
            finally
            {
                objData.objConnection.Close();
            }

            return objResultado;
        }

        public async Task<CResult> DeleteAsync(ACA_FACULTADESTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            CResult objResultado = new();
            try
            {
                var p = new List<CParameter>
                {
                    new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
                    new CParameter() { ParameterName = "CORR_FACULTAD", Value = Data.CORR_FACULTAD, DbType = System.Data.DbType.Int32 },
                };

                await objData.ExecCmd(System.Data.CommandType.Text, _SqlDelete, true, p);

                objResultado = Ok(null, 1, Data.CORR_FACULTAD);
            }
            catch (Exception e)
            {
                // Red de seguridad: si entre la validación y el borrado alguien le asignó una carrera, la FK lo impide.
                objResultado = Error(-1, "No se puede eliminar la facultad porque tiene registros relacionados. Utilice Desactivar.", e.Source);
            }
            finally
            {
                objData.objConnection.Close();
            }

            return objResultado;
        }

        public async Task<CResult> ActivarInactivarAsync(ACA_FACULTADESTable Data, string vLOGIN_SISTEMA, string vESTACION)
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
                    new CParameter() { ParameterName = "CORR_RELATIVO", Value = Data.CORR_FACULTAD, DbType = System.Data.DbType.Int32 },
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
                        new CParameter() { ParameterName = "CORR_FACULTAD", Value = Data.CORR_FACULTAD, DbType = System.Data.DbType.Int32 },
                    };
                    var readerGet = await objData.GetDataReader(_ViewName, xWhere);
                    var response = new List<ACA_FACULTADESView>().FromDataReader(readerGet).FirstOrDefault();
                    readerGet.Close();

                    objResultado = Ok(response, 1, response?.CORR_FACULTAD ?? Data.CORR_FACULTAD);
                }
                else
                {
                    objResultado = Error(
                        (int)objData.objCommand.Parameters["@SYS_NUMERO_ERROR"].Value,
                        (string)objData.objCommand.Parameters["@SYS_MENSAJE_ERROR"].Value,
                        "C" + _TableName + ".Mtto(" + UpdateType.Update.ToString() + ")");
                }
            }
            catch (Exception e)
            {
                objResultado = Error(-1, e.Message, e.Source);
            }
            finally
            {
                objData.objConnection.Close();
            }

            return objResultado;
        }

        private static CResult Ok(object data, int rows, int codeHelper)
        {
            return new CResult
            {
                Data = data,
                Result = true,
                RowsAffected = rows,
                CodeHelper = codeHelper,
                ErrorCode = 0,
                ErrorMessage = string.Empty,
                ErrorSource = string.Empty
            };
        }

        private static CResult Error(int code, string message, string source)
        {
            return new CResult
            {
                Data = null,
                Result = false,
                RowsAffected = 0,
                CodeHelper = 0,
                ErrorCode = code,
                ErrorMessage = message,
                ErrorSource = $"[{source}]"
            };
        }

        // Cómo lo hace: el servidor responde en español ("clave duplicada"), por eso también se busca el índice único.
        private static bool IsDuplicateKeyError(Exception e)
        {
            return e.Message.Contains("UQ_ACA_FACULTADES_CODIGO", StringComparison.OrdinalIgnoreCase) ||
                e.Message.Contains("duplicad", StringComparison.OrdinalIgnoreCase) ||
                e.Message.Contains("duplicate key", StringComparison.OrdinalIgnoreCase) ||
                e.Message.Contains("PRIMARY KEY", StringComparison.OrdinalIgnoreCase) ||
                e.Message.Contains("UNIQUE KEY", StringComparison.OrdinalIgnoreCase);
        }
    }
}
