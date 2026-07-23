using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;

namespace sguees.Services
{
	public interface IBAN_TIPO_MOVI_BANCARIOService
	{
		Task<CResult> GetAllAsync(BAN_TIPO_MOVI_BANCARIOParam xWhere);
		Task<CResult> GetAsync(BAN_TIPO_MOVI_BANCARIOParam xWhere);
		Task<CResult> CreateAsync(BAN_TIPO_MOVI_BANCARIOTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> UpdateAsync(BAN_TIPO_MOVI_BANCARIOTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> DeleteAsync(BAN_TIPO_MOVI_BANCARIOTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> ActivarInactivarAsync(BAN_TIPO_MOVI_BANCARIOTable Data, string vLOGIN_SISTEMA, string vESTACION);
	}
}
