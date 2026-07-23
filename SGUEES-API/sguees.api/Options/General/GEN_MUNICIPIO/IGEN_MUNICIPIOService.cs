using System.Threading.Tasks;
using eFramework.Core;
using SGUEES.Models;

namespace SGUEES.Services
{
	// Qué hace: define el contrato del servicio de municipios (consultas, lookups, creación, eliminación y actualización).
	public interface IGEN_MUNICIPIOService
	{
		// Qué hace: lista municipios según los filtros recibidos.
		Task<CResult> GetAllAsync(GEN_MUNICIPIOParam xWhere);
		// Qué hace: obtiene municipio específico por sus claves.
		Task<CResult> GetAsync(GEN_MUNICIPIOParam xWhere);
		// Qué hace: lista el catálogo de municipios para mantenimientos relacionados.
		Task<CResult> GetMunicipiosByCodigoDeptoAsync(GEN_MUNICIPIOParam xWhere);
		// Qué hace: crea municipio con su información de auditoría.
		Task<CResult> CreateAsync(GEN_MUNICIPIOTable data, string vLoginSistema, string vEstacion);
		// Qué hace: actualiza municipio con su información de auditoría.
		Task<CResult> UpdateAsync(GEN_MUNICIPIOTable data, string vLoginSistema, string vEstacion);
		// Qué hace: elimina municipio identificado por sus claves.
		Task<CResult> DeleteAsync(GEN_MUNICIPIOTable data, string vLoginSistema, string vEstacion);
	}
}
