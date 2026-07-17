using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using SGUEES.Models;

namespace SGUEES.Repositories
{
    public interface ISC_DESCRIPTOR_RELACION_LABORALRepository
    {
        // Consulta la vista de relación laboral con los filtros indicados.
        Task<CResult> GetAllAsync(List<CParameter> xWhere);
        // Consulta un registro de relación laboral según los filtros indicados.
        Task<CResult> GetAsync(List<CParameter> xWhere);
        // Inserta el registro de relación laboral y devuelve los datos persistidos.
        Task<CResult> CreateAsync(SC_DESCRIPTOR_RELACION_LABORALTable Data, string vLOGIN_SISTEMA, string vESTACION);
        // Actualiza el registro de relación laboral identificado por sus claves.
        Task<CResult> UpdateAsync(SC_DESCRIPTOR_RELACION_LABORALTable Data, string vLOGIN_SISTEMA, string vESTACION);
        // Elimina el registro de relación laboral identificado por sus claves.
        Task<CResult> DeleteAsync(SC_DESCRIPTOR_RELACION_LABORALTable Data, string vLOGIN_SISTEMA, string vESTACION);
    }
}
