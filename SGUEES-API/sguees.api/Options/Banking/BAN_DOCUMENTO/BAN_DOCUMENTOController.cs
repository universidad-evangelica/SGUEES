using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using eFramework.Core;
using sguees.api.Shared;
using sguees.Models;
using sguees.Services;

namespace sguees.Controllers
{
	[Authorize]
	[Route("[controller]")]
	[ApiController]
	public class BAN_DOCUMENTOController : ControllerBase
	{
		private readonly IBAN_DOCUMENTOService _service;

		public BAN_DOCUMENTOController(IBAN_DOCUMENTOService service)
		{
			_service = service ?? throw new ArgumentNullException(nameof(service));
		}

		[HttpGet("GetAll")]
		[Authorize(Policy = "/ban-documento|R")]
		public async Task<CResult> GetAll([FromQuery] BAN_DOCUMENTOParam Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			return await _service.GetAllAsync(Data);
		}

		[HttpGet("Get")]
		[Authorize(Policy = "/ban-documento|R")]
		public async Task<CResult> Get([FromQuery] BAN_DOCUMENTOParam Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			return await _service.GetAsync(Data);
		}

		[HttpPost]
		[Authorize(Policy = "/ban-documento|C")]
		public async Task<IActionResult> Post(BAN_DOCUMENTOTable Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			var resultado = await _service.CreateAsync(
				Data,
				User.Claims.ToList().SingleOrDefault(e => e.Type == ClaimTypes.NameIdentifier).Value,
				ClientInfoHelper.GetClientStation(HttpContext));
			return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
		}

		[HttpPut]
		[Authorize(Policy = "/ban-documento|U")]
		public async Task<IActionResult> Put(BAN_DOCUMENTOTable Data)
		{
			this.ApplyQueryKeys(
				Data,
				nameof(BAN_DOCUMENTOTable.CORR_EMPRESA),
				nameof(BAN_DOCUMENTOTable.ANIO_PERIODO),
				nameof(BAN_DOCUMENTOTable.MES_PERIODO),
				nameof(BAN_DOCUMENTOTable.CORR_TIPO_MOVIMIENTO),
				nameof(BAN_DOCUMENTOTable.CORR_DOCUMENTO));
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			var resultado = await _service.UpdateAsync(
				Data,
				User.Claims.ToList().SingleOrDefault(e => e.Type == ClaimTypes.NameIdentifier).Value,
				ClientInfoHelper.GetClientStation(HttpContext));
			return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
		}

		[HttpDelete]
		[Authorize(Policy = "/ban-documento|D")]
		public async Task<IActionResult> Delete([FromQuery] BAN_DOCUMENTOTable Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			var resultado = await _service.DeleteAsync(Data, string.Empty, string.Empty);
			return resultado.ErrorCode == 0 ? Ok(resultado) : BadRequest(resultado);
		}

		[HttpPut("Aplicar")]
		[Authorize(Policy = "/ban-documento|U")]
		public async Task<IActionResult> Aplicar(BAN_DOCUMENTOTable Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			Data.USUARIO_ACTU = User.Claims.ToList().SingleOrDefault(e => e.Type == ClaimTypes.NameIdentifier).Value.ToLower();
			Data.FECHA_ACTU = DateTime.Now;
			Data.ESTACION_ACTU = ClientInfoHelper.GetClientStation(HttpContext);
			var resultado = await _service.AplicarAsync(Data, Data.USUARIO_ACTU, Data.ESTACION_ACTU);
			return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
		}

		[HttpPut("Anular")]
		[Authorize(Policy = "/ban-documento|U")]
		public async Task<IActionResult> Anular(BAN_DOCUMENTOTable Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			Data.USUARIO_ACTU = User.Claims.ToList().SingleOrDefault(e => e.Type == ClaimTypes.NameIdentifier).Value.ToLower();
			Data.FECHA_ACTU = DateTime.Now;
			Data.ESTACION_ACTU = ClientInfoHelper.GetClientStation(HttpContext);
			var resultado = await _service.AnularAsync(Data, Data.USUARIO_ACTU, Data.ESTACION_ACTU);
			return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
		}

		[HttpPut("ImprimirCheque")]
		[Authorize(Policy = "/ban-documento|U")]
		public async Task<IActionResult> ImprimirCheque(BAN_DOCUMENTOTable Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			Data.USUARIO_ACTU = User.Claims.ToList().SingleOrDefault(e => e.Type == ClaimTypes.NameIdentifier).Value.ToLower();
			Data.FECHA_ACTU = DateTime.Now;
			Data.ESTACION_ACTU = ClientInfoHelper.GetClientStation(HttpContext);
			var resultado = await _service.ImprimirChequeAsync(Data, Data.USUARIO_ACTU, Data.ESTACION_ACTU);
			return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
		}
	}
}
