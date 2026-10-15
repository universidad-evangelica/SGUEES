using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using sguees.Models;

namespace sguees.Repositories
{
    public interface IACA_FACULTADES_SEDESRepository : IRepository<ACA_FACULTADES_SEDESTable>
    {
        Task<bool> FacultadEsDeEmpresaAsync(int corrEmpresa, int corrFacultad);
        Task<bool> SedeActivaDeEmpresaAsync(int corrEmpresa, int corrSede);
    }
}
