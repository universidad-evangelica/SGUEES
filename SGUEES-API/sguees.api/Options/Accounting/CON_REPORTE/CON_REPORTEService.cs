using System.IO;

using System.Threading.Tasks;

using eFramework.Core;

using sguees.Models;

using sguees.Repositories;



namespace sguees.Services

{

	public interface ICON_REPORTEService

	{

		Task<CResult> GetDefinicionesAsync();

		Task<CResult> GetConfiReportesAsync(int corrEmpresa);

		Task<CResult> ConsultarAsync(CON_REPORTEParam param);

		Task<Stream> GetPDFAsync(CON_REPORTEParam param, string loginSistema);

	}



	public class CON_REPORTEService : ICON_REPORTEService

	{

		private readonly ICON_REPORTERepository _repo;

		private readonly ICON_REPORepository _repoRpt;

		private readonly ISEG_USUARIOService _repoUser;



		public CON_REPORTEService(

			ICON_REPORTERepository repo,

			ICON_REPORepository repoRpt,

			ISEG_USUARIOService repoUser)

		{

			_repo = repo;

			_repoRpt = repoRpt;

			_repoUser = repoUser;

		}



		public Task<CResult> GetDefinicionesAsync() => _repo.GetDefinicionesAsync();



		public Task<CResult> GetConfiReportesAsync(int corrEmpresa) => _repo.GetConfiReportesAsync(corrEmpresa);



		public Task<CResult> ConsultarAsync(CON_REPORTEParam param) => _repo.ConsultarAsync(param);



		public async Task<Stream> GetPDFAsync(CON_REPORTEParam param, string loginSistema)

		{

			var consulta = await _repo.ConsultarParaImprAsync(param);

			if (!consulta.Result || consulta.Data == null)

			{

				return null;

			}



			if (!CON_REPORTERegistry.TryGetRptEndpoint(param.CODIGO_REPORTE, out var endpoint))

			{

				return null;

			}



			return await _repoRpt.GetConReporteImprAsync(

				(System.Collections.Generic.List<CON_REPORTE_IMPRView>)consulta.Data,

				endpoint,

				_repoUser.GenerateRptToken(loginSistema));

		}

	}

}

