using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;

namespace sguees.Services
{
    public interface IACA_PROSPECTO_BECA_RESPUESTAService
    {
        Task<CResult> GetRespuestasAsync(ACA_PROSPECTO_BECAParam xWhere);
        Task<CResult> GetOpcionesAsync(int corrEmpresa, int corrPreguntaBeca);
        Task<CResult> GuardarRespuestaAsync(int corrEmpresa, string usuario, AcaProspectoBecaRespuestaEdicion edicion);
    }
}
