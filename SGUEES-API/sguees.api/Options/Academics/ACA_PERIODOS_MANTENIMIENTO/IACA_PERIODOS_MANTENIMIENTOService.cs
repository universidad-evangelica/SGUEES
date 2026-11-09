using eFramework.Core;
using sguees.Models;

namespace sguees.Services
{
    public interface IACA_PERIODOS_MANTENIMIENTOService
    {
        Task<CResult> GetAllAsync(ACA_PERIODOConsulta data);
        Task<CResult> GetCatalogosAsync(int empresa);
        Task<CResult> GetHistorialAsync(ACA_PERIODOConsulta data);
        Task<CResult> GetOfertaAsync(ACA_PERIODOConsulta data);
        Task<CResult> WriteAsync(int operation, ACA_PERIODOInput data, string user, string station);
    }
}
