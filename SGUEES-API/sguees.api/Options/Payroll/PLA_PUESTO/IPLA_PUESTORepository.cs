// Qué hace: contrato del repositorio de puestos (PLA_PUESTO).
// Cómo: extiende IRepository y agrega ActivarInactivarAsync y ExistsNombreAsync.
using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using SGUEES.Models;

namespace SGUEES.Repositories
{
    public interface IPLA_PUESTORepository : IRepository<PLA_PUESTOTable>
    {
        Task<CResult> ActivarInactivarAsync(PLA_PUESTOTable Data, string vLOGIN_SISTEMA, string vESTACION);
        Task<bool> ExistsNombreAsync(int corrEmpresa, string nombre, int excludeCorr);
    }
}
