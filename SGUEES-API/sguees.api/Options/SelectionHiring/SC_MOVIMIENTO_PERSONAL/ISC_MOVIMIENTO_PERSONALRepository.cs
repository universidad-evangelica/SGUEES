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
		Task<CResult> GetAllAsyncBitacora(List<CParameter> xWhere);
		Task<CResult> GetUnidadesUsuarioAsync(List<CParameter> xWhere);
		Task<CResult> GetPuestosByUnidadAsync(List<CParameter> xWhere);
		Task<CResult> GetModalidadesAsync(List<CParameter> xWhere);
	}
}
