using sguees.Models;
using eFrameworkAPI.Core;

namespace sguees.Repositories
{
    public interface ICOM_REPORepository
    {
        //  Task<Stream> GetVL_FSEEStreamAsync(List<COM_VL_FSEEView> Data, string Token);
        //  Task<CResult<string>> GetCuerpoCorreoPDFJSONAsync(COM_CORREO_PDFJSONView Data, string Token);
        Task<Stream> GetRepoSujetoExcluidoStreamAsync(List<COM_REPO_SUJETO_EXCLUIDOView> Data, string Token);
        Task<Stream> GetComSoliCotizacionImprAsync(List<COM_SOLI_COTIZACION_IMPRView> Data, string Token);
        Task<Stream> GetComCuadroComparativoImprAsync(List<COM_CUADRO_COMPARATIVO_IMPRView> Data, string Token);
        Task<Stream> GetComCuadroComparativoOrdenCompraImprAsync(List<COM_ORDEN_COMPRA_IMPRView> Data, string Token);
    }
}
