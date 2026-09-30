using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
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
		private readonly ISC_MOVIMIENTO_PERSONALService _movimientoService;

		public SC_BANDEJA_ACTORESController(
			ISC_BANDEJA_ACTORES_REQUISICIONService requisicionService,
			ISC_BANDEJA_ACTORES_CANDIDATOService candidatoService,
			ISC_REQUISICION_PERSONALService requisicionPersonalService,
			ISC_REQUISICION_CANDIDATOService requisicionCandidatoService,
			ISC_MOVIMIENTO_PERSONALService movimientoService)
		{
			_requisicionService = requisicionService
				?? throw new ArgumentNullException(nameof(requisicionService));
			_candidatoService = candidatoService
				?? throw new ArgumentNullException(nameof(candidatoService));
			_requisicionPersonalService = requisicionPersonalService
				?? throw new ArgumentNullException(nameof(requisicionPersonalService));
			_requisicionCandidatoService = requisicionCandidatoService
				?? throw new ArgumentNullException(nameof(requisicionCandidatoService));
			_movimientoService = movimientoService
				?? throw new ArgumentNullException(nameof(movimientoService));
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
			var totalMov = await _movimientoService.CountPendientesActorAsync(empresa, login);
			var unidades = await _requisicionService.GetUnidadesPendientesAsync(empresa, login);
			var totalUnidades = unidades.Result ? unidades.RowsAffected : 0;

			var kpis = new SC_BANDEJA_ACTORES_KPIView
			{
				TOTAL_REQUISICIONES = totalReq,
				TOTAL_CANDIDATOS = totalCand,
				TOTAL_MOVIMIENTOS = totalMov,
				TOTAL_UNIDADES = totalUnidades,
				TOTAL_PENDIENTES = totalReq + totalCand + totalMov,
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

		[HttpGet("GetMovimientos")]
		[Authorize(Policy = "/sc-bandeja-actores|R")]
		public async Task<CResult> GetMovimientos([FromQuery] SC_BANDEJA_ACTORES_REQUISICIONParam Data)
		{
			Data.CORR_EMPRESA = Empresa();
			Data.LOGIN_SISTEMA = Usuario();
			if (Data.PAGE <= 0)
			{
				Data.PAGE = 1;
			}

			var p = new List<CParameter>
			{
				new() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "LOGIN_SISTEMA", Value = Data.LOGIN_SISTEMA ?? string.Empty, DbType = System.Data.DbType.String },
				new() { ParameterName = "PAGE", Value = Data.PAGE, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "PAGE_SIZE", Value = Data.PAGE_SIZE, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "SORT_FIELD", Value = Data.SORT_FIELD ?? "FECHA_NOTIFICACION", DbType = System.Data.DbType.String },
				new() { ParameterName = "SORT_DESC", Value = Data.SORT_DESC, DbType = System.Data.DbType.Boolean },
			};
			if (Data.CORR_UNIDAD > 0)
			{
				p.Add(new CParameter { ParameterName = "CORR_UNIDAD", Value = Data.CORR_UNIDAD, DbType = System.Data.DbType.Int32 });
			}
			if (Data.FECHA_DESDE.HasValue)
			{
				p.Add(new CParameter { ParameterName = "FECHA_DESDE", Value = Data.FECHA_DESDE.Value, DbType = System.Data.DbType.Date });
			}
			if (Data.FECHA_HASTA.HasValue)
			{
				p.Add(new CParameter { ParameterName = "FECHA_HASTA", Value = Data.FECHA_HASTA.Value, DbType = System.Data.DbType.Date });
			}
			if (!string.IsNullOrWhiteSpace(Data.BUSQUEDA))
			{
				p.Add(new CParameter { ParameterName = "BUSQUEDA", Value = Data.BUSQUEDA, DbType = System.Data.DbType.String });
			}

			return await _movimientoService.GetPendientesActorAsync(p);
		}

		[HttpPut("AutorizaMovimiento")]
		[Authorize(Policy = "/sc-bandeja-actores|U")]
		public async Task<IActionResult> AutorizaMovimiento([FromBody] SC_MOVIMIENTO_PERSONAL_AUTORIZAParam Data)
		{
			Data.CORR_EMPRESA = Empresa();
			var resultado = await _movimientoService.AutorizaAsync(Data, Usuario());
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
