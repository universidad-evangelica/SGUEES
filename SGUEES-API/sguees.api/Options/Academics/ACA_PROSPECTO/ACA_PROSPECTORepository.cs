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
        // Cómo lo hace: /aca-prospecto es de solo consulta; IRepository exige los métodos, así que
        //               responden un error claro hasta la fase de edición.
        public Task<CResult> CreateAsync(ACA_PROSPECTOTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            return Task.FromResult(OperacionNoHabilitada());
        }

        // Qué hace: carreras que el prospecto puede elegir en su ciclo (cambio de carrera).
        // Cómo lo hace: misma regla del portal (NI_LIST_CATALOGS opción 5): carrera activa de un
        //               período activo del mismo ciclo, con la inscripción abierta, ligada por carrera,
        //               facultad o área. Agrega la condición que al portal le falta: que la carrera
        //               tenga plan vigente, para no ofrecer una que después no se pueda procesar.
        public async Task<CResult> GetCarrerasDelCicloAsync(List<CParameter> xWhere)
        {
            return await LeerOfertaAsync(_SqlCarrerasDelCiclo, xWhere);
        }

        // Qué hace: modalidades con plan vigente de una carrera (igual que la opción 6 del portal).
        public async Task<CResult> GetModalidadesDeCarreraAsync(List<CParameter> xWhere)
        {
            return await LeerOfertaAsync(_SqlModalidadesDeCarrera, xWhere);
        }

        private async Task<CResult> LeerOfertaAsync(string consulta, List<CParameter> xWhere)
        {
            CResult objResultado = new();

            try
            {
                var reader = await objData.GetDataReader(System.Data.CommandType.Text, consulta, xWhere);
                var response = new List<ACA_PROSPECTO_OFERTAView>().FromDataReader(reader).ToList();

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

        // Qué hace: actualiza forma de ingreso, financiamiento y, si cambió, la carrera del prospecto.
        // Cómo lo hace: objData.Update sobre ACA_PROSPECTO por CORR_PROSPECTO y relee V_ACA_PROSPECTO.
        //               No toca ESTADO ni los campos de proceso (reservados a la migración a estudiante).
        //               Con carrera y modalidad resuelve plan y período con la misma regla del portal
        //               (PutPersonalInformationChangeCareer): plan vigente más reciente de esa carrera y
        //               modalidad, y período activo del mismo ciclo buscando por carrera → facultad →
        //               área. El CIF no cambia porque depende solo del ciclo.
        public async Task<CResult> UpdateAsync(ACA_PROSPECTOTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            CResult objResultado = new();

            try
            {
                var p = new List<CParameter>
                {
                    new CParameter() {ParameterName="FORMA_INGRESO",Value=Data.FORMA_INGRESO,DbType=System.Data.DbType.String},
                    new CParameter() {ParameterName="FINANCIA_ESTUDIOS",Value=Data.FINANCIA_ESTUDIOS ?? (object)DBNull.Value,DbType=System.Data.DbType.String},
                    new CParameter() {ParameterName="USUARIO_ACTU",Value=Data.USUARIO_ACTU,DbType=System.Data.DbType.String},
                    new CParameter() {ParameterName="ESTACION_ACTU",Value=Data.ESTACION_ACTU,DbType=System.Data.DbType.String},
                    new CParameter() {ParameterName="FECHA_ACTU",Value=Data.FECHA_ACTU,DbType=System.Data.DbType.DateTime},
                };

                if (Data.CORR_CARRERA > 0 && Data.CORR_MODALIDAD > 0)
                {
                    var actual = await LeerProspectoAsync(Data.CORR_PROSPECTO);
                    if (actual == null)
                        throw new System.Exception("El prospecto ya no existe.");

                    if (actual.CORR_CARRERA != Data.CORR_CARRERA || actual.CORR_MODALIDAD != Data.CORR_MODALIDAD)
                    {
                        var destino = await ResolverPlanYPeriodoAsync(Data.CORR_CARRERA, Data.CORR_MODALIDAD, actual.CORR_PERIODO_ACADEMICO);
                        p.Add(new CParameter() { ParameterName = "CORR_PLAN_ACADEMICO", Value = destino.Plan, DbType = System.Data.DbType.Int32 });
                        p.Add(new CParameter() { ParameterName = "CORR_PERIODO_ACADEMICO", Value = destino.Periodo, DbType = System.Data.DbType.Int32 });
                    }
                }

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

        // Qué hace: el prospecto tal como está hoy (para saber si la carrera realmente cambió).
        private async Task<ACA_PROSPECTOView> LeerProspectoAsync(int corrProspecto)
        {
            var p = new List<CParameter>
            {
                new CParameter() {ParameterName="CORR_PROSPECTO",Value=corrProspecto,DbType=System.Data.DbType.Int32},
            };

            var reader = await objData.GetDataReader(_ViewName, p);
            var fila = new List<ACA_PROSPECTOView>().FromDataReader(reader).FirstOrDefault();
            reader.Close();
            objData.objConnection.Close();

            return fila;
        }

        // Qué hace: plan académico y período que le tocan a una carrera y modalidad dentro del mismo
        //           ciclo del prospecto; si no existen, explica cuál de los dos falta.
        private async Task<(int Plan, int Periodo)> ResolverPlanYPeriodoAsync(int corrCarrera, int corrModalidad, int periodoActual)
        {
            var p = new List<CParameter>
            {
                new CParameter() {ParameterName="CORR_CARRERA",Value=corrCarrera,DbType=System.Data.DbType.Int32},
                new CParameter() {ParameterName="CORR_MODALIDAD",Value=corrModalidad,DbType=System.Data.DbType.Int32},
                new CParameter() {ParameterName="CORR_PERIODO_ACTUAL",Value=periodoActual,DbType=System.Data.DbType.Int32},
            };

            var reader = await objData.GetDataReader(System.Data.CommandType.Text, _SqlPlanYPeriodo, p);
            var destino = new List<ACA_PROSPECTO_DESTINOView>().FromDataReader(reader).FirstOrDefault();
            reader.Close();
            objData.objConnection.Close();

            if (destino == null || !(destino.CORR_PLAN_ACADEMICO > 0))
                throw new System.Exception("No hay un plan académico vigente para la carrera y modalidad seleccionadas.");
            if (!(destino.CORR_PERIODO_ACADEMICO > 0))
                throw new System.Exception("No hay un período activo para esa carrera en el ciclo del prospecto.");

            return (destino.CORR_PLAN_ACADEMICO, destino.CORR_PERIODO_ACADEMICO);
        }

        // Carreras del ciclo del prospecto (regla del portal + la exigencia de plan vigente).
        private const string _SqlCarrerasDelCiclo =
            "SELECT DISTINCT C.CORR_CARRERA AS CORR, C.CODIGO_CARRERA AS CODIGO, C.NOMBRE_CARRERA AS NOMBRE " +
            "FROM ACA_CARRERAS C " +
            "INNER JOIN ACA_PERIODOS_ACADEMICOS P ON P.CORR_AREA_ACADEMICA = C.CORR_AREA_ACADEMICA " +
            "INNER JOIN ACA_PROSPECTO PR ON PR.CORR_PROSPECTO = @CORR_PROSPECTO " +
            "INNER JOIN ACA_PERIODOS_ACADEMICOS PA ON PA.CORR_PERIODO_ACADEMICO = PR.CORR_PERIODO_ACADEMICO " +
            "WHERE P.ANIO = PA.ANIO AND P.NUMERO_PERIODO = PA.NUMERO_PERIODO " +
            "AND P.ACTIVO = 1 AND C.ACTIVO = 1 AND P.FECHA_FIN_INSCRIPCION >= CAST(GETDATE() AS DATE) " +
            "AND ((P.CORR_CARRERA IS NOT NULL AND P.CORR_CARRERA = C.CORR_CARRERA) " +
            "  OR (P.CORR_CARRERA IS NULL AND P.CORR_FACULTAD IS NOT NULL AND P.CORR_FACULTAD = C.CORR_FACULTAD) " +
            "  OR (P.CORR_CARRERA IS NULL AND P.CORR_FACULTAD IS NULL)) " +
            "AND EXISTS (SELECT 1 FROM ACA_PLANES_ACADEMICOS PL WHERE PL.CORR_CARRERA = C.CORR_CARRERA AND PL.PLAN_VIGENTE = 1) " +
            "ORDER BY C.NOMBRE_CARRERA";

        // Modalidades con plan vigente de la carrera elegida.
        private const string _SqlModalidadesDeCarrera =
            "SELECT DISTINCT M.CORR_MODALIDAD AS CORR, M.CODIGO_MODALIDAD AS CODIGO, M.NOMBRE_MODALIDAD AS NOMBRE " +
            "FROM ACA_PLANES_ACADEMICOS PL " +
            "INNER JOIN ACA_MODALIDADES_ACADEMICAS M ON M.CORR_MODALIDAD = PL.CORR_MODALIDAD " +
            "WHERE PL.CORR_CARRERA = @CORR_CARRERA AND PL.PLAN_VIGENTE = 1 " +
            "ORDER BY M.NOMBRE_MODALIDAD";

        // Plan vigente más reciente y período activo del mismo ciclo (carrera → facultad → área).
        private const string _SqlPlanYPeriodo =
            "DECLARE @ANIO SMALLINT, @NUM TINYINT, @FAC INT, @AREA INT; " +
            "SELECT @ANIO = ANIO, @NUM = NUMERO_PERIODO FROM ACA_PERIODOS_ACADEMICOS WHERE CORR_PERIODO_ACADEMICO = @CORR_PERIODO_ACTUAL; " +
            "SELECT @FAC = CORR_FACULTAD, @AREA = CORR_AREA_ACADEMICA FROM ACA_CARRERAS WHERE CORR_CARRERA = @CORR_CARRERA; " +
            "SELECT " +
            "  ISNULL((SELECT TOP 1 PL.CORR_PLAN_ACADEMICO FROM ACA_PLANES_ACADEMICOS PL " +
            "          WHERE PL.CORR_CARRERA = @CORR_CARRERA AND PL.CORR_MODALIDAD = @CORR_MODALIDAD AND PL.PLAN_VIGENTE = 1 " +
            "          ORDER BY PL.ANIO_PLAN DESC), 0) AS CORR_PLAN_ACADEMICO, " +
            "  ISNULL(COALESCE( " +
            "    (SELECT TOP 1 P.CORR_PERIODO_ACADEMICO FROM ACA_PERIODOS_ACADEMICOS P " +
            "     WHERE P.ANIO = @ANIO AND P.NUMERO_PERIODO = @NUM AND P.ACTIVO = 1 AND P.CORR_CARRERA = @CORR_CARRERA), " +
            "    (SELECT TOP 1 P.CORR_PERIODO_ACADEMICO FROM ACA_PERIODOS_ACADEMICOS P " +
            "     WHERE P.ANIO = @ANIO AND P.NUMERO_PERIODO = @NUM AND P.ACTIVO = 1 AND P.CORR_FACULTAD = @FAC AND P.CORR_CARRERA IS NULL), " +
            "    (SELECT TOP 1 P.CORR_PERIODO_ACADEMICO FROM ACA_PERIODOS_ACADEMICOS P " +
            "     WHERE P.ANIO = @ANIO AND P.NUMERO_PERIODO = @NUM AND P.ACTIVO = 1 AND P.CORR_AREA_ACADEMICA = @AREA " +
            "       AND P.CORR_FACULTAD IS NULL AND P.CORR_CARRERA IS NULL)), 0) AS CORR_PERIODO_ACADEMICO";

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
