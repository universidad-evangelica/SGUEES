using eFramework.Core;
using scuees.Models;

namespace scuees.Services
{
    public interface ICOM_REPOService
    {
    //    Task<Stream> GetRepoSujetoExcluidoAsync(COM_DOCUMENTOParam xWhere);
    //    Task<CResult> GetComConsultaSujetoExcluidoAsync(COM_DOCUMENTOParam xWhere);   
        Task<CResult> GetComCotizacionRepo(COM_COTIZACIONParam xWhere);  
    }
}
