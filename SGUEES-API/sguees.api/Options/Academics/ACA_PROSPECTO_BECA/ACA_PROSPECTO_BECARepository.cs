using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using Microsoft.Extensions.Configuration;
using sguees.Models;

namespace sguees.Repositories
{
    // Qué hace: lectura de solicitudes de beca y de las respuestas de su cuestionario.
    // Cómo lo hace: V_ACA_PROSPECTO_BECA_CONSULTA para el listado y
    //               V_ACA_PROSPECTO_BECA_RESPUESTA para el detalle. No escribe.
    public class ACA_PROSPECTO_BECARepository : BaseRepository<ACA_PROSPECTO_BECATable>, IACA_PROSPECTO_BECARepository
    {
        private const string _TableName = "ACA_PROSPECTO_BECA";
        private const string _ViewName = "V_ACA_PROSPECTO_BECA_CONSULTA";
        private const string _ViewRespuesta = "V_ACA_PROSPECTO_BECA_RESPUESTA";
        private const string _ViewArchivo = "V_ACA_PROSPECTO_BECA_ARCHIVO";

        public ACA_PROSPECTO_BECARepository(IConfiguration config) :
                base(config.GetConnectionString("defaultConnection"),
                     config.GetSection("DbProvider:defaultProvider").Value)
        {
        }

        public async Task<CResult> GetAllAsync(List<CParameter> xWhere)
        {
            return await LeerAsync<ACA_PROSPECTO_BECAView>(_ViewName, xWhere, "FECHA_SOLICITUD DESC");
        }

        public Task<CResult> GetAsync(List<CParameter> xWhere)
        {
            return Task.FromResult(OperacionNoHabilitada());
        }

        public async Task<CResult> GetRespuestasAsync(List<CParameter> xWhere)
        {
            return await LeerAsync<ACA_PROSPECTO_BECA_RESPUESTAView>(
                _ViewRespuesta, xWhere, "ORDEN_SECCION, ORDEN_PREGUNTA, CORR_RESPUESTA_BECA");
        }

        public async Task<CResult> GetArchivosAsync(List<CParameter> xWhere)
        {
            return await LeerAsync<ACA_PROSPECTO_BECA_ARCHIVOView>(
                _ViewArchivo, xWhere, "ORDEN_SECCION, ORDEN_PREGUNTA, CORR_RESPUESTA_BECA");
        }

        public async Task<CResult> GetArchivoAsync(List<CParameter> xWhere)
        {
            return await LeerAsync<ACA_PROSPECTO_BECA_ARCHIVOView>(
                _ViewArchivo, xWhere, "CORR_RESPUESTA_BECA");
        }

        public Task<CResult> CreateAsync(ACA_PROSPECTO_BECATable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            return Task.FromResult(OperacionNoHabilitada());
        }

        public Task<CResult> UpdateAsync(ACA_PROSPECTO_BECATable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            return Task.FromResult(OperacionNoHabilitada());
        }

        public Task<CResult> DeleteAsync(ACA_PROSPECTO_BECATable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            return Task.FromResult(OperacionNoHabilitada());
        }

        private async Task<CResult> LeerAsync<T>(string vista, List<CParameter> xWhere, string orden)
        {
            CResult objResultado = new();

            try
            {
                var reader = await objData.GetDataReader(vista, xWhere, orden);
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
