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
    public class ACA_PROSPECTO_MEDIO_ORIGENRepository : BaseRepository<ACA_PROSPECTO_MEDIO_ORIGENTable>, IACA_PROSPECTO_MEDIO_ORIGENRepository
    {
        private const string _TableName = "ACA_PROSPECTO_MEDIO_ORIGEN";
        private const string _ViewName = "V_ACA_PROSPECTO_MEDIO_ORIGEN";

        public ACA_PROSPECTO_MEDIO_ORIGENRepository(IConfiguration config) :
                base(config.GetConnectionString("defaultConnection"),
                     config.GetSection("DbProvider:defaultProvider").Value)
        {
        }

        // Qué hace: medios por los que el prospecto conoció la universidad.
        // Cómo lo hace: lee V_ACA_PROSPECTO_MEDIO_ORIGEN ordenado por ORDEN_MEDIO, CORR_PROSPECTO_MEDIO.
        public async Task<CResult> GetAllAsync(List<CParameter> xWhere)
        {
            CResult objResultado = new();

            try
            {
                var reader = await objData.GetDataReader(_ViewName, xWhere, "ORDEN_MEDIO, CORR_PROSPECTO_MEDIO");
                var response = new List<ACA_PROSPECTO_MEDIO_ORIGENView>().FromDataReader(reader).ToList();

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
                var response = new List<ACA_PROSPECTO_MEDIO_ORIGENView>().FromDataReader(reader).FirstOrDefault();

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

        // Qué hace: agrega un medio de origen del prospecto.
        // Cómo lo hace: la llave es IDENTITY, así que inserta con ExecCmd. Antes verifica que el medio
        //               no esté repetido (la tabla tiene índice único por persona y medio) y deja solo
        //               los campos que ese medio usa.
        public async Task<CResult> CreateAsync(ACA_PROSPECTO_MEDIO_ORIGENTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            CResult objResultado = new();

            try
            {
                var existentes = await LeerPorPersonaAsync(Data.CORR_PROSPECTO_PERSONA);
                if (existentes.Any(m => m.CORR_MEDIO_ORIGEN == Data.CORR_MEDIO_ORIGEN))
                    throw new System.Exception("El prospecto ya tiene registrado ese medio.");

                await AjustarCamposPorMedioAsync(Data);
                await objData.ExecCmd(System.Data.CommandType.Text, _SqlInsertMedio, true, ParametrosMedio(Data, true));

                var creado = (await LeerPorPersonaAsync(Data.CORR_PROSPECTO_PERSONA))
                    .OrderByDescending(m => m.CORR_PROSPECTO_MEDIO)
                    .FirstOrDefault();

                objResultado.Data = creado;
                objResultado.Result = true;
                objResultado.RowsAffected = 1;
                objResultado.CodeHelper = creado?.CORR_PROSPECTO_MEDIO ?? 0;
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

        // Qué hace: actualiza un medio de origen del prospecto (incluido el medio elegido).
        public async Task<CResult> UpdateAsync(ACA_PROSPECTO_MEDIO_ORIGENTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            CResult objResultado = new();

            try
            {
                var actual = await LeerPorLlaveAsync(Data.CORR_PROSPECTO_MEDIO);
                if (actual == null)
                    throw new System.Exception("El medio ya no existe.");

                var repetido = (await LeerPorPersonaAsync(actual.CORR_PROSPECTO_PERSONA))
                    .Any(m => m.CORR_MEDIO_ORIGEN == Data.CORR_MEDIO_ORIGEN && m.CORR_PROSPECTO_MEDIO != Data.CORR_PROSPECTO_MEDIO);
                if (repetido)
                    throw new System.Exception("El prospecto ya tiene registrado ese medio.");

                await AjustarCamposPorMedioAsync(Data);

                var pWhere = new List<CParameter>
                {
                    new CParameter() {ParameterName="CORR_PROSPECTO_MEDIO",Value=Data.CORR_PROSPECTO_MEDIO,DbType=System.Data.DbType.Int32},
                };

                var reader = await objData.Update(_TableName, ParametrosMedio(Data, false), pWhere);
                var response = new List<ACA_PROSPECTO_MEDIO_ORIGENView>().FromDataReader(reader).FirstOrDefault();

                reader.Close();
                reader = null;

                objResultado.Data = response;
                objResultado.Result = true;
                objResultado.RowsAffected = 1;
                objResultado.CodeHelper = Data.CORR_PROSPECTO_MEDIO;
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

        // Qué hace: elimina un medio de origen del prospecto.
        public async Task<CResult> DeleteAsync(ACA_PROSPECTO_MEDIO_ORIGENTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            CResult objResultado = new();

            try
            {
                var pWhere = new List<CParameter>
                {
                    new CParameter() {ParameterName="CORR_PROSPECTO_MEDIO",Value=Data.CORR_PROSPECTO_MEDIO,DbType=System.Data.DbType.Int32},
                };

                await objData.Delete(_TableName, pWhere);

                objResultado.Data = null;
                objResultado.Result = true;
                objResultado.RowsAffected = 1;
                objResultado.CodeHelper = Data.CORR_PROSPECTO_MEDIO;
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

        // Qué hace: deja solo los campos que ese medio usa y exige los suyos (misma regla del portal).
        // Cómo lo hace: identifica los medios especiales por su CODIGO en GEN_MEDIO_ORIGEN ('OTRO' y
        //               'REF'); el portal los busca por nombre, que es más frágil si alguien lo edita.
        private async Task AjustarCamposPorMedioAsync(ACA_PROSPECTO_MEDIO_ORIGENTable Data)
        {
            var codigo = (await CodigoMedioAsync(Data.CORR_MEDIO_ORIGEN) ?? string.Empty).Trim().ToUpperInvariant();

            if (codigo == CodigoOtro)
            {
                Data.ESTUDIANTE_REFIERE = null;
                Data.CORR_CARRERA_REFIERE = null;
                if (Data.DESCRIPCION == null)
                    throw new System.Exception("Indique a qué otro medio se refiere.");
                return;
            }

            if (codigo == CodigoReferido)
            {
                Data.DESCRIPCION = null;
                if (Data.ESTUDIANTE_REFIERE == null)
                    throw new System.Exception("Indique el nombre del estudiante que lo refiere.");
                if (!(Data.CORR_CARRERA_REFIERE > 0))
                    throw new System.Exception("Indique la carrera del estudiante que lo refiere.");
                return;
            }

            // El resto de medios no lleva detalle.
            Data.DESCRIPCION = null;
            Data.ESTUDIANTE_REFIERE = null;
            Data.CORR_CARRERA_REFIERE = null;
        }

        private async Task<string> CodigoMedioAsync(int corrMedio)
        {
            var p = new List<CParameter>
            {
                new CParameter() {ParameterName="CORR_MEDIO_ORIGEN",Value=corrMedio,DbType=System.Data.DbType.Int32},
            };

            var reader = await objData.GetDataReader("GEN_MEDIO_ORIGEN", p);
            var medio = new List<GEN_MEDIO_ORIGENView>().FromDataReader(reader).FirstOrDefault();
            reader.Close();
            objData.objConnection.Close();

            return medio?.CODIGO;
        }

        private async Task<List<ACA_PROSPECTO_MEDIO_ORIGENView>> LeerPorPersonaAsync(int corrPersona)
        {
            var p = new List<CParameter>
            {
                new CParameter() {ParameterName="CORR_PROSPECTO_PERSONA",Value=corrPersona,DbType=System.Data.DbType.Int32},
            };

            var reader = await objData.GetDataReader(_ViewName, p);
            var filas = new List<ACA_PROSPECTO_MEDIO_ORIGENView>().FromDataReader(reader).ToList();
            reader.Close();
            objData.objConnection.Close();

            return filas;
        }

        private async Task<ACA_PROSPECTO_MEDIO_ORIGENView> LeerPorLlaveAsync(int corrMedio)
        {
            var p = new List<CParameter>
            {
                new CParameter() {ParameterName="CORR_PROSPECTO_MEDIO",Value=corrMedio,DbType=System.Data.DbType.Int32},
            };

            var reader = await objData.GetDataReader(_ViewName, p);
            var fila = new List<ACA_PROSPECTO_MEDIO_ORIGENView>().FromDataReader(reader).FirstOrDefault();
            reader.Close();
            objData.objConnection.Close();

            return fila;
        }

        private static List<CParameter> ParametrosMedio(ACA_PROSPECTO_MEDIO_ORIGENTable Data, bool esAlta)
        {
            var p = new List<CParameter>();

            if (esAlta)
            {
                p.Add(new CParameter() { ParameterName = "CORR_PROSPECTO_PERSONA", Value = Data.CORR_PROSPECTO_PERSONA, DbType = System.Data.DbType.Int32 });
            }

            p.Add(new CParameter() { ParameterName = "CORR_MEDIO_ORIGEN", Value = Data.CORR_MEDIO_ORIGEN, DbType = System.Data.DbType.Int32 });
            p.Add(new CParameter() { ParameterName = "DESCRIPCION", Value = Data.DESCRIPCION ?? (object)DBNull.Value, DbType = System.Data.DbType.String });
            p.Add(new CParameter() { ParameterName = "ESTUDIANTE_REFIERE", Value = Data.ESTUDIANTE_REFIERE ?? (object)DBNull.Value, DbType = System.Data.DbType.String });
            p.Add(new CParameter() { ParameterName = "CORR_CARRERA_REFIERE", Value = Data.CORR_CARRERA_REFIERE ?? (object)DBNull.Value, DbType = System.Data.DbType.Int32 });

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

        private const string CodigoOtro = "OTRO";
        private const string CodigoReferido = "REF";

        private const string _SqlInsertMedio =
            "INSERT INTO ACA_PROSPECTO_MEDIO_ORIGEN (CORR_PROSPECTO_PERSONA, CORR_MEDIO_ORIGEN, DESCRIPCION, ESTUDIANTE_REFIERE, " +
            "CORR_CARRERA_REFIERE, USUARIO_CREA, ESTACION_CREA, FECHA_CREA) " +
            "VALUES (@CORR_PROSPECTO_PERSONA, @CORR_MEDIO_ORIGEN, @DESCRIPCION, @ESTUDIANTE_REFIERE, " +
            "@CORR_CARRERA_REFIERE, @USUARIO_CREA, @ESTACION_CREA, @FECHA_CREA)";
    }
}
