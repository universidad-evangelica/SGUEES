using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;

namespace sguees.Services
{
	public interface IBAN_TIPO_CHEQUEService
	{
		Task<CResult> GetAllAsync(BAN_TIPO_CHEQUEParam xWhere);
		Task<CResult> GetAsync(BAN_TIPO_CHEQUEParam xWhere);
		Task<CResult> CreateAsync(BAN_TIPO_CHEQUETable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> UpdateAsync(BAN_TIPO_CHEQUETable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> DeleteAsync(BAN_TIPO_CHEQUETable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> ActivarInactivarAsync(BAN_TIPO_CHEQUETable Data, string vLOGIN_SISTEMA, string vESTACION);
	}
}
