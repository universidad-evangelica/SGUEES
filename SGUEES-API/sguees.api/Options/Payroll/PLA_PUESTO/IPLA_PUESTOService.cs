// Qué hace: contrato del servicio de puestos (PLA_PUESTO).
// Cómo: declara GetAll, Get, Create, Update, Delete y ActivarInactivar.
using System.Threading.Tasks;
using eFramework.Core;
using SGUEES.Models;

namespace SGUEES.Services
{
    public interface IPLA_PUESTOService
    {
        Task<CResult> GetAllAsync(PLA_PUESTOParam xWhere);
        Task<CResult> GetAsync(PLA_PUESTOParam xWhere);
        Task<CResult> CreateAsync(PLA_PUESTOTable Data, string vLOGIN_SISTEMA, string vESTACION);
        Task<CResult> UpdateAsync(PLA_PUESTOTable Data, string vLOGIN_SISTEMA, string vESTACION);
        Task<CResult> DeleteAsync(PLA_PUESTOTable Data, string vLOGIN_SISTEMA, string vESTACION);
        Task<CResult> ActivarInactivarAsync(PLA_PUESTOTable Data, string vLOGIN_SISTEMA, string vESTACION);
    }
}
