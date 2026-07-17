using System.Threading.Tasks;
using eFramework.Core;
using SGUEES.Models;

namespace SGUEES.Services
{
	public interface IGEN_MUNICIPIOService
	{
		// Define la consulta del listado de municipios según los filtros recibidos.
		Task<CResult> GetAllAsync(GEN_MUNICIPIOParam xWhere);
		// Define la consulta de un municipio específico por sus claves.
		Task<CResult> GetAsync(GEN_MUNICIPIOParam xWhere);
		// Define la consulta del catálogo de municipios usado por mantenimientos relacionados.
		Task<CResult> GetMunicipiosByCodigoDeptoAsync(GEN_MUNICIPIOParam xWhere);
		// Define la creación validada de un municipio con su información de auditoría.
		Task<CResult> CreateAsync(GEN_MUNICIPIOTable data, string vLoginSistema, string vEstacion);
		// Define la actualización validada de un municipio con su información de auditoría.
		Task<CResult> UpdateAsync(GEN_MUNICIPIOTable data, string vLoginSistema, string vEstacion);
		// Define la eliminación de un municipio identificado por sus claves.
		Task<CResult> DeleteAsync(GEN_MUNICIPIOTable data, string vLoginSistema, string vEstacion);
	}
}
