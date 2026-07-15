using System.Threading.Tasks;
using eFramework.Core;
using SGUEES.Models;

namespace SGUEES.Services
{
	public interface IGEN_DEPTOService
	{
		Task<CResult> GetAllAsync(GEN_DEPTOParam xWhere);
		Task<CResult> GetAsync(GEN_DEPTOParam xWhere);
		Task<CResult> CreateAsync(GEN_DEPTOTable data, string vLoginSistema, string vEstacion);
		Task<CResult> UpdateAsync(GEN_DEPTOTable data, string vLoginSistema, string vEstacion);
		Task<CResult> DeleteAsync(GEN_DEPTOTable data, string vLoginSistema, string vEstacion);
	}
}
