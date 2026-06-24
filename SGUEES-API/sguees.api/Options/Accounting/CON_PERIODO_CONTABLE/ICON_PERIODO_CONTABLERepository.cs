using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using sguees.Models;

namespace sguees.Repositories
{
	public interface ICON_PERIODO_CONTABLERepository : IRepository<CON_PERIODO_CONTABLETable>
	{
		Task<CResult> GenerarCierreAsync(CON_PERIODO_CONTABLEOperacionTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> GenerarAperturaAsync(CON_PERIODO_CONTABLEOperacionTable Data, string vLOGIN_SISTEMA, string vESTACION);
	}
}
