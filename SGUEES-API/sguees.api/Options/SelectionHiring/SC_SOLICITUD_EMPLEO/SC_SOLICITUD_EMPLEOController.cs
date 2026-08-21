using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using eFramework.Core;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using sguees.api.Shared;
using  sguees.Models;
using  sguees.Services;
using SGUEES.Models;

namespace sguees.Controllers
{
	[Authorize]
	[Route("[controller]")]
	[ApiController]
	
	public class SC_SOLICITUD_EMPLEOController : ControllerBase
	{
		private readonly ISC_SOLICITUD_EMPLEOService _service;
		
		public SC_SOLICITUD_EMPLEOController(ISC_SOLICITUD_EMPLEOService service)
		{
			_service = service ?? throw new ArgumentNullException(nameof(_service));
		}
		
		[HttpGet("GetAll")]
		[Authorize(Policy = "/sc-solicitud-empleo|R")]
		public async Task<CResult> GetAll([FromQuery] SC_SOLICITUD_EMPLEOParam Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			return await _service.GetAllAsync(Data);
		}
		
		[HttpGet("Get")]
		[Authorize(Policy = "/sc-solicitud-empleo|R")]
		public async Task<CResult> Get([FromQuery] SC_SOLICITUD_EMPLEOParam Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			return await _service.GetAsync(Data);
		}
		
		[HttpPost]
		[Authorize(Policy = "/sc-solicitud-empleo|C")]
		public async Task<IActionResult> Post(SC_SOLICITUD_EMPLEOTable Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			Data.USUARIO_CREA = User.Claims.ToList().SingleOrDefault(e => e.Type == ClaimTypes.NameIdentifier).Value;
			Data.ESTACION_CREA = ClientInfoHelper.GetClientStation(HttpContext);
			Data.FECHA_CREA = DateTime.Now;
			Data.USUARIO_ACTU = Data.USUARIO_CREA;
			Data.ESTACION_ACTU = Data.ESTACION_CREA;
			Data.FECHA_ACTU = Data.FECHA_CREA;
			
			var resultado = await _service.CreateAsync(Data, Data.ESTACION_CREA, "e-CoffeeTech");
			if (resultado.ErrorCode == 0)
			{
				return StatusCode(201, resultado);
			} else {
				return BadRequest(resultado);
			}
		}
		
		[HttpPut]
		[Authorize(Policy = "/sc-solicitud-empleo|U")]
		public async Task<IActionResult> Put(SC_SOLICITUD_EMPLEOTable Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			Data.USUARIO_ACTU = User.Claims.ToList().SingleOrDefault(e => e.Type == ClaimTypes.NameIdentifier).Value;
			Data.ESTACION_ACTU = ClientInfoHelper.GetClientStation(HttpContext);
			Data.FECHA_ACTU = DateTime.Now;
			var resultado = await _service.UpdateAsync(Data, "Admin", "e-CoffeeTech");
			if (resultado.ErrorCode == 0)
			{
				return StatusCode(201, resultado);
			} else {
				return BadRequest(resultado);
			}
		}
		
		[HttpDelete]
		[Authorize(Policy = "/sc-solicitud-empleo|D")]
		public async Task<IActionResult> Delete([FromQuery] SC_SOLICITUD_EMPLEOTable Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			var resultado = await _service.DeleteAsync(Data, "Admin", "e-CoffeeTech");
			if (resultado.ErrorCode == 0)
			{
				return Ok(resultado);
			} else {
				return BadRequest(resultado);
			}
		}

		/// <summary>
		/// RRHH: actualiza datos del candidato (persona + colecciones) de forma atómica.
		/// No modifica la sección Confirmación.
		/// </summary>
		[HttpPut("ActualizarPersonaDatos")]
		[Authorize(Policy = "/sc-solicitud-empleo|U")]
		public async Task<IActionResult> ActualizarPersonaDatos([FromBody] SC_SOLICITUD_EMPLEO_PERSONA_ACTUALIZARParam data)
		{
			var corrEmpresa = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			var usuario = User.Claims.ToList().SingleOrDefault(e => e.Type == ClaimTypes.NameIdentifier)?.Value ?? "RRHH";
			var estacion = ClientInfoHelper.GetClientStation(HttpContext);
			var resultado = await _service.ActualizarPersonaDatosAsync(corrEmpresa, usuario, estacion, data);
			return resultado.Result ? Ok(resultado) : BadRequest(resultado);
		}

		/// <summary>
		/// Sube/reemplaza la fotografía del candidato (permiso U de la solicitud).
		/// </summary>
		[HttpPost("SubirFotoPersona")]
		[Authorize(Policy = "/sc-solicitud-empleo|U")]
		[RequestSizeLimit(6 * 1024 * 1024)]
		public async Task<IActionResult> SubirFotoPersona(
			[FromForm] int CORR_PERSONA_DATOS,
			IFormFile file,
			[FromServices] PersonaFotoStorage fotoStorage)
		{
			var corrEmpresa = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			if (CORR_PERSONA_DATOS <= 0)
			{
				return BadRequest(new CResult
				{
					Result = false,
					ErrorCode = -1,
					ErrorMessage = "Identificador de persona inválido.",
				});
			}

			var guardado = await fotoStorage.SaveFinalAsync(corrEmpresa, CORR_PERSONA_DATOS, file);
			if (!guardado.Ok)
			{
				return BadRequest(new CResult
				{
					Result = false,
					ErrorCode = -1,
					ErrorMessage = guardado.Error,
				});
			}

			return Ok(new CResult
			{
				Result = true,
				ErrorCode = 0,
				RowsAffected = 1,
				Data = new { FOTO_URL = guardado.RelativeUrl },
				ErrorMessage = "",
			});
		}
	}
}
