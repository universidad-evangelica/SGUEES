using System.Threading.Tasks;
using eFramework.Core;
using SGUEES.Models;

namespace SGUEES.Services
{
	// Qué hace: define el contrato del servicio de distritos (consultas, creación, eliminación y actualización).
	public interface IGEN_DISTRITOService
	{
		// Qué hace: lista distritos según los filtros recibidos.
		Task<CResult> GetAllAsync(GEN_DISTRITOParam xWhere);
		// Qué hace: obtiene distrito específico por sus claves.
		Task<CResult> GetAsync(GEN_DISTRITOParam xWhere);
		// Qué hace: crea distrito con su información de auditoría.
		Task<CResult> CreateAsync(GEN_DISTRITOTable data, string vLoginSistema, string vEstacion);
		// Qué hace: actualiza distrito con su información de auditoría.
		Task<CResult> UpdateAsync(GEN_DISTRITOTable data, string vLoginSistema, string vEstacion);
		// Qué hace: elimina distrito identificado por sus claves.
		Task<CResult> DeleteAsync(GEN_DISTRITOTable data, string vLoginSistema, string vEstacion);
	}
}
