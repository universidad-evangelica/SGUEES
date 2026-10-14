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
		private readonly ISC_REQUISICION_CANDIDATOService _requisicionCandidatoService;
		private readonly ISC_MOVIMIENTO_PERSONALService _movimientoPersonalService;

		public SC_BANDEJA_THController(
			ISC_BANDEJA_TH_REQUISICIONService requisicionService,
			ISC_BANDEJA_TH_CANDIDATOService candidatoService,
			ISC_BANDEJA_TH_CONTRATOService contratoService,
			ISC_REQUISICION_CANDIDATOService requisicionCandidatoService,
			ISC_MOVIMIENTO_PERSONALService movimientoPersonalService)
		{
			_requisicionService = requisicionService
				?? throw new System.ArgumentNullException(nameof(requisicionService));
			_candidatoService = candidatoService
				?? throw new System.ArgumentNullException(nameof(candidatoService));
			_contratoService = contratoService
				?? throw new System.ArgumentNullException(nameof(contratoService));
			_requisicionCandidatoService = requisicionCandidatoService
				?? throw new System.ArgumentNullException(nameof(requisicionCandidatoService));
			_movimientoPersonalService = movimientoPersonalService
				?? throw new System.ArgumentNullException(nameof(movimientoPersonalService));
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

		// Qué hace: Registra el dictamen Aplica / No aplica desde el módulo de Talento Humano.
		// Cómo lo hace: Inyecta CORR_EMPRESA, usuario y estación, e invoca el servicio de decisión con validarJefatura = false para permitir la gestión de TH.
		[HttpPost("DecideCandidato")]
		[Authorize(Policy = "/sc-bandeja-th|U")]
		public async Task<IActionResult> DecideCandidato([FromBody] SC_REQUISICION_CANDIDATOTable Data)
		{
			Data.CORR_EMPRESA = Empresa();
			var resultado = await _requisicionCandidatoService.DecideAsync(
				Data,
				Usuario(),
				ClientInfoHelper.GetClientStation(HttpContext),
				validarJefatura: false);

			if (resultado.Result)
			{
				return Ok(resultado);
			}

			return BadRequest(resultado);
		}

		// Qué hace: Confirma el movimiento de personal vinculado a una contratación desde la bandeja de TH.
		// Cómo lo hace: Inyecta CORR_EMPRESA, usuario y estación, e invoca el servicio de confirmación de movimiento personal.
		[HttpPut("ConfirmarMovimientoPersonal")]
		[Authorize(Policy = "/sc-bandeja-th|U")]
		public async Task<IActionResult> ConfirmarMovimientoPersonal([FromBody] SC_MOVIMIENTO_PERSONAL_CONFIRMAParam Data)
		{
			Data.CORR_EMPRESA = Empresa();
			var resultado = await _movimientoPersonalService.ConfirmarAsync(
				Data,
				Usuario(),
				ClientInfoHelper.GetClientStation(HttpContext));

			if (resultado.ErrorCode == 0)
			{
				return StatusCode(201, resultado);
			}

			return Ok(resultado);
		}

		// Qué hace: Endpoint para crear el empleado institucional / usuario a partir del movimiento en la bandeja TH.
		// Cómo lo hace: Inyecta empresa, usuario y estación, y delega a _movimientoPersonalService.ContratarEmpleadoAsync con la política de bandeja TH.
		[HttpPost("ContratarEmpleado")]
		[Authorize(Policy = "/sc-bandeja-th|U")]
		public async Task<IActionResult> ContratarEmpleado([FromBody] SC_MOVIMIENTO_PERSONALParam Data)
		{
			Data.CORR_EMPRESA = Empresa();
			var resultado = await _movimientoPersonalService.ContratarEmpleadoAsync(
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
