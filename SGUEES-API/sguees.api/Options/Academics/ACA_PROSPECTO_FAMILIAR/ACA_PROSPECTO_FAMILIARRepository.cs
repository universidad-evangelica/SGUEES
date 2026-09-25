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
    public class ACA_PROSPECTO_FAMILIARRepository : BaseRepository<ACA_PROSPECTO_FAMILIARTable>, IACA_PROSPECTO_FAMILIARRepository
    {
        private const string _TableName = "ACA_PROSPECTO_FAMILIAR";
        private const string _ViewName = "V_ACA_PROSPECTO_FAMILIAR";

        public ACA_PROSPECTO_FAMILIARRepository(IConfiguration config) :
                base(config.GetConnectionString("defaultConnection"),
                     config.GetSection("DbProvider:defaultProvider").Value)
        {
        }

        // Qué hace: familiares y contacto de emergencia del prospecto.
        // Cómo lo hace: lee V_ACA_PROSPECTO_FAMILIAR ordenado por ES_NUCLEO DESC, CORR_PARENTESCO, CORR_PROSPECTO_FAMILIAR.
        public async Task<CResult> GetAllAsync(List<CParameter> xWhere)
        {
            CResult objResultado = new();

            try
            {
                var reader = await objData.GetDataReader(_ViewName, xWhere, "ES_NUCLEO DESC, CORR_PARENTESCO, CORR_PROSPECTO_FAMILIAR");
                var response = new List<ACA_PROSPECTO_FAMILIARView>().FromDataReader(reader).ToList();

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
                var response = new List<ACA_PROSPECTO_FAMILIARView>().FromDataReader(reader).FirstOrDefault();

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

        // Qué hace: agrega un familiar al prospecto.
        // Cómo lo hace: CORR_PROSPECTO_FAMILIAR es IDENTITY, así que inserta con ExecCmd (objData.Insert
        //               calcula MAX+1 y no aplica). Si viene marcado como contacto de emergencia, se lo
        //               quita a los demás; devuelve la fila creada leída de la vista.
        public async Task<CResult> CreateAsync(ACA_PROSPECTO_FAMILIARTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            CResult objResultado = new();

            try
            {
                await objData.ExecCmd(System.Data.CommandType.Text, _SqlInsertFamiliar, true, ParametrosFamiliar(Data, true));

                var creado = (await LeerPorPersonaAsync(Data.CORR_PROSPECTO_PERSONA))
                    .OrderByDescending(f => f.CORR_PROSPECTO_FAMILIAR)
                    .FirstOrDefault();

                if (Data.ES_EMERGENCIA == true && creado != null)
                {
                    await QuitarEmergenciaAsync(Data.CORR_PROSPECTO_PERSONA, creado.CORR_PROSPECTO_FAMILIAR, Data.USUARIO_CREA, Data.ESTACION_CREA);
                }

                objResultado.Data = creado;
                objResultado.Result = true;
                objResultado.RowsAffected = 1;
                objResultado.CodeHelper = creado?.CORR_PROSPECTO_FAMILIAR ?? 0;
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

        // Qué hace: actualiza un familiar del prospecto.
        // Cómo lo hace: objData.Update por CORR_PROSPECTO_FAMILIAR; si queda marcado como contacto de
        //               emergencia, se lo quita a los demás familiares de la misma persona.
        public async Task<CResult> UpdateAsync(ACA_PROSPECTO_FAMILIARTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            CResult objResultado = new();

            try
            {
                var pWhere = new List<CParameter>
                {
                    new CParameter() {ParameterName="CORR_PROSPECTO_FAMILIAR",Value=Data.CORR_PROSPECTO_FAMILIAR,DbType=System.Data.DbType.Int32},
                };

                var reader = await objData.Update(_TableName, ParametrosFamiliar(Data, false), pWhere);
                var response = new List<ACA_PROSPECTO_FAMILIARView>().FromDataReader(reader).FirstOrDefault();

                reader.Close();
                reader = null;
                objData.objConnection.Close();

                if (Data.ES_EMERGENCIA == true)
                {
                    var corrPersona = response?.CORR_PROSPECTO_PERSONA ?? Data.CORR_PROSPECTO_PERSONA;
                    await QuitarEmergenciaAsync(corrPersona, Data.CORR_PROSPECTO_FAMILIAR, Data.USUARIO_ACTU, Data.ESTACION_ACTU);
                }

                objResultado.Data = response;
                objResultado.Result = true;
                objResultado.RowsAffected = 1;
                objResultado.CodeHelper = Data.CORR_PROSPECTO_FAMILIAR;
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

        // Qué hace: elimina un familiar del prospecto.
        public async Task<CResult> DeleteAsync(ACA_PROSPECTO_FAMILIARTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            CResult objResultado = new();

            try
            {
                var pWhere = new List<CParameter>
                {
                    new CParameter() {ParameterName="CORR_PROSPECTO_FAMILIAR",Value=Data.CORR_PROSPECTO_FAMILIAR,DbType=System.Data.DbType.Int32},
                };

                await objData.Delete(_TableName, pWhere);

                objResultado.Data = null;
                objResultado.Result = true;
                objResultado.RowsAffected = 1;
                objResultado.CodeHelper = Data.CORR_PROSPECTO_FAMILIAR;
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

        // Qué hace: familiares de una persona leídos de la vista.
        private async Task<List<ACA_PROSPECTO_FAMILIARView>> LeerPorPersonaAsync(int corrPersona)
        {
            var p = new List<CParameter>
            {
                new CParameter() {ParameterName="CORR_PROSPECTO_PERSONA",Value=corrPersona,DbType=System.Data.DbType.Int32},
            };

            var reader = await objData.GetDataReader(_ViewName, p);
            var filas = new List<ACA_PROSPECTO_FAMILIARView>().FromDataReader(reader).ToList();
            reader.Close();
            objData.objConnection.Close();

            return filas;
        }

        // Qué hace: deja un único contacto de emergencia por prospecto.
        // Cómo lo hace: apaga la marca y borra teléfono y dirección de emergencia en los demás
        //               familiares de la persona (esos datos solo tienen sentido en la fila marcada).
        private async Task QuitarEmergenciaAsync(int corrPersona, int corrFamiliar, string usuario, string estacion)
        {
            if (corrPersona <= 0) return;

            var p = new List<CParameter>
            {
                new CParameter() {ParameterName="CORR_PROSPECTO_PERSONA",Value=corrPersona,DbType=System.Data.DbType.Int32},
                new CParameter() {ParameterName="CORR_PROSPECTO_FAMILIAR",Value=corrFamiliar,DbType=System.Data.DbType.Int32},
                new CParameter() {ParameterName="USUARIO_ACTU",Value=usuario ?? "",DbType=System.Data.DbType.String},
                new CParameter() {ParameterName="ESTACION_ACTU",Value=estacion ?? "",DbType=System.Data.DbType.String},
                new CParameter() {ParameterName="FECHA_ACTU",Value=DateTime.Now,DbType=System.Data.DbType.DateTime},
            };

            await objData.ExecCmd(System.Data.CommandType.Text, _SqlQuitarEmergencia, true, p);
            objData.objConnection.Close();
        }

        // Qué hace: columnas del familiar para insertar o actualizar.
        private static List<CParameter> ParametrosFamiliar(ACA_PROSPECTO_FAMILIARTable Data, bool esAlta)
        {
            var p = new List<CParameter>();

            if (esAlta)
            {
                p.Add(new CParameter() { ParameterName = "CORR_PROSPECTO_PERSONA", Value = Data.CORR_PROSPECTO_PERSONA, DbType = System.Data.DbType.Int32 });
            }

            p.Add(new CParameter() { ParameterName = "CORR_PARENTESCO", Value = Data.CORR_PARENTESCO, DbType = System.Data.DbType.Int32 });
            p.Add(new CParameter() { ParameterName = "NOMBRES", Value = Data.NOMBRES ?? (object)DBNull.Value, DbType = System.Data.DbType.String });
            p.Add(new CParameter() { ParameterName = "APELLIDO1", Value = Data.APELLIDO1 ?? (object)DBNull.Value, DbType = System.Data.DbType.String });
            p.Add(new CParameter() { ParameterName = "APELLIDO2", Value = Data.APELLIDO2 ?? (object)DBNull.Value, DbType = System.Data.DbType.String });
            p.Add(new CParameter() { ParameterName = "TRABAJA", Value = Data.TRABAJA ?? false, DbType = System.Data.DbType.Boolean });
            p.Add(new CParameter() { ParameterName = "PROFESION", Value = Data.PROFESION ?? (object)DBNull.Value, DbType = System.Data.DbType.String });
            p.Add(new CParameter() { ParameterName = "OCUPACION", Value = Data.OCUPACION ?? (object)DBNull.Value, DbType = System.Data.DbType.String });
            p.Add(new CParameter() { ParameterName = "NOMBRE_EMPRESA", Value = Data.NOMBRE_EMPRESA ?? (object)DBNull.Value, DbType = System.Data.DbType.String });
            p.Add(new CParameter() { ParameterName = "TELEFONO_TRABAJO", Value = Data.TELEFONO_TRABAJO ?? (object)DBNull.Value, DbType = System.Data.DbType.String });
            p.Add(new CParameter() { ParameterName = "DIRECCION_TRABAJO", Value = Data.DIRECCION_TRABAJO ?? (object)DBNull.Value, DbType = System.Data.DbType.String });
            p.Add(new CParameter() { ParameterName = "DIRECCION_CASA", Value = Data.DIRECCION_CASA ?? (object)DBNull.Value, DbType = System.Data.DbType.String });
            p.Add(new CParameter() { ParameterName = "TELEFONO", Value = Data.TELEFONO ?? (object)DBNull.Value, DbType = System.Data.DbType.String });
            p.Add(new CParameter() { ParameterName = "TELEFONO2", Value = Data.TELEFONO2 ?? (object)DBNull.Value, DbType = System.Data.DbType.String });
            p.Add(new CParameter() { ParameterName = "VIVE_CON_EL", Value = Data.VIVE_CON_EL ?? false, DbType = System.Data.DbType.Boolean });
            p.Add(new CParameter() { ParameterName = "ACTIVO", Value = true, DbType = System.Data.DbType.Boolean });
            p.Add(new CParameter() { ParameterName = "ES_EMERGENCIA", Value = Data.ES_EMERGENCIA ?? false, DbType = System.Data.DbType.Boolean });
            p.Add(new CParameter() { ParameterName = "DIRECCION_EMERGENCIA", Value = Data.DIRECCION_EMERGENCIA ?? (object)DBNull.Value, DbType = System.Data.DbType.String });
            p.Add(new CParameter() { ParameterName = "TELEFONO_EMERGENCIA", Value = Data.TELEFONO_EMERGENCIA ?? (object)DBNull.Value, DbType = System.Data.DbType.String });
            p.Add(new CParameter() { ParameterName = "FINANCIA_ESTUDIOS", Value = Data.FINANCIA_ESTUDIOS ?? false, DbType = System.Data.DbType.Boolean });

            if (esAlta)
            {
                p.Add(new CParameter() { ParameterName = "USUARIO_CREA", Value = Data.USUARIO_CREA ?? "", DbType = System.Data.DbType.String });
                p.Add(new CParameter() { ParameterName = "ESTACION_CREA", Value = Data.ESTACION_CREA ?? "", DbType = System.Data.DbType.String });
                p.Add(new CParameter() { ParameterName = "FECHA_CREA", Value = Data.FECHA_CREA, DbType = System.Data.DbType.DateTime });
            }
            else
            {
                p.Add(new CParameter() { ParameterName = "USUARIO_ACTU", Value = Data.USUARIO_ACTU, DbType = System.Data.DbType.String });
                p.Add(new CParameter() { ParameterName = "ESTACION_ACTU", Value = Data.ESTACION_ACTU, DbType = System.Data.DbType.String });
                p.Add(new CParameter() { ParameterName = "FECHA_ACTU", Value = Data.FECHA_ACTU, DbType = System.Data.DbType.DateTime });
            }

            return p;
        }

        private const string _SqlInsertFamiliar =
            "INSERT INTO ACA_PROSPECTO_FAMILIAR (CORR_PROSPECTO_PERSONA, CORR_PARENTESCO, NOMBRES, APELLIDO1, APELLIDO2, TRABAJA, PROFESION, " +
            "OCUPACION, NOMBRE_EMPRESA, TELEFONO_TRABAJO, DIRECCION_TRABAJO, DIRECCION_CASA, TELEFONO, TELEFONO2, VIVE_CON_EL, ACTIVO, " +
            "ES_EMERGENCIA, DIRECCION_EMERGENCIA, TELEFONO_EMERGENCIA, FINANCIA_ESTUDIOS, USUARIO_CREA, ESTACION_CREA, FECHA_CREA) " +
            "VALUES (@CORR_PROSPECTO_PERSONA, @CORR_PARENTESCO, @NOMBRES, @APELLIDO1, @APELLIDO2, @TRABAJA, @PROFESION, " +
            "@OCUPACION, @NOMBRE_EMPRESA, @TELEFONO_TRABAJO, @DIRECCION_TRABAJO, @DIRECCION_CASA, @TELEFONO, @TELEFONO2, @VIVE_CON_EL, @ACTIVO, " +
            "@ES_EMERGENCIA, @DIRECCION_EMERGENCIA, @TELEFONO_EMERGENCIA, @FINANCIA_ESTUDIOS, @USUARIO_CREA, @ESTACION_CREA, @FECHA_CREA)";

        private const string _SqlQuitarEmergencia =
            "UPDATE ACA_PROSPECTO_FAMILIAR SET ES_EMERGENCIA = 0, TELEFONO_EMERGENCIA = NULL, DIRECCION_EMERGENCIA = NULL, " +
            "USUARIO_ACTU = @USUARIO_ACTU, ESTACION_ACTU = @ESTACION_ACTU, FECHA_ACTU = @FECHA_ACTU " +
            "WHERE CORR_PROSPECTO_PERSONA = @CORR_PROSPECTO_PERSONA AND CORR_PROSPECTO_FAMILIAR <> @CORR_PROSPECTO_FAMILIAR AND ES_EMERGENCIA = 1";
    }
}
