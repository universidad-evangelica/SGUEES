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
    public class SC_SOLICITUD_EMPLEO_PUBLICORepository
        : BaseRepository<SC_SOLICITUD_EMPLEO_TOKENTable>, ISC_SOLICITUD_EMPLEO_PUBLICORepository
    {
        public SC_SOLICITUD_EMPLEO_PUBLICORepository(IConfiguration config)
            : base(
                config.GetConnectionString("defaultConnection"),
                config.GetSection("DbProvider:defaultProvider").Value)
        {
        }

        public async Task<CResult> GetSolicitudAsync(List<CParameter> xWhere)
        {
            CResult resultado = new();
            try
            {
                var reader = await objData.GetDataReader("V_SC_SOLICITUD_EMPLEO", xWhere);
                var response = new List<SC_SOLICITUD_EMPLEOView>().FromDataReader(reader).FirstOrDefault();
                reader.Close();

                resultado.Data = response;
                resultado.Result = response != null;
                resultado.RowsAffected = response == null ? 0 : 1;
                resultado.ErrorCode = response == null ? -1 : 0;
                resultado.ErrorMessage = response == null ? "La solicitud de empleo no existe." : "";
            }
            catch (System.Exception e)
            {
                SetError(resultado, e);
            }
            finally
            {
                objData.objConnection.Close();
            }

            return resultado;
        }

        public async Task<CResult> GetAllTokenAsync(List<CParameter> xWhere)
        {
            CResult resultado = new();
            try
            {
                var reader = await objData.GetDataReader(
                    CommandType.StoredProcedure,
                    "PRAL_DATA_SC_SOLICITUD_EMPLEO_TOKEN",
                    xWhere);
                var response = new List<SC_SOLICITUD_EMPLEO_TOKENView>().FromDataReader(reader).ToList();
                reader.Close();

                resultado.Data = response;
                resultado.Result = true;
                resultado.RowsAffected = response.Count;
                resultado.ErrorCode = 0;
                resultado.ErrorMessage = "";
            }
            catch (System.Exception e)
            {
                SetError(resultado, e);
            }
            finally
            {
                objData.objConnection.Close();
            }

            return resultado;
        }

        public async Task<CResult> GenerarTokenAsync(SC_SOLICITUD_EMPLEO_TOKENTable data)
        {
            CResult resultado = new();
            try
            {
                var parametros = new List<CParameter>
                {
                    new() { ParameterName = "@CORR_EMPRESA", Value = data.CORR_EMPRESA, DbType = DbType.Int32 },
                    new() { ParameterName = "@CORR_SOLICITUD_EMPLEO", Value = data.CORR_SOLICITUD_EMPLEO, DbType = DbType.Int32 },
                    new() { ParameterName = "@TOKEN_HASH", Value = data.TOKEN_HASH, DbType = DbType.String },
                    new() { ParameterName = "@FECHA_GENERACION", Value = data.FECHA_GENERACION, DbType = DbType.DateTime },
                    new() { ParameterName = "@FECHA_EXPIRACION", Value = data.FECHA_EXPIRACION, DbType = DbType.DateTime },
                    new() { ParameterName = "@CORREO_DESTINO", Value = data.CORREO_DESTINO, DbType = DbType.String },
                };

                var reader = await objData.GetDataReader(
                    CommandType.StoredProcedure,
                    "PRAL_MTTO_SC_SOLICITUD_EMPLEO_TOKEN_GENERAR",
                    parametros);
                var response = new List<SC_SOLICITUD_EMPLEO_TOKENView>().FromDataReader(reader).FirstOrDefault();
                reader.Close();

                resultado.Data = response;
                resultado.Result = response != null;
                resultado.RowsAffected = response == null ? 0 : 1;
                resultado.CodeHelper = response?.CORR_TOKEN ?? 0;
                resultado.ErrorCode = response == null ? -1 : 0;
                resultado.ErrorMessage = response == null ? "No fue posible generar el token." : "";
            }
            catch (System.Exception e)
            {
                SetError(resultado, e);
            }
            finally
            {
                objData.objConnection.Close();
            }

            return resultado;
        }

        public async Task<CResult> ActualizarEstadoTokenAsync(
            int corrEmpresa,
            int corrToken,
            string estadoToken)
        {
            CResult resultado = new();
            try
            {
                var parametros = new List<CParameter>
                {
                    new() { ParameterName = "@CORR_EMPRESA", Value = corrEmpresa, DbType = DbType.Int32 },
                    new() { ParameterName = "@CORR_TOKEN", Value = corrToken, DbType = DbType.Int32 },
                    new() { ParameterName = "@ESTADO_TOKEN", Value = estadoToken, DbType = DbType.String },
                };

                var reader = await objData.GetDataReader(
                    CommandType.StoredProcedure,
                    "PRAL_MTTO_SC_SOLICITUD_EMPLEO_TOKEN_ESTADO",
                    parametros);
                var response = new List<SC_SOLICITUD_EMPLEO_TOKENView>().FromDataReader(reader).FirstOrDefault();
                reader.Close();

                resultado.Data = response;
                resultado.Result = response != null;
                resultado.RowsAffected = response == null ? 0 : 1;
                resultado.CodeHelper = response?.CORR_TOKEN ?? 0;
                resultado.ErrorCode = response == null ? -1 : 0;
                resultado.ErrorMessage = response == null ? "No fue posible actualizar el token." : "";
            }
            catch (System.Exception e)
            {
                SetError(resultado, e);
            }
            finally
            {
                objData.objConnection.Close();
            }

            return resultado;
        }

        public async Task<CResult> ValidarTokenAsync(string tokenHash)
        {
            CResult resultado = new();
            try
            {
                var parametros = new List<CParameter>
                {
                    new() { ParameterName = "@TOKEN_HASH", Value = tokenHash, DbType = DbType.String },
                };

                var reader = await objData.GetDataReader(
                    CommandType.StoredProcedure,
                    "PRAL_DATA_SC_SOLICITUD_EMPLEO_PUBLICO_VALIDAR",
                    parametros);
                var response = new List<SC_SOLICITUD_EMPLEO_PUBLICOView>().FromDataReader(reader).FirstOrDefault()
                    ?? new SC_SOLICITUD_EMPLEO_PUBLICOView { VALIDO = false };
                reader.Close();

                resultado.Data = response;
                resultado.Result = true;
                resultado.RowsAffected = response.VALIDO ? 1 : 0;
                resultado.ErrorCode = 0;
                resultado.ErrorMessage = response.VALIDO
                    ? ""
                    : "El enlace es inválido, expiró o ya fue utilizado.";
            }
            catch (System.Exception e)
            {
                SetError(resultado, e);
            }
            finally
            {
                objData.objConnection.Close();
            }

            return resultado;
        }

        public async Task<CResult> CompletarAsync(
            string tokenHash,
            SC_SOLICITUD_EMPLEO_COMPLETARParam data)
        {
            CResult resultado = new();
            try
            {
                var parametros = new List<CParameter>
                {
                    new() { ParameterName = "@TOKEN_HASH", Value = tokenHash, DbType = DbType.String },
                    new() { ParameterName = "@NOMBRE1", Value = data.NOMBRE1, DbType = DbType.String },
                    new() { ParameterName = "@NOMBRE2", Value = data.NOMBRE2, DbType = DbType.String },
                    new() { ParameterName = "@APELLIDO1", Value = data.APELLIDO1, DbType = DbType.String },
                    new() { ParameterName = "@APELLIDO2", Value = data.APELLIDO2, DbType = DbType.String },
                };

                var reader = await objData.GetDataReader(
                    CommandType.StoredProcedure,
                    "PRAL_MTTO_SC_SOLICITUD_EMPLEO_PUBLICO_COMPLETAR",
                    parametros);
                var response = new List<SC_SOLICITUD_EMPLEO_COMPLETARView>().FromDataReader(reader).FirstOrDefault();
                reader.Close();

                resultado.Data = response;
                resultado.Result = response?.COMPLETADO == true;
                resultado.RowsAffected = response?.COMPLETADO == true ? 1 : 0;
                resultado.CodeHelper = response?.CORR_PERSONA_DATOS ?? 0;
                resultado.ErrorCode = response?.COMPLETADO == true ? 0 : -1;
                resultado.ErrorMessage = response?.COMPLETADO == true
                    ? ""
                    : "No fue posible completar la solicitud de empleo.";
            }
            catch (System.Exception e)
            {
                SetError(resultado, e);
            }
            finally
            {
                objData.objConnection.Close();
            }

            return resultado;
        }

        private static void SetError(CResult resultado, System.Exception error)
        {
            resultado.Data = null;
            resultado.Result = false;
            resultado.RowsAffected = 0;
            resultado.CodeHelper = 0;
            resultado.ErrorCode = -1;
            resultado.ErrorMessage = error.Message;
            resultado.ErrorSource = error.Source ?? "";
        }
    }
}
