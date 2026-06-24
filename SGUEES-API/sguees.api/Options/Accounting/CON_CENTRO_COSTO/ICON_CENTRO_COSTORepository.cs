using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using sguees.Models;

namespace sguees.Repositories
{
	public interface ICON_CENTRO_COSTORepository: IRepository<CON_CENTRO_COSTOTable>
	{
		Task<CResult> ImportarExcelAsync(CON_CENTRO_COSTO_IMPORTParam Data, string vLOGIN_SISTEMA, string vESTACION);
	}
}
