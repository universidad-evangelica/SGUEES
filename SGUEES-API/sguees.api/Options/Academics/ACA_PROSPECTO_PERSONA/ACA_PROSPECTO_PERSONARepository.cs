using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using System.Linq;
using eFramework.Data;
using eFramework.Core;
using sguees.Models;

namespace sguees.Repositories
{
    public class ACA_PROSPECTO_PERSONARepository : BaseRepository<ACA_PROSPECTO_PERSONATable>, IACA_PROSPECTO_PERSONARepository
    {
        private const string _TableName = "ACA_PROSPECTO_PERSONA";
        private const string _ViewName = "V_ACA_PROSPECTO_PERSONA";

        public ACA_PROSPECTO_PERSONARepository(IConfiguration config) :
                base(config.GetConnectionString("defaultConnection"),
                     config.GetSection("DbProvider:defaultProvider").Value)
        {
        }

        // Qué hace: datos personales del prospecto.
        // Cómo lo hace: lee V_ACA_PROSPECTO_PERSONA.
        public async Task<CResult> GetAllAsync(List<CParameter> xWhere)
        {
            CResult objResultado = new();

            try
            {
                var reader = await objData.GetDataReader(_ViewName, xWhere);
                var response = new List<ACA_PROSPECTO_PERSONAView>().FromDataReader(reader).ToList();

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
            catch (System.Exception e)
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

        public async Task<CResult> GetAsync(List<CParameter> xWhere)
        {
            CResult objResultado = new();

            try
            {
                var reader = await objData.GetDataReader(_ViewName, xWhere);
                var response = new List<ACA_PROSPECTO_PERSONAView>().FromDataReader(reader).FirstOrDefault();

                reader.Close();
                reader = null;

                objResultado.Data = response;
                objResultado.Result = true;
                objResultado.RowsAffected = 1;
                objResultado.CodeHelper = 0;
                objResultado.ErrorCode = 0;
                objResultado.ErrorMessage = "";
                objResultado.ErrorSource = "";
            }
            catch (System.Exception e)
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

        // Qué hace: alta, modificación y eliminación aún no habilitadas.
        // Cómo lo hace: /aca-prospecto es de solo consulta; IRepository exige los métodos, así que
        //               responden un error claro hasta la fase de edición.
        public Task<CResult> CreateAsync(ACA_PROSPECTO_PERSONATable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            return Task.FromResult(OperacionNoHabilitada());
        }

        // Qué hace: actualiza los datos personales del prospecto.
        // Cómo lo hace: objData.Update sobre ACA_PROSPECTO_PERSONA por CORR_PROSPECTO_PERSONA y relee
        //               V_ACA_PROSPECTO_PERSONA. No toca CORR_PROSPECTO ni la auditoría de creación.
        public async Task<CResult> UpdateAsync(ACA_PROSPECTO_PERSONATable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            CResult objResultado = new();

            try
            {
                var p = new List<CParameter>
                {
                    new CParameter() {ParameterName="NOMBRES",Value=Data.NOMBRES,DbType=System.Data.DbType.String},
                    new CParameter() {ParameterName="APELLIDO1",Value=Data.APELLIDO1,DbType=System.Data.DbType.String},
                    new CParameter() {ParameterName="APELLIDO2",Value=Data.APELLIDO2 ?? (object)DBNull.Value,DbType=System.Data.DbType.String},
                    new CParameter() {ParameterName="DUI",Value=Data.DUI ?? (object)DBNull.Value,DbType=System.Data.DbType.String},
                    new CParameter() {ParameterName="NIE",Value=Data.NIE ?? (object)DBNull.Value,DbType=System.Data.DbType.String},
                    new CParameter() {ParameterName="CARNET_RESIDENCIA",Value=Data.CARNET_RESIDENCIA ?? (object)DBNull.Value,DbType=System.Data.DbType.String},
                    new CParameter() {ParameterName="NIT",Value=Data.NIT ?? (object)DBNull.Value,DbType=System.Data.DbType.String},
                    new CParameter() {ParameterName="FECHA_NACIMIENTO",Value=Data.FECHA_NACIMIENTO ?? (object)DBNull.Value,DbType=System.Data.DbType.Date},
                    new CParameter() {ParameterName="LUGAR_NACIMIENTO",Value=Data.LUGAR_NACIMIENTO ?? (object)DBNull.Value,DbType=System.Data.DbType.String},
                    new CParameter() {ParameterName="CORR_PAIS_PROCEDENCIA",Value=Data.CORR_PAIS_PROCEDENCIA ?? (object)DBNull.Value,DbType=System.Data.DbType.Int32},
                    new CParameter() {ParameterName="CORR_PAIS_RESIDENCIA",Value=Data.CORR_PAIS_RESIDENCIA ?? (object)DBNull.Value,DbType=System.Data.DbType.Int32},
                    new CParameter() {ParameterName="GEN_PAIS_NACIONALIDAD",Value=Data.GEN_PAIS_NACIONALIDAD ?? (object)DBNull.Value,DbType=System.Data.DbType.Int32},
                    new CParameter() {ParameterName="IGLESIA_ACTUAL",Value=Data.IGLESIA_ACTUAL ?? (object)DBNull.Value,DbType=System.Data.DbType.String},
                    new CParameter() {ParameterName="CORR_RELIGION",Value=Data.CORR_RELIGION ?? (object)DBNull.Value,DbType=System.Data.DbType.Int32},
                    new CParameter() {ParameterName="TRABAJA",Value=Data.TRABAJA,DbType=System.Data.DbType.Boolean},
                    new CParameter() {ParameterName="HA_SIDO_DEPORTADO",Value=Data.HA_SIDO_DEPORTADO,DbType=System.Data.DbType.Boolean},
                    new CParameter() {ParameterName="POSEE_DISCAPACIDAD",Value=Data.POSEE_DISCAPACIDAD,DbType=System.Data.DbType.Boolean},
                    new CParameter() {ParameterName="CORR_SEXO",Value=Data.CORR_SEXO ?? (object)DBNull.Value,DbType=System.Data.DbType.Int32},
                    new CParameter() {ParameterName="CORR_ESTADO_CIVIL",Value=Data.CORR_ESTADO_CIVIL ?? (object)DBNull.Value,DbType=System.Data.DbType.Int32},
                    new CParameter() {ParameterName="CORR_TIPO_SANGRE",Value=Data.CORR_TIPO_SANGRE ?? (object)DBNull.Value,DbType=System.Data.DbType.Int32},
                    new CParameter() {ParameterName="CORR_DEPTO_RESIDENCIA",Value=Data.CORR_DEPTO_RESIDENCIA ?? (object)DBNull.Value,DbType=System.Data.DbType.Int32},
                    new CParameter() {ParameterName="CORR_MUNICIPIO_RESIDENCIA",Value=Data.CORR_MUNICIPIO_RESIDENCIA ?? (object)DBNull.Value,DbType=System.Data.DbType.Int32},
                    new CParameter() {ParameterName="DIRECCION_ACTUAL",Value=Data.DIRECCION_ACTUAL ?? (object)DBNull.Value,DbType=System.Data.DbType.String},
                    new CParameter() {ParameterName="USUARIO_ACTU",Value=Data.USUARIO_ACTU,DbType=System.Data.DbType.String},
                    new CParameter() {ParameterName="ESTACION_ACTU",Value=Data.ESTACION_ACTU,DbType=System.Data.DbType.String},
                    new CParameter() {ParameterName="FECHA_ACTU",Value=Data.FECHA_ACTU,DbType=System.Data.DbType.DateTime},
                };

                var pWhere = new List<CParameter>
                {
                    new CParameter() {ParameterName="CORR_PROSPECTO_PERSONA",Value=Data.CORR_PROSPECTO_PERSONA,DbType=System.Data.DbType.Int32},
                };

                var reader = await objData.Update(_TableName, p, pWhere);
                var response = new List<ACA_PROSPECTO_PERSONAView>().FromDataReader(reader).FirstOrDefault();

                reader.Close();
                reader = null;

                objResultado.Data = response;
                objResultado.Result = true;
                objResultado.RowsAffected = 1;
                objResultado.CodeHelper = Data.CORR_PROSPECTO_PERSONA;
                objResultado.ErrorCode = 0;
                objResultado.ErrorMessage = "";
                objResultado.ErrorSource = "";
            }
            catch (System.Exception e)
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

        public Task<CResult> DeleteAsync(ACA_PROSPECTO_PERSONATable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            return Task.FromResult(OperacionNoHabilitada());
        }

        private static CResult OperacionNoHabilitada()
        {
            return new CResult()
            {
                Data = null,
                Result = false,
                RowsAffected = 0,
                CodeHelper = 0,
                ErrorCode = -1,
                ErrorMessage = $"Operación no habilitada: {_TableName} es de solo consulta.",
                ErrorSource = ""
            };
        }
    }
}
