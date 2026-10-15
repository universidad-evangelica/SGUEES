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
    public class ACA_PROSPECTO_DEPORTACIONRepository : BaseRepository<ACA_PROSPECTO_DEPORTACIONTable>, IACA_PROSPECTO_DEPORTACIONRepository
    {
        private const string _TableName = "ACA_PROSPECTO_DEPORTACION";
        private const string _ViewName = "V_ACA_PROSPECTO_DEPORTACION";

        public ACA_PROSPECTO_DEPORTACIONRepository(IConfiguration config) :
                base(config.GetConnectionString("defaultConnection"),
                     config.GetSection("DbProvider:defaultProvider").Value)
        {
        }

        // Qué hace: deportaciones declaradas por el prospecto.
        // Cómo lo hace: lee V_ACA_PROSPECTO_DEPORTACION ordenado por CORR_PROSPECTO_DEPORTACION.
        public async Task<CResult> GetAllAsync(List<CParameter> xWhere)
        {
            CResult objResultado = new();

            try
            {
                var reader = await objData.GetDataReader(_ViewName, xWhere, "CORR_PROSPECTO_DEPORTACION");
                var response = new List<ACA_PROSPECTO_DEPORTACIONView>().FromDataReader(reader).ToList();

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
                var response = new List<ACA_PROSPECTO_DEPORTACIONView>().FromDataReader(reader).FirstOrDefault();

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

        // Qué hace: agrega una deportación del prospecto.
        // Cómo lo hace: la llave es IDENTITY, así que inserta con ExecCmd, y deja HA_SIDO_DEPORTADO = 1
        //               en la persona: la declaración se deriva del detalle. Regla de negocio: una sola
        //               deportación por país (si lo deportaron dos veces del mismo país, interesa la
        //               última, que se edita); la tabla no tiene índice único, lo cuida el API.
        public async Task<CResult> CreateAsync(ACA_PROSPECTO_DEPORTACIONTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            CResult objResultado = new();

            try
            {
                var existentes = await LeerPorPersonaAsync(Data.CORR_PROSPECTO_PERSONA);
                if (existentes.Any(d => d.CORR_PAIS == Data.CORR_PAIS))
                    throw new System.Exception("El prospecto ya tiene registrada una deportación de ese país; modifique esa fila.");

                await objData.ExecCmd(System.Data.CommandType.Text, _SqlInsertDeportacion, true, ParametrosDeportacion(Data, true));
                await ActualizarBanderaAsync(Data.CORR_PROSPECTO_PERSONA, true, Data.USUARIO_CREA, Data.ESTACION_CREA);

                var creado = (await LeerPorPersonaAsync(Data.CORR_PROSPECTO_PERSONA))
                    .OrderByDescending(d => d.CORR_PROSPECTO_DEPORTACION)
                    .FirstOrDefault();

                objResultado.Data = creado;
                objResultado.Result = true;
                objResultado.RowsAffected = 1;
                objResultado.CodeHelper = creado?.CORR_PROSPECTO_DEPORTACION ?? 0;
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

        // Qué hace: actualiza una deportación (país, vigente, observación), sin repetir el país.
        public async Task<CResult> UpdateAsync(ACA_PROSPECTO_DEPORTACIONTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            CResult objResultado = new();

            try
            {
                var actual = await LeerPorLlaveAsync(Data.CORR_PROSPECTO_DEPORTACION);
                if (actual == null)
                    throw new System.Exception("La deportación ya no existe.");

                var repetida = (await LeerPorPersonaAsync(actual.CORR_PROSPECTO_PERSONA))
                    .Any(d => d.CORR_PAIS == Data.CORR_PAIS && d.CORR_PROSPECTO_DEPORTACION != Data.CORR_PROSPECTO_DEPORTACION);
                if (repetida)
                    throw new System.Exception("El prospecto ya tiene registrada una deportación de ese país; modifique esa fila.");

                var pWhere = new List<CParameter>
                {
                    new CParameter() {ParameterName="CORR_PROSPECTO_DEPORTACION",Value=Data.CORR_PROSPECTO_DEPORTACION,DbType=System.Data.DbType.Int32},
                };

                var reader = await objData.Update(_TableName, ParametrosDeportacion(Data, false), pWhere);
                var response = new List<ACA_PROSPECTO_DEPORTACIONView>().FromDataReader(reader).FirstOrDefault();

                reader.Close();
                reader = null;

                objResultado.Data = response;
                objResultado.Result = true;
                objResultado.RowsAffected = 1;
                objResultado.CodeHelper = Data.CORR_PROSPECTO_DEPORTACION;
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

        // Qué hace: elimina una deportación; si era la última, apaga HA_SIDO_DEPORTADO.
        public async Task<CResult> DeleteAsync(ACA_PROSPECTO_DEPORTACIONTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            CResult objResultado = new();

            try
            {
                var actual = await LeerPorLlaveAsync(Data.CORR_PROSPECTO_DEPORTACION);

                var pWhere = new List<CParameter>
                {
                    new CParameter() {ParameterName="CORR_PROSPECTO_DEPORTACION",Value=Data.CORR_PROSPECTO_DEPORTACION,DbType=System.Data.DbType.Int32},
                };

                await objData.Delete(_TableName, pWhere);

                if (actual != null)
                {
                    var restantes = await LeerPorPersonaAsync(actual.CORR_PROSPECTO_PERSONA);
                    await ActualizarBanderaAsync(actual.CORR_PROSPECTO_PERSONA, restantes.Count > 0, vLOGIN_SISTEMA, vESTACION);
                }

                objResultado.Data = null;
                objResultado.Result = true;
                objResultado.RowsAffected = 1;
                objResultado.CodeHelper = Data.CORR_PROSPECTO_DEPORTACION;
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

        private async Task<List<ACA_PROSPECTO_DEPORTACIONView>> LeerPorPersonaAsync(int corrPersona)
        {
            var p = new List<CParameter>
            {
                new CParameter() {ParameterName="CORR_PROSPECTO_PERSONA",Value=corrPersona,DbType=System.Data.DbType.Int32},
            };

            var reader = await objData.GetDataReader(_ViewName, p);
            var filas = new List<ACA_PROSPECTO_DEPORTACIONView>().FromDataReader(reader).ToList();
            reader.Close();
            objData.objConnection.Close();

            return filas;
        }

        private async Task<ACA_PROSPECTO_DEPORTACIONView> LeerPorLlaveAsync(int corrDeportacion)
        {
            var p = new List<CParameter>
            {
                new CParameter() {ParameterName="CORR_PROSPECTO_DEPORTACION",Value=corrDeportacion,DbType=System.Data.DbType.Int32},
            };

            var reader = await objData.GetDataReader(_ViewName, p);
            var fila = new List<ACA_PROSPECTO_DEPORTACIONView>().FromDataReader(reader).FirstOrDefault();
            reader.Close();
            objData.objConnection.Close();

            return fila;
        }

        // Qué hace: deja PERSONA.HA_SIDO_DEPORTADO igual a "tiene al menos una deportación" (espejo del
        //           detalle, como TRABAJA con el empleo).
        private async Task ActualizarBanderaAsync(int corrPersona, bool deportado, string usuario, string estacion)
        {
            var p = new List<CParameter>
            {
                new CParameter() {ParameterName="HA_SIDO_DEPORTADO",Value=deportado,DbType=System.Data.DbType.Boolean},
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

        private static List<CParameter> ParametrosDeportacion(ACA_PROSPECTO_DEPORTACIONTable Data, bool esAlta)
        {
            var p = new List<CParameter>();

            if (esAlta)
            {
                p.Add(new CParameter() { ParameterName = "CORR_PROSPECTO_PERSONA", Value = Data.CORR_PROSPECTO_PERSONA, DbType = System.Data.DbType.Int32 });
            }

            p.Add(new CParameter() { ParameterName = "CORR_PAIS", Value = Data.CORR_PAIS, DbType = System.Data.DbType.Int32 });
            p.Add(new CParameter() { ParameterName = "ES_VIGENTE", Value = Data.ES_VIGENTE, DbType = System.Data.DbType.Boolean });
            p.Add(new CParameter() { ParameterName = "OBSERVACION", Value = Data.OBSERVACION ?? (object)DBNull.Value, DbType = System.Data.DbType.String });

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

        private const string _SqlInsertDeportacion =
            "INSERT INTO ACA_PROSPECTO_DEPORTACION (CORR_PROSPECTO_PERSONA, CORR_PAIS, ES_VIGENTE, OBSERVACION, USUARIO_CREA, ESTACION_CREA, FECHA_CREA) " +
            "VALUES (@CORR_PROSPECTO_PERSONA, @CORR_PAIS, @ES_VIGENTE, @OBSERVACION, @USUARIO_CREA, @ESTACION_CREA, @FECHA_CREA)";
    }
}
