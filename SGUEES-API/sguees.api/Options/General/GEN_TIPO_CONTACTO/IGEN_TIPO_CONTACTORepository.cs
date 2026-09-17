// Qué hace: contrato del repositorio GEN_TIPO_CONTACTO.
// Cómo lo hace: hereda IRepository y declara ActivarInactivarAsync del catálogo.
using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using sguees.Models;

namespace sguees.Repositories
{
	public interface IGEN_TIPO_CONTACTORepository : IRepository<GEN_TIPO_CONTACTOTable>
	{
		Task<CResult> ActivarInactivarAsync(GEN_TIPO_CONTACTOTable Data, string vLOGIN_SISTEMA, string vESTACION);
	}
}
