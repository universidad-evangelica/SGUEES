using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;

namespace SGUEES.Repositories
{
	public interface ISC_BANDEJA_ACTORES_REQUISICIONRepository
	{
		Task<CResult> GetRequisicionesPagedAsync(List<CParameter> xWhere);
		Task<CResult> GetBitacoraRequisicionAsync(List<CParameter> xWhere);
		Task<CResult> GetUnidadesPendientesAsync(List<CParameter> xWhere);
		Task<int> CountRequisicionesPendientesAsync(List<CParameter> xWhere);
	}
}
