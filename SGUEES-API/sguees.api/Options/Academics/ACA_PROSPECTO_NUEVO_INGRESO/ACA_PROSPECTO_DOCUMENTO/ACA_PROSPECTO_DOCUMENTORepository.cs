using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using Microsoft.Extensions.Configuration;
using sguees.Models;

namespace sguees.Repositories
{
    // Qué hace: documentos de la solicitud de nuevo ingreso.
    // Cómo lo hace: lee V_ACA_PROSPECTO_DOCUMENTO_NUEVO_INGRESO. Solo consulta.
    public class ACA_PROSPECTO_DOCUMENTORepository : BaseRepository<ACA_PROSPECTO_DOCUMENTOTable>, IACA_PROSPECTO_DOCUMENTORepository
    {
        private const string _ViewName = "V_ACA_PROSPECTO_DOCUMENTO_NUEVO_INGRESO";

        public ACA_PROSPECTO_DOCUMENTORepository(IConfiguration config) :
                base(config.GetConnectionString("defaultConnection"),
                     config.GetSection("DbProvider:defaultProvider").Value)
        {
        }

        public async Task<CResult> GetAllAsync(List<CParameter> xWhere)
        {
            CResult objResultado = new();

            try
            {
                var reader = await objData.GetDataReader(_ViewName, xWhere, "ORDEN, CORR_DOCUMENTO_ADMISION");
                var response = new List<ACA_PROSPECTO_DOCUMENTOView>().FromDataReader(reader).ToList();

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

        public Task<CResult> GetAsync(List<CParameter> xWhere)
        {
            return GetAllAsync(xWhere);
        }

        public Task<CResult> CreateAsync(ACA_PROSPECTO_DOCUMENTOTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            return Task.FromResult(OperacionNoHabilitada());
        }

        public Task<CResult> UpdateAsync(ACA_PROSPECTO_DOCUMENTOTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            return Task.FromResult(OperacionNoHabilitada());
        }

        public Task<CResult> DeleteAsync(ACA_PROSPECTO_DOCUMENTOTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            return Task.FromResult(OperacionNoHabilitada());
        }

        private static CResult OperacionNoHabilitada()
        {
            return new CResult()
            {
                Data = null,
                Result = false,
                ErrorCode = -1,
                ErrorMessage = "Operación no habilitada: la documentación de nuevo ingreso solo se consulta.",
            };
        }
    }
}
