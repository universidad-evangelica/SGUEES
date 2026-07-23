using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using sguees.Models;

namespace sguees.Repositories
{
	public interface IBAN_TIPO_MOVI_BANCARIORepository : IRepository<BAN_TIPO_MOVI_BANCARIOTable>
	{
		Task<CResult> ActivarInactivarAsync(BAN_TIPO_MOVI_BANCARIOTable Data, string vLOGIN_SISTEMA, string vESTACION);
	}
}
