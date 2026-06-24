using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;

namespace sguees.Repositories
{
	public interface ICON_REPORTERepository
	{
		Task<CResult> GetDefinicionesAsync();
		Task<CResult> GetConfiReportesAsync(int corrEmpresa);
		Task<CResult> ConsultarAsync(CON_REPORTEParam param);
		Task<CResult> ConsultarParaImprAsync(CON_REPORTEParam param);
	}
}
