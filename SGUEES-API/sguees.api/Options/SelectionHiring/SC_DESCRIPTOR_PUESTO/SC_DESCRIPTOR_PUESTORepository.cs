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
                    new CParameter() { ParameterName = "CORR_IMPACTO_ECONOMICO", Value = Data.CORR_IMPACTO_ECONOMICO, DbType = System.Data.DbType.Int32 },
                    new CParameter() { ParameterName = "DESCRIPCION_IMPACTO_ECONOMICO", Value = Data.DESCRIPCION_IMPACTO_ECONOMICO, DbType = System.Data.DbType.String },
                    new CParameter() { ParameterName = "FORMATO", Value = Data.FORMATO, DbType = System.Data.DbType.String },
                    new CParameter() { ParameterName = "VERSION", Value = Data.VERSION, DbType = System.Data.DbType.Int32 },
                    new CParameter() { ParameterName = "ESTADO_DESCRIPTOR", Value = Data.ESTADO_DESCRIPTOR, DbType = System.Data.DbType.String },
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

        public async Task<SC_INDUCCIONView> GetInduccionActivaAsync(int corrEmpresa, int corrInduccion)
        {
            const string sql = @"SELECT TOP 1
                  A.CORR_INDUCCION,
                  A.NOMBRE_INDUCCION,
                  A.SEMANAS_INDUCCION
                FROM SC_INDUCCION A
                WHERE A.CORR_EMPRESA = @CORR_EMPRESA
                  AND A.CORR_INDUCCION = @CORR_INDUCCION
                  AND ISNULL(A.ESTADO_INDUCCION, 1) = 1";

            try
            {
                var reader = await objData.GetDataReader(System.Data.CommandType.Text, sql, new List<CParameter>
                {
                    new CParameter() { ParameterName = "CORR_EMPRESA", Value = corrEmpresa, DbType = System.Data.DbType.Int32 },
                    new CParameter() { ParameterName = "CORR_INDUCCION", Value = corrInduccion, DbType = System.Data.DbType.Int32 },
                });

                var response = new List<SC_INDUCCIONView>().FromDataReader(reader).FirstOrDefault();
                reader.Close();
                return response;
            }
            finally
            {
                objData.objConnection.Close();
            }
        }

        public async Task<CResult> ActualizarEntrenamientoAsync(
            SC_DESCRIPTOR_PUESTOTable Data,
            string vLOGIN_SISTEMA,
            string vESTACION)
        {
            CResult objResultado = new();

            try
            {
                var p = new List<CParameter>
                {
                    new CParameter() { ParameterName = "CORR_INDUCCION", Value = Data.CORR_INDUCCION, DbType = System.Data.DbType.Int32 },
                    new CParameter() { ParameterName = "NOMBRE_INDUCCION", Value = Data.NOMBRE_INDUCCION, DbType = System.Data.DbType.String },
                    new CParameter() { ParameterName = "SEMANAS_INDUCCION", Value = Data.SEMANAS_INDUCCION, DbType = System.Data.DbType.Int32 },
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

                objResultado.Data = response;
                objResultado.Result = response != null;
                objResultado.RowsAffected = response == null ? 0 : 1;
                objResultado.CodeHelper = Data.CORR_DESCRIPTOR_PUESTO;
                objResultado.ErrorCode = response == null ? -1 : 0;
                objResultado.ErrorMessage = response == null
                    ? "No se encontro el descriptor de puesto para la empresa de la sesion."
                    : "";
                objResultado.ErrorSource = response == null ? "[SC_DESCRIPTOR_PUESTORepository]" : "";
            }
            catch (Exception e)
            {
                objResultado.Data = null;
                objResultado.Result = false;
                objResultado.RowsAffected = 0;
                objResultado.CodeHelper = Data.CORR_DESCRIPTOR_PUESTO;
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

                // Hijos del descriptor y del perfil (orden: detalle -> encabezados -> descriptor).
                await objData.Delete("SC_DESCRIPTOR_FUNCION_ACTIVIDAD", pWhere);
                await objData.Delete("SC_DESCRIPTOR_FUNCION", pWhere);
                await objData.Delete("SC_DESCRIPTOR_KPI_FUNCION", pWhere);
                await objData.Delete("SC_DESCRIPTOR_RELACION_LABORAL", pWhere);
                await objData.Delete("SC_DESCRIPTOR_PUESTO_RESPONSABILIDAD_CARGO", pWhere);
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
                new CParameter() { ParameterName = "ESTADO_DESCRIPTOR", Value = Data.ESTADO_DESCRIPTOR, DbType = System.Data.DbType.String },
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

        private static object ToSqlDate(DateTime? fecha)
        {
            if (!fecha.HasValue || fecha.Value.Year < 1753)
            {
                return DBNull.Value;
            }

            return fecha.Value.Date;
        }

        private static bool IsDuplicateKeyError(Exception e)
        {
            return e.Message.Contains("duplicate key", StringComparison.OrdinalIgnoreCase) ||
                e.Message.Contains("PRIMARY KEY", StringComparison.OrdinalIgnoreCase) ||
                e.Message.Contains("UNIQUE KEY", StringComparison.OrdinalIgnoreCase);
        }

        public async Task<bool> ExistsDescriptorAbiertoPorPuestoAsync(int corrEmpresa, int corrPuesto, int excludeCorrDescriptor)
        {
            if (corrEmpresa <= 0 || corrPuesto <= 0)
            {
                return false;
            }

            const string sql = @"SELECT TOP 1 1 AS FOUND
                FROM SC_DESCRIPTOR_PUESTO
                WHERE CORR_EMPRESA = @CORR_EMPRESA
                  AND CORR_PUESTO = @CORR_PUESTO
                  AND ESTADO_DESCRIPTOR IN ('BORRADOR', 'ENVIADO', 'REVISADO', 'ACTIVO')
                  AND (@EXCLUDE_CORR <= 0 OR CORR_DESCRIPTOR_PUESTO <> @EXCLUDE_CORR)";

            try
            {
                var reader = await objData.GetDataReader(System.Data.CommandType.Text, sql, new List<CParameter>
                {
                    new CParameter() { ParameterName = "CORR_EMPRESA", Value = corrEmpresa, DbType = System.Data.DbType.Int32 },
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
    }
}
