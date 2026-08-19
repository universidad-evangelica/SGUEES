using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using SGUEES.Models;

namespace SGUEES.Repositories
{
    // Contrato del repositorio de SC_DESCRIPTOR_PUESTO_FUNCION: acceso a datos de las funciones del descriptor de puesto.
    public interface ISC_DESCRIPTOR_PUESTO_FUNCIONRepository
    {
        // Consulta la vista de función del descriptor con los filtros indicados.
        Task<CResult> GetAllAsync(List<CParameter> xWhere);
        // Consulta un registro de función del descriptor según los filtros indicados.
        Task<CResult> GetAsync(List<CParameter> xWhere);
        // Inserta el registro de función del descriptor y devuelve los datos persistidos.
        Task<CResult> CreateAsync(SC_DESCRIPTOR_PUESTO_FUNCIONTable Data, string vLOGIN_SISTEMA, string vESTACION);
        // Actualiza el registro de función del descriptor identificado por sus claves.
        Task<CResult> UpdateAsync(SC_DESCRIPTOR_PUESTO_FUNCIONTable Data, string vLOGIN_SISTEMA, string vESTACION);
        // Elimina el registro de función del descriptor identificado por sus claves.
        Task<CResult> DeleteAsync(SC_DESCRIPTOR_PUESTO_FUNCIONTable Data, string vLOGIN_SISTEMA, string vESTACION);
    }
}
