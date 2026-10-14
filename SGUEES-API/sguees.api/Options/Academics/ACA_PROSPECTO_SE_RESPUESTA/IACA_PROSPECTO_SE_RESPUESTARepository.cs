using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using sguees.Models;

namespace sguees.Repositories
{
    public interface IACA_PROSPECTO_SE_RESPUESTARepository : IRepository<ACA_PROSPECTO_SE_RESPUESTATable>
    {
        Task<CResult> GuardarAsync(ACA_PROSPECTO_SE_RESPUESTA_GUARDARParam Data, string vLOGIN_SISTEMA, string vESTACION);
    }
}
