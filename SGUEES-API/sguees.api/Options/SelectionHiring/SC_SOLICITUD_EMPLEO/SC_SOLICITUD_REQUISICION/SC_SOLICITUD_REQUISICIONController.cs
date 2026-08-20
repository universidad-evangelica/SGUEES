using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using eFramework.Core;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using sguees.api.Shared;
using sguees.Models;
using sguees.Services;

namespace sguees.Controllers
{
	/// <summary>
	/// Detalle solicitud ↔ requisición. Permisos del padre (/sc-solicitud-empleo).
	/// </summary>
	[Authorize]
	[Route("[controller]")]
	[ApiController]
	public class SC_SOLICITUD_REQUISICIONController : ControllerBase
	{
		private readonly ISC_SOLICITUD_REQUISICIONService _service;

		public SC_SOLICITUD_REQUISICIONController(ISC_SOLICITUD_REQUISICIONService service)
		{
			_service = service ?? throw new ArgumentNullException(nameof(service));
		}

		[HttpGet("GetAll")]
		[Authorize(Policy = "/sc-solicitud-empleo|R")]
		public async Task<CResult> GetAll([FromQuery] SC_SOLICITUD_REQUISICIONParam Data)
		{
			Data.CORR_EMPRESA = Empresa();
			return await _service.GetAllAsync(Data);
		}

		[HttpGet("Get")]
		[Authorize(Policy = "/sc-solicitud-empleo|R")]
		public async Task<CResult> Get([FromQuery] SC_SOLICITUD_REQUISICIONParam Data)
		{
			Data.CORR_EMPRESA = Empresa();
			return await _service.GetAsync(Data);
		}

		[HttpPost]
		[Authorize(Policy = "/sc-solicitud-empleo|C")]
		public async Task<IActionResult> Post(SC_SOLICITUD_REQUISICIONTable Data)
		{
			Data.CORR_EMPRESA = Empresa();
			var user = Usuario();
			var station = ClientInfoHelper.GetClientStation(HttpContext);
			var now = DateTime.Now;
			Data.USUARIO_CREA = user;
			Data.ESTACION_CREA = station;
			Data.FECHA_CREA = now;
			Data.USUARIO_ACTU = user;
			Data.ESTACION_ACTU = station;
			Data.FECHA_ACTU = now;

			var resultado = await _service.CreateAsync(Data, user, station);
			if (resultado.Result && resultado.ErrorCode == 0)
			{
				return StatusCode(201, resultado);
			}

			return Ok(resultado);
		}

		[HttpDelete]
		[Authorize(Policy = "/sc-solicitud-empleo|D")]
		public async Task<IActionResult> Delete([FromQuery] SC_SOLICITUD_REQUISICIONTable Data)
		{
			Data.CORR_EMPRESA = Empresa();
			var resultado = await _service.DeleteAsync(Data, Usuario(), ClientInfoHelper.GetClientStation(HttpContext));
			return resultado.ErrorCode == 0 ? Ok(resultado) : BadRequest(resultado);
		}

		private int Empresa() => int.Parse(User.Claims.Single(e => e.Type == "CORR_EMPRESA").Value);
		private string Usuario() => User.Claims.Single(e => e.Type == ClaimTypes.NameIdentifier).Value;
	}
}
