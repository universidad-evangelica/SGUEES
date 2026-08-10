// Qué hace: acceso a datos de SC_UNIDADES_TIPO_USUARIO (tabla intermedia unidad-rol).
// Cómo: lee V_SC_UNIDADES_TIPO_USUARIO y escribe en SC_UNIDADES_TIPO_USUARIO vía CData (Insert/Update/Delete).
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
    // Qué hace: repositorio de unidades asignadas por tipo de usuario.
    // Cómo: implementa GetAll/Get/Create/Update/Delete y ActivarInactivar sobre la PK compuesta.
    public class SC_UNIDADES_TIPO_USUARIORepository : BaseRepository<SC_UNIDADES_TIPO_USUARIOTable>, ISC_UNIDADES_TIPO_USUARIORepository
    {
        private const string _TableName = "SC_UNIDADES_TIPO_USUARIO";
        private const string _ViewName = "V_SC_UNIDADES_TIPO_USUARIO";

        public SC_UNIDADES_TIPO_USUARIORepository(IConfiguration config) :
            base(config.GetConnectionString("defaultConnection"),
                config.GetSection("DbProvider:defaultProvider").Value)
        {
        }

        // Qué hace: indica si ya existe la asignación empresa-unidad-rol.
        // Cómo: consulta la vista con las tres llaves y revisa si hay Data.
        public async Task<bool> ExistsAsync(int corrEmpresa, int corrUnidad, int tipoUsuario)
        {
            var result = await GetAsync(new List<CParameter>
            {
                new CParameter() { ParameterName = "CORR_EMPRESA", Value = corrEmpresa, DbType = System.Data.DbType.Int32 },
                new CParameter() { ParameterName = "CORR_UNIDAD", Value = corrUnidad, DbType = System.Data.DbType.Int32 },
                new CParameter() { ParameterName = "TIPO_USUARIO", Value = tipoUsuario, DbType = System.Data.DbType.Int32 },
            });

            return result.Result && result.Data != null;
        }

        // Qué hace: lista las asignaciones desde la vista.
        // Cómo: lee V_SC_UNIDADES_TIPO_USUARIO con el filtro y ordena por CORR_UNIDAD.
        public async Task<CResult> GetAllAsync(List<CParameter> xWhere)
        {
            CResult objResultado = new();

            try
            {
                var reader = await objData.GetDataReader(_ViewName, xWhere);
                var response = new List<SC_UNIDADES_TIPO_USUARIOView>().FromDataReader(reader)
                    .OrderBy(x => x.CORR_UNIDAD)
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

        // Qué hace: obtiene una asignación unidad-rol.
        // Cómo: lee la vista con el filtro y toma el primer registro.
        public async Task<CResult> GetAsync(List<CParameter> xWhere)
        {
            CResult objResultado = new();

            try
            {
                var reader = await objData.GetDataReader(_ViewName, xWhere);
                var response = new List<SC_UNIDADES_TIPO_USUARIOView>().FromDataReader(reader).FirstOrDefault();

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

        // Qué hace: inserta una asignación en SC_UNIDADES_TIPO_USUARIO.
        // Cómo: Insert con todos los campos de escritura; si hay llave duplicada, ErrorCode 2627.
        public async Task<CResult> CreateAsync(SC_UNIDADES_TIPO_USUARIOTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            CResult objResultado = new();

            try
            {
                var p = BuildWriteParameters(Data);
                var pWhere = new List<CParameter>
                {
                    new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
                    new CParameter() { ParameterName = "CORR_UNIDAD", Value = Data.CORR_UNIDAD, DbType = System.Data.DbType.Int32 },
                    new CParameter() { ParameterName = "TIPO_USUARIO", Value = Data.TIPO_USUARIO, DbType = System.Data.DbType.Int32 },
                };

                var reader = await objData.Insert(_TableName, p, "", pWhere);
                var response = new List<SC_UNIDADES_TIPO_USUARIOView>().FromDataReader(reader).FirstOrDefault();

                reader.Close();
                reader = null;

                objResultado.Data = response;
                objResultado.Result = true;
                objResultado.RowsAffected = 1;
                objResultado.CodeHelper = response?.CORR_UNIDAD ?? Data.CORR_UNIDAD;
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
                    ? "Esa unidad ya esta asignada al rol."
                    : e.Message;
                objResultado.ErrorSource += $"[{e.Source}]";
            }
            finally
            {
                objData.objConnection.Close();
            }

            return objResultado;
        }

        // Qué hace: bloquea la actualización directa de la asignación.
        // Cómo: devuelve error indicando que debe eliminarse y volver a asignar.
        public async Task<CResult> UpdateAsync(SC_UNIDADES_TIPO_USUARIOTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            return new CResult
            {
                Data = null,
                Result = false,
                CodeHelper = 0,
                ErrorCode = -1,
                ErrorMessage = "La actualizacion de unidades por rol no esta habilitada. Elimine y vuelva a asignar.",
                ErrorSource = "[SC_UNIDADES_TIPO_USUARIORepository]",
                RowsAffected = 0
            };
        }

        // Qué hace: elimina una asignación unidad-rol.
        // Cómo: Delete sobre SC_UNIDADES_TIPO_USUARIO filtrando por las tres llaves de la PK.
        public async Task<CResult> DeleteAsync(SC_UNIDADES_TIPO_USUARIOTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            CResult objResultado = new();

            try
            {
                var pWhere = new List<CParameter>
                {
                    new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
                    new CParameter() { ParameterName = "CORR_UNIDAD", Value = Data.CORR_UNIDAD, DbType = System.Data.DbType.Int32 },
                    new CParameter() { ParameterName = "TIPO_USUARIO", Value = Data.TIPO_USUARIO, DbType = System.Data.DbType.Int32 },
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

        // Qué hace: alterna ACTIVO de la asignación unidad-rol.
        // Cómo: lee el registro actual, hace UPDATE de ACTIVO + auditoría y vuelve a leer la vista (PK compuesta; no usa el SP de un solo correlativo).
        public async Task<CResult> ActivarInactivarAsync(SC_UNIDADES_TIPO_USUARIOTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            CResult objResultado = new();

            try
            {
                var pWhere = new List<CParameter>
                {
                    new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
                    new CParameter() { ParameterName = "CORR_UNIDAD", Value = Data.CORR_UNIDAD, DbType = System.Data.DbType.Int32 },
                    new CParameter() { ParameterName = "TIPO_USUARIO", Value = Data.TIPO_USUARIO, DbType = System.Data.DbType.Int32 },
                };

                var readerGet = await objData.GetDataReader(_ViewName, pWhere);
                var current = new List<SC_UNIDADES_TIPO_USUARIOView>().FromDataReader(readerGet).FirstOrDefault();
                readerGet.Close();

                if (current == null)
                {
                    objResultado.Data = null;
                    objResultado.Result = false;
                    objResultado.RowsAffected = 0;
                    objResultado.CodeHelper = 0;
                    objResultado.ErrorCode = -1;
                    objResultado.ErrorMessage = "No se encontro la asignacion de unidad a actualizar.";
                    objResultado.ErrorSource = "[SC_UNIDADES_TIPO_USUARIORepository]";
                    return objResultado;
                }

                var p = new List<CParameter>
                {
                    new CParameter() { ParameterName = "ACTIVO", Value = !(current.ACTIVO ?? true), DbType = System.Data.DbType.Boolean },
                    new CParameter() { ParameterName = "USUARIO_ACTU", Value = vLOGIN_SISTEMA, DbType = System.Data.DbType.String },
                    new CParameter() { ParameterName = "ESTACION_ACTU", Value = vESTACION ?? string.Empty, DbType = System.Data.DbType.String },
                    new CParameter() { ParameterName = "FECHA_ACTU", Value = DateTime.Now, DbType = System.Data.DbType.DateTime },
                };

                var readerUpdate = await objData.Update(_TableName, p, pWhere);
                readerUpdate?.Close();

                var readerAfter = await objData.GetDataReader(_ViewName, pWhere);
                var response = new List<SC_UNIDADES_TIPO_USUARIOView>().FromDataReader(readerAfter).FirstOrDefault();
                readerAfter.Close();

                objResultado.Data = response;
                objResultado.Result = true;
                objResultado.RowsAffected = 1;
                objResultado.CodeHelper = response?.CORR_UNIDAD ?? Data.CORR_UNIDAD;
                objResultado.ErrorCode = 0;
                objResultado.ErrorMessage = string.Empty;
                objResultado.ErrorSource = string.Empty;
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

        // Qué hace: arma los parámetros de escritura de la tabla.
        // Cómo: mapea todos los campos de SC_UNIDADES_TIPO_USUARIOTable a CParameter.
        private static List<CParameter> BuildWriteParameters(SC_UNIDADES_TIPO_USUARIOTable Data)
        {
            return new List<CParameter>
            {
                new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
                new CParameter() { ParameterName = "CORR_UNIDAD", Value = Data.CORR_UNIDAD, DbType = System.Data.DbType.Int32 },
                new CParameter() { ParameterName = "TIPO_USUARIO", Value = Data.TIPO_USUARIO, DbType = System.Data.DbType.Int32 },
                new CParameter() { ParameterName = "ACTIVO", Value = Data.ACTIVO ?? true, DbType = System.Data.DbType.Boolean },
                new CParameter() { ParameterName = "USUARIO_CREA", Value = Data.USUARIO_CREA, DbType = System.Data.DbType.String },
                new CParameter() { ParameterName = "ESTACION_CREA", Value = Data.ESTACION_CREA, DbType = System.Data.DbType.String },
                new CParameter() { ParameterName = "FECHA_CREA", Value = Data.FECHA_CREA, DbType = System.Data.DbType.DateTime },
                new CParameter() { ParameterName = "USUARIO_ACTU", Value = Data.USUARIO_ACTU, DbType = System.Data.DbType.String },
                new CParameter() { ParameterName = "ESTACION_ACTU", Value = Data.ESTACION_ACTU, DbType = System.Data.DbType.String },
                new CParameter() { ParameterName = "FECHA_ACTU", Value = Data.FECHA_ACTU, DbType = System.Data.DbType.DateTime },
            };
        }

        // Qué hace: detecta errores de llave duplicada en SQL Server.
        // Cómo: busca textos típicos de PRIMARY/UNIQUE KEY en el mensaje de la excepción.
        private static bool IsDuplicateKeyError(Exception e)
        {
            return e.Message.Contains("duplicate key", StringComparison.OrdinalIgnoreCase) ||
                e.Message.Contains("PRIMARY KEY", StringComparison.OrdinalIgnoreCase) ||
                e.Message.Contains("UNIQUE KEY", StringComparison.OrdinalIgnoreCase);
        }
    }
}
