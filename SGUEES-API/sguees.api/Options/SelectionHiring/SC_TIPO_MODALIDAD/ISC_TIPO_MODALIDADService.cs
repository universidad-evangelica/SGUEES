using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;

namespace sguees.Services
{
	public interface ISC_TIPO_MODALIDADService
	{
		Task<CResult> GetAllAsync(SC_TIPO_MODALIDADParam xWhere);
		Task<CResult> GetAsync(SC_TIPO_MODALIDADParam xWhere);
		Task<CResult> CreateAsync(SC_TIPO_MODALIDADTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> UpdateAsync(SC_TIPO_MODALIDADTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> DeleteAsync(SC_TIPO_MODALIDADTable Data, string vLOGIN_SISTEMA, string vESTACION);
	}
}
