using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using sguees.Models;

namespace sguees.Repositories
{
	public interface IBAN_CUENTA_BANCARIARepository : IRepository<BAN_CUENTA_BANCARIATable>
	{
		Task<CResult> ActivarInactivarAsync(BAN_CUENTA_BANCARIATable Data, string vLOGIN_SISTEMA, string vESTACION);
	}
}
