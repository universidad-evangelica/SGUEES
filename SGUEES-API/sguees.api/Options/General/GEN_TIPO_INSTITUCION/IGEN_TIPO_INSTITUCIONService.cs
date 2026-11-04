using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;

namespace sguees.Services
{
	public interface IGEN_TIPO_INSTITUCIONService
	{
		Task<CResult> GetAllAsync(GEN_TIPO_INSTITUCIONParam xWhere);
		Task<CResult> GetAsync(GEN_TIPO_INSTITUCIONParam xWhere);
		Task<CResult> CreateAsync(GEN_TIPO_INSTITUCIONTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> UpdateAsync(GEN_TIPO_INSTITUCIONTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> DeleteAsync(GEN_TIPO_INSTITUCIONTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> ActivarInactivarAsync(GEN_TIPO_INSTITUCIONTable Data, string vLOGIN_SISTEMA, string vESTACION);
	}
}
