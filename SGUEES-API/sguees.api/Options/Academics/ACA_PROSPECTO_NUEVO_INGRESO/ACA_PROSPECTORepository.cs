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

        // Qué hace: solicitudes de nuevo ingreso ya enviadas, pendientes o aprobadas.
        // Cómo lo hace: lee V_ACA_PROSPECTO (sigue en pregrado, área 5) y deja la instancia
        //               tipo 104 en estado 38 Ingresado o 39 Aprobado.
        //               Aprobado sigue en el paso Solicitud aprobada. Quien edita en el portal no tiene instancia.
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
            " AND ( " +
            "      (I.ACTIVO = 1 AND I.CORR_ESTADO_ACTUAL = 38) " +
            "   OR I.CORR_ESTADO_ACTUAL IN (39, 46) " +
            " ) " +
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

        // Qué hace: prospectos de pregrado que todavía no tienen instancia del flujo 104.
        // Cómo lo hace: la misma vista del listado, sin paso ni estado de flujo. Enviar los pasa a pendientes.
        private const string _SqlSolicitudesBorrador =
            "SELECT V.*, " +
            "PA.FECHA_FIN_INSCRIPCION, " +
            "CAST(NULL AS int) AS CORR_INSTANCIA, CAST(NULL AS int) AS CORR_PASO_ACTUAL, " +
            "CAST(NULL AS int) AS ORDEN_PASO, CAST(NULL AS varchar(200)) AS NOMBRE_PASO, CAST(NULL AS varchar(200)) AS NOMBRE_ACTOR_PASO, " +
            "CAST(NULL AS varchar(200)) AS NOMBRE_PASO_INICIAL, CAST(NULL AS varchar(200)) AS NOMBRE_ACTOR_INICIAL, " +
            "DATEDIFF(DAY, CAST(GETDATE() AS date), CAST(PA.FECHA_FIN_INSCRIPCION AS date)) AS DIAS_VENCE, " +
            "CAST(NULL AS int) AS DIAS_EN_PASO " +
            "FROM dbo.V_ACA_PROSPECTO AS V " +
            "INNER JOIN dbo.ACA_PERIODOS_ACADEMICOS AS PA " +
            "  ON PA.CORR_PERIODO_ACADEMICO = V.CORR_PERIODO_ACADEMICO " +
            "WHERE V.CORR_EMPRESA = @CORR_EMPRESA " +
            "AND NOT EXISTS ( " +
            "  SELECT 1 FROM dbo.SEG_FLUJO_INSTANCIA AS I " +
            "  WHERE I.CORR_EMPRESA = V.CORR_EMPRESA " +
            "    AND I.CORR_TIPO_DOCUMENTO = 104 " +
            "    AND I.CORR_DOCUMENTO = V.CORR_PROSPECTO " +
            ") " +
            "ORDER BY V.FECHA_REGISTRO DESC";

        public Task<CResult> GetAllAsync(List<CParameter> xWhere)
        {
            return LeerSolicitudesAsync(_SqlSolicitudesIngresadas, xWhere);
        }

        public Task<CResult> GetBorradoresAsync(List<CParameter> xWhere)
        {
            return LeerSolicitudesAsync(_SqlSolicitudesBorrador, xWhere);
        }

        // Qué hace: da de alta un prospecto en borrador, con CIF y clave inicial.
        // Cómo lo hace: usa NI_PERSONALINFORMATION_REGISTER (ESTADO 'P', sin flujo) y guarda
        //               la clave como el hash del CIF, igual que el registro del portal.
        public async Task<CResult> RegistrarAsync(ACA_PROSPECTOParam data)
        {
            CResult objResultado = new();

            try
            {
                var codigos = await LeerCodigosOfertaAsync(data.CORR_CARRERA, data.CORR_MODALIDAD);
                if (codigos.carrera == null || codigos.modalidad == null)
                    throw new System.Exception("No se encontró el código de la carrera o de la modalidad.");

                var duplicado = await LeerTextoAsync(_SqlRegistroDuplicado, new List<CParameter>
                {
                    new CParameter() { ParameterName = "NOMBRES", Value = data.NOMBRES, DbType = System.Data.DbType.String },
                    new CParameter() { ParameterName = "APELLIDO1", Value = data.APELLIDO1, DbType = System.Data.DbType.String },
                    new CParameter() { ParameterName = "APELLIDO2", Value = data.APELLIDO2 ?? string.Empty, DbType = System.Data.DbType.String },
                    new CParameter() { ParameterName = "FECHA_NACIMIENTO", Value = data.FECHA_NACIMIENTO.Value.Date, DbType = System.Data.DbType.Date },
                    new CParameter() { ParameterName = "CORREO", Value = data.CORREO, DbType = System.Data.DbType.String },
                });
                if (!string.IsNullOrWhiteSpace(duplicado))
                    throw new System.Exception(duplicado);

                var cicloCerrado = await LeerTextoAsync(_SqlMensajeCicloRegistro, new List<CParameter>
                {
                    new CParameter() { ParameterName = "CORR_CARRERA", Value = data.CORR_CARRERA, DbType = System.Data.DbType.Int32 },
                    new CParameter() { ParameterName = "ANIO", Value = data.ANIO, DbType = System.Data.DbType.Int32 },
                    new CParameter() { ParameterName = "NUMERO_PERIODO", Value = data.NUMERO_PERIODO, DbType = System.Data.DbType.Int32 },
                });
                if (!string.IsNullOrWhiteSpace(cicloCerrado))
                    throw new System.Exception(cicloCerrado);

                var guid = Guid.NewGuid().ToString();
                var periodo = data.ANIO.ToString("0000") + "-" + data.NUMERO_PERIODO.ToString("00");
                var registro = new List<CParameter>
                {
                    new CParameter() { ParameterName = "@Names", Value = data.NOMBRES, DbType = System.Data.DbType.String },
                    new CParameter() { ParameterName = "@FirstLastName", Value = data.APELLIDO1, DbType = System.Data.DbType.String },
                    new CParameter() { ParameterName = "@SecondLastName", Value = data.APELLIDO2 ?? string.Empty, DbType = System.Data.DbType.String },
                    new CParameter() { ParameterName = "@CareerCode", Value = codigos.carrera, DbType = System.Data.DbType.String },
                    new CParameter() { ParameterName = "@TypeModality", Value = codigos.modalidad, DbType = System.Data.DbType.String },
                    new CParameter() { ParameterName = "@Email", Value = data.CORREO, DbType = System.Data.DbType.String },
                    new CParameter() { ParameterName = "@PhoneNumber", Value = data.TELEFONO, DbType = System.Data.DbType.String },
                    new CParameter() { ParameterName = "@BirthDate", Value = data.FECHA_NACIMIENTO.Value.Date, DbType = System.Data.DbType.Date },
                    new CParameter() { ParameterName = "@PersonalGuid", Value = guid, DbType = System.Data.DbType.String },
                    new CParameter() { ParameterName = "@TypeAdmission", Value = data.FORMA_INGRESO, DbType = System.Data.DbType.String },
                    new CParameter() { ParameterName = "@PeriodoCod", Value = periodo, DbType = System.Data.DbType.String },
                    new CParameter() { ParameterName = "@Result", Value = 0, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.Output },
                    new CParameter() { ParameterName = "@Cif", Value = string.Empty, DbType = System.Data.DbType.String, Direction = System.Data.ParameterDirection.Output, Size = 50 },
                };

                await objData.ExecCmd(System.Data.CommandType.StoredProcedure, "NI_PERSONALINFORMATION_REGISTER", true, registro);
                var resultSp = objData.objCommand.Parameters["@Result"].Value;
                var cif = objData.objCommand.Parameters["@Cif"].Value?.ToString();
                objData.objConnection.Close();

                var creado = resultSp != null && resultSp != DBNull.Value && System.Convert.ToInt32(resultSp) > 0 && !string.IsNullOrWhiteSpace(cif);
                if (!creado)
                {
                    var error = await LeerTextoAsync(_SqlErrorRegistro, new List<CParameter>
                    {
                        new CParameter() { ParameterName = "GUID", Value = guid, DbType = System.Data.DbType.String },
                    });
                    throw new System.Exception(string.IsNullOrWhiteSpace(error) ? "No se pudo crear la solicitud." : error);
                }

                await objData.ExecCmd(System.Data.CommandType.Text, _SqlClaveInicial, true, new List<CParameter>
                {
                    new CParameter() { ParameterName = "CLAVE", Value = BCrypt.Net.BCrypt.HashPassword(cif), DbType = System.Data.DbType.String },
                    new CParameter() { ParameterName = "CIF", Value = cif, DbType = System.Data.DbType.String },
                });
                objData.objConnection.Close();

                var fila = await LeerSolicitudesAsync(
                    _SqlSolicitudesBorrador.Replace(
                        "WHERE V.CORR_EMPRESA = @CORR_EMPRESA ",
                        "WHERE V.CORR_EMPRESA = @CORR_EMPRESA AND V.CODIGO_PROSPECTO = @CODIGO_PROSPECTO "),
                    new List<CParameter>
                    {
                        new CParameter() { ParameterName = "CORR_EMPRESA", Value = data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
                        new CParameter() { ParameterName = "CODIGO_PROSPECTO", Value = cif, DbType = System.Data.DbType.String },
                    });

                if (!fila.Result)
                    return fila;

                var lista = fila.Data as System.Collections.Generic.List<ACA_PROSPECTOView>;
                var prospecto = lista?.FirstOrDefault();
                if (prospecto == null)
                    throw new System.Exception("La solicitud se creó, pero no se pudo leer para el listado.");

                objResultado.Data = prospecto;
                objResultado.Result = true;
                objResultado.RowsAffected = 1;
                objResultado.ErrorCode = 0;
                objResultado.ErrorMessage = "";
                objResultado.CodeHelper = prospecto.CORR_PROSPECTO;
            }
            catch (System.Exception e)
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

        private async Task<(string carrera, string modalidad)> LeerCodigosOfertaAsync(int corrCarrera, int corrModalidad)
        {
            var reader = await objData.GetDataReader(System.Data.CommandType.Text, _SqlCodigosOferta, new List<CParameter>
            {
                new CParameter() { ParameterName = "CORR_CARRERA", Value = corrCarrera, DbType = System.Data.DbType.Int32 },
                new CParameter() { ParameterName = "CORR_MODALIDAD", Value = corrModalidad, DbType = System.Data.DbType.Int32 },
            });
            string carrera = null;
            string modalidad = null;
            if (reader.Read())
            {
                carrera = reader["CODIGO_CARRERA"] == DBNull.Value ? null : reader["CODIGO_CARRERA"].ToString();
                modalidad = reader["CODIGO_MODALIDAD"] == DBNull.Value ? null : reader["CODIGO_MODALIDAD"].ToString();
            }
            reader.Close();
            objData.objConnection.Close();
            return (carrera, modalidad);
        }

        private async Task<string> LeerTextoAsync(string sql, List<CParameter> parametros)
        {
            var reader = await objData.GetDataReader(System.Data.CommandType.Text, sql, parametros);
            string texto = null;
            if (reader.Read() && reader["MENSAJE"] != DBNull.Value)
                texto = reader["MENSAJE"]?.ToString();
            reader.Close();
            objData.objConnection.Close();
            return texto;
        }

        private const string _SqlCodigosOferta =
            "SELECT C.CODIGO_CARRERA, M.CODIGO_MODALIDAD " +
            "FROM dbo.ACA_CARRERAS C " +
            "CROSS JOIN dbo.ACA_MODALIDADES_ACADEMICAS M " +
            "WHERE C.CORR_CARRERA = @CORR_CARRERA AND M.CORR_MODALIDAD = @CORR_MODALIDAD";

        private const string _SqlRegistroDuplicado =
            "SELECT CASE " +
            "WHEN EXISTS (SELECT 1 FROM dbo.ACA_PROSPECTO_CONTACTO C WHERE C.ES_CORREO = 1 AND C.CONTACTO = @CORREO) " +
            "THEN 'Este correo ya está en otra solicitud. Use otro correo o abra la solicitud que ya existe.' " +
            "WHEN EXISTS (SELECT 1 FROM dbo.ACA_PROSPECTO_PERSONA P " +
            "WHERE dbo.FN_NI_LIMPIAR_ACENTOS_Y_ESPACIOS(P.NOMBRES) = dbo.FN_NI_LIMPIAR_ACENTOS_Y_ESPACIOS(@NOMBRES) " +
            "AND dbo.FN_NI_LIMPIAR_ACENTOS_Y_ESPACIOS(P.APELLIDO1) = dbo.FN_NI_LIMPIAR_ACENTOS_Y_ESPACIOS(@APELLIDO1) " +
            "AND ((P.APELLIDO2 IS NULL AND dbo.FN_NI_LIMPIAR_ACENTOS_Y_ESPACIOS(@APELLIDO2) = '') " +
            "OR dbo.FN_NI_LIMPIAR_ACENTOS_Y_ESPACIOS(P.APELLIDO2) = dbo.FN_NI_LIMPIAR_ACENTOS_Y_ESPACIOS(@APELLIDO2)) " +
            "AND CONVERT(date, P.FECHA_NACIMIENTO) = @FECHA_NACIMIENTO) " +
            "THEN 'Ya existe una solicitud con este nombre y esta fecha de nacimiento. Búsquela en el listado o cambie el nombre o la fecha para crear otra.' " +
            "ELSE '' END AS MENSAJE";

        private const string _SqlErrorRegistro =
            "SELECT TOP 1 ErrorMessage AS MENSAJE FROM dbo.GEN_ADMISIONES_MESSAGES_ERRORS " +
            "WHERE ErrorGuid = @GUID ORDER BY ErrorId DESC";

        private const string _SqlClaveInicial =
            "UPDATE dbo.ACA_PROSPECTO SET CONTRASENA_PROSPECTO = @CLAVE WHERE CODIGO_PROSPECTO = @CIF";

        private async Task<CResult> LeerSolicitudesAsync(string sql, List<CParameter> xWhere)
        {
            CResult objResultado = new();

            try
            {
                var reader = await objData.GetDataReader(System.Data.CommandType.Text, sql, xWhere);
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

        // Qué hace: el período que usaría el registro (carrera, si no facultad, si no área).
        // Cómo lo hace: la misma prioridad de NI_PERSONALINFORMATION_REGISTER. Si ese período ya cerró, la carrera no se ofrece.
        private const string _SqlPeriodoRegistro =
            "SELECT TOP 1 PX.FECHA_FIN FROM ( " +
            "  SELECT 1 AS PRIO, P1.FECHA_FIN_INSCRIPCION AS FECHA_FIN FROM dbo.ACA_PERIODOS_ACADEMICOS P1 " +
            "  WHERE P1.ACTIVO = 1 AND P1.ANIO = @ANIO AND P1.NUMERO_PERIODO = @NUMERO_PERIODO AND P1.CORR_CARRERA = C.CORR_CARRERA " +
            "  UNION ALL " +
            "  SELECT 2, P2.FECHA_FIN_INSCRIPCION FROM dbo.ACA_PERIODOS_ACADEMICOS P2 " +
            "  WHERE P2.ACTIVO = 1 AND P2.ANIO = @ANIO AND P2.NUMERO_PERIODO = @NUMERO_PERIODO AND P2.CORR_FACULTAD = C.CORR_FACULTAD AND P2.CORR_CARRERA IS NULL " +
            "  UNION ALL " +
            "  SELECT 3, P3.FECHA_FIN_INSCRIPCION FROM dbo.ACA_PERIODOS_ACADEMICOS P3 " +
            "  WHERE P3.ACTIVO = 1 AND P3.ANIO = @ANIO AND P3.NUMERO_PERIODO = @NUMERO_PERIODO AND P3.CORR_AREA_ACADEMICA = C.CORR_AREA_ACADEMICA AND P3.CORR_FACULTAD IS NULL AND P3.CORR_CARRERA IS NULL " +
            ") PX ORDER BY PX.PRIO";

        // Qué hace: impide crear la solicitud si el ciclo que va a quedar guardado ya cerró.
        // Cómo lo hace: el registro de admisión no mira la fecha; aquí se revisa antes de llamarlo.
        private const string _SqlMensajeCicloRegistro =
            "SELECT CASE " +
            "WHEN E.FECHA_FIN IS NULL THEN 'No se puede crear la solicitud. No hay un período activo para ese ciclo.' " +
            "WHEN CAST(E.FECHA_FIN AS date) < CAST(GETDATE() AS date) THEN 'No se puede crear la solicitud. La inscripción de este ciclo ya venció.' " +
            "ELSE '' END AS MENSAJE " +
            "FROM dbo.ACA_CARRERAS C " +
            "OUTER APPLY ( " + _SqlPeriodoRegistro + " ) E " +
            "WHERE C.CORR_CARRERA = @CORR_CARRERA";

        private const string _SqlCarrerasDelCiclo =
            "SELECT O.CORR_CARRERA AS CORR, O.CODIGO_CARRERA AS CODIGO, O.NOMBRE_CARRERA AS NOMBRE " +
            "FROM dbo.FN_ACA_OFERTA_CICLO(@ANIO, @NUMERO_PERIODO) O " +
            "INNER JOIN dbo.ACA_CARRERAS C ON C.CORR_CARRERA = O.CORR_CARRERA " +
            "CROSS APPLY ( " + _SqlPeriodoRegistro + " ) E " +
            "WHERE CAST(E.FECHA_FIN AS date) >= CAST(GETDATE() AS date) " +
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

        // Qué hace: ciclos del combo, igual que el select de Periodo del registro de admisión.
        // Cómo lo hace: solo períodos de pregrado con inscripción abierta y al menos una carrera que el registro
        //               dejaría en un período todavía abierto. Si se está editando, se suma el ciclo que ya tiene.
        private const string _SqlCiclos =
            "SELECT CONVERT(VARCHAR(4), X.ANIO) + '-' + RIGHT('0' + CONVERT(VARCHAR(2), X.NUMERO_PERIODO), 2) AS CICLO, " +
            "       X.ANIO, X.NUMERO_PERIODO " +
            "FROM ( " +
            "  SELECT P.ANIO, P.NUMERO_PERIODO FROM ACA_PERIODOS_ACADEMICOS P " +
            "  WHERE P.ACTIVO = 1 AND P.CORR_AREA_ACADEMICA = 5 AND P.FECHA_FIN_INSCRIPCION >= CAST(GETDATE() AS DATE) " +
            "    AND EXISTS ( " +
            "      SELECT 1 FROM dbo.FN_ACA_OFERTA_CICLO(P.ANIO, P.NUMERO_PERIODO) O " +
            "      INNER JOIN dbo.ACA_CARRERAS C ON C.CORR_CARRERA = O.CORR_CARRERA " +
            "      CROSS APPLY ( " +
            "        SELECT TOP 1 PX.FECHA_FIN FROM ( " +
            "          SELECT 1 AS PRIO, P1.FECHA_FIN_INSCRIPCION AS FECHA_FIN FROM dbo.ACA_PERIODOS_ACADEMICOS P1 " +
            "          WHERE P1.ACTIVO = 1 AND P1.ANIO = P.ANIO AND P1.NUMERO_PERIODO = P.NUMERO_PERIODO AND P1.CORR_CARRERA = C.CORR_CARRERA " +
            "          UNION ALL " +
            "          SELECT 2, P2.FECHA_FIN_INSCRIPCION FROM dbo.ACA_PERIODOS_ACADEMICOS P2 " +
            "          WHERE P2.ACTIVO = 1 AND P2.ANIO = P.ANIO AND P2.NUMERO_PERIODO = P.NUMERO_PERIODO AND P2.CORR_FACULTAD = C.CORR_FACULTAD AND P2.CORR_CARRERA IS NULL " +
            "          UNION ALL " +
            "          SELECT 3, P3.FECHA_FIN_INSCRIPCION FROM dbo.ACA_PERIODOS_ACADEMICOS P3 " +
            "          WHERE P3.ACTIVO = 1 AND P3.ANIO = P.ANIO AND P3.NUMERO_PERIODO = P.NUMERO_PERIODO AND P3.CORR_AREA_ACADEMICA = C.CORR_AREA_ACADEMICA AND P3.CORR_FACULTAD IS NULL AND P3.CORR_CARRERA IS NULL " +
            "        ) PX ORDER BY PX.PRIO " +
            "      ) E " +
            "      WHERE CAST(E.FECHA_FIN AS date) >= CAST(GETDATE() AS date) " +
            "    ) " +
            "  UNION " +
            "  SELECT PA.ANIO, PA.NUMERO_PERIODO FROM ACA_PROSPECTO PR " +
            "  INNER JOIN ACA_PERIODOS_ACADEMICOS PA ON PA.CORR_PERIODO_ACADEMICO = PR.CORR_PERIODO_ACADEMICO " +
            "  WHERE PR.CORR_PROSPECTO = @CORR_PROSPECTO " +
            ") X " +
            "ORDER BY X.ANIO, X.NUMERO_PERIODO";


        // Qué hace: indica qué botones del paso puede pulsar este login.
        // Cómo lo hace: Aprobar y Rechazar exigen instancia activa en 38 y el actor origen de ese paso.
        //               Revertir exige estado 39 y el actor origen del paso cuya acción Retorna a 38.
        //               Si la inscripción del ciclo ya cerró, los tres quedan apagados.
        private const string _SqlPuedeAprobar =
            "SELECT CAST(CASE WHEN I.ACTIVO = 1 AND I.CORR_ESTADO_ACTUAL = 38 " +
            "AND NOT EXISTS (SELECT 1 FROM dbo.ACA_PROSPECTO PR INNER JOIN dbo.ACA_PERIODOS_ACADEMICOS PA ON PA.CORR_PERIODO_ACADEMICO = PR.CORR_PERIODO_ACADEMICO WHERE PR.CORR_PROSPECTO = I.CORR_DOCUMENTO AND CAST(PA.FECHA_FIN_INSCRIPCION AS date) < CAST(GETDATE() AS date)) " +
            "AND dbo.SEG_FN_UsuarioMatchActorUnidad(@LOGIN_SISTEMA, PS.CORR_ACTOR_ORIGEN, I.CORR_UNIDAD_DOCUMENTO, I.CORR_EMPRESA) = 1 " +
            "AND EXISTS (SELECT 1 FROM dbo.SEG_FLUJO_PASO_ACCION_ESTADO A WHERE A.CORR_EMPRESA = I.CORR_EMPRESA AND A.CORR_PASO = I.CORR_PASO_ACTUAL AND A.CORR_ESTADO_DESTINO = 39 AND A.PERMITIDO = 1 AND A.ACTIVO = 1) " +
            "THEN 1 ELSE 0 END AS bit) AS PUEDE_APROBAR, " +
            "CAST(CASE WHEN I.ACTIVO = 1 AND I.CORR_ESTADO_ACTUAL = 38 " +
            "AND NOT EXISTS (SELECT 1 FROM dbo.ACA_PROSPECTO PR INNER JOIN dbo.ACA_PERIODOS_ACADEMICOS PA ON PA.CORR_PERIODO_ACADEMICO = PR.CORR_PERIODO_ACADEMICO WHERE PR.CORR_PROSPECTO = I.CORR_DOCUMENTO AND CAST(PA.FECHA_FIN_INSCRIPCION AS date) < CAST(GETDATE() AS date)) " +
            "AND dbo.SEG_FN_UsuarioMatchActorUnidad(@LOGIN_SISTEMA, PS.CORR_ACTOR_ORIGEN, I.CORR_UNIDAD_DOCUMENTO, I.CORR_EMPRESA) = 1 " +
            "AND EXISTS (SELECT 1 FROM dbo.SEG_FLUJO_PASO_ACCION_ESTADO A WHERE A.CORR_EMPRESA = I.CORR_EMPRESA AND A.CORR_PASO = I.CORR_PASO_ACTUAL AND A.CORR_ESTADO_DESTINO = 46 AND A.PERMITIDO = 1 AND A.ACTIVO = 1) " +
            "THEN 1 ELSE 0 END AS bit) AS PUEDE_RECHAZAR, " +
            "CAST(CASE WHEN I.CORR_ESTADO_ACTUAL = 39 " +
            "AND NOT EXISTS (SELECT 1 FROM dbo.ACA_PROSPECTO PR INNER JOIN dbo.ACA_PERIODOS_ACADEMICOS PA ON PA.CORR_PERIODO_ACADEMICO = PR.CORR_PERIODO_ACADEMICO WHERE PR.CORR_PROSPECTO = I.CORR_DOCUMENTO AND CAST(PA.FECHA_FIN_INSCRIPCION AS date) < CAST(GETDATE() AS date)) " +
            "AND EXISTS (" +
            "SELECT 1 FROM dbo.SEG_FLUJO_PASO_ACCION_ESTADO AR " +
            "INNER JOIN dbo.SEG_FLUJO_PASO PR ON PR.CORR_EMPRESA = AR.CORR_EMPRESA AND PR.CORR_PASO = AR.CORR_PASO " +
            "WHERE AR.CORR_EMPRESA = I.CORR_EMPRESA AND AR.CORR_FLUJO_PROCESO = I.CORR_FLUJO_PROCESO AND AR.CORR_TIPO_MOVIMIENTO = 2 AND AR.CORR_ESTADO_DESTINO = 38 AND AR.CORR_PASO_DESTINO IS NOT NULL AND AR.PERMITIDO = 1 AND AR.ACTIVO = 1 " +
            "AND dbo.SEG_FN_UsuarioMatchActorUnidad(@LOGIN_SISTEMA, PR.CORR_ACTOR_ORIGEN, I.CORR_UNIDAD_DOCUMENTO, I.CORR_EMPRESA) = 1" +
            ") THEN 1 ELSE 0 END AS bit) AS PUEDE_REVERTIR " +
            "FROM dbo.SEG_FLUJO_INSTANCIA I " +
            "LEFT JOIN dbo.SEG_FLUJO_PASO PS ON PS.CORR_EMPRESA = I.CORR_EMPRESA AND PS.CORR_PASO = I.CORR_PASO_ACTUAL " +
            "WHERE I.CORR_EMPRESA = @CORR_EMPRESA AND I.CORR_TIPO_DOCUMENTO = 104 AND I.CORR_DOCUMENTO = @CORR_PROSPECTO " +
            "AND I.CORR_INSTANCIA = (SELECT MAX(I2.CORR_INSTANCIA) FROM dbo.SEG_FLUJO_INSTANCIA I2 WHERE I2.CORR_EMPRESA = I.CORR_EMPRESA AND I2.CORR_TIPO_DOCUMENTO = 104 AND I2.CORR_DOCUMENTO = I.CORR_DOCUMENTO)";

        public async Task<CResult> GetPuedeAprobarAsync(List<CParameter> xWhere)
        {
            CResult objResultado = new();
            var corrProspecto = 0;
            var corrParam = xWhere?.Find(p => p.ParameterName == "CORR_PROSPECTO");
            if (corrParam?.Value != null)
                int.TryParse(corrParam.Value.ToString(), out corrProspecto);

            try
            {
                var puedeAprobar = false;
                var puedeRechazar = false;
                var puedeRevertir = false;
                var reader = await objData.GetDataReader(System.Data.CommandType.Text, _SqlPuedeAprobar, xWhere);
                if (reader.Read())
                {
                    if (reader["PUEDE_APROBAR"] != DBNull.Value)
                        puedeAprobar = Convert.ToBoolean(reader["PUEDE_APROBAR"]);
                    if (reader["PUEDE_RECHAZAR"] != DBNull.Value)
                        puedeRechazar = Convert.ToBoolean(reader["PUEDE_RECHAZAR"]);
                    if (reader["PUEDE_REVERTIR"] != DBNull.Value)
                        puedeRevertir = Convert.ToBoolean(reader["PUEDE_REVERTIR"]);
                }
                reader.Close();

                objResultado.Data = new ACA_PROSPECTO_ACCION_FLUJOView
                {
                    CORR_PROSPECTO = corrProspecto,
                    PUEDE_APROBAR = puedeAprobar,
                    PUEDE_RECHAZAR = puedeRechazar,
                    PUEDE_REVERTIR = puedeRevertir
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

        // Qué hace: mismo 100 % que habilita Enviar en admisión.
        // Cómo lo hace: promedia los anillos del portal (datos personales, documentación,
        //               estudio socioeconómico y, si marcó interés, el formulario de beca).
        private const string _SqlCompletitudAprobar =
            "DECLARE @persona int, @pFilled int = 0, @pTotal int = 0, @pPct int = 0, " +
            "@eq bit = 0, @cuota bit = 0, @dTotal int = 0, @dCarg int = 0, @dPct int = 0, " +
            "@socio int, @version varchar(20), @seFilled int = 0, @seTotal int = 0, @sePct int = 0, " +
            "@becas bit = 0, @beca int, @becaTipo int, @becaVer int, @bTotal int = 0, @bFilled int = 0, @bPct int = 0, " +
            "@n int = 3, @general int = 0, @mensaje varchar(500) = ''; " +
            "SELECT TOP 1 @persona = CORR_PROSPECTO_PERSONA FROM dbo.ACA_PROSPECTO_PERSONA WHERE CORR_PROSPECTO = @CORR_PROSPECTO; " +
            "IF @persona IS NOT NULL BEGIN " +
            "  SELECT @pTotal = 11, @pFilled = " +
            "    CASE WHEN NULLIF(LTRIM(RTRIM(LUGAR_NACIMIENTO)), '') IS NOT NULL THEN 1 ELSE 0 END " +
            "    + CASE WHEN CORR_PAIS_PROCEDENCIA IS NOT NULL THEN 1 ELSE 0 END " +
            "    + CASE WHEN CORR_PAIS_RESIDENCIA IS NOT NULL THEN 1 ELSE 0 END " +
            "    + CASE WHEN CORR_SEXO IS NOT NULL THEN 1 ELSE 0 END " +
            "    + CASE WHEN NULLIF(LTRIM(RTRIM(DUI)), '') IS NOT NULL THEN 1 ELSE 0 END " +
            "    + CASE WHEN CORR_ESTADO_CIVIL IS NOT NULL THEN 1 ELSE 0 END " +
            "    + CASE WHEN CORR_RELIGION IS NOT NULL THEN 1 ELSE 0 END " +
            "    + CASE WHEN NULLIF(LTRIM(RTRIM(IGLESIA_ACTUAL)), '') IS NOT NULL THEN 1 ELSE 0 END " +
            "    + CASE WHEN NULLIF(LTRIM(RTRIM(DIRECCION_ACTUAL)), '') IS NOT NULL THEN 1 ELSE 0 END " +
            "    + CASE WHEN CORR_DEPTO_RESIDENCIA IS NOT NULL THEN 1 ELSE 0 END " +
            "    + CASE WHEN CORR_MUNICIPIO_RESIDENCIA IS NOT NULL THEN 1 ELSE 0 END " +
            "  FROM dbo.ACA_PROSPECTO_PERSONA WHERE CORR_PROSPECTO_PERSONA = @persona; " +
            "  IF EXISTS (SELECT 1 FROM dbo.ACA_PROSPECTO_PERSONA WHERE CORR_PROSPECTO_PERSONA = @persona AND HA_SIDO_DEPORTADO = 1) BEGIN " +
            "    SET @pTotal = @pTotal + 1; " +
            "    IF EXISTS (SELECT 1 FROM dbo.ACA_PROSPECTO_DEPORTACION WHERE CORR_PROSPECTO_PERSONA = @persona AND ES_VIGENTE = 1) SET @pFilled = @pFilled + 1; " +
            "  END " +
            "  IF EXISTS (SELECT 1 FROM dbo.ACA_PROSPECTO_PERSONA WHERE CORR_PROSPECTO_PERSONA = @persona AND POSEE_DISCAPACIDAD = 1) BEGIN " +
            "    SET @pTotal = @pTotal + 1; " +
            "    IF EXISTS (SELECT 1 FROM dbo.ACA_PROSPECTO_LIMITACION_FISICA WHERE CORR_PROSPECTO_PERSONA = @persona) SET @pFilled = @pFilled + 1; " +
            "  END " +
            "  SET @pTotal = @pTotal + 4; " +
            "  SELECT TOP 1 @pFilled = @pFilled " +
            "    + CASE WHEN NULLIF(LTRIM(RTRIM(NOMBRES)), '') IS NOT NULL THEN 1 ELSE 0 END " +
            "    + CASE WHEN CORR_PARENTESCO > 0 THEN 1 ELSE 0 END " +
            "    + CASE WHEN NULLIF(LTRIM(RTRIM(TELEFONO_EMERGENCIA)), '') IS NOT NULL THEN 1 ELSE 0 END " +
            "    + CASE WHEN NULLIF(LTRIM(RTRIM(DIRECCION_EMERGENCIA)), '') IS NOT NULL THEN 1 ELSE 0 END " +
            "  FROM dbo.ACA_PROSPECTO_FAMILIAR WHERE CORR_PROSPECTO_PERSONA = @persona AND ES_EMERGENCIA = 1; " +
            "  SET @pTotal = @pTotal + 6; " +
            "  SELECT TOP 1 @pFilled = @pFilled " +
            "    + CASE WHEN NULLIF(LTRIM(RTRIM(NOMBRE_INSTITUCION)), '') IS NOT NULL THEN 1 ELSE 0 END " +
            "    + CASE WHEN NULLIF(LTRIM(RTRIM(TIPO_EDUCACION)), '') IS NOT NULL THEN 1 ELSE 0 END " +
            "    + CASE WHEN NULLIF(LTRIM(RTRIM(TITULO_OBTENIDO)), '') IS NOT NULL THEN 1 ELSE 0 END " +
            "    + CASE WHEN ANIO_TITULACION IS NOT NULL THEN 1 ELSE 0 END " +
            "    + CASE WHEN CORR_PAIS IS NOT NULL THEN 1 ELSE 0 END " +
            "    + CASE WHEN CORR_DEPTO IS NOT NULL THEN 1 ELSE 0 END " +
            "  FROM dbo.ACA_PROSPECTO_ESTUDIO WHERE CORR_PROSPECTO_PERSONA = @persona AND NIVEL_ESTUDIO = 'MEDIO' AND GRADUADO_UEES = 0; " +
            "  SET @pTotal = @pTotal + 1; " +
            "  IF EXISTS (SELECT 1 FROM dbo.ACA_PROSPECTO_MEDIO_ORIGEN WHERE CORR_PROSPECTO_PERSONA = @persona) SET @pFilled = @pFilled + 1; " +
            "  SET @pPct = CASE WHEN @pTotal = 0 THEN 0 ELSE CAST(ROUND(@pFilled * 100.0 / @pTotal, 0) AS int) END; " +
            "  IF @pPct > 100 SET @pPct = 100; " +
            "END " +
            "SELECT @eq = CASE WHEN UPPER(LTRIM(RTRIM(ISNULL(FORMA_INGRESO, '')))) = 'EQ' THEN 1 ELSE 0 END, " +
            "       @becas = CASE WHEN BECAS_INTERES = 1 THEN 1 ELSE 0 END " +
            "FROM dbo.ACA_PROSPECTO WHERE CORR_PROSPECTO = @CORR_PROSPECTO; " +
            "SELECT TOP 1 @cuota = CASE WHEN S.APLICA_CUOTA_MAXIMA = 1 THEN 1 ELSE 0 END, " +
            "       @socio = S.CORR_PROSPECTO_SOCIOECONOMICO, @version = V.CODIGO " +
            "FROM dbo.ACA_PROSPECTO_PERSONA P " +
            "INNER JOIN dbo.ACA_PROSPECTO_SOCIOECONOMICO S ON S.CORR_PROSPECTO_PERSONA = P.CORR_PROSPECTO_PERSONA " +
            "LEFT JOIN dbo.ACA_SE_VERSION V ON V.CORR_VERSION = S.CORR_VERSION " +
            "WHERE P.CORR_PROSPECTO = @CORR_PROSPECTO ORDER BY S.CORR_PROSPECTO_SOCIOECONOMICO DESC; " +
            "SELECT @dTotal = COUNT(*) FROM dbo.ACA_DOCUMENTO_ADMISION D " +
            "WHERE D.ACTIVO = 1 AND EXISTS (SELECT 1 FROM dbo.ACA_DOCUMENTO_ADMISION_REGLA R " +
            "  WHERE R.CORR_DOCUMENTO_ADMISION = D.CORR_DOCUMENTO_ADMISION AND R.ES_EQUIVALENCIA = @eq AND R.CON_CUOTA_MAXIMA = @cuota); " +
            "SELECT @dCarg = COUNT(DISTINCT X.CORR_DOCUMENTO_ADMISION) FROM dbo.ACA_PROSPECTO_DOCUMENTO X " +
            "WHERE X.CORR_PROSPECTO = @CORR_PROSPECTO AND X.ACTIVO = 1 AND EXISTS (SELECT 1 FROM dbo.ACA_DOCUMENTO_ADMISION D " +
            "  WHERE D.CORR_DOCUMENTO_ADMISION = X.CORR_DOCUMENTO_ADMISION AND D.ACTIVO = 1 AND EXISTS (SELECT 1 FROM dbo.ACA_DOCUMENTO_ADMISION_REGLA R " +
            "    WHERE R.CORR_DOCUMENTO_ADMISION = D.CORR_DOCUMENTO_ADMISION AND R.ES_EQUIVALENCIA = @eq AND R.CON_CUOTA_MAXIMA = @cuota)); " +
            "SET @dPct = CASE WHEN @dTotal = 0 THEN 0 ELSE CAST(ROUND(@dCarg * 100.0 / @dTotal, 0) AS int) END; " +
            "IF @cuota = 1 SET @sePct = 100; " +
            "ELSE IF @socio IS NOT NULL BEGIN " +
            "  DECLARE @centro int = 0, @bachNom int = 0, @bachCuo int = 0, @uniTiene bit = 0, @uniNom int = 0, " +
            "          @ing int = 0, @alim int = 0, @serv int = 0, @tran int = 0, @personas int = 0; " +
            "  SELECT @centro = CASE WHEN S.CORR_TIPO_INSTITUCION IS NOT NULL OR EXISTS (SELECT 1 FROM dbo.ACA_PROSPECTO_SE_RESPUESTA R INNER JOIN dbo.ACA_SE_PREGUNTA Q ON Q.CORR_PREGUNTA = R.CORR_PREGUNTA LEFT JOIN dbo.ACA_SE_OPCION O ON O.CORR_OPCION = R.CORR_OPCION WHERE R.CORR_PROSPECTO_SOCIOECONOMICO = S.CORR_PROSPECTO_SOCIOECONOMICO AND Q.CODIGO = 'CENTRO_EDUCATIVO' AND (NULLIF(LTRIM(RTRIM(O.CODIGO)), '') IS NOT NULL OR NULLIF(LTRIM(RTRIM(R.VALOR_TEXTO)), '') IS NOT NULL)) THEN 1 ELSE 0 END " +
            "  FROM dbo.ACA_PROSPECTO_SOCIOECONOMICO S WHERE S.CORR_PROSPECTO_SOCIOECONOMICO = @socio; " +
            "  SELECT @bachNom = MAX(CASE WHEN Q.CODIGO = 'BACH_NOMBRE' AND NULLIF(LTRIM(RTRIM(R.VALOR_TEXTO)), '') IS NOT NULL THEN 1 ELSE 0 END), " +
            "         @bachCuo = MAX(CASE WHEN Q.CODIGO = 'BACH_CUOTA' AND R.VALOR_NUMERO IS NOT NULL THEN 1 ELSE 0 END), " +
            "         @uniTiene = MAX(CASE WHEN Q.CODIGO = 'UNI_TIENE' AND R.VALOR_BIT = 1 THEN 1 ELSE 0 END), " +
            "         @uniNom = MAX(CASE WHEN Q.CODIGO = 'UNI_NOMBRE' AND NULLIF(LTRIM(RTRIM(R.VALOR_TEXTO)), '') IS NOT NULL THEN 1 ELSE 0 END), " +
            "         @alim = MAX(CASE WHEN Q.CODIGO = 'EGR_ALIM_MONTO' AND R.VALOR_NUMERO IS NOT NULL AND R.VALOR_NUMERO <> 0 THEN 1 ELSE 0 END), " +
            "         @serv = MAX(CASE WHEN Q.CODIGO = 'EGR_SERV_MONTO' AND R.VALOR_NUMERO IS NOT NULL AND R.VALOR_NUMERO <> 0 THEN 1 ELSE 0 END), " +
            "         @tran = MAX(CASE WHEN Q.CODIGO = 'EGR_TRAN_MONTO' AND R.VALOR_NUMERO IS NOT NULL AND R.VALOR_NUMERO <> 0 THEN 1 ELSE 0 END) " +
            "  FROM dbo.ACA_PROSPECTO_SE_RESPUESTA R INNER JOIN dbo.ACA_SE_PREGUNTA Q ON Q.CORR_PREGUNTA = R.CORR_PREGUNTA " +
            "  WHERE R.CORR_PROSPECTO_SOCIOECONOMICO = @socio; " +
            "  IF EXISTS (SELECT 1 FROM dbo.ACA_PROSPECTO_SE_RESPUESTA R INNER JOIN dbo.ACA_SE_PREGUNTA Q ON Q.CORR_PREGUNTA = R.CORR_PREGUNTA WHERE R.CORR_PROSPECTO_SOCIOECONOMICO = @socio AND ( " +
            "      (Q.CODIGO = 'ING_EST_LUGAR' AND NULLIF(LTRIM(RTRIM(R.VALOR_TEXTO)), '') IS NOT NULL AND EXISTS (SELECT 1 FROM dbo.ACA_PROSPECTO_SE_RESPUESTA L INNER JOIN dbo.ACA_SE_PREGUNTA LQ ON LQ.CORR_PREGUNTA = L.CORR_PREGUNTA WHERE L.CORR_PROSPECTO_SOCIOECONOMICO = @socio AND LQ.CODIGO = 'ING_EST_LIQ' AND L.VALOR_NUMERO IS NOT NULL AND L.VALOR_NUMERO <> 0)) " +
            "      OR (Q.CODIGO = 'ING_MAD_LUGAR' AND NULLIF(LTRIM(RTRIM(R.VALOR_TEXTO)), '') IS NOT NULL AND EXISTS (SELECT 1 FROM dbo.ACA_PROSPECTO_SE_RESPUESTA L INNER JOIN dbo.ACA_SE_PREGUNTA LQ ON LQ.CORR_PREGUNTA = L.CORR_PREGUNTA WHERE L.CORR_PROSPECTO_SOCIOECONOMICO = @socio AND LQ.CODIGO = 'ING_MAD_LIQ' AND L.VALOR_NUMERO IS NOT NULL AND L.VALOR_NUMERO <> 0)) " +
            "      OR (Q.CODIGO = 'ING_PAD_LUGAR' AND NULLIF(LTRIM(RTRIM(R.VALOR_TEXTO)), '') IS NOT NULL AND EXISTS (SELECT 1 FROM dbo.ACA_PROSPECTO_SE_RESPUESTA L INNER JOIN dbo.ACA_SE_PREGUNTA LQ ON LQ.CORR_PREGUNTA = L.CORR_PREGUNTA WHERE L.CORR_PROSPECTO_SOCIOECONOMICO = @socio AND LQ.CODIGO = 'ING_PAD_LIQ' AND L.VALOR_NUMERO IS NOT NULL AND L.VALOR_NUMERO <> 0)) " +
            "      OR (Q.CODIGO = 'ING_OTR_LUGAR' AND NULLIF(LTRIM(RTRIM(R.VALOR_TEXTO)), '') IS NOT NULL AND EXISTS (SELECT 1 FROM dbo.ACA_PROSPECTO_SE_RESPUESTA L INNER JOIN dbo.ACA_SE_PREGUNTA LQ ON LQ.CORR_PREGUNTA = L.CORR_PREGUNTA WHERE L.CORR_PROSPECTO_SOCIOECONOMICO = @socio AND LQ.CODIGO = 'ING_OTR_LIQ' AND L.VALOR_NUMERO IS NOT NULL AND L.VALOR_NUMERO <> 0)) " +
            "      OR (Q.CODIGO = 'ING_REM_BRUTO' AND R.VALOR_NUMERO IS NOT NULL AND R.VALOR_NUMERO <> 0 AND EXISTS (SELECT 1 FROM dbo.ACA_PROSPECTO_SE_RESPUESTA L INNER JOIN dbo.ACA_SE_PREGUNTA LQ ON LQ.CORR_PREGUNTA = L.CORR_PREGUNTA WHERE L.CORR_PROSPECTO_SOCIOECONOMICO = @socio AND LQ.CODIGO = 'ING_REM_LIQ' AND L.VALOR_NUMERO IS NOT NULL AND L.VALOR_NUMERO <> 0)) " +
            "  )) SET @ing = 1; " +
            "  SET @seTotal = 7; SET @seFilled = ISNULL(@centro, 0) + ISNULL(@bachNom, 0) + ISNULL(@bachCuo, 0) + @ing + ISNULL(@alim, 0) + ISNULL(@serv, 0) + ISNULL(@tran, 0); " +
            "  IF @uniTiene = 1 BEGIN SET @seTotal = @seTotal + 1; SET @seFilled = @seFilled + ISNULL(@uniNom, 0); END " +
            "  IF UPPER(ISNULL(@version, '')) = 'V2' BEGIN SET @seTotal = @seTotal + 1; SET @seFilled = @seFilled + @personas; END " +
            "  SET @sePct = CASE WHEN @seTotal = 0 THEN 0 ELSE CAST(ROUND(@seFilled * 100.0 / @seTotal, 0) AS int) END; " +
            "  IF @sePct > 100 SET @sePct = 100; " +
            "END " +
            "IF @becas = 1 BEGIN " +
            "  SET @n = 4; " +
            "  SELECT TOP 1 @beca = CORR_PROSPECTO_BECA, @becaTipo = CORR_BECA, @becaVer = CORR_FORMULARIO_VERSION " +
            "  FROM dbo.ACA_PROSPECTO_BECA WHERE CORR_PROSPECTO = @CORR_PROSPECTO AND ACTIVO = 1 ORDER BY CORR_PROSPECTO_BECA DESC; " +
            "  IF @beca IS NOT NULL BEGIN " +
            "    SELECT @bTotal = COUNT(*), @bFilled = SUM(CASE WHEN Resp.Ok = 1 THEN 1 ELSE 0 END) " +
            "    FROM dbo.ACA_PROSPECTO_BECA_SECCION S " +
            "    INNER JOIN dbo.ACA_PROSPECTO_BECA_PREGUNTA P ON P.CORR_SECCION_BECA = S.CORR_SECCION_BECA AND P.ACTIVO = 1 AND P.REQUERIDO = 1 " +
            "    INNER JOIN dbo.ACA_PROSPECTO_BECA_PREGUNTA_TIPO PT ON PT.CORR_PREGUNTA_BECA = P.CORR_PREGUNTA_BECA AND PT.CORR_BECA = @becaTipo AND PT.ACTIVO = 1 " +
            "    OUTER APPLY (SELECT CASE WHEN P.TIPO_RESPUESTA = 'ACEPTACION' AND EXISTS (SELECT 1 FROM dbo.ACA_PROSPECTO_BECA_RESPUESTA R WHERE R.CORR_PROSPECTO_BECA = @beca AND R.CORR_PREGUNTA_BECA = P.CORR_PREGUNTA_BECA AND (UPPER(LTRIM(RTRIM(ISNULL(R.RESPUESTA_TEXTO, '')))) IN ('TRUE', '1', 'SI', 'S') OR R.RESPUESTA_NUMERO = 1)) THEN 1 WHEN P.TIPO_RESPUESTA <> 'ACEPTACION' AND EXISTS (SELECT 1 FROM dbo.ACA_PROSPECTO_BECA_RESPUESTA R WHERE R.CORR_PROSPECTO_BECA = @beca AND R.CORR_PREGUNTA_BECA = P.CORR_PREGUNTA_BECA AND (NULLIF(LTRIM(RTRIM(R.RESPUESTA_TEXTO)), '') IS NOT NULL OR R.RESPUESTA_NUMERO IS NOT NULL OR R.RESPUESTA_FECHA IS NOT NULL OR R.CORR_OPCION_BECA IS NOT NULL OR NULLIF(LTRIM(RTRIM(R.ARCHIVO_NOMBRE)), '') IS NOT NULL)) THEN 1 ELSE 0 END AS Ok) Resp " +
            "    WHERE S.CORR_FORMULARIO_VERSION = @becaVer AND S.ACTIVO = 1 " +
            "      AND (NOT EXISTS (SELECT 1 FROM dbo.ACA_PROSPECTO_BECA_DEPENDENCIA D WHERE D.CORR_PREGUNTA_HIJA = P.CORR_PREGUNTA_BECA AND D.ACTIVO = 1) " +
            "           OR EXISTS (SELECT 1 FROM dbo.ACA_PROSPECTO_BECA_DEPENDENCIA D INNER JOIN dbo.ACA_PROSPECTO_BECA_RESPUESTA RP ON RP.CORR_PROSPECTO_BECA = @beca AND RP.CORR_PREGUNTA_BECA = D.CORR_PREGUNTA_PADRE AND RP.CORR_OPCION_BECA = D.CORR_OPCION_PADRE WHERE D.CORR_PREGUNTA_HIJA = P.CORR_PREGUNTA_BECA AND D.ACTIVO = 1)); " +
            "    SET @bPct = CASE WHEN ISNULL(@bTotal, 0) = 0 THEN 0 ELSE CAST(ROUND(ISNULL(@bFilled, 0) * 100.0 / @bTotal, 0) AS int) END; " +
            "  END " +
            "END " +
            "IF @SOLO_NUEVO_INGRESO = 1 BEGIN " +
            "  SET @general = CAST(ROUND((@pPct + @dPct) * 1.0 / 2, 0) AS int); " +
            "  IF @pPct < 100 OR @dPct < 100 BEGIN " +
            "    SET @mensaje = 'No se puede enviar. La solicitud de nuevo ingreso debe estar al 100%.'; " +
            "    IF @pPct < 100 SET @mensaje = @mensaje + ' Datos personales ' + CONVERT(varchar(10), @pPct) + '%.'; " +
            "    IF @dPct < 100 SET @mensaje = @mensaje + ' Documentación ' + CONVERT(varchar(10), @dPct) + '%.'; " +
            "  END " +
            "END ELSE BEGIN " +
            "  SET @general = CAST(ROUND((@pPct + @dPct + @sePct + CASE WHEN @becas = 1 THEN @bPct ELSE 0 END) * 1.0 / @n, 0) AS int); " +
            "  IF @general < 100 BEGIN " +
            "    SET @mensaje = 'No se puede aprobar. Los formularios deben estar al 100%, igual que para enviar en admisión.'; " +
            "    IF @pPct < 100 SET @mensaje = @mensaje + ' Datos personales ' + CONVERT(varchar(10), @pPct) + '%.'; " +
            "    IF @dPct < 100 SET @mensaje = @mensaje + ' Documentación ' + CONVERT(varchar(10), @dPct) + '%.'; " +
            "    IF @sePct < 100 SET @mensaje = @mensaje + ' Estudio socioeconómico ' + CONVERT(varchar(10), @sePct) + '%.'; " +
            "    IF @becas = 1 AND @bPct < 100 SET @mensaje = @mensaje + ' Formulario de beca ' + CONVERT(varchar(10), @bPct) + '%.'; " +
            "  END " +
            "END " +
            "SELECT @general AS PORCENTAJE, @mensaje AS MENSAJE;";

        // Qué hace: dice si el ciclo del prospecto ya cerró la inscripción.
        // Cómo lo hace: el mismo corte de la grilla, FECHA_FIN_INSCRIPCION anterior a hoy. El día de cierre sigue abierto.
        private const string _SqlInscripcionVencida =
            "SELECT CASE WHEN EXISTS (" +
            "SELECT 1 FROM dbo.ACA_PROSPECTO PR " +
            "INNER JOIN dbo.ACA_PERIODOS_ACADEMICOS PA ON PA.CORR_PERIODO_ACADEMICO = PR.CORR_PERIODO_ACADEMICO " +
            "WHERE PR.CORR_PROSPECTO = @CORR_PROSPECTO " +
            "AND CAST(PA.FECHA_FIN_INSCRIPCION AS date) < CAST(GETDATE() AS date)" +
            ") THEN 1 ELSE 0 END AS VENCIDA";

        // Qué hace: mueve el flujo 104 con el login de la sesión.
        // Cómo lo hace: 1 envía el borrador si el ciclo sigue abierto y datos personales y documentación están al 100 %.
        //               3 aprueba (exige también socioeconómico y beca), 4 rechaza y 5 revierte.
        public async Task<CResult> AccionFlujoAsync(int corrEmpresa, int corrProspecto, string login, string observacion, string estacion, int operacion)
        {
            CResult objResultado = new();
            const string spName = "PRAL_MTTO_ACA_PROSPECTO_NUEVO_INGRESO_AUTORIZA";

            try
            {
                if (operacion == 1 && await InscripcionVencidaAsync(corrProspecto))
                {
                    objResultado.Result = false;
                    objResultado.ErrorCode = -16;
                    objResultado.ErrorMessage = "No se puede enviar. La inscripción de este ciclo ya venció.";
                    objResultado.CodeHelper = corrProspecto;
                    return objResultado;
                }

                if (operacion == 1 || operacion == 3)
                {
                var incompleto = await MensajeSiNoEstaCompletaAsync(corrProspecto, operacion == 1);
                if (!string.IsNullOrWhiteSpace(incompleto))
                {
                    objResultado.Result = false;
                    objResultado.ErrorCode = -16;
                    objResultado.ErrorMessage = incompleto;
                    objResultado.CodeHelper = corrProspecto;
                    return objResultado;
                }
                }

                var p = new List<CParameter>
                {
                    new CParameter() { ParameterName = "@CORR_EMPRESA", Value = corrEmpresa, DbType = System.Data.DbType.Int32 },
                    new CParameter() { ParameterName = "@CORR_PROSPECTO", Value = corrProspecto, DbType = System.Data.DbType.Int32 },
                    new CParameter() { ParameterName = "@CORR_UNIDAD_DOCUMENTO", Value = operacion == 1 ? 6 : DBNull.Value, DbType = System.Data.DbType.Int32 },
                    new CParameter() { ParameterName = "@OPERACION", Value = operacion, DbType = System.Data.DbType.Int32 },
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

        // Qué hace: true si la inscripción del ciclo de ese prospecto ya cerró.
        // Cómo lo hace: lee FECHA_FIN_INSCRIPCION. Sin fecha no se toma como vencida.
        private async Task<bool> InscripcionVencidaAsync(int corrProspecto)
        {
            var parametros = new List<CParameter>
            {
                new CParameter() { ParameterName = "CORR_PROSPECTO", Value = corrProspecto, DbType = System.Data.DbType.Int32 },
            };
            var reader = await objData.GetDataReader(System.Data.CommandType.Text, _SqlInscripcionVencida, parametros);
            var vencida = reader.Read() && reader["VENCIDA"] != DBNull.Value && Convert.ToInt32(reader["VENCIDA"]) == 1;
            reader.Close();
            return vencida;
        }

        // Qué hace: mensaje si falta el 100 % para enviar o para aprobar.
        // Cómo lo hace: al enviar solo promedia datos personales y documentación de nuevo ingreso.
        //               Al aprobar también exige estudio socioeconómico y, si aplica, la beca.
        private async Task<string> MensajeSiNoEstaCompletaAsync(int corrProspecto, bool soloNuevoIngreso)
        {
            var parametros = new List<CParameter>
            {
                new CParameter() { ParameterName = "CORR_PROSPECTO", Value = corrProspecto, DbType = System.Data.DbType.Int32 },
                new CParameter() { ParameterName = "SOLO_NUEVO_INGRESO", Value = soloNuevoIngreso, DbType = System.Data.DbType.Boolean },
            };
            var reader = await objData.GetDataReader(System.Data.CommandType.Text, _SqlCompletitudAprobar, parametros);
            string mensaje = null;
            if (reader.Read() && reader["MENSAJE"] != DBNull.Value)
                mensaje = reader["MENSAJE"]?.ToString();
            reader.Close();
            return mensaje;
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
