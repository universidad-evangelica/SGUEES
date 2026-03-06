using eFramework.Data;
using sguees.Models;
using eFramework.Core;

namespace sguees.Repositories
{
	public interface ISEG_USUARIORepository: IRepository<SEG_USUARIOTable>
	{
		Task<CResult> CambioClave(SEG_USUARIO_LOGINParam Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> RestablecerContrasenaAsync(SEG_USUARIOTable Data, string nuevaContrasena, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> GetUsuarioAsync(List<CParameter> xWhere);
		Task<bool> VerificarPrimerLoginAsync(string loginSistema);
	Task<CResult> RegistrarLoginHistorialAsync(string loginSistema, string ipAddress, string navegador, string codigoSuite, bool exitoso, string mensaje, bool esCambioClave = false);
		Task<SEG_USUARIO_EXPIRACION_CLAVEView> ValidarExpiracionClaveAsync(string loginSistema);
		Task<List<SEG_USUARIO_CLAVE_HISTORIALView>> GetUltimasClavesAsync(string loginSistema, int numeroUltimasClaves);
	}
}
