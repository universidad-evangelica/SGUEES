using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using sguees.Models;

namespace sguees.Repositories
{
	public interface ICOM_BANCORepository: IRepository<COM_BANCOTable>
	{
		Task<CResult> ActivarInactivarAsync(COM_BANCOTable Data, string vLOGIN_SISTEMA, string vESTACION);
	}
}
