using System.Threading.Tasks;
using eFramework.Core;
using scuees.Models;

namespace scuees.Services
{
	public interface ISEG_TIPO_USUARIOService
	{
		Task<CResult> GetAllAsync(SEG_TIPO_USUARIOParam xWhere);
		Task<CResult> GetAsync(SEG_TIPO_USUARIOParam xWhere);
		Task<CResult> CreateAsync(SEG_TIPO_USUARIOTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> UpdateAsync(SEG_TIPO_USUARIOTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> DeleteAsync(SEG_TIPO_USUARIOTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> GetAllSEG_TIPO_USUARIO_OPCION(SEG_TIPO_USUARIOParam xWhere);
		Task<CResult> UpdateSEG_TIPO_USUARIO_OPCIONAsync(SEG_TIPO_USUARIO_OPCIONTable Data, string vLOGIN_SISTEMA, string vESTACION);
	}
}
