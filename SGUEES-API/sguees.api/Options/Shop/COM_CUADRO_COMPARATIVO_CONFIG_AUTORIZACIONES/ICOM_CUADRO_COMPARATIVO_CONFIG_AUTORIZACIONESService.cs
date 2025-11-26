using System.Threading.Tasks;
using eFramework.Core;
using scuees.Models;

namespace scuees.Services
{
	public interface ICOM_CUADRO_COMPARATIVO_CONFIG_AUTORIZACIONESService
	{
		Task<CResult> GetAllAsync(COM_CUADRO_COMPARATIVO_CONFIG_AUTORIZACIONESParam xWhere);
		Task<CResult> GetAsync(COM_CUADRO_COMPARATIVO_CONFIG_AUTORIZACIONESParam xWhere);
		Task<CResult> CreateAsync(COM_CUADRO_COMPARATIVO_CONFIG_AUTORIZACIONESTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> UpdateAsync(COM_CUADRO_COMPARATIVO_CONFIG_AUTORIZACIONESTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> DeleteAsync(COM_CUADRO_COMPARATIVO_CONFIG_AUTORIZACIONESTable Data, string vLOGIN_SISTEMA, string vESTACION);
	}
}
