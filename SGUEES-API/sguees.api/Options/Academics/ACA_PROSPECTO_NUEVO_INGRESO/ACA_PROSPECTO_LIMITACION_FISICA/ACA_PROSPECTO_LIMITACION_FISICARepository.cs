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
    public class ACA_PROSPECTO_LIMITACION_FISICARepository : BaseRepository<ACA_PROSPECTO_LIMITACION_FISICATable>, IACA_PROSPECTO_LIMITACION_FISICARepository
    {
        private const string _TableName = "ACA_PROSPECTO_LIMITACION_FISICA";
        private const string _ViewName = "V_ACA_PROSPECTO_LIMITACION_FISICA";

        public ACA_PROSPECTO_LIMITACION_FISICARepository(IConfiguration config) :
                base(config.GetConnectionString("defaultConnection"),
                     config.GetSection("DbProvider:defaultProvider").Value)
        {
        }

        // Qué hace: limitaciones físicas declaradas por el prospecto.
        // Cómo lo hace: lee V_ACA_PROSPECTO_LIMITACION_FISICA ordenado por CORR_PROSPECTO_LIMITACION_FISICA.
        public async Task<CResult> GetAllAsync(List<CParameter> xWhere)
        {
            CResult objResultado = new();

            try
            {
                var reader = await objData.GetDataReader(_ViewName, xWhere, "CORR_PROSPECTO_LIMITACION_FISICA");
                var response = new List<ACA_PROSPECTO_LIMITACION_FISICAView>().FromDataReader(reader).ToList();

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
                var response = new List<ACA_PROSPECTO_LIMITACION_FISICAView>().FromDataReader(reader).FirstOrDefault();

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

        // Qué hace: agrega una limitación física del prospecto.
        // Cómo lo hace: la llave es IDENTITY, así que inserta con ExecCmd. Rechaza repetir la misma
        //               limitación para la persona (la tabla tiene índice único) con un mensaje claro y
        //               deja POSEE_DISCAPACIDAD = 1 en la persona: la declaración se deriva del detalle.
        public async Task<CResult> CreateAsync(ACA_PROSPECTO_LIMITACION_FISICATable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            CResult objResultado = new();

            try
            {
                var existentes = await LeerPorPersonaAsync(Data.CORR_PROSPECTO_PERSONA);
                if (existentes.Any(l => l.CORR_LIMITACION_FISICA == Data.CORR_LIMITACION_FISICA))
                    throw new System.Exception("El prospecto ya tiene registrada esa limitación física.");

                await objData.ExecCmd(System.Data.CommandType.Text, _SqlInsertLimitacion, true, ParametrosLimitacion(Data, true));
                await ActualizarBanderaAsync(Data.CORR_PROSPECTO_PERSONA, true, Data.USUARIO_CREA, Data.ESTACION_CREA);

                var creado = (await LeerPorPersonaAsync(Data.CORR_PROSPECTO_PERSONA))
                    .OrderByDescending(l => l.CORR_PROSPECTO_LIMITACION_FISICA)
                    .FirstOrDefault();

                objResultado.Data = creado;
                objResultado.Result = true;
                objResultado.RowsAffected = 1;
                objResultado.CodeHelper = creado?.CORR_PROSPECTO_LIMITACION_FISICA ?? 0;
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

        // Qué hace: actualiza una limitación física (limitación del catálogo y detalle).
        public async Task<CResult> UpdateAsync(ACA_PROSPECTO_LIMITACION_FISICATable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            CResult objResultado = new();

            try
            {
                var actual = await LeerPorLlaveAsync(Data.CORR_PROSPECTO_LIMITACION_FISICA);
                if (actual == null)
                    throw new System.Exception("La limitación ya no existe.");

                var repetida = (await LeerPorPersonaAsync(actual.CORR_PROSPECTO_PERSONA))
                    .Any(l => l.CORR_LIMITACION_FISICA == Data.CORR_LIMITACION_FISICA && l.CORR_PROSPECTO_LIMITACION_FISICA != Data.CORR_PROSPECTO_LIMITACION_FISICA);
                if (repetida)
                    throw new System.Exception("El prospecto ya tiene registrada esa limitación física.");

                var pWhere = new List<CParameter>
                {
                    new CParameter() {ParameterName="CORR_PROSPECTO_LIMITACION_FISICA",Value=Data.CORR_PROSPECTO_LIMITACION_FISICA,DbType=System.Data.DbType.Int32},
                };

                var reader = await objData.Update(_TableName, ParametrosLimitacion(Data, false), pWhere);
                var response = new List<ACA_PROSPECTO_LIMITACION_FISICAView>().FromDataReader(reader).FirstOrDefault();

                reader.Close();
                reader = null;

                objResultado.Data = response;
                objResultado.Result = true;
                objResultado.RowsAffected = 1;
                objResultado.CodeHelper = Data.CORR_PROSPECTO_LIMITACION_FISICA;
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

        // Qué hace: elimina una limitación física; si era la última, apaga POSEE_DISCAPACIDAD.
        public async Task<CResult> DeleteAsync(ACA_PROSPECTO_LIMITACION_FISICATable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            CResult objResultado = new();

            try
            {
                var actual = await LeerPorLlaveAsync(Data.CORR_PROSPECTO_LIMITACION_FISICA);

                var pWhere = new List<CParameter>
                {
                    new CParameter() {ParameterName="CORR_PROSPECTO_LIMITACION_FISICA",Value=Data.CORR_PROSPECTO_LIMITACION_FISICA,DbType=System.Data.DbType.Int32},
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
                objResultado.CodeHelper = Data.CORR_PROSPECTO_LIMITACION_FISICA;
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

        private async Task<List<ACA_PROSPECTO_LIMITACION_FISICAView>> LeerPorPersonaAsync(int corrPersona)
        {
            var p = new List<CParameter>
            {
                new CParameter() {ParameterName="CORR_PROSPECTO_PERSONA",Value=corrPersona,DbType=System.Data.DbType.Int32},
            };

            var reader = await objData.GetDataReader(_ViewName, p);
            var filas = new List<ACA_PROSPECTO_LIMITACION_FISICAView>().FromDataReader(reader).ToList();
            reader.Close();
            objData.objConnection.Close();

            return filas;
        }

        private async Task<ACA_PROSPECTO_LIMITACION_FISICAView> LeerPorLlaveAsync(int corrLimitacion)
        {
            var p = new List<CParameter>
            {
                new CParameter() {ParameterName="CORR_PROSPECTO_LIMITACION_FISICA",Value=corrLimitacion,DbType=System.Data.DbType.Int32},
            };

            var reader = await objData.GetDataReader(_ViewName, p);
            var fila = new List<ACA_PROSPECTO_LIMITACION_FISICAView>().FromDataReader(reader).FirstOrDefault();
            reader.Close();
            objData.objConnection.Close();

            return fila;
        }

        // Qué hace: deja PERSONA.POSEE_DISCAPACIDAD igual a "tiene al menos una limitación" (espejo del
        //           detalle, como TRABAJA con el empleo). Misma mecánica que ActualizarTrabajaAsync.
        private async Task ActualizarBanderaAsync(int corrPersona, bool posee, string usuario, string estacion)
        {
            var p = new List<CParameter>
            {
                new CParameter() {ParameterName="POSEE_DISCAPACIDAD",Value=posee,DbType=System.Data.DbType.Boolean},
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

        private static List<CParameter> ParametrosLimitacion(ACA_PROSPECTO_LIMITACION_FISICATable Data, bool esAlta)
        {
            var p = new List<CParameter>();

            if (esAlta)
            {
                p.Add(new CParameter() { ParameterName = "CORR_PROSPECTO_PERSONA", Value = Data.CORR_PROSPECTO_PERSONA, DbType = System.Data.DbType.Int32 });
            }

            p.Add(new CParameter() { ParameterName = "CORR_LIMITACION_FISICA", Value = Data.CORR_LIMITACION_FISICA, DbType = System.Data.DbType.Int32 });
            p.Add(new CParameter() { ParameterName = "ESPECIFIQUE", Value = Data.ESPECIFIQUE ?? (object)DBNull.Value, DbType = System.Data.DbType.String });

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

        private const string _SqlInsertLimitacion =
            "INSERT INTO ACA_PROSPECTO_LIMITACION_FISICA (CORR_PROSPECTO_PERSONA, CORR_LIMITACION_FISICA, ESPECIFIQUE, USUARIO_CREA, ESTACION_CREA, FECHA_CREA) " +
            "VALUES (@CORR_PROSPECTO_PERSONA, @CORR_LIMITACION_FISICA, @ESPECIFIQUE, @USUARIO_CREA, @ESTACION_CREA, @FECHA_CREA)";
    }
}
