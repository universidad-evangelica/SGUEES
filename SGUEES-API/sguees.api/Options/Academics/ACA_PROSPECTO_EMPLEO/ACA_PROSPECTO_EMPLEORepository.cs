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
    public class ACA_PROSPECTO_EMPLEORepository : BaseRepository<ACA_PROSPECTO_EMPLEOTable>, IACA_PROSPECTO_EMPLEORepository
    {
        private const string _TableName = "ACA_PROSPECTO_EMPLEO";
        private const string _ViewName = "V_ACA_PROSPECTO_EMPLEO";

        public ACA_PROSPECTO_EMPLEORepository(IConfiguration config) :
                base(config.GetConnectionString("defaultConnection"),
                     config.GetSection("DbProvider:defaultProvider").Value)
        {
        }

        // Qué hace: información laboral del prospecto.
        // Cómo lo hace: lee V_ACA_PROSPECTO_EMPLEO ordenado por CORR_PROSPECTO_EMPLEO.
        public async Task<CResult> GetAllAsync(List<CParameter> xWhere)
        {
            CResult objResultado = new();

            try
            {
                var reader = await objData.GetDataReader(_ViewName, xWhere, "CORR_PROSPECTO_EMPLEO");
                var response = new List<ACA_PROSPECTO_EMPLEOView>().FromDataReader(reader).ToList();

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
                var response = new List<ACA_PROSPECTO_EMPLEOView>().FromDataReader(reader).FirstOrDefault();

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

        // Qué hace: crea la información laboral del prospecto (máximo una) y marca TRABAJA = 1 en la persona.
        // Cómo lo hace: CORR_PROSPECTO_EMPLEO es IDENTITY, así que inserta con ExecCmd (objData.Insert
        //               calcula MAX+1 y no aplica). Rechaza un segundo empleo. Relee V_ACA_PROSPECTO_EMPLEO
        //               por persona y devuelve la fila creada.
        public async Task<CResult> CreateAsync(ACA_PROSPECTO_EMPLEOTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            CResult objResultado = new();

            try
            {
                var pPersona = new List<CParameter>
                {
                    new CParameter() {ParameterName="CORR_PROSPECTO_PERSONA",Value=Data.CORR_PROSPECTO_PERSONA,DbType=System.Data.DbType.Int32},
                };

                var reader = await objData.GetDataReader(_ViewName, pPersona);
                var existente = new List<ACA_PROSPECTO_EMPLEOView>().FromDataReader(reader).FirstOrDefault();
                reader.Close();
                objData.objConnection.Close();

                if (existente != null)
                    throw new System.Exception("El prospecto ya tiene información laboral registrada; modifíquela en lugar de crear otra.");

                var pIns = new List<CParameter>
                {
                    new CParameter() {ParameterName="CORR_PROSPECTO_PERSONA",Value=Data.CORR_PROSPECTO_PERSONA,DbType=System.Data.DbType.Int32},
                    new CParameter() {ParameterName="EMPRESA",Value=Data.EMPRESA ?? (object)DBNull.Value,DbType=System.Data.DbType.String},
                    new CParameter() {ParameterName="CARGO",Value=Data.CARGO ?? (object)DBNull.Value,DbType=System.Data.DbType.String},
                    new CParameter() {ParameterName="DIRECCION",Value=Data.DIRECCION ?? (object)DBNull.Value,DbType=System.Data.DbType.String},
                    new CParameter() {ParameterName="TELEFONO",Value=Data.TELEFONO ?? (object)DBNull.Value,DbType=System.Data.DbType.String},
                    new CParameter() {ParameterName="EMAIL",Value=Data.EMAIL ?? (object)DBNull.Value,DbType=System.Data.DbType.String},
                    new CParameter() {ParameterName="CORR_SECTOR_LABORAL",Value=Data.CORR_SECTOR_LABORAL ?? (object)DBNull.Value,DbType=System.Data.DbType.Int32},
                    new CParameter() {ParameterName="CORR_PAIS",Value=Data.CORR_PAIS ?? (object)DBNull.Value,DbType=System.Data.DbType.Int32},
                    new CParameter() {ParameterName="CORR_DEPTO",Value=Data.CORR_DEPTO ?? (object)DBNull.Value,DbType=System.Data.DbType.Int32},
                    new CParameter() {ParameterName="CORR_MUNICIPIO",Value=Data.CORR_MUNICIPIO ?? (object)DBNull.Value,DbType=System.Data.DbType.Int32},
                    new CParameter() {ParameterName="TRABAJA_AUN",Value=true,DbType=System.Data.DbType.Boolean},
                    new CParameter() {ParameterName="TIENE_EMPLEO_FUERA",Value=Data.TIENE_EMPLEO_FUERA ?? false,DbType=System.Data.DbType.Boolean},
                    new CParameter() {ParameterName="SALARIO_MENSUAL",Value=Data.SALARIO_MENSUAL ?? (object)DBNull.Value,DbType=System.Data.DbType.Decimal},
                    new CParameter() {ParameterName="APORTE_LIQUIDO",Value=Data.APORTE_LIQUIDO ?? (object)DBNull.Value,DbType=System.Data.DbType.Decimal},
                    new CParameter() {ParameterName="USUARIO_CREA",Value=Data.USUARIO_CREA ?? "",DbType=System.Data.DbType.String},
                    new CParameter() {ParameterName="ESTACION_CREA",Value=Data.ESTACION_CREA ?? "",DbType=System.Data.DbType.String},
                    new CParameter() {ParameterName="FECHA_CREA",Value=Data.FECHA_CREA,DbType=System.Data.DbType.DateTime},
                };

                await objData.ExecCmd(System.Data.CommandType.Text, _SqlInsertEmpleo, true, pIns);

                // Red de seguridad: la bandera de la persona sigue a los datos.
                await ActualizarTrabajaAsync(Data.CORR_PROSPECTO_PERSONA, true, Data.USUARIO_CREA, Data.ESTACION_CREA);

                reader = await objData.GetDataReader(_ViewName, pPersona);
                var response = new List<ACA_PROSPECTO_EMPLEOView>().FromDataReader(reader).FirstOrDefault();
                reader.Close();
                reader = null;

                objResultado.Data = response;
                objResultado.Result = true;
                objResultado.RowsAffected = 1;
                objResultado.CodeHelper = response?.CORR_PROSPECTO_EMPLEO ?? 0;
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

        private const string _SqlInsertEmpleo =
            "INSERT INTO ACA_PROSPECTO_EMPLEO (CORR_PROSPECTO_PERSONA, EMPRESA, CARGO, DIRECCION, TELEFONO, EMAIL, CORR_SECTOR_LABORAL, " +
            "CORR_PAIS, CORR_DEPTO, CORR_MUNICIPIO, TRABAJA_AUN, TIENE_EMPLEO_FUERA, SALARIO_MENSUAL, APORTE_LIQUIDO, USUARIO_CREA, ESTACION_CREA, FECHA_CREA) " +
            "VALUES (@CORR_PROSPECTO_PERSONA, @EMPRESA, @CARGO, @DIRECCION, @TELEFONO, @EMAIL, @CORR_SECTOR_LABORAL, " +
            "@CORR_PAIS, @CORR_DEPTO, @CORR_MUNICIPIO, @TRABAJA_AUN, @TIENE_EMPLEO_FUERA, @SALARIO_MENSUAL, @APORTE_LIQUIDO, @USUARIO_CREA, @ESTACION_CREA, @FECHA_CREA)";

        // Qué hace: deja PERSONA.TRABAJA igual a la existencia del empleo (1 al crear, 0 al eliminar).
        // Cómo lo hace: objData.Update sobre ACA_PROSPECTO_PERSONA por CORR_PROSPECTO_PERSONA; cierra el reader.
        private async Task ActualizarTrabajaAsync(int corrPersona, bool trabaja, string usuario, string estacion)
        {
            var p = new List<CParameter>
            {
                new CParameter() {ParameterName="TRABAJA",Value=trabaja,DbType=System.Data.DbType.Boolean},
                new CParameter() {ParameterName="USUARIO_ACTU",Value=usuario ?? "",DbType=System.Data.DbType.String},
                new CParameter() {ParameterName="ESTACION_ACTU",Value=estacion ?? "",DbType=System.Data.DbType.String},
                new CParameter() {ParameterName="FECHA_ACTU",Value=DateTime.Now,DbType=System.Data.DbType.DateTime},
            };
            var pWhere = new List<CParameter>
            {
                new CParameter() {ParameterName="CORR_PROSPECTO_PERSONA",Value=corrPersona,DbType=System.Data.DbType.Int32},
            };

            var reader = await objData.Update("ACA_PROSPECTO_PERSONA", p, pWhere);
            reader.Close();
            objData.objConnection.Close();
        }

        // Qué hace: actualiza la información laboral del prospecto.
        // Cómo lo hace: objData.Update sobre ACA_PROSPECTO_EMPLEO por CORR_PROSPECTO_EMPLEO y relee
        //               V_ACA_PROSPECTO_EMPLEO. Guarda CORR_PAIS (el portal lo deja en NULL).
        public async Task<CResult> UpdateAsync(ACA_PROSPECTO_EMPLEOTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            CResult objResultado = new();

            try
            {
                var p = new List<CParameter>
                {
                    new CParameter() {ParameterName="EMPRESA",Value=Data.EMPRESA ?? (object)DBNull.Value,DbType=System.Data.DbType.String},
                    new CParameter() {ParameterName="CARGO",Value=Data.CARGO ?? (object)DBNull.Value,DbType=System.Data.DbType.String},
                    new CParameter() {ParameterName="DIRECCION",Value=Data.DIRECCION ?? (object)DBNull.Value,DbType=System.Data.DbType.String},
                    new CParameter() {ParameterName="TELEFONO",Value=Data.TELEFONO ?? (object)DBNull.Value,DbType=System.Data.DbType.String},
                    new CParameter() {ParameterName="EMAIL",Value=Data.EMAIL ?? (object)DBNull.Value,DbType=System.Data.DbType.String},
                    new CParameter() {ParameterName="CORR_SECTOR_LABORAL",Value=Data.CORR_SECTOR_LABORAL ?? (object)DBNull.Value,DbType=System.Data.DbType.Int32},
                    new CParameter() {ParameterName="CORR_PAIS",Value=Data.CORR_PAIS ?? (object)DBNull.Value,DbType=System.Data.DbType.Int32},
                    new CParameter() {ParameterName="CORR_DEPTO",Value=Data.CORR_DEPTO ?? (object)DBNull.Value,DbType=System.Data.DbType.Int32},
                    new CParameter() {ParameterName="CORR_MUNICIPIO",Value=Data.CORR_MUNICIPIO ?? (object)DBNull.Value,DbType=System.Data.DbType.Int32},
                    new CParameter() {ParameterName="TRABAJA_AUN",Value=Data.TRABAJA_AUN ?? (object)DBNull.Value,DbType=System.Data.DbType.Boolean},
                    new CParameter() {ParameterName="TIENE_EMPLEO_FUERA",Value=Data.TIENE_EMPLEO_FUERA ?? (object)DBNull.Value,DbType=System.Data.DbType.Boolean},
                    new CParameter() {ParameterName="SALARIO_MENSUAL",Value=Data.SALARIO_MENSUAL ?? (object)DBNull.Value,DbType=System.Data.DbType.Decimal},
                    new CParameter() {ParameterName="APORTE_LIQUIDO",Value=Data.APORTE_LIQUIDO ?? (object)DBNull.Value,DbType=System.Data.DbType.Decimal},
                    new CParameter() {ParameterName="USUARIO_ACTU",Value=Data.USUARIO_ACTU,DbType=System.Data.DbType.String},
                    new CParameter() {ParameterName="ESTACION_ACTU",Value=Data.ESTACION_ACTU,DbType=System.Data.DbType.String},
                    new CParameter() {ParameterName="FECHA_ACTU",Value=Data.FECHA_ACTU,DbType=System.Data.DbType.DateTime},
                };

                var pWhere = new List<CParameter>
                {
                    new CParameter() {ParameterName="CORR_PROSPECTO_EMPLEO",Value=Data.CORR_PROSPECTO_EMPLEO,DbType=System.Data.DbType.Int32},
                };

                var reader = await objData.Update(_TableName, p, pWhere);
                var response = new List<ACA_PROSPECTO_EMPLEOView>().FromDataReader(reader).FirstOrDefault();

                reader.Close();
                reader = null;

                objResultado.Data = response;
                objResultado.Result = true;
                objResultado.RowsAffected = 1;
                objResultado.CodeHelper = Data.CORR_PROSPECTO_EMPLEO;
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

        // Qué hace: elimina la información laboral del prospecto y deja TRABAJA = 0 en la persona.
        // Cómo lo hace: lee la fila por PK para conocer la persona, borra por PK y actualiza la bandera.
        public async Task<CResult> DeleteAsync(ACA_PROSPECTO_EMPLEOTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            CResult objResultado = new();

            try
            {
                var pPk = new List<CParameter>
                {
                    new CParameter() {ParameterName="CORR_PROSPECTO_EMPLEO",Value=Data.CORR_PROSPECTO_EMPLEO,DbType=System.Data.DbType.Int32},
                };

                var reader = await objData.GetDataReader(_ViewName, pPk);
                var fila = new List<ACA_PROSPECTO_EMPLEOView>().FromDataReader(reader).FirstOrDefault();
                reader.Close();
                objData.objConnection.Close();

                if (fila == null)
                    throw new System.Exception("La información laboral indicada no existe.");

                var filas = (int)await objData.Delete(_TableName, pPk);
                await ActualizarTrabajaAsync(fila.CORR_PROSPECTO_PERSONA, false, vLOGIN_SISTEMA, vESTACION);

                objResultado.Data = null;
                objResultado.Result = true;
                objResultado.RowsAffected = filas;
                objResultado.CodeHelper = Data.CORR_PROSPECTO_EMPLEO;
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
