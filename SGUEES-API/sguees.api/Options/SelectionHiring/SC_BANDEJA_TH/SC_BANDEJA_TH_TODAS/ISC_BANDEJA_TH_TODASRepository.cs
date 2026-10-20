using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using SGUEES.Models;

namespace SGUEES.Repositories
{
	// Qué hace: Define el contrato de acceso a datos para la consulta unificada de la pestaña Todas.
	// Cómo lo hace: Declara el método GetTodasPagedAsync recibiendo la lista de parámetros CParameter.
	public interface ISC_BANDEJA_TH_TODASRepository
	{
		Task<CResult> GetTodasPagedAsync(List<CParameter> xWhere);
	}
}
