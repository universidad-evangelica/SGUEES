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
    public class SC_PERFIL_PUESTO_COMPETENCIAS_CONDUCTUALESRepository : BaseRepository<SC_PERFIL_PUESTO_COMPETENCIAS_CONDUCTUALESTable>, ISC_PERFIL_PUESTO_COMPETENCIAS_CONDUCTUALESRepository
    {
        private const string _TableName = "SC_PERFIL_PUESTO_COMPETENCIAS_CONDUCTUALES";
        private const string _ViewName = "V_SC_PERFIL_PUESTO_COMPETENCIAS_CONDUCTUALES";

        public SC_PERFIL_PUESTO_COMPETENCIAS_CONDUCTUALESRepository(IConfiguration config) :
            base(config.GetConnectionString("defaultConnection"),
                config.GetSection("DbProvider:defaultProvider").Value)
        {
        }

        // Lee de V_SC_PERFIL_PUESTO_COMPETENCIAS_CONDUCTUALES con filtros; ordena por id.
        public async Task<CResult> GetAllAsync(List<CParameter> xWhere)
        {
            CResult objResultado = new();

            try
            {
                var reader = await objData.GetDataReader(_ViewName, xWhere);
                var response = new List<SC_PERFIL_PUESTO_COMPETENCIAS_CONDUCTUALESView>().FromDataReader(reader)
                    .OrderBy(x => x.CORR_PERFIL_PUESTO_COMPETENCIAS_CONDUCTUALES)
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

        // Lee un registro de V_SC_PERFIL_PUESTO_COMPETENCIAS_CONDUCTUALES con empresa e id.
        public async Task<CResult> GetAsync(List<CParameter> xWhere)
        {
            CResult objResultado = new();

            try
            {
                var reader = await objData.GetDataReader(_ViewName, xWhere);
                var response = new List<SC_PERFIL_PUESTO_COMPETENCIAS_CONDUCTUALESView>().FromDataReader(reader).FirstOrDefault();

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

        // Inserta en SC_PERFIL_PUESTO_COMPETENCIAS_CONDUCTUALES y devuelve el registro leído desde la vista.
        public async Task<CResult> CreateAsync(SC_PERFIL_PUESTO_COMPETENCIAS_CONDUCTUALESTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            CResult objResultado = new();

            try
            {
                var p = BuildWriteParameters(Data);
                var pWhere = new List<CParameter>
                {
                    new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
                };

                var reader = await objData.Insert(_TableName, p, "CORR_PERFIL_PUESTO_COMPETENCIAS_CONDUCTUALES", pWhere);
                var response = new List<SC_PERFIL_PUESTO_COMPETENCIAS_CONDUCTUALESView>().FromDataReader(reader).FirstOrDefault();

                reader.Close();
                reader = null;

                objResultado.Data = response;
                objResultado.Result = true;
                objResultado.RowsAffected = 1;
                objResultado.CodeHelper = response?.CORR_PERFIL_PUESTO_COMPETENCIAS_CONDUCTUALES ?? 0;
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

        // Actualiza SC_PERFIL_PUESTO_COMPETENCIAS_CONDUCTUALES por empresa e id; devuelve el registro.
        public async Task<CResult> UpdateAsync(SC_PERFIL_PUESTO_COMPETENCIAS_CONDUCTUALESTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            CResult objResultado = new();

            try
            {
                var p = new List<CParameter>
                {
                    new CParameter() { ParameterName = "NOMBRE_COMPETENCIAS_CONDUCTUALES", Value = Data.NOMBRE_COMPETENCIAS_CONDUCTUALES, DbType = System.Data.DbType.String },
                    new CParameter() { ParameterName = "CODIGO_TIPO_PUESTO", Value = Data.CODIGO_TIPO_PUESTO, DbType = System.Data.DbType.String },
                    new CParameter() { ParameterName = "DESCRIPCION", Value = Data.DESCRIPCION, DbType = System.Data.DbType.String },
                    new CParameter() { ParameterName = "CORR_COMPETENCIAS_CONDUCTUALES", Value = Data.CORR_COMPETENCIAS_CONDUCTUALES, DbType = System.Data.DbType.Int32 },
                    new CParameter() { ParameterName = "USUARIO_ACTU", Value = Data.USUARIO_ACTU, DbType = System.Data.DbType.String },
                    new CParameter() { ParameterName = "ESTACION_ACTU", Value = Data.ESTACION_ACTU, DbType = System.Data.DbType.String },
                    new CParameter() { ParameterName = "FECHA_ACTU", Value = Data.FECHA_ACTU, DbType = System.Data.DbType.DateTime },
                };

                var pWhere = new List<CParameter>
                {
                    new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
                    new CParameter() { ParameterName = "CORR_PERFIL_PUESTO_COMPETENCIAS_CONDUCTUALES", Value = Data.CORR_PERFIL_PUESTO_COMPETENCIAS_CONDUCTUALES, DbType = System.Data.DbType.Int32 },
                };

                var reader = await objData.Update(_TableName, p, pWhere);
                var response = new List<SC_PERFIL_PUESTO_COMPETENCIAS_CONDUCTUALESView>().FromDataReader(reader).FirstOrDefault();

                reader.Close();
                reader = null;

                objResultado.Data = response;
                objResultado.Result = true;
                objResultado.RowsAffected = response == null ? 0 : 1;
                objResultado.CodeHelper = response?.CORR_PERFIL_PUESTO_COMPETENCIAS_CONDUCTUALES ?? Data.CORR_PERFIL_PUESTO_COMPETENCIAS_CONDUCTUALES;
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

        // Borra el registro de SC_PERFIL_PUESTO_COMPETENCIAS_CONDUCTUALES por empresa e id.
        public async Task<CResult> DeleteAsync(SC_PERFIL_PUESTO_COMPETENCIAS_CONDUCTUALESTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            CResult objResultado = new();

            try
            {
                var pWhere = new List<CParameter>
                {
                    new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
                    new CParameter() { ParameterName = "CORR_PERFIL_PUESTO_COMPETENCIAS_CONDUCTUALES", Value = Data.CORR_PERFIL_PUESTO_COMPETENCIAS_CONDUCTUALES, DbType = System.Data.DbType.Int32 },
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

        // Arma columnas y valores para insertar en SC_PERFIL_PUESTO_COMPETENCIAS_CONDUCTUALES, con auditoría.
        private static List<CParameter> BuildWriteParameters(SC_PERFIL_PUESTO_COMPETENCIAS_CONDUCTUALESTable Data)
        {
            return new List<CParameter>
            {
                new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
                new CParameter() { ParameterName = "CORR_PERFIL_PUESTO_COMPETENCIAS_CONDUCTUALES", Value = Data.CORR_PERFIL_PUESTO_COMPETENCIAS_CONDUCTUALES, DbType = System.Data.DbType.Int32 },
                new CParameter() { ParameterName = "CODIGO_TIPO_PUESTO", Value = Data.CODIGO_TIPO_PUESTO, DbType = System.Data.DbType.String },
                new CParameter() { ParameterName = "NOMBRE_COMPETENCIAS_CONDUCTUALES", Value = Data.NOMBRE_COMPETENCIAS_CONDUCTUALES, DbType = System.Data.DbType.String },
                new CParameter() { ParameterName = "DESCRIPCION", Value = Data.DESCRIPCION, DbType = System.Data.DbType.String },
                new CParameter() { ParameterName = "CORR_DESCRIPTOR_PUESTO", Value = Data.CORR_DESCRIPTOR_PUESTO, DbType = System.Data.DbType.Int32 },
                new CParameter() { ParameterName = "CORR_PERFIL_PUESTO", Value = Data.CORR_PERFIL_PUESTO, DbType = System.Data.DbType.Int32 },
                new CParameter() { ParameterName = "CORR_COMPETENCIAS_CONDUCTUALES", Value = Data.CORR_COMPETENCIAS_CONDUCTUALES, DbType = System.Data.DbType.Int32 },
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
