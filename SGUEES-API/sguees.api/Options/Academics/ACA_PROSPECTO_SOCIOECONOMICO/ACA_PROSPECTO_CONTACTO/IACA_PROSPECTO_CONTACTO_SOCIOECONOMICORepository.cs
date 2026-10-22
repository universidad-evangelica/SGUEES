using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using sguees.Models;

namespace sguees.Repositories
{
    public interface IACA_PROSPECTO_CONTACTO_SOCIOECONOMICORepository : IRepository<ACA_PROSPECTO_CONTACTO_SOCIOECONOMICOTable>
    {
        // Qué hace: códigos telefónicos de país del SP del registro (NI_LIST_CATALOGS opción 21).
        Task<CResult> GetCODIGO_PAISAsync();
    }
}
