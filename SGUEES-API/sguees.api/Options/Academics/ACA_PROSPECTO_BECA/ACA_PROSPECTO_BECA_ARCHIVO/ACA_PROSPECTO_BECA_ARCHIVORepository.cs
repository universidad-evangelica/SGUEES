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
    // Qué hace: lectura de los archivos de la solicitud de beca.
    // Cómo lo hace: lee V_ACA_PROSPECTO_BECA_ARCHIVO. El reemplazo del archivo está en el servicio.
    public class ACA_PROSPECTO_BECA_ARCHIVORepository : BaseRepository<ACA_PROSPECTO_BECA_ARCHIVOTable>, IACA_PROSPECTO_BECA_ARCHIVORepository
    {
        private const string _ViewName = "V_ACA_PROSPECTO_BECA_ARCHIVO";

        public ACA_PROSPECTO_BECA_ARCHIVORepository(IConfiguration config) :
                base(config.GetConnectionString("defaultConnection"),
                     config.GetSection("DbProvider:defaultProvider").Value)
        {
        }

        public Task<CResult> GetAllAsync(List<CParameter> xWhere)
        {
            return GetArchivosAsync(xWhere);
        }

        public Task<CResult> GetAsync(List<CParameter> xWhere)
        {
            return GetArchivoAsync(xWhere);
        }

        public Task<CResult> GetArchivosAsync(List<CParameter> xWhere)
        {
            return LeerAsync(xWhere, "ORDEN_SECCION, ORDEN_PREGUNTA, CORR_RESPUESTA_BECA");
        }

        public Task<CResult> GetArchivoAsync(List<CParameter> xWhere)
        {
            return LeerAsync(xWhere, "CORR_RESPUESTA_BECA");
        }

        public Task<CResult> CreateAsync(ACA_PROSPECTO_BECA_ARCHIVOTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            return Task.FromResult(OperacionNoHabilitada());
        }

        public Task<CResult> UpdateAsync(ACA_PROSPECTO_BECA_ARCHIVOTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            return Task.FromResult(OperacionNoHabilitada());
        }

        public Task<CResult> DeleteAsync(ACA_PROSPECTO_BECA_ARCHIVOTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            return Task.FromResult(OperacionNoHabilitada());
        }

        private async Task<CResult> LeerAsync(List<CParameter> xWhere, string orden)
        {
            CResult objResultado = new();

            try
            {
                var reader = await objData.GetDataReader(_ViewName, xWhere, orden);
                var response = new List<ACA_PROSPECTO_BECA_ARCHIVOView>().FromDataReader(reader).ToList();

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
                ErrorCode = -1,
                ErrorMessage = "Operación no habilitada: ACA_PROSPECTO_BECA_ARCHIVO lee la vista y reemplaza el archivo por el servicio.",
            };
        }
    }
}
