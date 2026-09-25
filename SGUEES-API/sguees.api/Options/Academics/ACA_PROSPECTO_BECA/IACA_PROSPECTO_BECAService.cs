using System.IO;
using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;

namespace sguees.Services
{
    public interface IACA_PROSPECTO_BECAService
    {
        Task<CResult> GetAllAsync(ACA_PROSPECTO_BECAParam xWhere);
        Task<CResult> GetRespuestasAsync(ACA_PROSPECTO_BECAParam xWhere);
        Task<CResult> GetArchivosAsync(ACA_PROSPECTO_BECAParam xWhere);
        Task<AcaProspectoBecaArchivoAbierto> AbrirArchivoAsync(ACA_PROSPECTO_BECAParam xWhere);
    }

    // Qué hace: archivo listo para mostrarse en el navegador.
    public class AcaProspectoBecaArchivoAbierto
    {
        public Stream Stream { get; set; }
        public string ContentType { get; set; }
    }
}
