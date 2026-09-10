using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;

namespace sguees.Services
{
	// Qué hace: contrato de servicio de bitácora de partida.
	// Cómo lo hace: GetAll/Get por llave de partida.
	public interface ICON_PARTIDA_BITACORAService
	{
		Task<CResult> GetAllAsync(CON_PARTIDA_BITACORAParam xWhere);
		Task<CResult> GetAsync(CON_PARTIDA_BITACORAParam xWhere);
	}
}
