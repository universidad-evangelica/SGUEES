using System.Linq;
using System.Threading.Tasks;
using eFramework.Core;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SGUEES.Models;
using SGUEES.Services;

namespace SGUEES.Controllers
{
	/// <summary>
	/// Bandeja TH — facade por stages (Requisición / Candidato / Contrato).
	/// </summary>
	[Authorize]
	[Route("[controller]")]
	[ApiController]
	public class SC_BANDEJA_THController : ControllerBase
	{
		private readonly ISC_BANDEJA_TH_REQUISICIONService _requisicionService;
		private readonly ISC_BANDEJA_TH_CANDIDATOService _candidatoService;
		private readonly ISC_BANDEJA_TH_CONTRATOService _contratoService;

		public SC_BANDEJA_THController(
			ISC_BANDEJA_TH_REQUISICIONService requisicionService,
			ISC_BANDEJA_TH_CANDIDATOService candidatoService,
			ISC_BANDEJA_TH_CONTRATOService contratoService)
		{
			_requisicionService = requisicionService
				?? throw new System.ArgumentNullException(nameof(requisicionService));
			_candidatoService = candidatoService
				?? throw new System.ArgumentNullException(nameof(candidatoService));
			_contratoService = contratoService
				?? throw new System.ArgumentNullException(nameof(contratoService));
		}

		[HttpGet("GetRequisiciones")]
		[Authorize(Policy = "/sc-bandeja-th|R")]
		public async Task<CResult> GetRequisiciones([FromQuery] SC_BANDEJA_TH_REQUISICIONParam Data)
		{
			Data.CORR_EMPRESA = Empresa();
			if (Data.PAGE <= 0)
			{
				Data.PAGE = 1;
			}

			return await _requisicionService.GetRequisicionesAsync(Data);
		}

		[HttpGet("GetBitacoraRequisicion")]
		[Authorize(Policy = "/sc-bandeja-th|R")]
		public async Task<CResult> GetBitacoraRequisicion([FromQuery] SC_BANDEJA_TH_BITACORAParam Data)
		{
			Data.CORR_EMPRESA = Empresa();
			Data.CORR_TIPO_DOCUMENTO = Data.CORR_TIPO_DOCUMENTO > 0 ? Data.CORR_TIPO_DOCUMENTO : 101;
			return await _requisicionService.GetBitacoraRequisicionAsync(Data);
		}

		/// <summary>
		/// Ciclo de selección: Postulante → En selección (+ No aplica). Sin APLICA.
		/// </summary>
		[HttpGet("GetCandidatos")]
		[Authorize(Policy = "/sc-bandeja-th|R")]
		public async Task<CResult> GetCandidatos([FromQuery] SC_BANDEJA_TH_CANDIDATOParam Data)
		{
			Data.CORR_EMPRESA = Empresa();
			if (Data.PAGE <= 0)
			{
				Data.PAGE = 1;
			}

			return await _candidatoService.GetCandidatosAsync(Data);
		}

		/// <summary>
		/// Cola de contratación: solo dictamen APLICA (listos para movimiento personal).
		/// </summary>
		[HttpGet("GetContrataciones")]
		[Authorize(Policy = "/sc-bandeja-th|R")]
		public async Task<CResult> GetContrataciones([FromQuery] SC_BANDEJA_TH_CONTRATOParam Data)
		{
			Data.CORR_EMPRESA = Empresa();
			if (Data.PAGE <= 0)
			{
				Data.PAGE = 1;
			}

			return await _contratoService.GetContratacionesAsync(Data);
		}

		private int Empresa() =>
			int.Parse(User.Claims.ToList().Single(e => e.Type == "CORR_EMPRESA").Value);
	}
}
