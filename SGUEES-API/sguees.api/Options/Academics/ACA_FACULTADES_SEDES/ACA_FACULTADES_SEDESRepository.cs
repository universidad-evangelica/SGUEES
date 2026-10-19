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
    // Qué hace: acceso a dbo.ACA_FACULTADES_SEDES y su vista V_ACA_FACULTADES_SEDES.
    // Cómo lo hace: la llave la manda la pantalla (facultad + sede), así que el alta no genera correlativo y la
    //               relectura es por esa misma llave. La tabla no tiene CORR_EMPRESA: las escrituras filtran solo
    //               por la llave y el servicio valida antes que la facultad sea de la empresa de la sesión.
    public class ACA_FACULTADES_SEDESRepository : BaseRepository<ACA_FACULTADES_SEDESTable>, IACA_FACULTADES_SEDESRepository
    {
        private const string _TableName = "ACA_FACULTADES_SEDES";
        private const string _ViewName = "V_ACA_FACULTADES_SEDES";

        public ACA_FACULTADES_SEDESRepository(IConfiguration config) :
            base(config.GetConnectionString("defaultConnection"),
                config.GetSection("DbProvider:defaultProvider").Value)
        {
        }

        public async Task<CResult> GetAllAsync(List<CParameter> xWhere)
        {
            CResult objResultado = new();
            try
            {
                var reader = await objData.GetDataReader(_ViewName, xWhere, "NOMBRE_SEDE");
                var response = new List<ACA_FACULTADES_SEDESView>().FromDataReader(reader).ToList();
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
                var response = new List<ACA_FACULTADES_SEDESView>().FromDataReader(reader).FirstOrDefault();
                reader.Close();
                reader = null;

                objResultado = Ok(response, response == null ? 0 : 1, response?.CORR_SEDE ?? 0);
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

        public async Task<CResult> CreateAsync(ACA_FACULTADES_SEDESTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            CResult objResultado = new();
            try
            {
                var p = new List<CParameter>
                {
                    new CParameter() { ParameterName = "CORR_FACULTAD", Value = Data.CORR_FACULTAD, DbType = System.Data.DbType.Int32 },
                    new CParameter() { ParameterName = "CORR_SEDE", Value = Data.CORR_SEDE, DbType = System.Data.DbType.Int32 },
                    new CParameter() { ParameterName = "ACTIVO", Value = Data.ACTIVO ?? true, DbType = System.Data.DbType.Boolean },
                    new CParameter() { ParameterName = "USUARIO_CREA", Value = Data.USUARIO_CREA, DbType = System.Data.DbType.String },
                    new CParameter() { ParameterName = "ESTACION_CREA", Value = Data.ESTACION_CREA, DbType = System.Data.DbType.String },
                    new CParameter() { ParameterName = "FECHA_CREA", Value = Data.FECHA_CREA, DbType = System.Data.DbType.DateTime },
                    new CParameter() { ParameterName = "USUARIO_ACTU", Value = Data.USUARIO_ACTU, DbType = System.Data.DbType.String },
                    new CParameter() { ParameterName = "ESTACION_ACTU", Value = Data.ESTACION_ACTU, DbType = System.Data.DbType.String },
                    new CParameter() { ParameterName = "FECHA_ACTU", Value = Data.FECHA_ACTU, DbType = System.Data.DbType.DateTime },
                };

                var reader = await objData.Insert(_TableName, p, "", KeyParameters(Data));
                var response = new List<ACA_FACULTADES_SEDESView>().FromDataReader(reader).FirstOrDefault();
                reader.Close();
                reader = null;

                objResultado = Ok(response, 1, response?.CORR_SEDE ?? Data.CORR_SEDE);
            }
            catch (Exception e)
            {
                objResultado = IsDuplicateKeyError(e)
                    ? Error(2627, "La sede ya está asignada a esta facultad.", e.Source)
                    : Error(-1, e.Message, e.Source);
            }
            finally
            {
                objData.objConnection.Close();
            }

            return objResultado;
        }

        public async Task<CResult> UpdateAsync(ACA_FACULTADES_SEDESTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            CResult objResultado = new();
            try
            {
                // La sede es parte de la llave: al editar solo cambia el estado.
                var p = new List<CParameter>
                {
                    new CParameter() { ParameterName = "ACTIVO", Value = Data.ACTIVO ?? true, DbType = System.Data.DbType.Boolean },
                    new CParameter() { ParameterName = "USUARIO_ACTU", Value = Data.USUARIO_ACTU, DbType = System.Data.DbType.String },
                    new CParameter() { ParameterName = "ESTACION_ACTU", Value = Data.ESTACION_ACTU, DbType = System.Data.DbType.String },
                    new CParameter() { ParameterName = "FECHA_ACTU", Value = Data.FECHA_ACTU, DbType = System.Data.DbType.DateTime },
                };

                var reader = await objData.Update(_TableName, p, KeyParameters(Data));
                var response = new List<ACA_FACULTADES_SEDESView>().FromDataReader(reader).FirstOrDefault();
                reader.Close();
                reader = null;

                objResultado = Ok(response, response == null ? 0 : 1, response?.CORR_SEDE ?? Data.CORR_SEDE);
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

        public async Task<CResult> DeleteAsync(ACA_FACULTADES_SEDESTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            CResult objResultado = new();
            try
            {
                var rows = (int)await objData.Delete(_TableName, KeyParameters(Data));
                objResultado = Ok(null, rows, Data.CORR_SEDE);
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

        // Qué hace: confirma que la facultad exista en la empresa de la sesión.
        public async Task<bool> FacultadEsDeEmpresaAsync(int corrEmpresa, int corrFacultad)
        {
            return await ExisteAsync("ACA_FACULTADES", new List<CParameter>
            {
                new CParameter() { ParameterName = "CORR_EMPRESA", Value = corrEmpresa, DbType = System.Data.DbType.Int32 },
                new CParameter() { ParameterName = "CORR_FACULTAD", Value = corrFacultad, DbType = System.Data.DbType.Int32 },
            });
        }

        // Qué hace: confirma que la sede exista, esté activa (ESTADO_SEDE = 'A') y sea de la empresa de la sesión.
        public async Task<bool> SedeActivaDeEmpresaAsync(int corrEmpresa, int corrSede)
        {
            return await ExisteAsync("GEN_SEDES", new List<CParameter>
            {
                new CParameter() { ParameterName = "CORR_EMPRESA", Value = corrEmpresa, DbType = System.Data.DbType.Int32 },
                new CParameter() { ParameterName = "CORR_SEDE", Value = corrSede, DbType = System.Data.DbType.Int32 },
                new CParameter() { ParameterName = "ESTADO_SEDE", Value = "A", DbType = System.Data.DbType.String },
            });
        }

        private async Task<bool> ExisteAsync(string vTabla, List<CParameter> xWhere)
        {
            try
            {
                var reader = await objData.GetDataReader(vTabla, xWhere);
                var existe = reader.HasRows;
                reader.Close();
                return existe;
            }
            finally
            {
                objData.objConnection.Close();
            }
        }

        private static List<CParameter> KeyParameters(ACA_FACULTADES_SEDESTable Data)
        {
            return new List<CParameter>
            {
                new CParameter() { ParameterName = "CORR_FACULTAD", Value = Data.CORR_FACULTAD, DbType = System.Data.DbType.Int32 },
                new CParameter() { ParameterName = "CORR_SEDE", Value = Data.CORR_SEDE, DbType = System.Data.DbType.Int32 },
            };
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

        // Cómo lo hace: el servidor responde en español ("clave duplicada"); también se busca el nombre de la PK.
        private static bool IsDuplicateKeyError(Exception e)
        {
            return e.Message.Contains("PK_ACA_FACULTADES_SEDES", StringComparison.OrdinalIgnoreCase) ||
                e.Message.Contains("duplicad", StringComparison.OrdinalIgnoreCase) ||
                e.Message.Contains("duplicate key", StringComparison.OrdinalIgnoreCase) ||
                e.Message.Contains("PRIMARY KEY", StringComparison.OrdinalIgnoreCase);
        }
    }
}
