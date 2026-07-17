using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using SGUEES.Models;

namespace SGUEES.Repositories
{
    // Contrato de acceso a datos del perfil del puesto (CRUD vía IRepository).
    public interface ISC_PERFIL_PUESTORepository : IRepository<SC_PERFIL_PUESTOTable>
    {
    }
}
