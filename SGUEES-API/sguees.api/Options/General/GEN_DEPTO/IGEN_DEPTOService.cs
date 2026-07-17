using System.Threading.Tasks;
using eFramework.Core;
using SGUEES.Models;

namespace SGUEES.Services
{
	// Contrato del servicio de departamentos (consultas, alta, baja y actualización).
	public interface IGEN_DEPTOService
	{
		// Define la consulta del listado de departamentos según los filtros recibidos.
		Task<CResult> GetAllAsync(GEN_DEPTOParam xWhere);
		// Define la consulta de un departamento específico por sus claves.
		Task<CResult> GetAsync(GEN_DEPTOParam xWhere);
		// Define la creación validada de un departamento con su información de auditoría.
		Task<CResult> CreateAsync(GEN_DEPTOTable data, string vLoginSistema, string vEstacion);
		// Define la actualización validada de un departamento con su información de auditoría.
		Task<CResult> UpdateAsync(GEN_DEPTOTable data, string vLoginSistema, string vEstacion);
		// Define la eliminación de un departamento identificado por sus claves.
		Task<CResult> DeleteAsync(GEN_DEPTOTable data, string vLoginSistema, string vEstacion);
	}
}
