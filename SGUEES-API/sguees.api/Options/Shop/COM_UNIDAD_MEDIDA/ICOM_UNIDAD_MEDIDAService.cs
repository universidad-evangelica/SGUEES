using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;

namespace sguees.Services
{
	public interface ICOM_UNIDAD_MEDIDAService
	{
		Task<CResult> GetAllAsync(COM_UNIDAD_MEDIDAParam xWhere);
		Task<CResult> GetAsync(COM_UNIDAD_MEDIDAParam xWhere);
		Task<CResult> CreateAsync(COM_UNIDAD_MEDIDATable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> UpdateAsync(COM_UNIDAD_MEDIDATable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> DeleteAsync(COM_UNIDAD_MEDIDATable Data, string vLOGIN_SISTEMA, string vESTACION);
	}
}
