using System.Threading.Tasks;
using eFramework.Core;
using SGUEES.Models;

namespace SGUEES.Services
{
	public interface ISC_TIPO_CONTRATACIONService
	{
		Task<CResult> GetAllAsync(SC_TIPO_CONTRATACIONParam xWhere);
		Task<CResult> GetAsync(SC_TIPO_CONTRATACIONParam xWhere);
		Task<CResult> CreateAsync(SC_TIPO_CONTRATACIONTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> UpdateAsync(SC_TIPO_CONTRATACIONTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> DeleteAsync(SC_TIPO_CONTRATACIONTable Data, string vLOGIN_SISTEMA, string vESTACION);
        //funcion para inactivar un registro, se actualiza el campo ACTIVO a false
    Task<CResult> DesactivateAsync(SC_TIPO_CONTRATACIONTable Data, string vLOGIN_SISTEMA, string vESTACION);
		//funcion para reactivar un registro, se actualiza el campo ACTIVO a true
		Task<CResult> ReactivateAsync(SC_TIPO_CONTRATACIONTable Data, string vLOGIN_SISTEMA, string vESTACION);
    }
}
