using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using sguees.Models;
using eFrameworkAPI.Core;

namespace sguees.Repositories
{
	public class CON_REPORepository : eFrameworkAPI.Data.BaseRepository, ICON_REPORepository
	{
		public CON_REPORepository(IConfiguration config) :
			base(config.GetSection("AppSetting:apiRptURL").Value)
		{
			objData.Token = string.Empty;
		}

		public Task<Stream> GetConLibroDiarioAuxiliarImprAsync(List<LIBRO_DIARIO_AUXILIAR_IMPRView> data, string token) =>
			PostAccountingAsync(data, "PostConLibroDiarioAuxiliarImpr", token);

		public Task<Stream> GetConLibroDiarioAuxiliarMesImprAsync(List<LIBRO_DIARIO_AUXILIAR_MES_IMPRView> data, string token) =>
			PostAccountingAsync(data, "PostConLibroDiarioAuxiliarMesImpr", token);

		public Task<Stream> GetConLibroDiarioMayorImprAsync(List<LIBRO_DIARIO_MAYOR_IMPRView> data, string token) =>
			PostAccountingAsync(data, "PostConLibroDiarioMayorImpr", token);

		public Task<Stream> GetConBalanceComprobacionImprAsync(List<BALANCE_COMPROBACION_IMPRView> data, string token) =>
			PostAccountingAsync(data, "PostConBalanceComprobacionImpr", token);

		public Task<Stream> GetConBalanceComprobacionMesImprAsync(List<BALANCE_COMPROBACION_MES_IMPRView> data, string token) =>
			PostAccountingAsync(data, "PostConBalanceComprobacionMesImpr", token);

		public Task<Stream> GetConBalanceGeneralImprAsync(List<BALANCE_GENERAL_IMPRView> data, string token) =>
			PostAccountingAsync(data, "PostConBalanceGeneralImpr", token);

		public Task<Stream> GetConEstadoResultadosImprAsync(List<ESTADO_RESULTADOS_IMPRView> data, string token) =>
			PostAccountingAsync(data, "PostConEstadoResultadosImpr", token);

		public Task<Stream> GetConBalanceGeneralVerticalImprAsync(List<BALANCE_GENERAL_VERTICAL_IMPRView> data, string token) =>
			PostAccountingAsync(data, "PostConBalanceGeneralVerticalImpr", token);

		public Task<Stream> GetConPartidaImprAsync(List<CON_PARTIDA_IMPRView> data, string token) =>
			PostAccountingAsync(data, "PostConPartidaImpr", token);

		private Task<Stream> PostAccountingAsync<TData>(List<TData> data, string endpoint, string token)
		{
			objData.Token = token;
			return objData.PostStreamAsync(data, "Accounting", endpoint);
		}
	}
}
