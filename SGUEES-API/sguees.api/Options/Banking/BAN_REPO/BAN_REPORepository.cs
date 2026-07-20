using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using sguees.Models;
using eFrameworkAPI.Core;

namespace sguees.Repositories
{
	public class BAN_REPORepository : eFrameworkAPI.Data.BaseRepository, IBAN_REPORepository
	{
		public BAN_REPORepository(IConfiguration config) :
			base(config.GetSection("AppSetting:apiRptURL").Value)
		{
			objData.Token = string.Empty;
		}

		public Task<Stream> GetBanChequeEmitidosImprAsync(List<BAN_CHEQUE_EMITIDOS_IMPRView> data, string token) =>
			PostBankingAsync(data, "PostBanChequeEmitidosImpr", token);

		public Task<Stream> GetBanEstadoCuentaImprAsync(List<BAN_ESTADO_CUENTA_IMPRView> data, string token) =>
			PostBankingAsync(data, "PostBanEstadoCuentaImpr", token);

		public Task<Stream> GetBanEstadoCuentaAcumuladoImprAsync(List<BAN_ESTADO_CUENTA_ACUMULADO_IMPRView> data, string token) =>
			PostBankingAsync(data, "PostBanEstadoCuentaAcumuladoImpr", token);

		public Task<Stream> GetBanEntregaChequesImprAsync(List<BAN_ENTREGA_CHEQUES_IMPRView> data, string token) =>
			PostBankingAsync(data, "PostBanEntregaChequesImpr", token);

		private Task<Stream> PostBankingAsync<TData>(List<TData> data, string endpoint, string token)
		{
			objData.Token = token;
			return objData.PostStreamAsync(data, "Banking", endpoint);
		}
	}
}
