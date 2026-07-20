using System.Threading.Tasks;
using eFramework.Core;
using SGUEES.Models;

namespace SGUEES.Services
{
	// Qué hace: define el contrato del servicio de departamentos (consultas, creación, eliminación y actualización).
	public interface IGEN_DEPTOService
	{
		// Qué hace: lista departamentos según los filtros recibidos.
		Task<CResult> GetAllAsync(GEN_DEPTOParam xWhere);
		// Qué hace: obtiene departamento específico por sus claves.
		Task<CResult> GetAsync(GEN_DEPTOParam xWhere);
		// Qué hace: crea departamento con su información de auditoría.
		Task<CResult> CreateAsync(GEN_DEPTOTable data, string vLoginSistema, string vEstacion);
		// Qué hace: actualiza departamento con su información de auditoría.
		Task<CResult> UpdateAsync(GEN_DEPTOTable data, string vLoginSistema, string vEstacion);
		// Qué hace: elimina departamento identificado por sus claves.
		Task<CResult> DeleteAsync(GEN_DEPTOTable data, string vLoginSistema, string vEstacion);
	}
}
