using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using SGUEES.Models;

namespace SGUEES.Repositories
{
    // Contrato del repositorio de SC_DESCRIPTOR_PUESTO_FUNCION_ACTIVIDAD: acceso a datos de las actividades
    // de una función del descriptor de puesto.
    public interface ISC_DESCRIPTOR_PUESTO_FUNCION_ACTIVIDADRepository
    {
        // Consulta la vista de actividad de la función con los filtros indicados.
        Task<CResult> GetAllAsync(List<CParameter> xWhere);
        // Consulta un registro de actividad de la función según los filtros indicados.
        Task<CResult> GetAsync(List<CParameter> xWhere);
        // Inserta el registro de actividad de la función y devuelve los datos persistidos.
        Task<CResult> CreateAsync(SC_DESCRIPTOR_PUESTO_FUNCION_ACTIVIDADTable Data, string vLOGIN_SISTEMA, string vESTACION);
        // Actualiza el registro de actividad de la función identificado por sus claves.
        Task<CResult> UpdateAsync(SC_DESCRIPTOR_PUESTO_FUNCION_ACTIVIDADTable Data, string vLOGIN_SISTEMA, string vESTACION);
        // Elimina el registro de actividad de la función identificado por sus claves.
        Task<CResult> DeleteAsync(SC_DESCRIPTOR_PUESTO_FUNCION_ACTIVIDADTable Data, string vLOGIN_SISTEMA, string vESTACION);
        // Elimina en bloque las actividades asociadas a una función del descriptor.
        Task<CResult> DeleteByFuncionAsync(SC_DESCRIPTOR_PUESTO_FUNCIONTable Data, string vLOGIN_SISTEMA, string vESTACION);
    }
}
