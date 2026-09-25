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
    public class ACA_PROSPECTO_SE_RESPUESTARepository : BaseRepository<ACA_PROSPECTO_SE_RESPUESTATable>, IACA_PROSPECTO_SE_RESPUESTARepository
    {
        private const string _TableName = "ACA_PROSPECTO_SE_RESPUESTA";
        private const string _ViewName = "V_ACA_PROSPECTO_SE_RESPUESTA";

        public ACA_PROSPECTO_SE_RESPUESTARepository(IConfiguration config) :
                base(config.GetConnectionString("defaultConnection"),
                     config.GetSection("DbProvider:defaultProvider").Value)
        {
        }

        // Qué hace: preguntas de la versión del estudio socioeconómico con su respuesta.
        // Cómo lo hace: lee V_ACA_PROSPECTO_SE_RESPUESTA ordenado por ORDEN, CORR_PREGUNTA.
        public async Task<CResult> GetAllAsync(List<CParameter> xWhere)
        {
            CResult objResultado = new();

            try
            {
                var reader = await objData.GetDataReader(_ViewName, xWhere, "ORDEN, CORR_PREGUNTA");
                var response = new List<ACA_PROSPECTO_SE_RESPUESTAView>().FromDataReader(reader).ToList();

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
                var response = new List<ACA_PROSPECTO_SE_RESPUESTAView>().FromDataReader(reader).FirstOrDefault();

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

        // Qué hace: guarda de una vez las respuestas del estudio socioeconómico del prospecto.
        // Cómo lo hace: lee las preguntas de la versión con su respuesta actual (V_ACA_PROSPECTO_SE_RESPUESTA)
        //               y, por pregunta, actualiza, inserta o borra la fila. Misma regla del portal: sin valor
        //               (texto vacío, monto 0, sin opción) = sin fila. Opción múltiple no se toca (V1 no tiene).
        //               El texto histórico de pregunta y opción se toma del banco. Sin transacción, como el
        //               resto del ERP: se detiene en el primer error y devuelve el estado final de las respuestas.
        public async Task<CResult> GuardarAsync(ACA_PROSPECTO_SE_RESPUESTA_GUARDARParam Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            CResult objResultado = new();
            int afectadas = 0;

            try
            {
                var pSocio = new List<CParameter>
                {
                    new CParameter() {ParameterName="CORR_PROSPECTO_SOCIOECONOMICO",Value=Data.CORR_PROSPECTO_SOCIOECONOMICO,DbType=System.Data.DbType.Int32},
                };

                var reader = await objData.GetDataReader(_ViewName, pSocio);
                var actuales = new List<ACA_PROSPECTO_SE_RESPUESTAView>().FromDataReader(reader).ToList();
                reader.Close();
                objData.objConnection.Close();

                if (actuales.Count == 0)
                    throw new System.Exception("El prospecto no tiene un estudio socioeconómico con preguntas.");

                var ahora = DateTime.Now;

                foreach (var item in Data.RESPUESTAS)
                {
                    var pregunta = actuales.FirstOrDefault(a => a.CORR_PREGUNTA == item.CORR_PREGUNTA);
                    if (pregunta == null) continue; // no pertenece a la versión del prospecto

                    var tipo = (pregunta.TIPO_PREGUNTA ?? "").Trim().ToUpperInvariant();
                    if (tipo == "OPCION_MULTIPLE") continue;

                    string texto = tipo == "TEXTO" && !string.IsNullOrWhiteSpace(item.VALOR_TEXTO) ? item.VALOR_TEXTO.Trim() : null;
                    decimal? numero = (tipo == "MONTO" || tipo == "NUMERO") && item.VALOR_NUMERO.HasValue && item.VALOR_NUMERO.Value != 0 ? item.VALOR_NUMERO : null;
                    bool? bit = tipo == "SI_NO" ? item.VALOR_BIT : null;
                    int? opcion = tipo == "OPCION_UNICA" && item.CORR_OPCION > 0 ? item.CORR_OPCION : null;
                    bool tieneValor = texto != null || numero.HasValue || bit.HasValue || opcion.HasValue;
                    bool existe = pregunta.CORR_RESPUESTA > 0;

                    if (!tieneValor)
                    {
                        if (existe)
                        {
                            await objData.Delete(_TableName, new List<CParameter>
                            {
                                new CParameter() {ParameterName="CORR_RESPUESTA",Value=pregunta.CORR_RESPUESTA.Value,DbType=System.Data.DbType.Int32},
                            });
                            afectadas++;
                        }
                        continue;
                    }

                    string textoOpcion = null;
                    if (opcion.HasValue)
                    {
                        textoOpcion = await TextoOpcionAsync(opcion.Value, item.CORR_PREGUNTA);
                        if (textoOpcion == null)
                            throw new System.Exception($"La opción seleccionada no pertenece a la pregunta {pregunta.CODIGO_PREGUNTA}.");
                    }

                    if (existe)
                    {
                        var p = new List<CParameter>
                        {
                            new CParameter() {ParameterName="VALOR_TEXTO",Value=texto ?? (object)DBNull.Value,DbType=System.Data.DbType.String},
                            new CParameter() {ParameterName="VALOR_NUMERO",Value=numero ?? (object)DBNull.Value,DbType=System.Data.DbType.Decimal},
                            new CParameter() {ParameterName="VALOR_BIT",Value=bit ?? (object)DBNull.Value,DbType=System.Data.DbType.Boolean},
                            new CParameter() {ParameterName="CORR_OPCION",Value=opcion ?? (object)DBNull.Value,DbType=System.Data.DbType.Int32},
                            new CParameter() {ParameterName="TEXTO_OPCION_HISTORICO",Value=textoOpcion ?? (object)DBNull.Value,DbType=System.Data.DbType.String},
                            new CParameter() {ParameterName="FECHA_RESPUESTA",Value=ahora,DbType=System.Data.DbType.DateTime},
                            new CParameter() {ParameterName="USUARIO_ACTU",Value=vLOGIN_SISTEMA ?? "",DbType=System.Data.DbType.String},
                            new CParameter() {ParameterName="ESTACION_ACTU",Value=vESTACION ?? "",DbType=System.Data.DbType.String},
                            new CParameter() {ParameterName="FECHA_ACTU",Value=ahora,DbType=System.Data.DbType.DateTime},
                        };
                        var pWhere = new List<CParameter>
                        {
                            new CParameter() {ParameterName="CORR_RESPUESTA",Value=pregunta.CORR_RESPUESTA.Value,DbType=System.Data.DbType.Int32},
                        };

                        var rUpd = await objData.Update(_TableName, p, pWhere);
                        rUpd.Close();
                        objData.objConnection.Close();
                    }
                    else
                    {
                        // CORR_RESPUESTA es IDENTITY: INSERT directo (objData.Insert calcula MAX+1, no aplica aquí).
                        var pIns = new List<CParameter>
                        {
                            new CParameter() {ParameterName="CORR_PROSPECTO_SOCIOECONOMICO",Value=Data.CORR_PROSPECTO_SOCIOECONOMICO,DbType=System.Data.DbType.Int32},
                            new CParameter() {ParameterName="CORR_PREGUNTA",Value=item.CORR_PREGUNTA,DbType=System.Data.DbType.Int32},
                            new CParameter() {ParameterName="VALOR_TEXTO",Value=texto ?? (object)DBNull.Value,DbType=System.Data.DbType.String},
                            new CParameter() {ParameterName="VALOR_NUMERO",Value=numero ?? (object)DBNull.Value,DbType=System.Data.DbType.Decimal},
                            new CParameter() {ParameterName="VALOR_BIT",Value=bit ?? (object)DBNull.Value,DbType=System.Data.DbType.Boolean},
                            new CParameter() {ParameterName="CORR_OPCION",Value=opcion ?? (object)DBNull.Value,DbType=System.Data.DbType.Int32},
                            new CParameter() {ParameterName="TEXTO_PREGUNTA_HISTORICO",Value=pregunta.ENUNCIADO ?? "",DbType=System.Data.DbType.String},
                            new CParameter() {ParameterName="TEXTO_OPCION_HISTORICO",Value=textoOpcion ?? (object)DBNull.Value,DbType=System.Data.DbType.String},
                            new CParameter() {ParameterName="FECHA_RESPUESTA",Value=ahora,DbType=System.Data.DbType.DateTime},
                            new CParameter() {ParameterName="USUARIO_CREA",Value=vLOGIN_SISTEMA ?? "",DbType=System.Data.DbType.String},
                            new CParameter() {ParameterName="ESTACION_CREA",Value=vESTACION ?? "",DbType=System.Data.DbType.String},
                            new CParameter() {ParameterName="FECHA_CREA",Value=ahora,DbType=System.Data.DbType.DateTime},
                        };

                        await objData.ExecCmd(System.Data.CommandType.Text, _SqlInsertRespuesta, true, pIns);
                    }

                    afectadas++;
                }

                // Estado final de las respuestas, en el mismo orden que GetAll.
                reader = await objData.GetDataReader(_ViewName, pSocio, "ORDEN, CORR_PREGUNTA");
                var response = new List<ACA_PROSPECTO_SE_RESPUESTAView>().FromDataReader(reader).ToList();
                reader.Close();
                reader = null;

                objResultado.Data = response;
                objResultado.Result = true;
                objResultado.RowsAffected = afectadas;
                objResultado.CodeHelper = Data.CORR_PROSPECTO_SOCIOECONOMICO;
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

        private const string _SqlInsertRespuesta =
            "INSERT INTO ACA_PROSPECTO_SE_RESPUESTA (CORR_PROSPECTO_SOCIOECONOMICO, CORR_PREGUNTA, VALOR_TEXTO, VALOR_NUMERO, VALOR_BIT, CORR_OPCION, " +
            "TEXTO_PREGUNTA_HISTORICO, TEXTO_OPCION_HISTORICO, FECHA_RESPUESTA, USUARIO_CREA, ESTACION_CREA, FECHA_CREA) " +
            "VALUES (@CORR_PROSPECTO_SOCIOECONOMICO, @CORR_PREGUNTA, @VALOR_TEXTO, @VALOR_NUMERO, @VALOR_BIT, @CORR_OPCION, " +
            "@TEXTO_PREGUNTA_HISTORICO, @TEXTO_OPCION_HISTORICO, @FECHA_RESPUESTA, @USUARIO_CREA, @ESTACION_CREA, @FECHA_CREA)";

        // Qué hace: texto de una opción del banco, validando que pertenezca a la pregunta.
        private async Task<string> TextoOpcionAsync(int corrOpcion, int corrPregunta)
        {
            var p = new List<CParameter>
            {
                new CParameter() {ParameterName="CORR_OPCION",Value=corrOpcion,DbType=System.Data.DbType.Int32},
                new CParameter() {ParameterName="CORR_PREGUNTA",Value=corrPregunta,DbType=System.Data.DbType.Int32},
            };

            var reader = await objData.GetDataReader("ACA_SE_OPCION", p);
            var opcion = new List<ACA_SE_OPCIONView>().FromDataReader(reader).FirstOrDefault();
            reader.Close();
            objData.objConnection.Close();

            return opcion?.TEXTO;
        }

        // Qué hace: alta, modificación individual y eliminación no habilitadas.
        // Cómo lo hace: el ERP guarda las respuestas en lote con GuardarAsync; IRepository exige
        //               estos métodos, así que responden un error claro.
        public Task<CResult> CreateAsync(ACA_PROSPECTO_SE_RESPUESTATable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            return Task.FromResult(OperacionNoHabilitada());
        }

        public Task<CResult> UpdateAsync(ACA_PROSPECTO_SE_RESPUESTATable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            return Task.FromResult(OperacionNoHabilitada());
        }

        public Task<CResult> DeleteAsync(ACA_PROSPECTO_SE_RESPUESTATable Data, string vLOGIN_SISTEMA, string vESTACION)
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
