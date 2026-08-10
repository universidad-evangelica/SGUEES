// Qué hace: contrato del servicio de puestos por unidad.
// Cómo: declara GetAll, Get, Create y Delete sobre GEN_UNIDADES_PUESTO.
using System.Threading.Tasks;
using eFramework.Core;
using SGUEES.Models;

namespace SGUEES.Services
{
    public interface IGEN_UNIDADES_PUESTOService
    {
        Task<CResult> GetAllAsync(GEN_UNIDADES_PUESTOParam xWhere);
        Task<CResult> GetAsync(GEN_UNIDADES_PUESTOParam xWhere);
        Task<CResult> CreateAsync(GEN_UNIDADES_PUESTOTable Data, string vLOGIN_SISTEMA, string vESTACION);
        Task<CResult> DeleteAsync(GEN_UNIDADES_PUESTOTable Data, string vLOGIN_SISTEMA, string vESTACION);
    }
}
