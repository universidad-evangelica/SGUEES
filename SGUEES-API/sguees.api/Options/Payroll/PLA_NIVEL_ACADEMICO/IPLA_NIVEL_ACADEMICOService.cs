using System.Threading.Tasks;
using eFramework.Core;
using SGUEES.Models;

namespace SGUEES.Services
{
    // Qué hace: define el contrato del servicio de mantenimiento de nivel académico.
    public interface IPLA_NIVEL_ACADEMICOService
    {
        // Qué hace: lista niveles académicos de la empresa.
        Task<CResult> GetAllAsync(PLA_NIVEL_ACADEMICOParam xWhere);
        // Qué hace: obtiene un nivel académico por filtros.
        Task<CResult> GetAsync(PLA_NIVEL_ACADEMICOParam xWhere);
        // Qué hace: crea un nivel académico tras validar datos.
        Task<CResult> CreateAsync(PLA_NIVEL_ACADEMICOTable Data, string vLOGIN_SISTEMA, string vESTACION);
        // Qué hace: actualiza un nivel académico existente.
        Task<CResult> UpdateAsync(PLA_NIVEL_ACADEMICOTable Data, string vLOGIN_SISTEMA, string vESTACION);
        // Qué hace: elimina un nivel académico si no tiene dependencias.
        Task<CResult> DeleteAsync(PLA_NIVEL_ACADEMICOTable Data, string vLOGIN_SISTEMA, string vESTACION);
        // Qué hace: cambia el estado activo/inactivo.
        Task<CResult> ActivarInactivarAsync(PLA_NIVEL_ACADEMICOTable Data, string vLOGIN_SISTEMA, string vESTACION);
    }
}
