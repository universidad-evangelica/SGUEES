using System.Threading.Tasks;
using eFramework.Core;
using SGUEES.Models;

namespace SGUEES.Services
{
	public interface ISC_BANDEJA_TH_REQUISICIONService
	{
		Task<CResult> GetRequisicionesAsync(SC_BANDEJA_TH_REQUISICIONParam xWhere);
		Task<CResult> GetBitacoraRequisicionAsync(SC_BANDEJA_TH_BITACORAParam xWhere);
	}
}
