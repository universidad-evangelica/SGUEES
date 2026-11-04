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
		/// Destino documento / seguimiento: SEG_OPCION_SISTEMA.URL_OPCION + ?corr={corr}.
		/// Ejemplo observadores: SC_REQUISICION_PERSONAL + CORR_REQUISICION_PERSONAL.
		/// </summary>
		Task<string> ResolverUrlDestinoAsync(string codigoOpcion, int corr);

		/// <summary>
		/// Solo URL_OPCION del menú (sin query). Útil para bandejas.
		/// </summary>
		Task<string> ResolverUrlOpcionAsync(string codigoOpcion);

		/// <summary>
		/// Destino tarea / acción: bandeja TH o Actores según unidad del receptor.
		/// Opcional: corr + tipo para deep link futuro (?corr=&amp;tipo=).
		/// </summary>
		Task<string> ResolverUrlBandejaTareaAsync(
			int corrEmpresa,
			string loginDestino,
			int? corrDocumento = null,
			string tipoDocumento = null);

		/// <summary>
		/// True si el login pertenece a unidad TH (nodo TH o hija directa).
		/// </summary>
		Task<bool> EsUsuarioThAsync(int corrEmpresa, string loginSistema);
	}
}
