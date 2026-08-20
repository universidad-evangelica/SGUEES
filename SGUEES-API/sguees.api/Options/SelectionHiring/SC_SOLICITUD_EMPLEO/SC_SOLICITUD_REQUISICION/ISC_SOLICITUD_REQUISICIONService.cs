using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;

namespace sguees.Services
{
	public interface ISC_SOLICITUD_REQUISICIONService
	{
		Task<CResult> GetAllAsync(SC_SOLICITUD_REQUISICIONParam xWhere);
		Task<CResult> GetAsync(SC_SOLICITUD_REQUISICIONParam xWhere);
		Task<CResult> CreateAsync(SC_SOLICITUD_REQUISICIONTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> DeleteAsync(SC_SOLICITUD_REQUISICIONTable Data, string vLOGIN_SISTEMA, string vESTACION);
	}
}
