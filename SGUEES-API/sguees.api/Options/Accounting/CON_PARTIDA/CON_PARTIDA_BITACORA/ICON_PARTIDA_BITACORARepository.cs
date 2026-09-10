using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;

namespace sguees.Repositories
{
	// Qué hace: contrato de lectura de bitácora de partida.
	// Cómo lo hace: expone GetAll/Get sobre la vista V_CON_PARTIDA_BITACORA.
	public interface ICON_PARTIDA_BITACORARepository
	{
		Task<CResult> GetAllAsync(List<CParameter> xWhere);
		Task<CResult> GetAsync(List<CParameter> xWhere);
	}
}
