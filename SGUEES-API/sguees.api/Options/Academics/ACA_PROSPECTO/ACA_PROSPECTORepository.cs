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

        // Qué hace: prospectos del ciclo solicitado.
        // Cómo lo hace: lee V_ACA_PROSPECTO ordenado por fecha de registro, los más recientes primero.
        public async Task<CResult> GetAllAsync(List<CParameter> xWhere)
        {
            CResult objResultado = new();

            try
            {
                var reader = await objData.GetDataReader(_ViewName, xWhere, "FECHA_REGISTRO DESC");
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
