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
	/// Decisión jefatura sobre candidato en requisición. Permisos del padre.
	/// </summary>
	[Authorize]
	[Route("[controller]")]
	[ApiController]
	public class SC_REQUISICION_CANDIDATOController : ControllerBase
	{
		private readonly ISC_REQUISICION_CANDIDATOService _service;

		public SC_REQUISICION_CANDIDATOController(ISC_REQUISICION_CANDIDATOService service)
		{
			_service = service ?? throw new ArgumentNullException(nameof(service));
		}

		/// <summary>Registra APLICA / NO_APLICA. Solo USUARIO_CREA de la requisición. Irreversible.</summary>
		[HttpPost("Decide")]
		[Authorize(Policy = "/sc-requisicion-personal|U")]
		public async Task<IActionResult> Decide(SC_REQUISICION_CANDIDATOTable Data)
		{
			Data.CORR_EMPRESA = Empresa();
			var user = Usuario();
			var station = ClientInfoHelper.GetClientStation(HttpContext);
			var resultado = await _service.DecideAsync(Data, user, station);
			if (resultado.Result && resultado.ErrorCode == 0)
			{
				return StatusCode(201, resultado);
			}

			return Ok(resultado);
		}

		/// <summary>Postulaciones / decisiones del expediente (consulta TH).</summary>
		[HttpGet("GetAll_SC_EXPEDIENTE_CANDIDATO")]
		[Authorize(Policy = "/sc-expediente-candidato|R")]
		public async Task<CResult> GetAll_SC_EXPEDIENTE_CANDIDATO([FromQuery] SC_REQUISICION_CANDIDATOParam Data)
		{
			Data.CORR_EMPRESA = Empresa();
			return await _service.GetPostulacionesExpedienteAsync(Data);
		}

		private int Empresa() => int.Parse(User.Claims.Single(e => e.Type == "CORR_EMPRESA").Value);

		private string Usuario() => User.Claims.Single(e => e.Type == ClaimTypes.NameIdentifier).Value;
	}
}
