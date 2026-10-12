using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;

namespace sguees.Services
{
	public interface IGEN_NOTIFICACIONService
	{
		Task<CResult> GetAllAsync(GEN_NOTIFICACIONParam xWhere);
		Task<CResult> CountPendientesAsync(int corrEmpresa, string loginSistema);
		Task<CResult> MarcarLeidaAsync(int corrEmpresa, string loginSistema, int corrNotificacion, string usuarioActu, string estacionActu);

		/// <summary>
		/// Creación interna: persiste y luego emite SignalR (best-effort).
		/// No expuesta como endpoint HTTP público.
		/// </summary>
		Task<CResult> CrearYEnviarAsync(GEN_NOTIFICACIONCreateParam data);
	}
}
