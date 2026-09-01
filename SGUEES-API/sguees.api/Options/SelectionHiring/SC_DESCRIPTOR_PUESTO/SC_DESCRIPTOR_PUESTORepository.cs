using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using Microsoft.Extensions.Configuration;
using SGUEES.Models;

namespace SGUEES.Repositories
{
    public class SC_DESCRIPTOR_PUESTORepository : BaseRepository<SC_DESCRIPTOR_PUESTOTable>, ISC_DESCRIPTOR_PUESTORepository
    {
        private const string _TableName = "SC_DESCRIPTOR_PUESTO";
        private const string _ViewName = "V_SC_DESCRIPTOR_PUESTO";
        private const string _CampoPk = "CORR_DESCRIPTOR_PUESTO";

        public SC_DESCRIPTOR_PUESTORepository(IConfiguration config) :
            base(config.GetConnectionString("defaultConnection"),
                config.GetSection("DbProvider:defaultProvider").Value)
        {
        }

        // Lee de la vista V_SC_DESCRIPTOR_PUESTO filtrando por CORR_EMPRESA; ordena por id.
        public async Task<CResult> GetAllAsync(List<CParameter> xWhere)
        {
            CResult objResultado = new();

            try
            {
                var dbWhere = xWhere
                    .Where(x => x.ParameterName == "CORR_EMPRESA")
                    .ToList();

                var reader = await objData.GetDataReader(_ViewName, dbWhere);
                var response = new List<SC_DESCRIPTOR_PUESTOView>().FromDataReader(reader)
                    .OrderBy(x => x.CORR_DESCRIPTOR_PUESTO)
                    .ToList();

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
            catch (Exception e)
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

        // Lee un registro de V_SC_DESCRIPTOR_PUESTO con los filtros recibidos (empresa + id).
        public async Task<CResult> GetAsync(List<CParameter> xWhere)
        {
            CResult objResultado = new();

            try
            {
                var reader = await objData.GetDataReader(_ViewName, xWhere);
                var response = new List<SC_DESCRIPTOR_PUESTOView>().FromDataReader(reader).FirstOrDefault();

                reader.Close();
                reader = null;

                objResultado.Data = response;
                objResultado.Result = true;
                objResultado.RowsAffected = response == null ? 0 : 1;
                objResultado.CodeHelper = response?.CORR_DESCRIPTOR_PUESTO ?? 0;
                objResultado.ErrorCode = 0;
                objResultado.ErrorMessage = "";
                objResultado.ErrorSource = "";
            }
            catch (Exception e)
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

        // Inserta en SC_DESCRIPTOR_PUESTO y devuelve el registro creado leído desde la vista.
        public async Task<CResult> CreateAsync(SC_DESCRIPTOR_PUESTOTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            CResult objResultado = new();

            try
            {
                var p = BuildWriteParameters(Data);
                var pWhere = new List<CParameter>
                {
                    new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
                };

                var reader = await objData.Insert(_TableName, p, _CampoPk, pWhere);
                var response = new List<SC_DESCRIPTOR_PUESTOView>().FromDataReader(reader).FirstOrDefault();

                reader.Close();
                reader = null;

                // El correlativo lo asigna el Insert, así que el código DES-#### se sella aquí,
                // solo al crear. El Update devuelve la fila ya con el código y evita releer la vista.
                response = await SellarCodigoDescriptorAsync(response);

                objResultado.Data = response;
                objResultado.Result = true;
                objResultado.RowsAffected = 1;
                objResultado.CodeHelper = response?.CORR_DESCRIPTOR_PUESTO ?? 0;
                objResultado.ErrorCode = 0;
                objResultado.ErrorMessage = "";
                objResultado.ErrorSource = "";
            }
            catch (Exception e)
            {
                var duplicateKey = IsDuplicateKeyError(e);
                objResultado.Data = null;
                objResultado.Result = false;
                objResultado.CodeHelper = 0;
                objResultado.ErrorCode = duplicateKey ? 2627 : -1;
                objResultado.ErrorMessage = duplicateKey
                    ? "No se pudo guardar el registro porque otro usuario guardo un registro al mismo tiempo. Intente nuevamente."
                    : e.Message;
                objResultado.ErrorSource += $"[{e.Source}]";
            }
            finally
            {
                objData.objConnection.Close();
            }

            return objResultado;
        }

        // Qué hace: graba el código legible DES-#### del descriptor recién creado.
        // Cómo: formatea el correlativo a 4 dígitos y actualiza solo esa columna; devuelve la
        //       fila actualizada para que el SPA la use sin volver a consultar.
        private async Task<SC_DESCRIPTOR_PUESTOView> SellarCodigoDescriptorAsync(SC_DESCRIPTOR_PUESTOView creado)
        {
            if (creado == null || creado.CORR_DESCRIPTOR_PUESTO <= 0)
            {
                return creado;
            }

            var codigo = $"DES-{creado.CORR_DESCRIPTOR_PUESTO:0000}";
            var campos = new List<CParameter>
            {
                new CParameter() { ParameterName = "CODIGO_DESCRIPTOR_PUESTO", Value = codigo, DbType = System.Data.DbType.String },
            };
            var pWhere = new List<CParameter>
            {
                new CParameter() { ParameterName = "CORR_EMPRESA", Value = creado.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
                new CParameter() { ParameterName = _CampoPk, Value = creado.CORR_DESCRIPTOR_PUESTO, DbType = System.Data.DbType.Int32 },
            };

            var reader = await objData.Update(_TableName, campos, pWhere);
            var actualizado = new List<SC_DESCRIPTOR_PUESTOView>().FromDataReader(reader).FirstOrDefault();
            reader.Close();

            if (actualizado != null)
            {
                return actualizado;
            }

            // Si el Update no devolvió fila, al menos el SPA recibe el código recién grabado.
            creado.CODIGO_DESCRIPTOR_PUESTO = codigo;
            return creado;
        }

        // Actualiza SC_DESCRIPTOR_PUESTO por CORR_EMPRESA + CORR_DESCRIPTOR_PUESTO y devuelve el registro.
        public async Task<CResult> UpdateAsync(SC_DESCRIPTOR_PUESTOTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            CResult objResultado = new();

            try
            {
                var p = new List<CParameter>
                {
                    new CParameter() { ParameterName = "CORR_PUESTO", Value = Data.CORR_PUESTO, DbType = System.Data.DbType.Int32 },
                    new CParameter() { ParameterName = "CORR_UNIDAD", Value = Data.CORR_UNIDAD, DbType = System.Data.DbType.Int32 },
                    new CParameter() { ParameterName = "FECHA_EMISION", Value = ToSqlDate(Data.FECHA_EMISION), DbType = System.Data.DbType.Date },
                    new CParameter() { ParameterName = "CORR_PUESTO_REPORTA", Value = Data.CORR_PUESTO_REPORTA, DbType = System.Data.DbType.Int32 },
                    new CParameter() { ParameterName = "FECHA_REVISION", Value = ToSqlDate(Data.FECHA_REVISION), DbType = System.Data.DbType.Date },
                    new CParameter() { ParameterName = "NUM_PERSONAL_CARGO", Value = Data.NUM_PERSONAL_CARGO, DbType = System.Data.DbType.Int32 },
                    new CParameter() { ParameterName = "OBJETIVO_PUESTO", Value = Data.OBJETIVO_PUESTO, DbType = System.Data.DbType.String },
                    new CParameter() { ParameterName = "NOMBRE_PUESTO", Value = Data.NOMBRE_PUESTO, DbType = System.Data.DbType.String },
                    new CParameter() { ParameterName = "NOMBRE_UNIDAD", Value = Data.NOMBRE_UNIDAD, DbType = System.Data.DbType.String },
                    new CParameter() { ParameterName = "FORMATO", Value = Data.FORMATO, DbType = System.Data.DbType.String },
                    new CParameter() { ParameterName = "VERSION", Value = Data.VERSION, DbType = System.Data.DbType.Int32 },
                    new CParameter() { ParameterName = "CORR_ESTADO", Value = Data.CORR_ESTADO, DbType = System.Data.DbType.Int32 },
                    new CParameter() { ParameterName = "NOMBRE_ESTADO", Value = Data.NOMBRE_ESTADO, DbType = System.Data.DbType.String },
                    new CParameter() { ParameterName = "USUARIO_ACTU", Value = Data.USUARIO_ACTU, DbType = System.Data.DbType.String },
                    new CParameter() { ParameterName = "ESTACION_ACTU", Value = Data.ESTACION_ACTU, DbType = System.Data.DbType.String },
                    new CParameter() { ParameterName = "FECHA_ACTU", Value = Data.FECHA_ACTU, DbType = System.Data.DbType.DateTime },
                };

                var pWhere = new List<CParameter>
                {
                    new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
                    new CParameter() { ParameterName = "CORR_DESCRIPTOR_PUESTO", Value = Data.CORR_DESCRIPTOR_PUESTO, DbType = System.Data.DbType.Int32 },
                };

                var reader = await objData.Update(_TableName, p, pWhere);
                var response = new List<SC_DESCRIPTOR_PUESTOView>().FromDataReader(reader).FirstOrDefault();

                reader.Close();
                reader = null;

                objResultado.Data = response;
                objResultado.Result = true;
                objResultado.RowsAffected = response == null ? 0 : 1;
                objResultado.CodeHelper = response?.CORR_DESCRIPTOR_PUESTO ?? Data.CORR_DESCRIPTOR_PUESTO;
                objResultado.ErrorCode = 0;
                objResultado.ErrorMessage = "";
                objResultado.ErrorSource = "";
            }
            catch (Exception e)
            {
                var duplicateKey = IsDuplicateKeyError(e);
                objResultado.Data = null;
                objResultado.Result = false;
                objResultado.CodeHelper = 0;
                objResultado.ErrorCode = duplicateKey ? 2627 : -1;
                objResultado.ErrorMessage = duplicateKey
                    ? "No se pudo guardar el registro porque otro usuario guardo un registro al mismo tiempo. Intente nuevamente."
                    : e.Message;
                objResultado.ErrorSource += $"[{e.Source}]";
            }
            finally
            {
                objData.objConnection.Close();
            }

            return objResultado;
        }

        // Actualiza solo RESPONSABLE (editable de Entrenamiento).
        public async Task<CResult> UpdateResponsableAsync(SC_DESCRIPTOR_PUESTOTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            CResult objResultado = new();

            try
            {
                var p = new List<CParameter>
                {
                    new CParameter() { ParameterName = "RESPONSABLE", Value = Data.RESPONSABLE, DbType = System.Data.DbType.String },
                    new CParameter() { ParameterName = "USUARIO_ACTU", Value = Data.USUARIO_ACTU, DbType = System.Data.DbType.String },
                    new CParameter() { ParameterName = "ESTACION_ACTU", Value = Data.ESTACION_ACTU, DbType = System.Data.DbType.String },
                    new CParameter() { ParameterName = "FECHA_ACTU", Value = Data.FECHA_ACTU, DbType = System.Data.DbType.DateTime },
                };

                var pWhere = new List<CParameter>
                {
                    new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
                    new CParameter() { ParameterName = "CORR_DESCRIPTOR_PUESTO", Value = Data.CORR_DESCRIPTOR_PUESTO, DbType = System.Data.DbType.Int32 },
                };

                var reader = await objData.Update(_TableName, p, pWhere);
                var response = new List<SC_DESCRIPTOR_PUESTOView>().FromDataReader(reader).FirstOrDefault();

                reader.Close();
                reader = null;

                objResultado.Data = response;
                objResultado.Result = true;
                objResultado.RowsAffected = response == null ? 0 : 1;
                objResultado.CodeHelper = response?.CORR_DESCRIPTOR_PUESTO ?? Data.CORR_DESCRIPTOR_PUESTO;
                objResultado.ErrorCode = 0;
                objResultado.ErrorMessage = "";
                objResultado.ErrorSource = "";
            }
            catch (Exception e)
            {
                var duplicateKey = IsDuplicateKeyError(e);
                objResultado.Data = null;
                objResultado.Result = false;
                objResultado.CodeHelper = 0;
                objResultado.ErrorCode = duplicateKey ? 2627 : -1;
                objResultado.ErrorMessage = duplicateKey
                    ? "No se pudo guardar el registro porque otro usuario guardo un registro al mismo tiempo. Intente nuevamente."
                    : e.Message;
                objResultado.ErrorSource += $"[{e.Source}]";
            }
            finally
            {
                objData.objConnection.Close();
            }

            return objResultado;
        }

        // Actualiza solo impacto económico (fila virtual de Responsabilidades).
        public async Task<CResult> UpdateImpactoEconomicoAsync(SC_DESCRIPTOR_PUESTOTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            CResult objResultado = new();

            try
            {
                var p = new List<CParameter>
                {
                    new CParameter() { ParameterName = "CORR_IMPACTO_ECONOMICO", Value = Data.CORR_IMPACTO_ECONOMICO, DbType = System.Data.DbType.Int32 },
                    new CParameter() { ParameterName = "DESCRIPCION_IMPACTO_ECONOMICO", Value = Data.DESCRIPCION_IMPACTO_ECONOMICO, DbType = System.Data.DbType.String },
                    new CParameter() { ParameterName = "USUARIO_ACTU", Value = Data.USUARIO_ACTU, DbType = System.Data.DbType.String },
                    new CParameter() { ParameterName = "ESTACION_ACTU", Value = Data.ESTACION_ACTU, DbType = System.Data.DbType.String },
                    new CParameter() { ParameterName = "FECHA_ACTU", Value = Data.FECHA_ACTU, DbType = System.Data.DbType.DateTime },
                };

                var pWhere = new List<CParameter>
                {
                    new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
                    new CParameter() { ParameterName = "CORR_DESCRIPTOR_PUESTO", Value = Data.CORR_DESCRIPTOR_PUESTO, DbType = System.Data.DbType.Int32 },
                };

                var reader = await objData.Update(_TableName, p, pWhere);
                var response = new List<SC_DESCRIPTOR_PUESTOView>().FromDataReader(reader).FirstOrDefault();

                reader.Close();
                reader = null;

                objResultado.Data = response;
                objResultado.Result = true;
                objResultado.RowsAffected = response == null ? 0 : 1;
                objResultado.CodeHelper = response?.CORR_DESCRIPTOR_PUESTO ?? Data.CORR_DESCRIPTOR_PUESTO;
                objResultado.ErrorCode = 0;
                objResultado.ErrorMessage = "";
                objResultado.ErrorSource = "";
            }
            catch (Exception e)
            {
                var duplicateKey = IsDuplicateKeyError(e);
                objResultado.Data = null;
                objResultado.Result = false;
                objResultado.CodeHelper = 0;
                objResultado.ErrorCode = duplicateKey ? 2627 : -1;
                objResultado.ErrorMessage = duplicateKey
                    ? "No se pudo guardar el registro porque otro usuario guardo un registro al mismo tiempo. Intente nuevamente."
                    : e.Message;
                objResultado.ErrorSource += $"[{e.Source}]";
            }
            finally
            {
                objData.objConnection.Close();
            }

            return objResultado;
        }

        // Borra tablas hijas en orden (detalle → encabezados) y luego el registro en SC_DESCRIPTOR_PUESTO.
        public async Task<CResult> DeleteAsync(SC_DESCRIPTOR_PUESTOTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            CResult objResultado = new();

            try
            {
                var pWhere = new List<CParameter>
                {
                    new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
                    new CParameter() { ParameterName = "CORR_DESCRIPTOR_PUESTO", Value = Data.CORR_DESCRIPTOR_PUESTO, DbType = System.Data.DbType.Int32 },
                };

                // Primero elimina detalle y encabezados del descriptor y del perfil; al final el descriptor.
                await objData.Delete("SC_DESCRIPTOR_PUESTO_FUNCION_ACTIVIDAD", pWhere);
                await objData.Delete("SC_DESCRIPTOR_PUESTO_FUNCION", pWhere);
                await objData.Delete("SC_DESCRIPTOR_PUESTO_KPI_FUNCION", pWhere);
                await objData.Delete("SC_DESCRIPTOR_PUESTO_RELACION_LABORAL", pWhere);
                await objData.Delete("SC_DESCRIPTOR_PUESTO_RESPONSABILIDAD_CARGO", pWhere);
                await objData.Delete("SC_DESCRIPTOR_PUESTO_INDUCCION", pWhere);
                await objData.Delete("SC_PERFIL_PUESTO_EDUCACION", pWhere);
                await objData.Delete("SC_PERFIL_PUESTO_EXPERIENCIA", pWhere);
                await objData.Delete("SC_PERFIL_PUESTO_COMPETENCIAS_TECNICAS", pWhere);
                await objData.Delete("SC_PERFIL_PUESTO_COMPETENCIAS_CONDUCTUALES", pWhere);
                await objData.Delete("SC_PERFIL_PUESTO", pWhere);
                await objData.Delete("SC_DESCRIPTOR_PUESTO_REQUERIMIENTO_ORGANIZACIONAL", pWhere);
                await objData.Delete("SC_DESCRIPTOR_PUESTO_RIESGO_PUESTO", pWhere);

                objResultado.RowsAffected = (int)await objData.Delete(_TableName, pWhere);
                objResultado.Data = null;
                objResultado.Result = true;
                objResultado.CodeHelper = Data.CORR_DESCRIPTOR_PUESTO;
                objResultado.ErrorCode = 0;
                objResultado.ErrorMessage = "";
                objResultado.ErrorSource = "";
            }
            catch (Exception e)
            {
                objResultado.Data = null;
                objResultado.Result = false;
                objResultado.CodeHelper = 0;
                objResultado.ErrorCode = -1;
                objResultado.ErrorMessage = "No se puede eliminar el descriptor de puesto porque tiene registros asociados en otras tablas.";
                objResultado.ErrorSource += $"[{e.Source}]";
            }
            finally
            {
                objData.objConnection.Close();
            }

            return objResultado;
        }

        // Arma la lista de columnas y valores para insertar o actualizar en SC_DESCRIPTOR_PUESTO.
        private static List<CParameter> BuildWriteParameters(SC_DESCRIPTOR_PUESTOTable Data, bool includeAuditCreate = true)
        {
            var p = new List<CParameter>
            {
                new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
                new CParameter() { ParameterName = "CORR_DESCRIPTOR_PUESTO", Value = Data.CORR_DESCRIPTOR_PUESTO, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput },
                new CParameter() { ParameterName = "CORR_PUESTO", Value = Data.CORR_PUESTO, DbType = System.Data.DbType.Int32 },
                new CParameter() { ParameterName = "CORR_UNIDAD", Value = Data.CORR_UNIDAD, DbType = System.Data.DbType.Int32 },
                new CParameter() { ParameterName = "FECHA_EMISION", Value = ToSqlDate(Data.FECHA_EMISION), DbType = System.Data.DbType.Date },
                new CParameter() { ParameterName = "CORR_PUESTO_REPORTA", Value = Data.CORR_PUESTO_REPORTA, DbType = System.Data.DbType.Int32 },
                new CParameter() { ParameterName = "FECHA_REVISION", Value = ToSqlDate(Data.FECHA_REVISION), DbType = System.Data.DbType.Date },
                new CParameter() { ParameterName = "NUM_PERSONAL_CARGO", Value = Data.NUM_PERSONAL_CARGO, DbType = System.Data.DbType.Int32 },
                new CParameter() { ParameterName = "OBJETIVO_PUESTO", Value = Data.OBJETIVO_PUESTO, DbType = System.Data.DbType.String },
                new CParameter() { ParameterName = "NOMBRE_PUESTO", Value = Data.NOMBRE_PUESTO, DbType = System.Data.DbType.String },
                new CParameter() { ParameterName = "NOMBRE_UNIDAD", Value = Data.NOMBRE_UNIDAD, DbType = System.Data.DbType.String },
                new CParameter() { ParameterName = "CORR_IMPACTO_ECONOMICO", Value = Data.CORR_IMPACTO_ECONOMICO, DbType = System.Data.DbType.Int32 },
                new CParameter() { ParameterName = "DESCRIPCION_IMPACTO_ECONOMICO", Value = Data.DESCRIPCION_IMPACTO_ECONOMICO, DbType = System.Data.DbType.String },
                new CParameter() { ParameterName = "RESPONSABLE", Value = Data.RESPONSABLE, DbType = System.Data.DbType.String },
                new CParameter() { ParameterName = "FORMATO", Value = Data.FORMATO, DbType = System.Data.DbType.String },
                new CParameter() { ParameterName = "VERSION", Value = Data.VERSION, DbType = System.Data.DbType.Int32 },
                new CParameter() { ParameterName = "CORR_ESTADO", Value = Data.CORR_ESTADO, DbType = System.Data.DbType.Int32 },
                new CParameter() { ParameterName = "NOMBRE_ESTADO", Value = Data.NOMBRE_ESTADO, DbType = System.Data.DbType.String },
                new CParameter() { ParameterName = "USUARIO_ACTU", Value = Data.USUARIO_ACTU, DbType = System.Data.DbType.String },
                new CParameter() { ParameterName = "ESTACION_ACTU", Value = Data.ESTACION_ACTU, DbType = System.Data.DbType.String },
                new CParameter() { ParameterName = "FECHA_ACTU", Value = Data.FECHA_ACTU, DbType = System.Data.DbType.DateTime },
            };

            if (includeAuditCreate)
            {
                p.Add(new CParameter() { ParameterName = "USUARIO_CREA", Value = Data.USUARIO_CREA, DbType = System.Data.DbType.String });
                p.Add(new CParameter() { ParameterName = "ESTACION_CREA", Value = Data.ESTACION_CREA, DbType = System.Data.DbType.String });
                p.Add(new CParameter() { ParameterName = "FECHA_CREA", Value = Data.FECHA_CREA, DbType = System.Data.DbType.DateTime });
            }

            return p;
        }

        // Convierte fechas anteriores a 1753 en NULL porque SQL Server no las acepta.
        private static object ToSqlDate(DateTime? fecha)
        {
            if (!fecha.HasValue || fecha.Value.Year < 1753)
            {
                return DBNull.Value;
            }

            return fecha.Value.Date;
        }

        // Detecta error de clave duplicada en SQL para devolver un mensaje claro al usuario.
        private static bool IsDuplicateKeyError(Exception e)
        {
            return e.Message.Contains("duplicate key", StringComparison.OrdinalIgnoreCase) ||
                e.Message.Contains("PRIMARY KEY", StringComparison.OrdinalIgnoreCase) ||
                e.Message.Contains("UNIQUE KEY", StringComparison.OrdinalIgnoreCase);
        }

        // Qué hace: mueve el flujo del descriptor vía PRAL_MTTO_SC_DESCRIPTOR_PUESTO_AUTORIZA.
        // Cómo lo hace: ExecCmd del SP; si MENSAJE_ERROR vacío, relee V_SC_DESCRIPTOR_PUESTO y lo
        //              devuelve en Data (parche en memoria en el SPA; sin GetAll).
        public async Task<CResult> AutorizaAsync(SC_DESCRIPTOR_PUESTO_AUTORIZAParam Data, string vLOGIN_SISTEMA)
        {
            CResult objResultado = new();
            const string spName = "PRAL_MTTO_SC_DESCRIPTOR_PUESTO_AUTORIZA";

            try
            {
                var p = new List<CParameter>
                {
                    new CParameter() { ParameterName = "@CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
                    new CParameter() { ParameterName = "@CORR_DESCRIPTOR_PUESTO", Value = Data.CORR_DESCRIPTOR_PUESTO, DbType = System.Data.DbType.Int32 },
                    new CParameter()
                    {
                        ParameterName = "@CORR_UNIDAD_DOCUMENTO",
                        Value = Data.CORR_UNIDAD_DOCUMENTO.HasValue && Data.CORR_UNIDAD_DOCUMENTO.Value > 0
                            ? Data.CORR_UNIDAD_DOCUMENTO.Value
                            : (object)DBNull.Value,
                        DbType = System.Data.DbType.Int32,
                    },
                    new CParameter() { ParameterName = "@OPERACION", Value = Data.OPERACION, DbType = System.Data.DbType.Int32 },
                    new CParameter()
                    {
                        ParameterName = "@CORR_ACCION",
                        Value = Data.CORR_ACCION.HasValue && Data.CORR_ACCION.Value > 0
                            ? Data.CORR_ACCION.Value
                            : (object)DBNull.Value,
                        DbType = System.Data.DbType.Int32,
                    },
                    new CParameter() { ParameterName = "@LOGIN_SISTEMA", Value = vLOGIN_SISTEMA ?? string.Empty, DbType = System.Data.DbType.String },
                    new CParameter() { ParameterName = "@OBSERVACION", Value = Data.OBSERVACION ?? string.Empty, DbType = System.Data.DbType.String },
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
                    objResultado.Data = null;
                    objResultado.Result = false;
                    objResultado.RowsAffected = 0;
                    objResultado.CodeHelper = Data.CORR_DESCRIPTOR_PUESTO;
                    objResultado.ErrorCode = -10;
                    objResultado.ErrorMessage = mensajeError;
                    objResultado.ErrorSource = "C" + _TableName + ".Autoriza";
                    return objResultado;
                }

                var keyWhere = new List<CParameter>
                {
                    new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
                    new CParameter() { ParameterName = "CORR_DESCRIPTOR_PUESTO", Value = Data.CORR_DESCRIPTOR_PUESTO, DbType = System.Data.DbType.Int32 },
                };

                var readerGet = await objData.GetDataReader(_ViewName, keyWhere);
                var response = new List<SC_DESCRIPTOR_PUESTOView>().FromDataReader(readerGet).FirstOrDefault();
                readerGet.Close();

                objResultado.Data = response;
                objResultado.Result = response != null;
                objResultado.RowsAffected = response == null ? 0 : 1;
                objResultado.CodeHelper = Data.CORR_DESCRIPTOR_PUESTO;
                objResultado.ErrorCode = response == null ? -1 : 0;
                objResultado.ErrorMessage = response == null
                    ? "La operacion de flujo se ejecuto pero no se pudo releer el descriptor."
                    : string.Empty;
                objResultado.ErrorSource = string.Empty;
            }
            catch (Exception e)
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

        // Qué hace: consulta flags PUEDE_* por destinatario y estado (SP).
        // Cómo: PRAL_DATA_SC_DESCRIPTOR_PUESTO_ACCIONES_FLUJO; el Service aplica permiso U del JWT.
        public async Task<CResult> GetAccionesFlujoAsync(SC_DESCRIPTOR_PUESTOParam xWhere)
        {
            CResult objResultado = new();
            const string spName = "PRAL_DATA_SC_DESCRIPTOR_PUESTO_ACCIONES_FLUJO";

            try
            {
                var p = new List<CParameter>
                {
                    new CParameter() { ParameterName = "@CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
                    new CParameter() { ParameterName = "@CORR_DESCRIPTOR_PUESTO", Value = xWhere.CORR_DESCRIPTOR_PUESTO, DbType = System.Data.DbType.Int32 },
                    new CParameter() { ParameterName = "@LOGIN_SISTEMA", Value = xWhere.LOGIN_SISTEMA ?? string.Empty, DbType = System.Data.DbType.String },
                };

                var reader = await objData.GetDataReader(System.Data.CommandType.StoredProcedure, spName, p);
                var row = new SC_DESCRIPTOR_PUESTO_ACCIONES_FLUJOView();
                if (reader.Read())
                {
                    row.CORR_DESCRIPTOR_PUESTO = reader["CORR_DESCRIPTOR_PUESTO"] != DBNull.Value
                        ? Convert.ToInt32(reader["CORR_DESCRIPTOR_PUESTO"])
                        : 0;
                    row.NOMBRE_ESTADO = reader["NOMBRE_ESTADO"]?.ToString();
                    row.CORR_PASO_ACTUAL = reader["CORR_PASO_ACTUAL"] != DBNull.Value
                        ? Convert.ToInt32(reader["CORR_PASO_ACTUAL"])
                        : (int?)null;
                    row.NOMBRE_PASO = reader["NOMBRE_PASO"]?.ToString();
                    row.ES_DESTINATARIO_PASO = reader["ES_DESTINATARIO_PASO"] != DBNull.Value
                        && Convert.ToBoolean(reader["ES_DESTINATARIO_PASO"]);
                    row.PUEDE_SOLICITAR = reader["PUEDE_SOLICITAR"] != DBNull.Value
                        && Convert.ToBoolean(reader["PUEDE_SOLICITAR"]);
                    row.PUEDE_APROBAR = reader["PUEDE_APROBAR"] != DBNull.Value
                        && Convert.ToBoolean(reader["PUEDE_APROBAR"]);
                    row.PUEDE_OBSERVAR = reader["PUEDE_OBSERVAR"] != DBNull.Value
                        && Convert.ToBoolean(reader["PUEDE_OBSERVAR"]);
                    row.PUEDE_INACTIVAR = reader["PUEDE_INACTIVAR"] != DBNull.Value
                        && Convert.ToBoolean(reader["PUEDE_INACTIVAR"]);
                    row.PUEDE_REACTIVAR = reader["PUEDE_REACTIVAR"] != DBNull.Value
                        && Convert.ToBoolean(reader["PUEDE_REACTIVAR"]);
                }
                reader.Close();

                objResultado.Data = row;
                objResultado.Result = true;
                objResultado.RowsAffected = 1;
                objResultado.CodeHelper = row.CORR_DESCRIPTOR_PUESTO;
                objResultado.ErrorCode = 0;
                objResultado.ErrorMessage = string.Empty;
                objResultado.ErrorSource = string.Empty;
            }
            catch (Exception e)
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

        // Consulta SC_DESCRIPTOR_PUESTO: true si la misma unidad+puesto ya tiene descriptor no Inactivo.
        public async Task<bool> ExistsDescriptorAbiertoPorPuestoAsync(
            int corrEmpresa,
            int corrUnidad,
            int corrPuesto,
            int excludeCorrDescriptor)
        {
            if (corrEmpresa <= 0 || corrUnidad <= 0 || corrPuesto <= 0)
            {
                return false;
            }

            const string sql = @"SELECT TOP 1 1 AS FOUND
                FROM SC_DESCRIPTOR_PUESTO
                WHERE CORR_EMPRESA = @CORR_EMPRESA
                  AND CORR_UNIDAD = @CORR_UNIDAD
                  AND CORR_PUESTO = @CORR_PUESTO
                  AND ISNULL(CORR_ESTADO, 0) <> 18
                  AND (@EXCLUDE_CORR <= 0 OR CORR_DESCRIPTOR_PUESTO <> @EXCLUDE_CORR)";

            try
            {
                var reader = await objData.GetDataReader(System.Data.CommandType.Text, sql, new List<CParameter>
                {
                    new CParameter() { ParameterName = "CORR_EMPRESA", Value = corrEmpresa, DbType = System.Data.DbType.Int32 },
                    new CParameter() { ParameterName = "CORR_UNIDAD", Value = corrUnidad, DbType = System.Data.DbType.Int32 },
                    new CParameter() { ParameterName = "CORR_PUESTO", Value = corrPuesto, DbType = System.Data.DbType.Int32 },
                    new CParameter() { ParameterName = "EXCLUDE_CORR", Value = excludeCorrDescriptor, DbType = System.Data.DbType.Int32 },
                });

                var exists = reader.Read();
                reader.Close();
                return exists;
            }
            finally
            {
                objData.objConnection.Close();
            }
        }

        // Qué hace: siguiente VERSION para la clave empresa+unidad+puesto.
        // Cómo lo hace: ISNULL(MAX(VERSION),0)+1 excluyendo el descriptor actual en Update.
        public async Task<int> GetNextVersionPorUnidadPuestoAsync(
            int corrEmpresa,
            int corrUnidad,
            int corrPuesto,
            int excludeCorrDescriptor)
        {
            if (corrEmpresa <= 0 || corrUnidad <= 0 || corrPuesto <= 0)
            {
                return 1;
            }

            const string sql = @"SELECT ISNULL(MAX(VERSION), 0) + 1 AS NEXT_VERSION
                FROM SC_DESCRIPTOR_PUESTO
                WHERE CORR_EMPRESA = @CORR_EMPRESA
                  AND CORR_UNIDAD = @CORR_UNIDAD
                  AND CORR_PUESTO = @CORR_PUESTO
                  AND (@EXCLUDE_CORR <= 0 OR CORR_DESCRIPTOR_PUESTO <> @EXCLUDE_CORR)";

            try
            {
                var reader = await objData.GetDataReader(System.Data.CommandType.Text, sql, new List<CParameter>
                {
                    new CParameter() { ParameterName = "CORR_EMPRESA", Value = corrEmpresa, DbType = System.Data.DbType.Int32 },
                    new CParameter() { ParameterName = "CORR_UNIDAD", Value = corrUnidad, DbType = System.Data.DbType.Int32 },
                    new CParameter() { ParameterName = "CORR_PUESTO", Value = corrPuesto, DbType = System.Data.DbType.Int32 },
                    new CParameter() { ParameterName = "EXCLUDE_CORR", Value = excludeCorrDescriptor, DbType = System.Data.DbType.Int32 },
                });

                var nextVersion = 1;
                if (reader.Read() && !reader.IsDBNull(0))
                {
                    nextVersion = Convert.ToInt32(reader.GetValue(0));
                    if (nextVersion < 1)
                    {
                        nextVersion = 1;
                    }
                }

                reader.Close();
                return nextVersion;
            }
            finally
            {
                objData.objConnection.Close();
            }
        }

        /// <summary>
        /// Lookup para sc-requisicion-personal: lista descriptores de V_SC_DESCRIPTOR_PUESTO
        /// filtrados por CORR_EMPRESA + CORR_UNIDAD (no altera GetAllAsync).
        /// </summary>
        public async Task<CResult> GetCORR_DESCRIPTOR_PUESTO_SC_REQUISICION_PERSONAL(List<CParameter> xWhere)
        {
            CResult objResultado = new();

            try
            {
                var reader = await objData.GetDataReader(_ViewName, xWhere);
                var response = new List<SC_DESCRIPTOR_PUESTOView>().FromDataReader(reader)
                    .OrderBy(x => x.NOMBRE_PUESTO)
                    .ThenBy(x => x.CORR_DESCRIPTOR_PUESTO)
                    .ToList();

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
            catch (Exception e)
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

        // Qué hace: obtiene los 6 bloques de impresión Formato corto del descriptor.
        // Cómo: SP PRAL_IMPR_SC_DESCRIPTOR_PUESTO_FORMATO_CORTO (encabezado, logos, funciones, KPIs, responsabilidades, inducciones).
        public Task<CResult> GetDescriptorFormatoCortoImprAsync(List<CParameter> xWhere)
        {
            return GetDescriptorFormatoCortoImprAsyncInternal(xWhere);
        }

        // Qué hace: obtiene filas de impresión Formato extenso del descriptor.
        // Cómo: SP PRAL_IMPR_SC_DESCRIPTOR_PUESTO_FORMATO_EXTENSO (misma forma de result sets).
        public Task<CResult> GetDescriptorFormatoExtensoImprAsync(List<CParameter> xWhere)
        {
            return GetDescriptorImprAsync("PRAL_IMPR_SC_DESCRIPTOR_PUESTO_FORMATO_EXTENSO", xWhere);
        }

        // Qué hace: lee los 7 result sets del SP Formato corto y arma el payload para RPT.
        // Cómo: merge logos (result set 2) en encabezado; demás apartados en listas separadas.
        private async Task<CResult> GetDescriptorFormatoCortoImprAsyncInternal(List<CParameter> xWhere)
        {
            CResult objResultado = new();

            try
            {
                var reader = await objData.GetDataReader(
                    System.Data.CommandType.StoredProcedure,
                    "PRAL_IMPR_SC_DESCRIPTOR_PUESTO_FORMATO_CORTO",
                    xWhere);

                var encabezado = new List<SC_DESCRIPTOR_PUESTO_FORMATO_CORTO_IMPRView>()
                    .FromDataReader(reader)
                    .ToList();

                if (reader.NextResult())
                {
                    var logos = new List<SC_DESCRIPTOR_PUESTO_IMPRView>()
                        .FromDataReader(reader)
                        .FirstOrDefault();
                    if (logos != null)
                    {
                        foreach (var row in encabezado)
                        {
                            row.NOMBRE_EMPRESA = logos.NOMBRE_EMPRESA;
                            row.PERIODO = logos.PERIODO;
                            row.LOGO1 = logos.LOGO1;
                            row.LOGO2 = logos.LOGO2;
                            row.TITULO_REPORTE = logos.TITULO_REPORTE;
                            row.NOMBRE_SISTEMA = logos.NOMBRE_SISTEMA;
                            row.FECHA_IMPRESION = logos.FECHA_IMPRESION;
                        }
                    }
                }

                var funciones = new List<SC_DESCRIPTOR_PUESTO_FORMATO_CORTO_FUNCIONES_IMPRView>();
                if (reader.NextResult())
                {
                    funciones = new List<SC_DESCRIPTOR_PUESTO_FORMATO_CORTO_FUNCIONES_IMPRView>()
                        .FromDataReader(reader)
                        .ToList();
                }

                var kpis = new List<SC_DESCRIPTOR_PUESTO_FORMATO_CORTO_KPI_IMPRView>();
                if (reader.NextResult())
                {
                    kpis = new List<SC_DESCRIPTOR_PUESTO_FORMATO_CORTO_KPI_IMPRView>()
                        .FromDataReader(reader)
                        .ToList();
                }

                var responsabilidades = new List<SC_DESCRIPTOR_PUESTO_FORMATO_CORTO_RESPONSABILIDAD_CARGO_IMPRView>();
                if (reader.NextResult())
                {
                    responsabilidades = new List<SC_DESCRIPTOR_PUESTO_FORMATO_CORTO_RESPONSABILIDAD_CARGO_IMPRView>()
                        .FromDataReader(reader)
                        .ToList();
                }

                var inducciones = new List<SC_DESCRIPTOR_PUESTO_FORMATO_CORTO_INDUCCION_IMPRView>();
                if (reader.NextResult())
                {
                    inducciones = new List<SC_DESCRIPTOR_PUESTO_FORMATO_CORTO_INDUCCION_IMPRView>()
                        .FromDataReader(reader)
                        .ToList();
                }

                var perfilPuesto = new List<SC_PERFIL_PUESTO_FORMATO_CORTO_IMPRView>();
                if (reader.NextResult())
                {
                    perfilPuesto = new List<SC_PERFIL_PUESTO_FORMATO_CORTO_IMPRView>()
                        .FromDataReader(reader)
                        .ToList();
                }

                reader.Close();

                var payload = new SC_DESCRIPTOR_PUESTO_FORMATO_CORTO_IMPRPayload
                {
                    Encabezado = encabezado,
                    Funciones = funciones,
                    Kpis = kpis,
                    Responsabilidades = responsabilidades,
                    Inducciones = inducciones,
                    PerfilPuesto = perfilPuesto,
                };

                objResultado.Data = payload;
                objResultado.Result = encabezado.Count > 0;
                objResultado.RowsAffected = encabezado.Count;
                objResultado.ErrorCode = encabezado.Count > 0 ? 0 : -1;
                objResultado.ErrorMessage = encabezado.Count > 0
                    ? string.Empty
                    : "No hay datos para imprimir el descriptor.";
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

        // Qué hace: lectura común de los SPs de impresión del descriptor (Formato extenso).
        // Cómo: result set 1 = detalle, result set 2 = encabezado/logos; merge como CON_PARTIDA.
        private async Task<CResult> GetDescriptorImprAsync(string spName, List<CParameter> xWhere)
        {
            CResult objResultado = new();

            try
            {
                var reader = await objData.GetDataReader(System.Data.CommandType.StoredProcedure, spName, xWhere);
                var response = new List<SC_DESCRIPTOR_PUESTO_IMPRView>().FromDataReader(reader).ToList();
                if (reader.NextResult())
                {
                    var header = new List<SC_DESCRIPTOR_PUESTO_IMPRView>().FromDataReader(reader).FirstOrDefault();
                    if (header != null)
                    {
                        foreach (var row in response)
                        {
                            row.NOMBRE_EMPRESA = header.NOMBRE_EMPRESA;
                            row.PERIODO = header.PERIODO;
                            row.LOGO1 = header.LOGO1;
                            row.LOGO2 = header.LOGO2;
                            row.TITULO_REPORTE = header.TITULO_REPORTE;
                            row.NOMBRE_SISTEMA = header.NOMBRE_SISTEMA;
                            row.FECHA_IMPRESION = header.FECHA_IMPRESION;
                        }
                    }
                }

                reader.Close();
                objResultado.Data = response;
                objResultado.Result = response.Count > 0;
                objResultado.RowsAffected = response.Count;
                objResultado.ErrorCode = response.Count > 0 ? 0 : -1;
                objResultado.ErrorMessage = response.Count > 0
                    ? string.Empty
                    : "No hay datos para imprimir el descriptor.";
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
    }
}
