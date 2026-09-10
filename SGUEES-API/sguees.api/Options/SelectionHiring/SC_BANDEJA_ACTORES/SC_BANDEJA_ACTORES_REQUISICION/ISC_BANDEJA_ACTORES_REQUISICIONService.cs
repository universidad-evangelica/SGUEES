using System.Threading.Tasks;
using eFramework.Core;
using SGUEES.Models;

namespace SGUEES.Services
{
	public interface ISC_BANDEJA_ACTORES_REQUISICIONService
	{
		Task<CResult> GetRequisicionesAsync(SC_BANDEJA_ACTORES_REQUISICIONParam xWhere);
		Task<CResult> GetBitacoraRequisicionAsync(SC_BANDEJA_ACTORES_BITACORAParam xWhere);
		Task<CResult> GetUnidadesPendientesAsync(int corrEmpresa, string loginSistema);
		Task<int> CountRequisicionesPendientesAsync(int corrEmpresa, string loginSistema);
	}
}
