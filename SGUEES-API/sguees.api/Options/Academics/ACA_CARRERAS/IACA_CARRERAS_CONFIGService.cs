using eFramework.Core;
using sguees.Models;

namespace sguees.Services
{
    public interface IACA_CARRERAS_CONFIGService
    {
        Task<CResult> Catalogos(int empresa);
        Task<CResult> Facultad(int empresa, int facultad);
        Task<CResult> Costos(int empresa, int carrera);
        Task<CResult> GuardarCosto(int empresa, sguees.Models.ACA_CostoInput data, string user, string station);
    }
}
