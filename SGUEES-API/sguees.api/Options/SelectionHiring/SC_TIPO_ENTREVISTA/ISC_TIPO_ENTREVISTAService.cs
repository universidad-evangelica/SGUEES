using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;

namespace sguees.Services
{
	public interface ISC_TIPO_ENTREVISTAService
	{
		Task<CResult> GetAllAsync(SC_TIPO_ENTREVISTAParam xWhere);
		Task<CResult> GetAsync(SC_TIPO_ENTREVISTAParam xWhere);
		Task<CResult> CreateAsync(SC_TIPO_ENTREVISTATable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> UpdateAsync(SC_TIPO_ENTREVISTATable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> DeleteAsync(SC_TIPO_ENTREVISTATable Data, string vLOGIN_SISTEMA, string vESTACION);
	}
}
