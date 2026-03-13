using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;

namespace sguees.Services
{
	public interface ISEG_USUARIOService
	{
		Task<CResult> GetAllAsync(SEG_USUARIOParam xWhere);
		Task<CResult> GetAsync(List<CParameter> xWhere);
		Task<CResult> CreateAsync(SEG_USUARIOTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> UpdateAsync(SEG_USUARIOTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> DeleteAsync(SEG_USUARIOTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> LoginAsync(string LOGIN_SISTEMA, string CLAVE_USUARIO, string CODIGO_SUITE);
		Task<CResult> CheckUserExistsAndActiveAsync(string LOGIN_SISTEMA, string CODIGO_SUITE);
		Task<CResult> GenerateTokenAsync(string LOGIN_SISTEMA, string CODIGO_SUITE);
		Task<CResult> GetMenuAsync(string LOGIN_SISTEMA, string CODIGO_SUITE);
		string GenerateRptToken(string username);
		#region "Detalle de opciones"
		Task<CResult> GetAllSEG_USUARIO_OPCION(SEG_USUARIOParam xWhere);
		Task<CResult> UpdateSEG_USUARIO_OPCIONAsync(SEG_USUARIO_OPCIONTable Data, string vLOGIN_SISTEMA, string vESTACION);
		#endregion
		Task<CResult> CambioClave(SEG_USUARIO_LOGINParam Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> RestablecerContrasenaAsync(string LOGIN_SISTEMA, int CORR_EMPRESA, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> SolicitarResetContrasenaAsync(string LOGIN_SISTEMA);
		Task<CResult> ConfirmarResetContrasenaAsync(SEG_USUARIO_RESET_PASSWORDParam Data);
		string GenerateToken(SEG_USUARIOView Usuario, string CodigoSuite, List<SEG_USUARIO_PERMISOView> Opciones);
		Task<CResult> getUSUARIO_PERMISOS(string vLOGIN_SISTEMA, string CODIGO_SUITE);
		Task<CResult> GetAllSEG_USUARIO_LOOKUP(SEG_USUARIOParam xWhere);
	}
}
