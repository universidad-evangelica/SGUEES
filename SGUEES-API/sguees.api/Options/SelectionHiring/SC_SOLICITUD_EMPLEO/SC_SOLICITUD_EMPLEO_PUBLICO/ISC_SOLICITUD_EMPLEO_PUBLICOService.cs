using System.Threading.Tasks;
using eFramework.Core;
using Microsoft.AspNetCore.Http;
using sguees.Models;

namespace sguees.Services
{
    public interface ISC_SOLICITUD_EMPLEO_PUBLICOService
    {
        Task<CResult> GetAllTokenAsync(SC_SOLICITUD_EMPLEO_TOKENParam data);
        Task<CResult> GenerarTokenAsync(SC_SOLICITUD_EMPLEO_GENERAR_TOKENParam data);
        Task<CResult> ValidarTokenAsync(SC_SOLICITUD_EMPLEO_PUBLICOParam data);
        Task<CResult> CompletarAsync(SC_SOLICITUD_EMPLEO_COMPLETARParam data);
        Task<CResult> SubirFotoAsync(string token, IFormFile file);
    }
}
