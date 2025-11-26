using System.Threading.Tasks;
using eFramework.Core;
using scuees.Models;

namespace scuees.Services
{
	public interface ICOM_ACTIVIDAD_ECONOMICAService
	{
		Task<CResult> GetAllAsync(COM_ACTIVIDAD_ECONOMICAParam xWhere);
		Task<CResult> GetAsync(COM_ACTIVIDAD_ECONOMICAParam xWhere);
		Task<CResult> CreateAsync(COM_ACTIVIDAD_ECONOMICATable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> UpdateAsync(COM_ACTIVIDAD_ECONOMICATable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> DeleteAsync(COM_ACTIVIDAD_ECONOMICATable Data, string vLOGIN_SISTEMA, string vESTACION);
	}
}
