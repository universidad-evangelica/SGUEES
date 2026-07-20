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
    public class SC_DESCRIPTOR_RELACION_LABORALRepository : BaseRepository<SC_DESCRIPTOR_RELACION_LABORALTable>, ISC_DESCRIPTOR_RELACION_LABORALRepository
    {
        private const string _TableName = "SC_DESCRIPTOR_RELACION_LABORAL";
        private const string _ViewName = "V_SC_DESCRIPTOR_RELACION_LABORAL";

        public SC_DESCRIPTOR_RELACION_LABORALRepository(IConfiguration config) :
            base(config.GetConnectionString("defaultConnection"),
                config.GetSection("DbProvider:defaultProvider").Value)
        {
        }

        // Consulta la vista de relación laboral con los filtros indicados.
        public async Task<CResult> GetAllAsync(List<CParameter> xWhere)
        {
            CResult objResultado = new();

            try
            {
                var reader = await objData.GetDataReader(_ViewName, xWhere);
                var response = new List<SC_DESCRIPTOR_RELACION_LABORALView>().FromDataReader(reader)
                    .OrderBy(x => x.CORR_RELACION_LABORAL)
                    .ToList();

                reader.Close();
                reader = null;

                NormalizeTipoRelacion(response);

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

        // Consulta un registro de relación laboral según los filtros indicados.
        public async Task<CResult> GetAsync(List<CParameter> xWhere)
        {
            CResult objResultado = new();

            try
            {
                var reader = await objData.GetDataReader(_ViewName, xWhere);
                var response = new List<SC_DESCRIPTOR_RELACION_LABORALView>().FromDataReader(reader).FirstOrDefault();

                reader.Close();
                reader = null;

                if (response != null)
                {
                    NormalizeTipoRelacion(response);
                }

                objResultado.Data = response;
                objResultado.Result = true;
                objResultado.RowsAffected = response == null ? 0 : 1;
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

        // Inserta el registro de relación laboral y devuelve los datos persistidos.
        public async Task<CResult> CreateAsync(SC_DESCRIPTOR_RELACION_LABORALTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            CResult objResultado = new();

            try
            {
                var p = BuildWriteParameters(Data);
                var pWhere = new List<CParameter>
                {
                    new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
                    new CParameter() { ParameterName = "CORR_DESCRIPTOR_PUESTO", Value = Data.CORR_DESCRIPTOR_PUESTO, DbType = System.Data.DbType.Int32 },
                };

                var reader = await objData.Insert(_TableName, p, "CORR_RELACION_LABORAL", pWhere);
                var response = new List<SC_DESCRIPTOR_RELACION_LABORALView>().FromDataReader(reader).FirstOrDefault();

                reader.Close();
                reader = null;

                if (response != null)
                {
                    NormalizeTipoRelacion(response);
                }

                objResultado.Data = response;
                objResultado.Result = true;
                objResultado.RowsAffected = 1;
                objResultado.CodeHelper = response?.CORR_RELACION_LABORAL ?? 0;
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

        // Actualiza el registro de relación laboral identificado por sus claves.
        public async Task<CResult> UpdateAsync(SC_DESCRIPTOR_RELACION_LABORALTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            CResult objResultado = new();

            try
            {
                var p = new List<CParameter>
                {
                    new CParameter() { ParameterName = "TIPO_RELACION", Value = Data.TIPO_RELACION, DbType = System.Data.DbType.String },
                    new CParameter() { ParameterName = "PUESTO_AREA", Value = Data.PUESTO_AREA, DbType = System.Data.DbType.String },
                    new CParameter() { ParameterName = "MOTIVO_RELACION", Value = Data.MOTIVO_RELACION, DbType = System.Data.DbType.String },
                    new CParameter() { ParameterName = "USUARIO_ACTU", Value = Data.USUARIO_ACTU, DbType = System.Data.DbType.String },
                    new CParameter() { ParameterName = "ESTACION_ACTU", Value = Data.ESTACION_ACTU, DbType = System.Data.DbType.String },
                    new CParameter() { ParameterName = "FECHA_ACTU", Value = Data.FECHA_ACTU, DbType = System.Data.DbType.DateTime },
                };

                var pWhere = new List<CParameter>
                {
                    new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
                    new CParameter() { ParameterName = "CORR_DESCRIPTOR_PUESTO", Value = Data.CORR_DESCRIPTOR_PUESTO, DbType = System.Data.DbType.Int32 },
                    new CParameter() { ParameterName = "CORR_RELACION_LABORAL", Value = Data.CORR_RELACION_LABORAL, DbType = System.Data.DbType.Int32 },
                };

                var reader = await objData.Update(_TableName, p, pWhere);
                var response = new List<SC_DESCRIPTOR_RELACION_LABORALView>().FromDataReader(reader).FirstOrDefault();

                reader.Close();
                reader = null;

                if (response != null)
                {
                    NormalizeTipoRelacion(response);
                }

                objResultado.Data = response;
                objResultado.Result = true;
                objResultado.RowsAffected = response == null ? 0 : 1;
                objResultado.CodeHelper = response?.CORR_RELACION_LABORAL ?? Data.CORR_RELACION_LABORAL;
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

        // Elimina el registro de relación laboral identificado por sus claves.
        public async Task<CResult> DeleteAsync(SC_DESCRIPTOR_RELACION_LABORALTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            CResult objResultado = new();

            try
            {
                var pWhere = new List<CParameter>
                {
                    new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
                    new CParameter() { ParameterName = "CORR_DESCRIPTOR_PUESTO", Value = Data.CORR_DESCRIPTOR_PUESTO, DbType = System.Data.DbType.Int32 },
                    new CParameter() { ParameterName = "CORR_RELACION_LABORAL", Value = Data.CORR_RELACION_LABORAL, DbType = System.Data.DbType.Int32 },
                };

                await objData.Delete(_TableName, pWhere);

                objResultado.Data = null;
                objResultado.Result = true;
                objResultado.RowsAffected = 1;
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

        // Construye los parámetros de escritura de relación laboral, incluida su auditoría.
        private static List<CParameter> BuildWriteParameters(SC_DESCRIPTOR_RELACION_LABORALTable Data)
        {
            return new List<CParameter>
            {
                new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
                new CParameter() { ParameterName = "CORR_DESCRIPTOR_PUESTO", Value = Data.CORR_DESCRIPTOR_PUESTO, DbType = System.Data.DbType.Int32 },
                new CParameter() { ParameterName = "CORR_RELACION_LABORAL", Value = Data.CORR_RELACION_LABORAL, DbType = System.Data.DbType.Int32 },
                new CParameter() { ParameterName = "TIPO_RELACION", Value = Data.TIPO_RELACION, DbType = System.Data.DbType.String },
                new CParameter() { ParameterName = "PUESTO_AREA", Value = Data.PUESTO_AREA, DbType = System.Data.DbType.String },
                new CParameter() { ParameterName = "MOTIVO_RELACION", Value = Data.MOTIVO_RELACION, DbType = System.Data.DbType.String },
                new CParameter() { ParameterName = "USUARIO_CREA", Value = Data.USUARIO_CREA, DbType = System.Data.DbType.String },
                new CParameter() { ParameterName = "ESTACION_CREA", Value = Data.ESTACION_CREA, DbType = System.Data.DbType.String },
                new CParameter() { ParameterName = "FECHA_CREA", Value = Data.FECHA_CREA, DbType = System.Data.DbType.DateTime },
                new CParameter() { ParameterName = "USUARIO_ACTU", Value = Data.USUARIO_ACTU, DbType = System.Data.DbType.String },
                new CParameter() { ParameterName = "ESTACION_ACTU", Value = Data.ESTACION_ACTU, DbType = System.Data.DbType.String },
                new CParameter() { ParameterName = "FECHA_ACTU", Value = Data.FECHA_ACTU, DbType = System.Data.DbType.DateTime },
            };
        }

        // Normaliza el tipo de relación laboral antes de consultar o persistir.
        private static void NormalizeTipoRelacion(IEnumerable<SC_DESCRIPTOR_RELACION_LABORALView> items)
        {
            foreach (var item in items)
            {
                NormalizeTipoRelacion(item);
            }
        }

        // Normaliza el tipo de relación laboral antes de consultar o persistir.
        private static void NormalizeTipoRelacion(SC_DESCRIPTOR_RELACION_LABORALView item)
        {
            if (item == null)
            {
                return;
            }

            item.TIPO_RELACION = string.IsNullOrWhiteSpace(item.TIPO_RELACION)
                ? item.TIPO_RELACION
                : item.TIPO_RELACION.Trim().ToUpperInvariant();
        }
    }
}
