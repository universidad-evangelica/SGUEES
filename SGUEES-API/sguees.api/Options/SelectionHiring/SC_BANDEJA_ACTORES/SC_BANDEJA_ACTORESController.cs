using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using eFramework.Core;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using sguees.api.Shared;
using SGUEES.Models;
using SGUEES.Services;

namespace SGUEES.Controllers
{
	/// <summary>
	/// Bandeja de actores / jefatura — pendientes por LOGIN_SISTEMA del JWT.
	/// </summary>
	[Authorize]
	[Route("[controller]")]
	[ApiController]
	public class SC_BANDEJA_ACTORESController : ControllerBase
	{
		private readonly ISC_BANDEJA_ACTORES_REQUISICIONService _requisicionService;
		private readonly ISC_BANDEJA_ACTORES_CANDIDATOService _candidatoService;
		private readonly ISC_REQUISICION_PERSONALService _requisicionPersonalService;
		private readonly ISC_REQUISICION_CANDIDATOService _requisicionCandidatoService;

		public SC_BANDEJA_ACTORESController(
			ISC_BANDEJA_ACTORES_REQUISICIONService requisicionService,
			ISC_BANDEJA_ACTORES_CANDIDATOService candidatoService,
			ISC_REQUISICION_PERSONALService requisicionPersonalService,
			ISC_REQUISICION_CANDIDATOService requisicionCandidatoService)
		{
			_requisicionService = requisicionService
				?? throw new ArgumentNullException(nameof(requisicionService));
			_candidatoService = candidatoService
				?? throw new ArgumentNullException(nameof(candidatoService));
			_requisicionPersonalService = requisicionPersonalService
				?? throw new ArgumentNullException(nameof(requisicionPersonalService));
			_requisicionCandidatoService = requisicionCandidatoService
				?? throw new ArgumentNullException(nameof(requisicionCandidatoService));
		}

		[HttpGet("GetRequisiciones")]
		[Authorize(Policy = "/sc-bandeja-actores|R")]
		public async Task<CResult> GetRequisiciones([FromQuery] SC_BANDEJA_ACTORES_REQUISICIONParam Data)
		{
			Data.CORR_EMPRESA = Empresa();
			Data.LOGIN_SISTEMA = Usuario();
			if (Data.PAGE <= 0)
			{
				Data.PAGE = 1;
			}

			return await _requisicionService.GetRequisicionesAsync(Data);
		}

		[HttpGet("GetBitacoraRequisicion")]
		[Authorize(Policy = "/sc-bandeja-actores|R")]
		public async Task<CResult> GetBitacoraRequisicion([FromQuery] SC_BANDEJA_ACTORES_BITACORAParam Data)
		{
			Data.CORR_EMPRESA = Empresa();
			Data.CORR_TIPO_DOCUMENTO = Data.CORR_TIPO_DOCUMENTO > 0 ? Data.CORR_TIPO_DOCUMENTO : 101;
			return await _requisicionService.GetBitacoraRequisicionAsync(Data);
		}

		[HttpGet("GetCandidatos")]
		[Authorize(Policy = "/sc-bandeja-actores|R")]
		public async Task<CResult> GetCandidatos([FromQuery] SC_BANDEJA_ACTORES_CANDIDATOParam Data)
		{
			Data.CORR_EMPRESA = Empresa();
			Data.LOGIN_SISTEMA = Usuario();
			if (Data.PAGE <= 0)
			{
				Data.PAGE = 1;
			}

			return await _candidatoService.GetCandidatosAsync(Data);
		}

		[HttpGet("GetUnidades")]
		[Authorize(Policy = "/sc-bandeja-actores|R")]
		public async Task<CResult> GetUnidades()
		{
			return await _requisicionService.GetUnidadesPendientesAsync(Empresa(), Usuario());
		}

		[HttpGet("GetKpis")]
		[Authorize(Policy = "/sc-bandeja-actores|R")]
		public async Task<CResult> GetKpis()
		{
			var empresa = Empresa();
			var login = Usuario();
			var totalReq = await _requisicionService.CountRequisicionesPendientesAsync(empresa, login);
			var totalCand = await _candidatoService.CountCandidatosPendientesAsync(empresa, login);
			var unidades = await _requisicionService.GetUnidadesPendientesAsync(empresa, login);
			var totalUnidades = unidades.Result ? unidades.RowsAffected : 0;

			var kpis = new SC_BANDEJA_ACTORES_KPIView
			{
				TOTAL_REQUISICIONES = totalReq,
				TOTAL_CANDIDATOS = totalCand,
				TOTAL_UNIDADES = totalUnidades,
				TOTAL_PENDIENTES = totalReq + totalCand,
			};

			return new CResult
			{
				Data = kpis,
				Result = true,
				RowsAffected = 1,
				CodeHelper = 0,
				ErrorCode = 0,
				ErrorMessage = "",
				ErrorSource = "",
			};
		}

		/// <summary>
		/// Aprobar / Devolver / Rechazar requisición (OPERACION 3/4/5).
		/// Reutiliza el mismo SP de flujo; el motor valida al actor.
		/// </summary>
		[HttpPut("AutorizaRequisicion")]
		[Authorize(Policy = "/sc-bandeja-actores|U")]
		public async Task<IActionResult> AutorizaRequisicion([FromBody] SC_REQUISICION_PERSONAL_AUTORIZAParam Data)
		{
			Data.CORR_EMPRESA = Empresa();
			var resultado = await _requisicionPersonalService.AutorizaAsync(Data, Usuario());
			if (resultado.Result)
			{
				return Ok(resultado);
			}

			return BadRequest(resultado);
		}

		/// <summary>
		/// Dictamen APLICA / NO_APLICA. Validación de jefatura en repository del Decide.
		/// </summary>
		[HttpPost("DecideCandidato")]
		[Authorize(Policy = "/sc-bandeja-actores|U")]
		public async Task<IActionResult> DecideCandidato([FromBody] SC_REQUISICION_CANDIDATOTable Data)
		{
			Data.CORR_EMPRESA = Empresa();
			var resultado = await _requisicionCandidatoService.DecideAsync(
				Data,
				Usuario(),
				ClientInfoHelper.GetClientStation(HttpContext));

			if (resultado.Result)
			{
				return Ok(resultado);
			}

			return BadRequest(resultado);
		}

		private int Empresa() =>
			int.Parse(User.Claims.ToList().Single(e => e.Type == "CORR_EMPRESA").Value);

		private string Usuario() =>
			User.Claims.ToList().Single(e => e.Type == ClaimTypes.NameIdentifier).Value;
	}
}
