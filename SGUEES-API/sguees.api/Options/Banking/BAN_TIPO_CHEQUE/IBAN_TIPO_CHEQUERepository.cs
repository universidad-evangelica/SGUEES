using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using sguees.Models;

namespace sguees.Repositories
{
	public interface IBAN_TIPO_CHEQUERepository : IRepository<BAN_TIPO_CHEQUETable>
	{
		Task<CResult> ActivarInactivarAsync(BAN_TIPO_CHEQUETable Data, string vLOGIN_SISTEMA, string vESTACION);
	}
}
