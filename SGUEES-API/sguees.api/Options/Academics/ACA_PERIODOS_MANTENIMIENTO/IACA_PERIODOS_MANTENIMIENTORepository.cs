using eFramework.Core;
using sguees.Models;

namespace sguees.Repositories
{
    public interface IACA_PERIODOS_MANTENIMIENTORepository
    {
        Task<CResult> GetAllAsync(ACA_PERIODOConsulta data);
        Task<CResult> GetCatalogosAsync(int empresa);
        Task<CResult> GetHistorialAsync(ACA_PERIODOConsulta data);
        Task<CResult> GetOfertaAsync(ACA_PERIODOConsulta data);
        Task<CResult> WriteAsync(int operation, ACA_PERIODOInput data, string user, string station);
    }
}
