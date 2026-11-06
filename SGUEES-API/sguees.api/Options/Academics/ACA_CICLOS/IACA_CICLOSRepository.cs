using eFramework.Core;
using sguees.Models;

namespace sguees.Repositories
{
    public interface IACA_CICLOSRepository
    {
        Task<CResult> Areas(int empresa);
        Task<CResult> Listar(int empresa, int area);
        Task<CResult> Detalle(int empresa, int id);
        Task<CResult> Catalogos(int empresa);
        Task<CResult> Oferta(int empresa, int id, int sede, DateTime fecha);
        Task<CResult> Write(string operation, int empresa, ACA_CICLOInput input, string user, string station);
    }
}
