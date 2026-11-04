using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using sguees.Models;

namespace sguees.Repositories
{
	public interface IGEN_TIPO_INSTITUCIONRepository : IRepository<GEN_TIPO_INSTITUCIONTable>
	{
		Task<CResult> ActivarInactivarAsync(GEN_TIPO_INSTITUCIONTable Data, string vLOGIN_SISTEMA, string vESTACION);
	}
}
