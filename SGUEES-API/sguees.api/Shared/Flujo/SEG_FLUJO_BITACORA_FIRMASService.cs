using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using Microsoft.Extensions.Configuration;
using sguees.Models;

namespace sguees.Services
{
    public class SEG_FLUJO_BITACORA_FIRMASService : ISEG_FLUJO_BITACORA_FIRMASService
    {
        private readonly IConfiguration _configuration;

        public SEG_FLUJO_BITACORA_FIRMASService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task<CResult> GetFirmasAsync(SEG_FLUJO_BITACORA_FIRMASParam xWhere)
        {
            CResult objResultado = new();

            try
            {
                var p = new List<CParameter>
                {
                    new CParameter() {ParameterName="CORR_EMPRESA", Value=xWhere.CORR_EMPRESA, DbType=System.Data.DbType.Int32},
                    new CParameter() {ParameterName="CORR_TIPO_DOCUMENTO", Value=xWhere.CORR_TIPO_DOCUMENTO, DbType=System.Data.DbType.Int32},
                    new CParameter() {ParameterName="CORR_DOCUMENTO", Value=xWhere.CORR_DOCUMENTO, DbType=System.Data.DbType.Int32},
                };

                var connectionString = _configuration.GetConnectionString("defaultConnection");
                var provider = _configuration.GetSection("DbProvider:defaultProvider").Value;

                var objData = new CData(connectionString, provider);
                var reader = await objData.GetDataReader("V_SEG_FLUJO_BITACORA_FIRMAS", p);

                var response = new List<SEG_FLUJO_BITACORA_FIRMASView>();
                while (reader.Read())
                {
                    response.Add(new SEG_FLUJO_BITACORA_FIRMASView
                    {
                        CORR_EMPRESA = Convert.ToInt32(reader["CORR_EMPRESA"]),
                        CORR_TIPO_DOCUMENTO = Convert.ToInt32(reader["CORR_TIPO_DOCUMENTO"]),
                        CORR_DOCUMENTO = Convert.ToInt32(reader["CORR_DOCUMENTO"]),
                        CORR_INSTANCIA = Convert.ToInt32(reader["CORR_INSTANCIA"]),
                        CORR_BITACORA = Convert.ToInt32(reader["CORR_BITACORA"]),
                        CORR_PASO = Convert.ToInt32(reader["CORR_PASO"]),
                        CORR_ESTADO_ANTERIOR = reader["CORR_ESTADO_ANTERIOR"] != DBNull.Value ? Convert.ToInt32(reader["CORR_ESTADO_ANTERIOR"]) : (int?)null,
                        CORR_ESTADO_NUEVO = Convert.ToInt32(reader["CORR_ESTADO_NUEVO"]),
                        ESTADO_DESTINO = reader["ESTADO_DESTINO"]?.ToString(),
                        LOGIN_SISTEMA = reader["LOGIN_SISTEMA"]?.ToString(),
                        COMENTARIO = reader["COMENTARIO"]?.ToString(),
                        FECHA_ACCION = Convert.ToDateTime(reader["FECHA_ACCION"]),
                        FECHA_BITACORA = Convert.ToDateTime(reader["FECHA_BITACORA"]),
                        CORR_UNIDAD_EJECUTOR = Convert.ToInt32(reader["CORR_UNIDAD_EJECUTOR"]),
                        NOMBRE_PASO = reader["NOMBRE_PASO"]?.ToString(),
                        ESTADO_ORIGEN = reader["ESTADO_ORIGEN"]?.ToString(),
                        ORDEN_FIRMA = Convert.ToInt32(reader["ORDEN_FIRMA"])
                    });
                }

                reader.Close();
                reader = null;
                objData.objConnection.Close();

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

            return objResultado;
        }
    }
}