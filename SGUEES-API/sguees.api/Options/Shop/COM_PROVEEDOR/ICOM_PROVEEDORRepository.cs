using eFramework.Data;
using eFramework.Core;
using sguees.Models;

namespace sguees.Repositories
{
	public interface ICOM_PROVEEDORRepository: IRepository<COM_PROVEEDORTable>
	{
		Task<CResult> GetProveedorActuAsync(List<CParameter> xWhere);
		Task<CResult> GetCorreoUsuarioOpcionComProveedorAsync(List<CParameter> xWhere);
		Task<CResult> GetAllLookUpAsync(List<CParameter> xWhere);
		Task<CResult> GetAllLookUpProvComAsync(List<CParameter> xWhere);
	}
}
