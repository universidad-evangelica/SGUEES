using System.Threading.Tasks;
using eFramework.Core;
using SGUEES.Models;

namespace SGUEES.Services
{
	public interface ISC_EXPEDIENTE_SOLICITUDService
	{
		Task<CResult> GetAllAsync(SC_EXPEDIENTE_SOLICITUDParam xWhere);
		Task<CResult> GetAsync(SC_EXPEDIENTE_SOLICITUDParam xWhere);
		Task<CResult> CreateAsync(SC_EXPEDIENTE_SOLICITUDTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> UpdateAsync(SC_EXPEDIENTE_SOLICITUDTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> DeleteAsync(SC_EXPEDIENTE_SOLICITUDTable Data, string vLOGIN_SISTEMA, string vESTACION);
	}
}
