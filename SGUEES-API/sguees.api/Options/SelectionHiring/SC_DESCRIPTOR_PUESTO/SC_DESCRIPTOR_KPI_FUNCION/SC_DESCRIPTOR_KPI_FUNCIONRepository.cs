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
    public class SC_DESCRIPTOR_KPI_FUNCIONRepository : BaseRepository<SC_DESCRIPTOR_KPI_FUNCIONTable>, ISC_DESCRIPTOR_KPI_FUNCIONRepository
    {
        private const string _TableName = "SC_DESCRIPTOR_KPI_FUNCION";
        private const string _ViewName = "V_SC_DESCRIPTOR_KPI_FUNCION";

        public SC_DESCRIPTOR_KPI_FUNCIONRepository(IConfiguration config) :
            base(config.GetConnectionString("defaultConnection"),
                config.GetSection("DbProvider:defaultProvider").Value)
        {
        }

        // Lee de V_SC_DESCRIPTOR_KPI_FUNCION con los filtros recibidos; ordena por CORR_KPI_FUNCION.
        public async Task<CResult> GetAllAsync(List<CParameter> xWhere)
        {
            CResult objResultado = new();

            try
            {
                var reader = await objData.GetDataReader(_ViewName, xWhere);
                var response = new List<SC_DESCRIPTOR_KPI_FUNCIONView>().FromDataReader(reader)
                    .OrderBy(x => x.CORR_KPI_FUNCION)
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

        // Lee un registro de V_SC_DESCRIPTOR_KPI_FUNCION con empresa, descriptor e id de KPI.
        public async Task<CResult> GetAsync(List<CParameter> xWhere)
        {
            CResult objResultado = new();

            try
            {
                var reader = await objData.GetDataReader(_ViewName, xWhere);
                var response = new List<SC_DESCRIPTOR_KPI_FUNCIONView>().FromDataReader(reader).FirstOrDefault();

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

        // Inserta en SC_DESCRIPTOR_KPI_FUNCION y devuelve el registro creado leído desde la vista.
        public async Task<CResult> CreateAsync(SC_DESCRIPTOR_KPI_FUNCIONTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            CResult objResultado = new();

            try
            {
                var p = BuildWriteParameters(Data);
                var pWhere = new List<CParameter>
                {
                    new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
                    new CParameter() { ParameterName = "CORR_DESCRIPTOR_PUESTO", Value = Data.CORR_DESCRIPTOR_PUESTO, DbType = System.Data.DbType.Int32 },
                };

                var reader = await objData.Insert(_TableName, p, "CORR_KPI_FUNCION", pWhere);
                var response = new List<SC_DESCRIPTOR_KPI_FUNCIONView>().FromDataReader(reader).FirstOrDefault();

                reader.Close();
                reader = null;

                objResultado.Data = response;
                objResultado.Result = true;
                objResultado.RowsAffected = 1;
                objResultado.CodeHelper = response?.CORR_KPI_FUNCION ?? 0;
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

        // Actualiza SC_DESCRIPTOR_KPI_FUNCION por empresa, descriptor e id; devuelve el registro.
        public async Task<CResult> UpdateAsync(SC_DESCRIPTOR_KPI_FUNCIONTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            CResult objResultado = new();

            try
            {
                var p = new List<CParameter>
                {
                    new CParameter() { ParameterName = "NOMBRE_INDICADOR", Value = Data.NOMBRE_INDICADOR, DbType = System.Data.DbType.String },
                    new CParameter() { ParameterName = "CORR_FRECUENCIA", Value = Data.CORR_FRECUENCIA, DbType = System.Data.DbType.Int32 },
                    new CParameter() { ParameterName = "NOMBRE_FRECUENCIA", Value = Data.NOMBRE_FRECUENCIA, DbType = System.Data.DbType.String },
                    new CParameter() { ParameterName = "META", Value = Data.META, DbType = System.Data.DbType.Int32 },
                    new CParameter() { ParameterName = "USUARIO_ACTU", Value = Data.USUARIO_ACTU, DbType = System.Data.DbType.String },
                    new CParameter() { ParameterName = "ESTACION_ACTU", Value = Data.ESTACION_ACTU, DbType = System.Data.DbType.String },
                    new CParameter() { ParameterName = "FECHA_ACTU", Value = Data.FECHA_ACTU, DbType = System.Data.DbType.DateTime },
                };

                var pWhere = new List<CParameter>
                {
                    new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
                    new CParameter() { ParameterName = "CORR_DESCRIPTOR_PUESTO", Value = Data.CORR_DESCRIPTOR_PUESTO, DbType = System.Data.DbType.Int32 },
                    new CParameter() { ParameterName = "CORR_KPI_FUNCION", Value = Data.CORR_KPI_FUNCION, DbType = System.Data.DbType.Int32 },
                };

                var reader = await objData.Update(_TableName, p, pWhere);
                var response = new List<SC_DESCRIPTOR_KPI_FUNCIONView>().FromDataReader(reader).FirstOrDefault();

                reader.Close();
                reader = null;

                objResultado.Data = response;
                objResultado.Result = true;
                objResultado.RowsAffected = response == null ? 0 : 1;
                objResultado.CodeHelper = response?.CORR_KPI_FUNCION ?? Data.CORR_KPI_FUNCION;
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

        // Borra el registro de SC_DESCRIPTOR_KPI_FUNCION por empresa, descriptor e id.
        public async Task<CResult> DeleteAsync(SC_DESCRIPTOR_KPI_FUNCIONTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            CResult objResultado = new();

            try
            {
                var pWhere = new List<CParameter>
                {
                    new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
                    new CParameter() { ParameterName = "CORR_DESCRIPTOR_PUESTO", Value = Data.CORR_DESCRIPTOR_PUESTO, DbType = System.Data.DbType.Int32 },
                    new CParameter() { ParameterName = "CORR_KPI_FUNCION", Value = Data.CORR_KPI_FUNCION, DbType = System.Data.DbType.Int32 },
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

        // Arma columnas y valores para insertar en SC_DESCRIPTOR_KPI_FUNCION, incluyendo auditoría.
        private static List<CParameter> BuildWriteParameters(SC_DESCRIPTOR_KPI_FUNCIONTable Data)
        {
            return new List<CParameter>
            {
                new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
                new CParameter() { ParameterName = "CORR_DESCRIPTOR_PUESTO", Value = Data.CORR_DESCRIPTOR_PUESTO, DbType = System.Data.DbType.Int32 },
                new CParameter() { ParameterName = "CORR_KPI_FUNCION", Value = Data.CORR_KPI_FUNCION, DbType = System.Data.DbType.Int32 },
                new CParameter() { ParameterName = "NOMBRE_INDICADOR", Value = Data.NOMBRE_INDICADOR, DbType = System.Data.DbType.String },
                new CParameter() { ParameterName = "CORR_FRECUENCIA", Value = Data.CORR_FRECUENCIA, DbType = System.Data.DbType.Int32 },
                new CParameter() { ParameterName = "NOMBRE_FRECUENCIA", Value = Data.NOMBRE_FRECUENCIA, DbType = System.Data.DbType.String },
                new CParameter() { ParameterName = "META", Value = Data.META, DbType = System.Data.DbType.Int32 },
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
