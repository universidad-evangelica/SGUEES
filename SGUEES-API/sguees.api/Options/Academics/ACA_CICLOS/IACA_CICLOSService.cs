using eFramework.Core;
using sguees.Models;

namespace sguees.Services
{
    public interface IACA_CICLOSService
    {
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
