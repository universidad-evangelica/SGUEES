using System.Threading.Tasks;
using eFramework.Core;
using SGUEES.Models;

namespace SGUEES.Services
{
	public interface IGEN_DISTRITOService
	{
		Task<CResult> GetAllAsync(GEN_DISTRITOParam xWhere);
		Task<CResult> GetAsync(GEN_DISTRITOParam xWhere);
		Task<CResult> CreateAsync(GEN_DISTRITOTable data, string vLoginSistema, string vEstacion);
		Task<CResult> UpdateAsync(GEN_DISTRITOTable data, string vLoginSistema, string vEstacion);
		Task<CResult> DeleteAsync(GEN_DISTRITOTable data, string vLoginSistema, string vEstacion);
	}
}
