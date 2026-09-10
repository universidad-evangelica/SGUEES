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

		public SC_BANDEJA_THController(
			ISC_BANDEJA_TH_REQUISICIONService requisicionService,
			ISC_BANDEJA_TH_CANDIDATOService candidatoService)
		{
			_requisicionService = requisicionService
				?? throw new System.ArgumentNullException(nameof(requisicionService));
			_candidatoService = candidatoService
				?? throw new System.ArgumentNullException(nameof(candidatoService));
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
		/// Listado paginado de postulaciones (solicitud + requisición) con estado de ciclo.
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

		private int Empresa() =>
			int.Parse(User.Claims.ToList().Single(e => e.Type == "CORR_EMPRESA").Value);
	}
}
