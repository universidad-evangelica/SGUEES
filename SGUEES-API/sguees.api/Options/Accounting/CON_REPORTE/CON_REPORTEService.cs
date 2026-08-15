using System.Collections.Generic;
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

			var token = _repoUser.GenerateRptToken(loginSistema);
			switch (param.CODIGO_REPORTE?.Trim().ToUpperInvariant())
			{
				case "LIBRO_DIARIO_AUXILIAR":
					return await _repoRpt.GetConLibroDiarioAuxiliarImprAsync(
						(List<LIBRO_DIARIO_AUXILIAR_IMPRView>)consulta.Data, token);
				case "LIBRO_DIARIO_AUXILIAR_MES":
					return await _repoRpt.GetConLibroDiarioAuxiliarMesImprAsync(
						(List<LIBRO_DIARIO_AUXILIAR_MES_IMPRView>)consulta.Data, token);
				case "LIBRO_DIARIO_MAYOR":
					return await _repoRpt.GetConLibroDiarioMayorImprAsync(
						(List<LIBRO_DIARIO_MAYOR_IMPRView>)consulta.Data, token);
				case "BALANCE_COMPROBACION":
					return await _repoRpt.GetConBalanceComprobacionImprAsync(
						(List<BALANCE_COMPROBACION_IMPRView>)consulta.Data, token);
				case "BALANCE_COMPROBACION_MES":
					return await _repoRpt.GetConBalanceComprobacionMesImprAsync(
						(List<BALANCE_COMPROBACION_MES_IMPRView>)consulta.Data, token);
				case "BALANCE_GENERAL":
					return await _repoRpt.GetConBalanceGeneralImprAsync(
						(List<BALANCE_GENERAL_IMPRView>)consulta.Data, token);
				case "ESTADO_RESULTADOS":
					return await _repoRpt.GetConEstadoResultadosImprAsync(
						(List<ESTADO_RESULTADOS_IMPRView>)consulta.Data, token);
				case "BALANCE_GENERAL_VERTICAL":
					return await _repoRpt.GetConBalanceGeneralVerticalImprAsync(
						(List<BALANCE_GENERAL_VERTICAL_IMPRView>)consulta.Data, token);
				default:
					return null;
			}
		}
	}
}
