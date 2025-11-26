using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using scuees.Models;

namespace scuees.Repositories
{
	public interface IGEN_DOCUMENTO_FISICORepository: IRepository<GEN_DOCUMENTO_FISICOTable>
	{
		Task<CResult> CreateGenDocFisicoAsync(List<CParameter> P, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> UpdateRutaAsync(GEN_DOCUMENTO_FISICOTable Data, string vLOGIN_SISTEMA, string vESTACION);
	}
}
