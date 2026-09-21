using System.Threading.Tasks;
using eFramework.Core;
using SGUEES.Models;

namespace SGUEES.Services
{
	public interface ISC_MOVIMIENTO_PERSONALService
	{
		Task<CResult> GetAllAsync(SC_MOVIMIENTO_PERSONALParam xWhere);
		Task<CResult> GetAsync(SC_MOVIMIENTO_PERSONALParam xWhere);
		Task<CResult> CreateAsync(SC_MOVIMIENTO_PERSONALTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> UpdateAsync(SC_MOVIMIENTO_PERSONALTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> DeleteAsync(SC_MOVIMIENTO_PERSONALTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> AutorizaAsync(SC_MOVIMIENTO_PERSONAL_AUTORIZAParam Data, string vLOGIN_SISTEMA);
		Task<CResult> GetBitacoraAsync(SC_MOVIMIENTO_PERSONAL_BITACORAParam xWhere);
		Task<CResult> GetUnidadesUsuarioAsync(SC_MOVIMIENTO_PERSONALParam xWhere);
		Task<CResult> GetPuestosByUnidadAsync(SC_MOVIMIENTO_PERSONALParam xWhere);
		Task<CResult> GetModalidadesAsync(SC_MOVIMIENTO_PERSONALParam xWhere);
	}
}
