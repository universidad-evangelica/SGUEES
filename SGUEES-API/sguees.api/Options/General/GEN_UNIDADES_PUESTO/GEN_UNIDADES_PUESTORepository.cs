// Qué hace: acceso a datos de GEN_UNIDADES_PUESTO (tabla intermedia unidad-puesto).
// Cómo: lee V_GEN_UNIDADES_PUESTO y escribe en GEN_UNIDADES_PUESTO vía CData (Insert/Delete).
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
    // Qué hace: repositorio de puestos asignados a unidades.
    // Cómo: implementa GetAll/Get/Create/Update/Delete sobre la PK compuesta.
    public class GEN_UNIDADES_PUESTORepository : BaseRepository<GEN_UNIDADES_PUESTOTable>, IGEN_UNIDADES_PUESTORepository
    {
        private const string _TableName = "GEN_UNIDADES_PUESTO";
        private const string _ViewName = "V_GEN_UNIDADES_PUESTO";

        public GEN_UNIDADES_PUESTORepository(IConfiguration config) :
            base(config.GetConnectionString("defaultConnection"),
                config.GetSection("DbProvider:defaultProvider").Value)
        {
        }

        // Qué hace: indica si ya existe la asignación empresa-unidad-puesto.
        // Cómo: consulta la vista con las tres llaves y revisa si hay Data.
        public async Task<bool> ExistsAsync(int corrEmpresa, int corrUnidad, int corrPuesto)
        {
            var result = await GetAsync(new List<CParameter>
            {
                new CParameter() { ParameterName = "CORR_EMPRESA", Value = corrEmpresa, DbType = System.Data.DbType.Int32 },
                new CParameter() { ParameterName = "CORR_UNIDAD", Value = corrUnidad, DbType = System.Data.DbType.Int32 },
                new CParameter() { ParameterName = "CORR_PUESTO", Value = corrPuesto, DbType = System.Data.DbType.Int32 },
            });

            return result.Result && result.Data != null;
        }

        // Qué hace: lista las asignaciones desde la vista.
        // Cómo: lee V_GEN_UNIDADES_PUESTO con el filtro y ordena por CORR_PUESTO.
        public async Task<CResult> GetAllAsync(List<CParameter> xWhere)
        {
            CResult objResultado = new();

            try
            {
                var reader = await objData.GetDataReader(_ViewName, xWhere);
                var response = new List<GEN_UNIDADES_PUESTOView>().FromDataReader(reader)
                    .OrderBy(x => x.CORR_UNIDAD)
                    .ThenBy(x => x.CORR_PUESTO)
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

        // Qué hace: obtiene una asignación unidad-puesto.
        // Cómo: lee la vista con el filtro y toma el primer registro.
        public async Task<CResult> GetAsync(List<CParameter> xWhere)
        {
            CResult objResultado = new();

            try
            {
                var reader = await objData.GetDataReader(_ViewName, xWhere);
                var response = new List<GEN_UNIDADES_PUESTOView>().FromDataReader(reader).FirstOrDefault();

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

        // Qué hace: inserta una asignación en GEN_UNIDADES_PUESTO.
        // Cómo: Insert con todos los campos de escritura; si hay llave duplicada, ErrorCode 2627.
        public async Task<CResult> CreateAsync(GEN_UNIDADES_PUESTOTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            CResult objResultado = new();

            try
            {
                var p = BuildWriteParameters(Data);
                var pWhere = new List<CParameter>
                {
                    new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
                    new CParameter() { ParameterName = "CORR_UNIDAD", Value = Data.CORR_UNIDAD, DbType = System.Data.DbType.Int32 },
                    new CParameter() { ParameterName = "CORR_PUESTO", Value = Data.CORR_PUESTO, DbType = System.Data.DbType.Int32 },
                };

                var reader = await objData.Insert(_TableName, p, "", pWhere);
                var response = new List<GEN_UNIDADES_PUESTOView>().FromDataReader(reader).FirstOrDefault();

                reader.Close();
                reader = null;

                objResultado.Data = response;
                objResultado.Result = true;
                objResultado.RowsAffected = 1;
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
                    ? "Ese puesto ya esta asignado a la unidad."
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
        public async Task<CResult> UpdateAsync(GEN_UNIDADES_PUESTOTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            return new CResult
            {
                Data = null,
                Result = false,
                CodeHelper = 0,
                ErrorCode = -1,
                ErrorMessage = "La actualizacion de puestos por unidad no esta habilitada. Elimine y vuelva a asignar.",
                ErrorSource = "[GEN_UNIDADES_PUESTORepository]",
                RowsAffected = 0
            };
        }

        // Qué hace: elimina una asignación unidad-puesto.
        // Cómo: Delete sobre GEN_UNIDADES_PUESTO filtrando por las tres llaves de la PK.
        public async Task<CResult> DeleteAsync(GEN_UNIDADES_PUESTOTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            CResult objResultado = new();

            try
            {
                var pWhere = new List<CParameter>
                {
                    new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
                    new CParameter() { ParameterName = "CORR_UNIDAD", Value = Data.CORR_UNIDAD, DbType = System.Data.DbType.Int32 },
                    new CParameter() { ParameterName = "CORR_PUESTO", Value = Data.CORR_PUESTO, DbType = System.Data.DbType.Int32 },
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

        // Qué hace: arma los parámetros de escritura de la tabla.
        // Cómo: mapea todos los campos de GEN_UNIDADES_PUESTOTable a CParameter.
        private static List<CParameter> BuildWriteParameters(GEN_UNIDADES_PUESTOTable Data)
        {
            return new List<CParameter>
            {
                new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
                new CParameter() { ParameterName = "CORR_UNIDAD", Value = Data.CORR_UNIDAD, DbType = System.Data.DbType.Int32 },
                new CParameter() { ParameterName = "CORR_PUESTO", Value = Data.CORR_PUESTO, DbType = System.Data.DbType.Int32 },
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
