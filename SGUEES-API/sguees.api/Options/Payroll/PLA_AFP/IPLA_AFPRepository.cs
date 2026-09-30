// Qué hace: contrato del repositorio PLA_AFP.
// Cómo lo hace: hereda IRepository y declara ActivarInactivarAsync.
using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using SGUEES.Models;

namespace SGUEES.Repositories
{
	public interface IPLA_AFPRepository : IRepository<PLA_AFPTable>
	{
		Task<CResult> ActivarInactivarAsync(PLA_AFPTable Data, string vLOGIN_SISTEMA, string vESTACION);
	}
}
