using System.Threading.Tasks;
using eFramework.Core;
using SGUEES.Models;

namespace SGUEES.Services
{
	public interface IGEN_MUNICIPIOService
	{
		Task<CResult> GetAllAsync(GEN_MUNICIPIOParam xWhere);
		Task<CResult> GetAsync(GEN_MUNICIPIOParam xWhere);
		Task<CResult> GetMunicipiosByCodigoDeptoAsync(GEN_MUNICIPIOParam xWhere);
		Task<CResult> CreateAsync(GEN_MUNICIPIOTable data, string vLoginSistema, string vEstacion);
		Task<CResult> UpdateAsync(GEN_MUNICIPIOTable data, string vLoginSistema, string vEstacion);
		Task<CResult> DeleteAsync(GEN_MUNICIPIOTable data, string vLoginSistema, string vEstacion);
	}
}
