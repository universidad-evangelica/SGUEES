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

		/// <summary>
		/// Fachada universal para módulos de negocio: arma el param y llama CrearYEnviarAsync.
		/// URL_DESTINO opcional (ruta interna Angular o null).
		/// </summary>
		Task<CResult> NotificarUsuarioAsync(
			int corrEmpresa,
			string loginDestino,
			string titulo,
			string mensaje,
			string urlDestino = null,
			string usuarioCrea = null,
			string estacionCrea = null);

		/// <summary>
		/// Resuelve URL_DESTINO desde SEG_OPCION_SISTEMA.URL_OPCION + ?corr={corr}.
		/// codigoOpcion = CODIGO_OPCION del menú (ej. SC_REQUISICION_PERSONAL).
		/// Retorna null si no hay opción, URL vacía o corr inválido.
		/// </summary>
		Task<string> ResolverUrlDestinoAsync(string codigoOpcion, int corr);
	}
}
