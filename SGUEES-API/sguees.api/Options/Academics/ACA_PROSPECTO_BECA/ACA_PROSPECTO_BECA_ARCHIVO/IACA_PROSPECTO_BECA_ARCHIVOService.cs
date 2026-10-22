using System.IO;
using System.Threading.Tasks;
using eFramework.Core;
using Microsoft.AspNetCore.Http;
using sguees.Models;

namespace sguees.Services
{
    public interface IACA_PROSPECTO_BECA_ARCHIVOService
    {
        Task<CResult> GetArchivosAsync(ACA_PROSPECTO_BECAParam xWhere);
        Task<AcaProspectoBecaArchivoAbierto> AbrirArchivoAsync(ACA_PROSPECTO_BECAParam xWhere);
        Task<CResult> ReemplazarArchivoAsync(int corrEmpresa, string usuario, int corrProspectoBeca, int corrRespuestaBeca, IFormFile archivo);
    }

}
