using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using SGUEES.Models;

namespace SGUEES.Repositories
{
	public interface ISC_EXPEDIENTE_ENTREVISTA_DOCUMENTORepository
	{
		Task<CResult> GetAllAsync(List<CParameter> xWhere);
		Task<CResult> GetAsync(List<CParameter> xWhere);
		Task<CResult> CreateAsync(SC_EXPEDIENTE_ENTREVISTA_DOCUMENTOTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> UpdateAsync(SC_EXPEDIENTE_ENTREVISTA_DOCUMENTOTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> DeleteAsync(SC_EXPEDIENTE_ENTREVISTA_DOCUMENTOTable Data, string vLOGIN_SISTEMA, string vESTACION);
	}
}
