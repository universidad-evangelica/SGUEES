// Qué hace: contrato del repositorio PLA_SEGURO_SOCIAL.
// Cómo lo hace: hereda IRepository y declara ActivarInactivarAsync.
using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using SGUEES.Models;

namespace SGUEES.Repositories
{
	public interface IPLA_SEGURO_SOCIALRepository : IRepository<PLA_SEGURO_SOCIALTable>
	{
		Task<CResult> ActivarInactivarAsync(PLA_SEGURO_SOCIALTable Data, string vLOGIN_SISTEMA, string vESTACION);
	}
}
