using eFramework.Data;
using sguees.Models;
using System.Threading.Tasks;
using eFramework.Core;

namespace sguees.Repositories
{
	public interface ICON_PARAMETRORepository : IRepository<CON_PARAMETROTable>
	{
		Task<CResult> GetMonedasAsync(int corrEmpresa);
	}
}
