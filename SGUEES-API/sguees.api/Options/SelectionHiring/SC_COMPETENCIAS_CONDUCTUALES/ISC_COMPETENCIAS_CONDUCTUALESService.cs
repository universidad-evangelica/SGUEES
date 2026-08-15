// Qué hace: contrato del servicio de competencias conductuales.
// Cómo: declara GetAllAsync, GetAsync, CreateAsync, UpdateAsync, DeleteAsync, ActivarInactivarAsync y GetCatalogoDescriptorAsync.
using System.Threading.Tasks;
using eFramework.Core;
using SGUEES.Models;

namespace SGUEES.Services
{
  public interface ISC_COMPETENCIAS_CONDUCTUALESService
  {
    // Qué hace: define la consulta del listado de competencias conductuales según los filtros recibidos.
    Task<CResult> GetAllAsync(SC_COMPETENCIAS_CONDUCTUALESParam xWhere);
    // Qué hace: define la consulta de una competencia conductual específica por sus claves.
    Task<CResult> GetAsync(SC_COMPETENCIAS_CONDUCTUALESParam xWhere);
    // Qué hace: define la creación validada de una competencia conductual con su información de auditoría.
    Task<CResult> CreateAsync(SC_COMPETENCIAS_CONDUCTUALESTable Data, string vLOGIN_SISTEMA, string vESTACION);
    // Qué hace: define la actualización validada de una competencia conductual con su información de auditoría.
    Task<CResult> UpdateAsync(SC_COMPETENCIAS_CONDUCTUALESTable Data, string vLOGIN_SISTEMA, string vESTACION);
    // Qué hace: define la eliminación de una competencia conductual identificada por sus claves.
    Task<CResult> DeleteAsync(SC_COMPETENCIAS_CONDUCTUALESTable Data, string vLOGIN_SISTEMA, string vESTACION);
    // Qué hace: define el cambio de estado activo/inactivo de la competencia conductual.
    Task<CResult> ActivarInactivarAsync(SC_COMPETENCIAS_CONDUCTUALESTable Data, string vLOGIN_SISTEMA, string vESTACION);
    // Qué hace: define la consulta del catálogo activo para el descriptor de puesto.
    Task<CResult> GetCatalogoDescriptorAsync(SC_COMPETENCIAS_CONDUCTUALESParam xWhere);
  }
}
