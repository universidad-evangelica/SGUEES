using System.Threading.Tasks;
using eFramework.Core;
using SGUEES.Models;

namespace SGUEES.Services
{
	// Contrato del servicio de distritos (consultas, alta, baja y actualización).
	public interface IGEN_DISTRITOService
	{
		// Define la consulta del listado de distritos según los filtros recibidos.
		Task<CResult> GetAllAsync(GEN_DISTRITOParam xWhere);
		// Define la consulta de un distrito específico por sus claves.
		Task<CResult> GetAsync(GEN_DISTRITOParam xWhere);
		// Define la creación validada de un distrito con su información de auditoría.
		Task<CResult> CreateAsync(GEN_DISTRITOTable data, string vLoginSistema, string vEstacion);
		// Define la actualización validada de un distrito con su información de auditoría.
		Task<CResult> UpdateAsync(GEN_DISTRITOTable data, string vLoginSistema, string vEstacion);
		// Define la eliminación de un distrito identificado por sus claves.
		Task<CResult> DeleteAsync(GEN_DISTRITOTable data, string vLoginSistema, string vEstacion);
	}
}
