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
    public class ACA_PROSPECTORepository : BaseRepository<ACA_PROSPECTOTable>, IACA_PROSPECTORepository
    {
        private const string _TableName = "ACA_PROSPECTO";
        private const string _ViewName = "V_ACA_PROSPECTO";

        public ACA_PROSPECTORepository(IConfiguration config) :
                base(config.GetConnectionString("defaultConnection"),
                     config.GetSection("DbProvider:defaultProvider").Value)
        {
        }

        // Qué hace: solicitudes de nuevo ingreso que el estudiante ya envió y siguen Ingresadas.
        // Cómo lo hace: lee V_ACA_PROSPECTO (sigue en pregrado, área 5) y solo deja las que
        //               tienen instancia activa del tipo 104 con estado actual 38.
        //               Quien todavía edita en el portal no tiene instancia y no aparece.
        private const string _SqlSolicitudesIngresadas =
            "SELECT V.*, " +
            "PA.FECHA_FIN_INSCRIPCION, " +
            "I.CORR_INSTANCIA, I.CORR_PASO_ACTUAL, " +
            "CAST(PS.ORDEN AS int) AS ORDEN_PASO, PS.NOMBRE_PASO, AD.NOMBRE_ACTOR AS NOMBRE_ACTOR_PASO, " +
            "P0.NOMBRE_PASO AS NOMBRE_PASO_INICIAL, AO.NOMBRE_ACTOR AS NOMBRE_ACTOR_INICIAL, " +
            "DATEDIFF(DAY, CAST(GETDATE() AS date), CAST(PA.FECHA_FIN_INSCRIPCION AS date)) AS DIAS_VENCE, " +
            "DATEDIFF(DAY, CAST(ISNULL(B.FECHA_ENTRADA, I.FECHA_INICIO) AS date), CAST(GETDATE() AS date)) AS DIAS_EN_PASO " +
            "FROM dbo.V_ACA_PROSPECTO AS V " +
            "INNER JOIN dbo.SEG_FLUJO_INSTANCIA AS I " +
            "  ON I.CORR_EMPRESA = V.CORR_EMPRESA " +
            " AND I.CORR_TIPO_DOCUMENTO = 104 " +
            " AND I.CORR_DOCUMENTO = V.CORR_PROSPECTO " +
            " AND I.ACTIVO = 1 " +
            " AND I.CORR_ESTADO_ACTUAL = 38 " +
            "INNER JOIN dbo.ACA_PERIODOS_ACADEMICOS AS PA " +
            "  ON PA.CORR_PERIODO_ACADEMICO = V.CORR_PERIODO_ACADEMICO " +
            "LEFT JOIN dbo.SEG_FLUJO_PASO AS PS " +
            "  ON PS.CORR_EMPRESA = I.CORR_EMPRESA AND PS.CORR_PASO = I.CORR_PASO_ACTUAL " +
            "LEFT JOIN dbo.SEG_FLUJO_ACTOR AS AD " +
            "  ON AD.CORR_EMPRESA = PS.CORR_EMPRESA AND AD.CORR_ACTOR = PS.CORR_ACTOR_DESTINO " +
            "LEFT JOIN dbo.SEG_FLUJO_PASO AS P0 " +
            "  ON P0.CORR_EMPRESA = I.CORR_EMPRESA AND P0.CORR_FLUJO_PROCESO = I.CORR_FLUJO_PROCESO AND P0.ORDEN = 1 " +
            "LEFT JOIN dbo.SEG_FLUJO_ACTOR AS AO " +
            "  ON AO.CORR_EMPRESA = P0.CORR_EMPRESA AND AO.CORR_ACTOR = P0.CORR_ACTOR_ORIGEN " +
            "OUTER APPLY ( " +
            "  SELECT MAX(BT.FECHA_ACCION) AS FECHA_ENTRADA " +
            "  FROM dbo.SEG_FLUJO_BITACORA AS BT " +
            "  WHERE BT.CORR_EMPRESA = I.CORR_EMPRESA AND BT.CORR_INSTANCIA = I.CORR_INSTANCIA AND BT.CORR_PASO = I.CORR_PASO_ACTUAL " +
            ") AS B " +
            "WHERE V.CORR_EMPRESA = @CORR_EMPRESA " +
            "ORDER BY V.FECHA_REGISTRO DESC";

        public async Task<CResult> GetAllAsync(List<CParameter> xWhere)
        {
            CResult objResultado = new();

            try
            {
                var reader = await objData.GetDataReader(System.Data.CommandType.Text, _SqlSolicitudesIngresadas, xWhere);
                var response = new List<ACA_PROSPECTOView>().FromDataReader(reader).ToList();

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
                var response = new List<ACA_PROSPECTOView>().FromDataReader(reader).FirstOrDefault();

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
        // Cómo lo hace: Prospectos es de solo consulta; IRepository exige los métodos, así que
        //               responden un error claro hasta la fase de edición.
        public Task<CResult> CreateAsync(ACA_PROSPECTOTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            return Task.FromResult(OperacionNoHabilitada());
        }

        // Qué hace: carreras que se pueden elegir en un ciclo (el que el usuario tiene en pantalla).
        // Cómo lo hace: la oferta sale de FN_ACA_OFERTA_CICLO, la misma función que usan el portal y
        //               ACA_SP_CAMBIAR_CICLO_PROSPECTO. Si el ciclo pedido es el del prospecto, agrega su carrera
        //               actual aunque ya no se oferte, para que el combo pueda mostrarla.
        public async Task<CResult> GetCarrerasDelCicloAsync(List<CParameter> xWhere)
        {
            return await LeerListaAsync<ACA_PROSPECTO_OFERTAView>(_SqlCarrerasDelCiclo, xWhere);
        }

        // Qué hace: modalidades con plan vigente de una carrera (igual que la opción 6 del portal).
        public async Task<CResult> GetModalidadesDeCarreraAsync(List<CParameter> xWhere)
        {
            return await LeerListaAsync<ACA_PROSPECTO_OFERTAView>(_SqlModalidadesDeCarrera, xWhere);
        }

        // Qué hace: ciclos a los que se puede mover el prospecto, más su ciclo actual aunque ya no califique.
        // Cómo lo hace: misma regla que NI_LIST_CATALOGS opción 20 del portal (pregrado, período activo,
        //               inscripción abierta y al menos una carrera inscribible).
        public async Task<CResult> GetCiclosAsync(List<CParameter> xWhere)
        {
            return await LeerListaAsync<ACA_PROSPECTO_CICLOView>(_SqlCiclos, xWhere);
        }

        // Qué hace: qué pasaría al cambiar ciclo/carrera (carrera conservada, beca a clonar, reapertura),
        //           sin escribir nada; alimenta el aviso previo al guardar.
        public async Task<CResult> ValidarCambioAsync(List<CParameter> xWhere)
        {
            return await LeerListaAsync<ACA_PROSPECTO_CAMBIO_CICLOView>(_SqlCambiarCiclo, xWhere);
        }

        private async Task<CResult> LeerListaAsync<T>(string consulta, List<CParameter> xWhere) where T : new()
        {
            CResult objResultado = new();

            try
            {
                var reader = await objData.GetDataReader(System.Data.CommandType.Text, consulta, xWhere);
                var response = new List<T>().FromDataReader(reader).ToList();

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

        // Qué hace: actualiza forma de ingreso y financiamiento y, si cambiaron, el ciclo y la carrera.
        // Cómo lo hace: primero ACA_SP_CAMBIAR_CICLO_PROSPECTO (resuelve plan y período, clona la beca al
        //               ciclo nuevo y reabre la postulación, en su propia transacción). Si el procedimiento no
        //               aplica el cambio, no se guarda nada y se devuelve su mensaje. Después objData.Update de
        //               los campos propios del encabezado y relectura de V_ACA_PROSPECTO. El CIF no cambia.
        public async Task<CResult> UpdateAsync(ACA_PROSPECTOTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            CResult objResultado = new();

            try
            {
                if (Data.ANIO > 0 && Data.NUMERO_PERIODO > 0 && Data.CORR_CARRERA > 0 && Data.CORR_MODALIDAD > 0)
                {
                    var pCambio = ParametrosCambio(Data.CORR_PROSPECTO, Data.ANIO, Data.NUMERO_PERIODO,
                        Data.CORR_CARRERA, Data.CORR_MODALIDAD, Data.USUARIO_ACTU, Data.ESTACION_ACTU, false);

                    var readerCambio = await objData.GetDataReader(System.Data.CommandType.Text, _SqlCambiarCiclo, pCambio);
                    var cambio = new List<ACA_PROSPECTO_CAMBIO_CICLOView>().FromDataReader(readerCambio).FirstOrDefault();
                    readerCambio.Close();
                    objData.objConnection.Close();

                    if (cambio == null)
                        throw new System.Exception("No se obtuvo respuesta del cambio de ciclo.");
                    if (cambio.RESULTADO != 0)
                        throw new System.Exception(cambio.MENSAJE);
                }

                var p = new List<CParameter>
                {
                    new CParameter() {ParameterName="FORMA_INGRESO",Value=Data.FORMA_INGRESO,DbType=System.Data.DbType.String},
                    new CParameter() {ParameterName="FINANCIA_ESTUDIOS",Value=Data.FINANCIA_ESTUDIOS ?? (object)DBNull.Value,DbType=System.Data.DbType.String},
                    new CParameter() {ParameterName="USUARIO_ACTU",Value=Data.USUARIO_ACTU,DbType=System.Data.DbType.String},
                    new CParameter() {ParameterName="ESTACION_ACTU",Value=Data.ESTACION_ACTU,DbType=System.Data.DbType.String},
                    new CParameter() {ParameterName="FECHA_ACTU",Value=Data.FECHA_ACTU,DbType=System.Data.DbType.DateTime},
                };

                var pWhere = new List<CParameter>
                {
                    new CParameter() {ParameterName="CORR_PROSPECTO",Value=Data.CORR_PROSPECTO,DbType=System.Data.DbType.Int32},
                };

                var reader = await objData.Update(_TableName, p, pWhere);
                var response = new List<ACA_PROSPECTOView>().FromDataReader(reader).FirstOrDefault();

                reader.Close();
                reader = null;

                objResultado.Data = response;
                objResultado.Result = true;
                objResultado.RowsAffected = 1;
                objResultado.CodeHelper = Data.CORR_PROSPECTO;
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

        public Task<CResult> DeleteAsync(ACA_PROSPECTOTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            return Task.FromResult(OperacionNoHabilitada());
        }

        // Qué hace: parámetros de ACA_SP_CAMBIAR_CICLO_PROSPECTO (los usan la validación previa y el guardado).
        public static List<CParameter> ParametrosCambio(int corrProspecto, short anio, byte numeroPeriodo,
            int corrCarrera, int corrModalidad, string usuario, string estacion, bool soloValidar)
        {
            return new List<CParameter>
            {
                new CParameter() {ParameterName="CORR_PROSPECTO",Value=corrProspecto,DbType=System.Data.DbType.Int32},
                new CParameter() {ParameterName="ANIO",Value=anio,DbType=System.Data.DbType.Int16},
                new CParameter() {ParameterName="NUMERO_PERIODO",Value=numeroPeriodo,DbType=System.Data.DbType.Byte},
                new CParameter() {ParameterName="CORR_CARRERA",Value=corrCarrera,DbType=System.Data.DbType.Int32},
                new CParameter() {ParameterName="CORR_MODALIDAD",Value=corrModalidad,DbType=System.Data.DbType.Int32},
                new CParameter() {ParameterName="USUARIO",Value=usuario ?? "",DbType=System.Data.DbType.String},
                new CParameter() {ParameterName="ESTACION",Value=estacion ?? "",DbType=System.Data.DbType.String},
                new CParameter() {ParameterName="SOLO_VALIDAR",Value=soloValidar,DbType=System.Data.DbType.Boolean},
            };
        }

        private const string _SqlCambiarCiclo =
            "EXEC dbo.ACA_SP_CAMBIAR_CICLO_PROSPECTO @CORR_PROSPECTO = @CORR_PROSPECTO, @ANIO = @ANIO, " +
            "@NUMERO_PERIODO = @NUMERO_PERIODO, @CORR_CARRERA = @CORR_CARRERA, @CORR_MODALIDAD = @CORR_MODALIDAD, " +
            "@USUARIO = @USUARIO, @ESTACION = @ESTACION, @SOLO_VALIDAR = @SOLO_VALIDAR";

        private const string _SqlCarrerasDelCiclo =
            "SELECT O.CORR_CARRERA AS CORR, O.CODIGO_CARRERA AS CODIGO, O.NOMBRE_CARRERA AS NOMBRE " +
            "FROM dbo.FN_ACA_OFERTA_CICLO(@ANIO, @NUMERO_PERIODO) O " +
            "UNION " +
            "SELECT C.CORR_CARRERA, C.CODIGO_CARRERA, C.NOMBRE_CARRERA " +
            "FROM ACA_PROSPECTO PR " +
            "INNER JOIN ACA_PLANES_ACADEMICOS PL ON PL.CORR_PLAN_ACADEMICO = PR.CORR_PLAN_ACADEMICO " +
            "INNER JOIN ACA_CARRERAS C ON C.CORR_CARRERA = PL.CORR_CARRERA " +
            "INNER JOIN ACA_PERIODOS_ACADEMICOS PA ON PA.CORR_PERIODO_ACADEMICO = PR.CORR_PERIODO_ACADEMICO " +
            "WHERE PR.CORR_PROSPECTO = @CORR_PROSPECTO AND PA.ANIO = @ANIO AND PA.NUMERO_PERIODO = @NUMERO_PERIODO " +
            "ORDER BY NOMBRE";

        private const string _SqlModalidadesDeCarrera =
            "SELECT DISTINCT M.CORR_MODALIDAD AS CORR, M.CODIGO_MODALIDAD AS CODIGO, M.NOMBRE_MODALIDAD AS NOMBRE " +
            "FROM ACA_PLANES_ACADEMICOS PL " +
            "INNER JOIN ACA_MODALIDADES_ACADEMICAS M ON M.CORR_MODALIDAD = PL.CORR_MODALIDAD " +
            "WHERE PL.CORR_CARRERA = @CORR_CARRERA AND PL.PLAN_VIGENTE = 1 " +
            "ORDER BY M.NOMBRE_MODALIDAD";

        private const string _SqlCiclos =
            "SELECT CONVERT(VARCHAR(4), X.ANIO) + '-' + RIGHT('0' + CONVERT(VARCHAR(2), X.NUMERO_PERIODO), 2) AS CICLO, " +
            "       X.ANIO, X.NUMERO_PERIODO " +
            "FROM ( " +
            "  SELECT P.ANIO, P.NUMERO_PERIODO FROM ACA_PERIODOS_ACADEMICOS P " +
            "  WHERE P.ACTIVO = 1 AND P.CORR_AREA_ACADEMICA = 5 AND P.FECHA_FIN_INSCRIPCION >= CAST(GETDATE() AS DATE) " +
            "    AND EXISTS (SELECT 1 FROM dbo.FN_ACA_OFERTA_CICLO(P.ANIO, P.NUMERO_PERIODO)) " +
            "  UNION " +
            "  SELECT PA.ANIO, PA.NUMERO_PERIODO FROM ACA_PROSPECTO PR " +
            "  INNER JOIN ACA_PERIODOS_ACADEMICOS PA ON PA.CORR_PERIODO_ACADEMICO = PR.CORR_PERIODO_ACADEMICO " +
            "  WHERE PR.CORR_PROSPECTO = @CORR_PROSPECTO " +
            ") X " +
            "ORDER BY X.ANIO, X.NUMERO_PERIODO";


        // Qué hace: indica si el login es el ejecutor del paso actual y ese paso puede aprobar.
        // Cómo lo hace: instancia activa tipo 104 en estado 38, actor origen del paso y acción hacia 39.
        private const string _SqlPuedeAprobar =
            "SELECT CAST(CASE WHEN dbo.SEG_FN_UsuarioMatchActorUnidad(@LOGIN_SISTEMA, PS.CORR_ACTOR_ORIGEN, I.CORR_UNIDAD_DOCUMENTO, I.CORR_EMPRESA) = 1 " +
            "AND EXISTS (SELECT 1 FROM dbo.SEG_FLUJO_PASO_ACCION_ESTADO A " +
            "WHERE A.CORR_EMPRESA = I.CORR_EMPRESA AND A.CORR_PASO = I.CORR_PASO_ACTUAL " +
            "AND A.CORR_ESTADO_DESTINO = 39 AND A.PERMITIDO = 1 AND A.ACTIVO = 1) " +
            "THEN 1 ELSE 0 END AS bit) AS PUEDE_APROBAR " +
            "FROM dbo.SEG_FLUJO_INSTANCIA I " +
            "INNER JOIN dbo.SEG_FLUJO_PASO PS ON PS.CORR_EMPRESA = I.CORR_EMPRESA AND PS.CORR_PASO = I.CORR_PASO_ACTUAL " +
            "WHERE I.CORR_EMPRESA = @CORR_EMPRESA AND I.CORR_TIPO_DOCUMENTO = 104 " +
            "AND I.CORR_DOCUMENTO = @CORR_PROSPECTO AND I.ACTIVO = 1 AND I.CORR_ESTADO_ACTUAL = 38";

        public async Task<CResult> GetPuedeAprobarAsync(List<CParameter> xWhere)
        {
            CResult objResultado = new();
            var corrProspecto = 0;
            var corrParam = xWhere?.Find(p => p.ParameterName == "CORR_PROSPECTO");
            if (corrParam?.Value != null)
                int.TryParse(corrParam.Value.ToString(), out corrProspecto);

            try
            {
                var puede = false;
                var reader = await objData.GetDataReader(System.Data.CommandType.Text, _SqlPuedeAprobar, xWhere);
                if (reader.Read() && reader["PUEDE_APROBAR"] != System.DBNull.Value)
                    puede = Convert.ToBoolean(reader["PUEDE_APROBAR"]);
                reader.Close();

                objResultado.Data = new ACA_PROSPECTO_ACCION_FLUJOView
                {
                    CORR_PROSPECTO = corrProspecto,
                    PUEDE_APROBAR = puede
                };
                objResultado.Result = true;
                objResultado.RowsAffected = 1;
                objResultado.ErrorCode = 0;
                objResultado.ErrorMessage = "";
            }
            catch (Exception e)
            {
                objResultado.Data = null;
                objResultado.Result = false;
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

        // Qué hace: aprueba la solicitud con el login de la sesión.
        // Cómo lo hace: OPERACION=3 del SP de autoriza; el SP rechaza si no es el ejecutor del paso.
        public async Task<CResult> AprobarAsync(int corrEmpresa, int corrProspecto, string login, string observacion, string estacion)
        {
            CResult objResultado = new();
            const string spName = "PRAL_MTTO_ACA_PROSPECTO_NUEVO_INGRESO_AUTORIZA";

            try
            {
                var p = new List<CParameter>
                {
                    new CParameter() { ParameterName = "@CORR_EMPRESA", Value = corrEmpresa, DbType = System.Data.DbType.Int32 },
                    new CParameter() { ParameterName = "@CORR_PROSPECTO", Value = corrProspecto, DbType = System.Data.DbType.Int32 },
                    new CParameter() { ParameterName = "@CORR_UNIDAD_DOCUMENTO", Value = DBNull.Value, DbType = System.Data.DbType.Int32 },
                    new CParameter() { ParameterName = "@OPERACION", Value = 3, DbType = System.Data.DbType.Int32 },
                    new CParameter() { ParameterName = "@LOGIN_SISTEMA", Value = login ?? string.Empty, DbType = System.Data.DbType.String },
                    new CParameter() { ParameterName = "@OBSERVACION", Value = observacion ?? string.Empty, DbType = System.Data.DbType.String },
                    new CParameter() { ParameterName = "@ESTACION", Value = estacion ?? string.Empty, DbType = System.Data.DbType.String },
                    new CParameter() { ParameterName = "@CORR_ESTADO", Value = 0, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.Output },
                    new CParameter() { ParameterName = "@MENSAJE_ERROR", Value = string.Empty, DbType = System.Data.DbType.String, Direction = System.Data.ParameterDirection.Output, Size = 500 },
                    new CParameter() { ParameterName = "@CORR_ACCION_USADA", Value = 0, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.Output },
                    new CParameter() { ParameterName = "@CORR_PASO_ACTUAL", Value = 0, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.Output },
                    new CParameter() { ParameterName = "@MODO", Value = string.Empty, DbType = System.Data.DbType.String, Direction = System.Data.ParameterDirection.Output, Size = 20 },
                    new CParameter() { ParameterName = "@NOMBRE_ESTADO", Value = string.Empty, DbType = System.Data.DbType.String, Direction = System.Data.ParameterDirection.Output, Size = 100 },
                };

                await objData.ExecCmd(System.Data.CommandType.StoredProcedure, spName, true, p);

                var mensajeError = objData.objCommand.Parameters["@MENSAJE_ERROR"].Value?.ToString();
                if (!string.IsNullOrWhiteSpace(mensajeError))
                {
                    objResultado.Result = false;
                    objResultado.ErrorCode = -10;
                    objResultado.ErrorMessage = mensajeError;
                    objResultado.CodeHelper = corrProspecto;
                    return objResultado;
                }

                objResultado.Data = new ACA_PROSPECTO_ACCION_FLUJOView
                {
                    CORR_PROSPECTO = corrProspecto,
                    PUEDE_APROBAR = false
                };
                objResultado.Result = true;
                objResultado.RowsAffected = 1;
                objResultado.ErrorCode = 0;
                objResultado.ErrorMessage = "";
                objResultado.CodeHelper = corrProspecto;
            }
            catch (Exception e)
            {
                objResultado.Result = false;
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
