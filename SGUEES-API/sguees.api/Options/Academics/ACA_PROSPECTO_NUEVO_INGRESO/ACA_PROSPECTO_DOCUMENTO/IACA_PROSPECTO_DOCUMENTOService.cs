using System.Threading.Tasks;
using eFramework.Core;
using Microsoft.AspNetCore.Http;
using sguees.Models;

namespace sguees.Services
{
    public interface IACA_PROSPECTO_DOCUMENTOService
    {
        Task<CResult> GetAllAsync(ACA_PROSPECTO_DOCUMENTOParam xWhere);

        // Qué hace: guarda o reemplaza el archivo de un documento de la solicitud.
        Task<CResult> CargarArchivoAsync(int corrEmpresa, string usuario, string estacion, int corrProspecto, int corrDocumentoAdmision, IFormFile archivo);
    }
}
