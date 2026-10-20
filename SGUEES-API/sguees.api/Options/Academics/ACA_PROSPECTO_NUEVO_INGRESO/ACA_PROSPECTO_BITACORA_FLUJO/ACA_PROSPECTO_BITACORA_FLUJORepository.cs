using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using eFramework.Data;
using eFramework.Core;
using sguees.Models;

namespace sguees.Repositories
{
    // Qué hace: historial del flujo de nuevo ingreso de un prospecto.
    // Cómo lo hace: lee la bitácora del tipo 104 y, si el ejecutor es PORTAL_ADMISION, muestra el CIF.
    public class ACA_PROSPECTO_BITACORA_FLUJORepository : IACA_PROSPECTO_BITACORA_FLUJORepository
    {
        private readonly CData objData;

        private const string _Sql =
            "SELECT B.CORR_BITACORA, B.CORR_INSTANCIA, B.NOMBRE_PASO, B.ESTADO_DESTINO, B.COMENTARIO, B.FECHA_ACCION, " +
            "CASE WHEN B.LOGIN_SISTEMA = 'PORTAL_ADMISION' THEN P.CODIGO_PROSPECTO ELSE B.LOGIN_SISTEMA END AS USUARIO " +
            "FROM dbo.V_SEG_FLUJO_BITACORA_FIRMAS AS B " +
            "INNER JOIN dbo.ACA_PROSPECTO AS P " +
            "  ON P.CORR_PROSPECTO = B.CORR_DOCUMENTO " +
            "WHERE B.CORR_EMPRESA = @CORR_EMPRESA " +
            "  AND B.CORR_TIPO_DOCUMENTO = 104 " +
            "  AND B.CORR_DOCUMENTO = @CORR_PROSPECTO " +
            "ORDER BY B.FECHA_ACCION DESC, B.CORR_BITACORA DESC";

        public ACA_PROSPECTO_BITACORA_FLUJORepository(IConfiguration config)
        {
            objData = new CData(
                config.GetConnectionString("defaultConnection"),
                config.GetSection("DbProvider:defaultProvider").Value);
        }

        public async Task<CResult> GetAllAsync(List<CParameter> xWhere)
        {
            CResult objResultado = new();

            try
            {
                var reader = await objData.GetDataReader(System.Data.CommandType.Text, _Sql, xWhere);
                var response = new List<ACA_PROSPECTO_BITACORA_FLUJOView>();
                while (reader.Read())
                {
                    response.Add(new ACA_PROSPECTO_BITACORA_FLUJOView
                    {
                        CORR_BITACORA = Convert.ToInt32(reader["CORR_BITACORA"]),
                        CORR_INSTANCIA = Convert.ToInt32(reader["CORR_INSTANCIA"]),
                        NOMBRE_PASO = reader["NOMBRE_PASO"]?.ToString(),
                        ESTADO_DESTINO = reader["ESTADO_DESTINO"]?.ToString(),
                        USUARIO = reader["USUARIO"]?.ToString(),
                        COMENTARIO = reader["COMENTARIO"]?.ToString(),
                        FECHA_ACCION = Convert.ToDateTime(reader["FECHA_ACCION"])
                    });
                }

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
    }
}
