using scuees.Models;
using eFrameworkAPI.Core;

namespace scuees.Repositories
{
	public class COM_REPORepository : eFrameworkAPI.Data.BaseRepository, ICOM_REPORepository
	{
		public COM_REPORepository(IConfiguration config) :
		base(config.GetSection("AppSetting:apiRptURL").Value)
		{
			objData.Token = ""; // AppDataService.Token;
		}

		
		// public async Task<Stream> GetVL_FSEEStreamAsync(List<COM_VL_FSEEView> Data, string Token)
		// {
		// 	objData.Token = Token;

		// 	return await objData.PostStreamAsync(Data, "Shop", "PostVL_FSEE");
		// }
		
		// public async Task<CResult<string>> GetCuerpoCorreoPDFJSONAsync(COM_CORREO_PDFJSONView Data, string Token)
		// {
		// 	objData.Token = Token;

		// 	return await objData.PostDataAsync<COM_CORREO_PDFJSONView, string>(Data, "Shop", "PostCuerpoCorreoPDFJSON");
		// }

		
		public async Task<Stream> GetRepoSujetoExcluidoStreamAsync(List<COM_REPO_SUJETO_EXCLUIDOView> Data, string Token)
		{
			objData.Token = Token;

			return await objData.PostStreamAsync(Data, "Shop", "PostRepo_Sujeto_Excluido");
		}
		public async Task<Stream> GetComSoliCotizacionImprAsync(List<COM_SOLI_COTIZACION_IMPRView> Data, string Token)
		{
			objData.Token = Token;

			return await objData.PostStreamAsync(Data, "Shop", "PostComSoliCotizacionImpr");
		}
		public async Task<Stream> GetComCuadroComparativoImprAsync(List<COM_CUADRO_COMPARATIVO_IMPRView> Data, string Token)
		{
			objData.Token = Token;

			return await objData.PostStreamAsync(Data, "Shop", "PostComCuadroComparativoImpr");
		}
		public async Task<Stream> GetComCuadroComparativoOrdenCompraImprAsync(List<COM_ORDEN_COMPRA_IMPRView> Data, string Token)
		{
			objData.Token = Token;

			return await objData.PostStreamAsync(Data, "Shop", "PostComCuadroComparativoOrdenCompraImpr");
		}
	}
}
