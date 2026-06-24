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

		public async Task<Stream> GetConReporteImprByCodigoAsync(ConReportePdfRequest data, string token)
		{
			objData.Token = token;
			return await objData.PostStreamAsync(data, "Accounting", "PostConReporteImprByCodigo");
		}

		public async Task<Stream> GetConPartidaImprAsync(List<CON_PARTIDA_IMPRView> data, string token)
		{
			objData.Token = token;
			return await objData.PostStreamAsync(data, "Accounting", "PostConPartidaImpr");
		}
	}
}
