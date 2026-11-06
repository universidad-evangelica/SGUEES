using eFramework.Core;
using sguees.Models;
namespace sguees.Repositories
{
    public interface IACA_CARRERASLookupRepository
    {
        Task<CResult> GetAsync(CatalogoCarrera catalogo, int empresa);
    }
}
