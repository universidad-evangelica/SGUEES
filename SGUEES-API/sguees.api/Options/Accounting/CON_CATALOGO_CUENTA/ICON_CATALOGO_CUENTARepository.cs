using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using sguees.Models;

namespace sguees.Repositories
{
	public interface ICON_CATALOGO_CUENTARepository : IRepository<CON_CATALOGO_CUENTATable>
	{
		Task<CResult> ImportarExcelAsync(CON_CATALOGO_CUENTA_IMPORTParam Data, string vLOGIN_SISTEMA, string vESTACION);
	}
}
