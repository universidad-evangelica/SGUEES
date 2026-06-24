using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;

namespace sguees.Services
{
	public interface ISC_TIPO_VACANTEService
	{
		Task<CResult> GetAllAsync(SC_TIPO_VACANTEParam xWhere);
		Task<CResult> GetAsync(SC_TIPO_VACANTEParam xWhere);
		Task<CResult> CreateAsync(SC_TIPO_VACANTETable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> UpdateAsync(SC_TIPO_VACANTETable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> DeleteAsync(SC_TIPO_VACANTETable Data, string vLOGIN_SISTEMA, string vESTACION);
        //funcion para inactivar un registro, se actualiza el campo ACTIVO a false
        Task<CResult> DesactivateAsync(SC_TIPO_VACANTETable Data, string vLOGIN_SISTEMA, string vESTACION);
        //funcion para reactivar un registro, se actualiza el campo ACTIVO a true
        Task<CResult> ReactivateAsync(SC_TIPO_VACANTETable Data, string vLOGIN_SISTEMA, string vESTACION);
    }
}
