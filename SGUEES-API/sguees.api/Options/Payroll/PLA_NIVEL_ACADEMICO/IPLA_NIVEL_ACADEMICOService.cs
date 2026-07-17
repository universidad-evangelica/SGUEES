using System.Threading.Tasks;
using eFramework.Core;
using SGUEES.Models;

namespace SGUEES.Services
{
    public interface IPLA_NIVEL_ACADEMICOService
    {
        // Define la consulta del listado de niveles académicos según los filtros recibidos.
        Task<CResult> GetAllAsync(PLA_NIVEL_ACADEMICOParam xWhere);
        // Define la consulta de un nivel académico específico por sus claves.
        Task<CResult> GetAsync(PLA_NIVEL_ACADEMICOParam xWhere);
        // Define la creación validada de un nivel académico con su información de auditoría.
        Task<CResult> CreateAsync(PLA_NIVEL_ACADEMICOTable Data, string vLOGIN_SISTEMA, string vESTACION);
        // Define la actualización validada de un nivel académico con su información de auditoría.
        Task<CResult> UpdateAsync(PLA_NIVEL_ACADEMICOTable Data, string vLOGIN_SISTEMA, string vESTACION);
        // Define la eliminación de un nivel académico identificado por sus claves.
        Task<CResult> DeleteAsync(PLA_NIVEL_ACADEMICOTable Data, string vLOGIN_SISTEMA, string vESTACION);
        // Define el cambio de estado activo/inactivo del nivel académico.
        Task<CResult> ActivarInactivarAsync(PLA_NIVEL_ACADEMICOTable Data, string vLOGIN_SISTEMA, string vESTACION);
    }
}
