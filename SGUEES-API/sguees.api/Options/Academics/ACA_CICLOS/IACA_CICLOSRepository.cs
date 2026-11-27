using eFramework.Core;
using sguees.Models;

namespace sguees.Repositories
{
    public interface IACA_CICLOSRepository
    {
        Task<CResult> OfertaAdmision(int empresa, int id, int sede);
        Task<CResult> GuardarOfertaAdmision(int empresa, ACA_ADMISION_OFERTAInput input, string user, string station);
        Task<CResult> Areas(int empresa);
        Task<CResult> Listar(int empresa, int area);
        Task<CResult> Detalle(int empresa, int id);
        Task<CResult> Catalogos(int empresa);
        Task<CResult> Candidatas(int empresa, int area, DateTime fecha);
        Task<CResult> Faltantes(int empresa, int id, byte[] version);
        Task<CResult> Oferta(int empresa, int id, int sede, DateTime fecha);
        Task<CResult> Write(string operation, int empresa, ACA_CICLOInput input, string user, string station);
    }
}
