using System.Threading.Tasks;

using eFramework.Core;

using sguees.Models;



namespace sguees.Services

{

	public interface IBAN_TIPO_MOVI_SEGUN_BANCARIAService

	{

		Task<CResult> GetAllAsync(BAN_TIPO_MOVI_SEGUN_BANCOParam xWhere);

		Task<CResult> GetAsync(BAN_TIPO_MOVI_SEGUN_BANCOParam xWhere);

		Task<CResult> CreateAsync(BAN_TIPO_MOVI_SEGUN_BANCARIOTable Data, string vLOGIN_SISTEMA, string vESTACION);

		Task<CResult> UpdateAsync(BAN_TIPO_MOVI_SEGUN_BANCARIOTable Data, string vLOGIN_SISTEMA, string vESTACION);

		Task<CResult> DeleteAsync(BAN_TIPO_MOVI_SEGUN_BANCARIOTable Data, string vLOGIN_SISTEMA, string vESTACION);

	}

}

