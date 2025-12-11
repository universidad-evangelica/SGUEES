using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;

namespace sguees.Services
{
	public interface ICOM_CUADRO_COMPARATIVO_AUTORIZACIONESService
	{
		Task<CResult> GetAllAsync(COM_CUADRO_COMPARATIVO_AUTORIZACIONESParam xWhere);
		Task<CResult> GetAsync(COM_CUADRO_COMPARATIVO_AUTORIZACIONESParam xWhere);
		Task<CResult> CreateAsync(COM_CUADRO_COMPARATIVO_AUTORIZACIONESTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> UpdateAsync(COM_CUADRO_COMPARATIVO_AUTORIZACIONESTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> DeleteAsync(COM_CUADRO_COMPARATIVO_AUTORIZACIONESTable Data, string vLOGIN_SISTEMA, string vESTACION);
	}
}
