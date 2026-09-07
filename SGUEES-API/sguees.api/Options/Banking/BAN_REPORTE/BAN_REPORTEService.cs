using System;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;
using sguees.Repositories;

namespace sguees.Services
{
	public interface IBAN_REPORTEService
	{
		Task<CResult> GetDefinicionesAsync();
		Task<CResult> ConsultarAsync(BAN_REPORTEParam param);
		Task<Stream> GetPDFAsync(BAN_REPORTEParam param, string loginSistema);
	}

	public class BAN_REPORTEService : IBAN_REPORTEService
	{
		private readonly IBAN_REPORTERepository _repo;
		private readonly IBAN_REPORepository _repoRpt;
		private readonly ISEG_USUARIOService _repoUser;

		public BAN_REPORTEService(
			IBAN_REPORTERepository repo,
			IBAN_REPORepository repoRpt,
			ISEG_USUARIOService repoUser)
		{
			_repo = repo;
			_repoRpt = repoRpt;
			_repoUser = repoUser;
		}

		public Task<CResult> GetDefinicionesAsync() => _repo.GetDefinicionesAsync();

		public Task<CResult> ConsultarAsync(BAN_REPORTEParam param) => _repo.ConsultarAsync(param);

		public async Task<Stream> GetPDFAsync(BAN_REPORTEParam param, string loginSistema)
		{
			var consulta = await _repo.ConsultarParaImprAsync(param);
			if (!consulta.Result || consulta.Data == null)
			{
				throw new InvalidOperationException(
					string.IsNullOrWhiteSpace(consulta.ErrorMessage)
						? "No hay datos para imprimir el reporte."
						: consulta.ErrorMessage);
			}

			var token = _repoUser.GenerateRptToken(loginSistema);
			Stream stream;
			switch (param.CODIGO_REPORTE?.Trim().ToUpperInvariant())
			{
				case "BAN_CHEQUE_EMITIDOS":
					stream = await _repoRpt.GetBanChequeEmitidosImprAsync(
						(List<BAN_CHEQUE_EMITIDOS_IMPRView>)consulta.Data, token);
					break;
				case "BAN_ESTADO_CUENTA":
					stream = await _repoRpt.GetBanEstadoCuentaImprAsync(
						(List<BAN_ESTADO_CUENTA_IMPRView>)consulta.Data, token);
					break;
				case "BAN_ESTADO_CUENTA_ACUMULADO":
					stream = await _repoRpt.GetBanEstadoCuentaAcumuladoImprAsync(
						(List<BAN_ESTADO_CUENTA_ACUMULADO_IMPRView>)consulta.Data, token);
					break;
				case "BAN_ENTREGA_CHEQUES":
					stream = await _repoRpt.GetBanEntregaChequesImprAsync(
						(List<BAN_ENTREGA_CHEQUES_IMPRView>)consulta.Data, token);
					break;
				default:
					throw new InvalidOperationException($"Reporte bancario no soportado: {param.CODIGO_REPORTE}.");
			}

			if (stream == null)
			{
				throw new InvalidOperationException("SGUEES-RPT no devolvió el PDF del reporte bancario.");
			}

			return stream;
		}
	}
}
