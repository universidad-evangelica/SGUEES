using eFramework.Data;
using eFramework.Core;
using scuees.Models;

namespace scuees.Repositories
{
	public interface ICOM_COTIZACIONRepository: IRepository<COM_COTIZACIONTable>
	{
		Task<CResult> AplicarAsync(COM_COTIZACIONTable Data);
		Task<CResult> GetComCotizacionRepoAsync(List<CParameter> xWhere);
		Task<CResult> GetCorreoCotizaAplicarAsync(List<CParameter> xWhere);
	}
}
