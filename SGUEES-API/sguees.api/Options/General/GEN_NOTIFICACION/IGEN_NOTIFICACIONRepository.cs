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
	}
}
