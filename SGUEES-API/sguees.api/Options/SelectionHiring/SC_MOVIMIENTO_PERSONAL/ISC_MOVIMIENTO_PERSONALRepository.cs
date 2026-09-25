using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using SGUEES.Models;

namespace SGUEES.Repositories
{
	public interface ISC_MOVIMIENTO_PERSONALRepository : IRepository<SC_MOVIMIENTO_PERSONALTable>
	{
		Task<CResult> AutorizaAsync(SC_MOVIMIENTO_PERSONAL_AUTORIZAParam Data, string vLOGIN_SISTEMA);
		Task<CResult> ConfirmarAsync(SC_MOVIMIENTO_PERSONALTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> GetAllAsyncBitacora(List<CParameter> xWhere);
		Task RegistrarBitacoraDocumentoAsync(
			int corrEmpresa,
			int corrMovimiento,
			string login,
			string estacion,
			string estadoDestino,
			string comentario);
		Task<CResult> GetUnidadesUsuarioAsync(List<CParameter> xWhere);
		Task<CResult> GetPuestosByUnidadAsync(List<CParameter> xWhere);
		Task<CResult> GetModalidadesAsync(List<CParameter> xWhere);
		Task<CResult> GetEmpleadosAsync(List<CParameter> xWhere);
		Task<CResult> GetRequisicionAsociadaAsync(List<CParameter> xWhere);
		Task<CResult> RegistrarFechaIngresoAsync(SC_MOVIMIENTO_PERSONALTable Data);
		Task<CResult> GetAccionesFlujoAsync(int corrEmpresa, int corrMovimiento, string login);
		Task<int> ResolverUnidadJefeAsync(int corrEmpresa, string login);
		Task<CResult> GetPendientesActorAsync(List<CParameter> xWhere);
		Task<int> CountPendientesActorAsync(int corrEmpresa, string login);
	}
}
