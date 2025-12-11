using eFramework.Data;
using sguees.Models;
using eFramework.Core;

namespace sguees.Repositories
{
	public interface ISEG_USUARIORepository: IRepository<SEG_USUARIOTable>
	{
		Task<CResult> CambioClave(SEG_USUARIO_LOGINParam Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> GetAuthClassAsync(List<CParameter> xWhere);
		Task<CResult> GetUsuarioClassAsync(List<CParameter> xWhere);
	}
}
