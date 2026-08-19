using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;

namespace sguees.Services
{
	public interface ISC_SOLICITUD_EMPLEOService
	{
		Task<CResult> GetAllAsync(SC_SOLICITUD_EMPLEOParam xWhere);
		Task<CResult> GetAsync(SC_SOLICITUD_EMPLEOParam xWhere);
		Task<CResult> CreateAsync(SC_SOLICITUD_EMPLEOTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> UpdateAsync(SC_SOLICITUD_EMPLEOTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> DeleteAsync(SC_SOLICITUD_EMPLEOTable Data, string vLOGIN_SISTEMA, string vESTACION);
        //funcion para inactivar un registro, se actualiza el campo ACTIVO a false
        //Task<CResult> DesactivateAsync(SC_SOLICITUD_EMPLEOTable Data, string vLOGIN_SISTEMA, string vESTACION);
        ////funcion para reactivar un registro, se actualiza el campo ACTIVO a true
        //Task<CResult> ReactivateAsync(SC_SOLICITUD_EMPLEOTable Data, string vLOGIN_SISTEMA, string vESTACION);
    }
}
