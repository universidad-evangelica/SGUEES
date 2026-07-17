using System.Threading.Tasks;
using eFramework.Core;
using SGUEES.Models;

namespace SGUEES.Services
{
    // Contrato del servicio de mantenimiento de nivel académico.
    public interface IPLA_NIVEL_ACADEMICOService
    {
        // Lista niveles de la empresa.
        Task<CResult> GetAllAsync(PLA_NIVEL_ACADEMICOParam xWhere);
        // Obtiene un nivel por filtros.
        Task<CResult> GetAsync(PLA_NIVEL_ACADEMICOParam xWhere);
        // Crea un nivel tras validar datos.
        Task<CResult> CreateAsync(PLA_NIVEL_ACADEMICOTable Data, string vLOGIN_SISTEMA, string vESTACION);
        // Actualiza un nivel existente.
        Task<CResult> UpdateAsync(PLA_NIVEL_ACADEMICOTable Data, string vLOGIN_SISTEMA, string vESTACION);
        // Elimina un nivel si no tiene dependencias.
        Task<CResult> DeleteAsync(PLA_NIVEL_ACADEMICOTable Data, string vLOGIN_SISTEMA, string vESTACION);
        // Cambia el estado activo/inactivo.
        Task<CResult> ActivarInactivarAsync(PLA_NIVEL_ACADEMICOTable Data, string vLOGIN_SISTEMA, string vESTACION);
    }
}
