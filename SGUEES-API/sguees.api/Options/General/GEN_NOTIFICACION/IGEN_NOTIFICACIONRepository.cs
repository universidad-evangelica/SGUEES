using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;

namespace sguees.Repositories
{
	public interface IGEN_NOTIFICACIONRepository
	{
		Task<CResult> GetAllAsync(List<CParameter> xWhere);
		Task<CResult> CountPendientesAsync(int corrEmpresa, string loginSistema);
		Task<CResult> MarcarLeidaAsync(int corrEmpresa, string loginSistema, int corrNotificacion, string usuarioActu, string estacionActu);
		Task<CResult> CrearAsync(GEN_NOTIFICACIONCreateParam data);

		/// <summary>
		/// True si el puesto vigente del login está en unidad TH (nodo TH o CORR_UNIDAD_PADRE = TH).
		/// </summary>
		Task<bool> EsUsuarioThAsync(int corrEmpresa, string loginSistema);

		// Qué hace: Obtiene el correo electrónico institucional y nombre de un usuario según su login.
		// Cómo lo hace: Define el contrato asíncrono para consultar dbo.SEG_USUARIO retornando una tupla (Correo, Nombre).
		Task<(string Correo, string Nombre)> ObtenerDatosCorreoUsuarioAsync(string loginSistema);
	}
}
