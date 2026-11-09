using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using sguees.Models;

namespace sguees.Repositories
{
	public interface IGEN_PERSONA_BANCORepository
	{
		Task<CResult> GetAllAsync(List<CParameter> xWhere);
		Task<CResult> GetAsync(List<CParameter> xWhere);
		Task<CResult> CreateAsync(GEN_PERSONA_BANCOTable Data);
		Task<CResult> UpdateAsync(GEN_PERSONA_BANCOTable Data);
		Task<CResult> DeleteAsync(GEN_PERSONA_BANCOTable Data);
		Task<int> NextCorrAsync(int corrEmpresa, long corrPersona);
	}
}
