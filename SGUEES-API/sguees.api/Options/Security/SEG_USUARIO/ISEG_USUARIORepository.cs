using eFramework.Data;
using scuees.Models;
using eFramework.Core;

namespace scuees.Repositories
{
	public interface ISEG_USUARIORepository: IRepository<SEG_USUARIOTable>
	{
		Task<CResult> CambioClave(SEG_USUARIO_LOGINParam Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> GetAuthClassAsync(List<CParameter> xWhere);
		Task<CResult> GetUsuarioClassAsync(List<CParameter> xWhere);
	}
}
