using System.Threading.Tasks;
using eFramework.Core;
using SGUEES.Models;

namespace SGUEES.Services
{
	// Qué hace: Define la interfaz del servicio para consultar la pestaña Todas en Bandeja TH.
	// Cómo lo hace: Declara el método GetTodasAsync recibiendo el modelo de parámetros SC_BANDEJA_TH_TODASParam.
	public interface ISC_BANDEJA_TH_TODASService
	{
		Task<CResult> GetTodasAsync(SC_BANDEJA_TH_TODASParam xWhere);
	}
}
