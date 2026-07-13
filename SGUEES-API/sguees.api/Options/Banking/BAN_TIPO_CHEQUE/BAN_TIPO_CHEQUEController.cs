using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Linq;
using System.Security.Claims;
using eFramework.Core;
using sguees.Models;
using sguees.Services;
using sguees.api.Shared;

namespace sguees.Controllers
{
	[Authorize]
	[Route("[controller]")]
	[ApiController]
	public class BAN_TIPO_CHEQUEController : ControllerBase
	{
		private readonly IBAN_TIPO_CHEQUEService _service;
		public BAN_TIPO_CHEQUEController(IBAN_TIPO_CHEQUEService service) { _service = service ?? throw new ArgumentNullException(nameof(service)); }

		[HttpGet("GetAll")]
		[Authorize(Policy = "/ban-tipo-cheque|R")]
		public async Task<CResult> GetAll([FromQuery] BAN_TIPO_CHEQUEParam Data)
		{
			Data.CORR_EMPRESA = GetCorrEmpresa();
			return await _service.GetAllAsync(Data);
		}

		[HttpGet("Get")]
		[Authorize(Policy = "/ban-tipo-cheque|R")]
		public async Task<CResult> Get([FromQuery] BAN_TIPO_CHEQUEParam Data)
		{
			Data.CORR_EMPRESA = GetCorrEmpresa();
			return await _service.GetAsync(Data);
		}

		[HttpPost]
		[Authorize(Policy = "/ban-tipo-cheque|C")]
		public async Task<IActionResult> Post(BAN_TIPO_CHEQUETable Data)
		{
			Data.CORR_EMPRESA = GetCorrEmpresa();
			Data.ESTADO_TIPO_CHEQUE ??= true;

			var resultado = await _service.CreateAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
			return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
		}

		[HttpPut]
		[Authorize(Policy = "/ban-tipo-cheque|U")]
		public async Task<IActionResult> Put(BAN_TIPO_CHEQUETable Data)
		{
			this.ApplyQueryKeys(Data, nameof(BAN_TIPO_CHEQUETable.CORR_TIPO_CHEQUE));
			Data.CORR_EMPRESA = GetCorrEmpresa();

			var resultado = await _service.UpdateAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
			return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
		}

		[HttpDelete]
		[Authorize(Policy = "/ban-tipo-cheque|D")]
		public async Task<IActionResult> Delete([FromQuery] BAN_TIPO_CHEQUETable Data)
		{
			Data.CORR_EMPRESA = GetCorrEmpresa();
			var resultado = await _service.DeleteAsync(Data, "", "");
			return resultado.ErrorCode == 0 ? Ok(resultado) : BadRequest(resultado);
		}

		[HttpPut("ActivarInactivar")]
		[Authorize(Policy = "/ban-tipo-cheque|U")]
		public async Task<IActionResult> ActivarInactivar(BAN_TIPO_CHEQUETable Data)
		{
			this.ApplyQueryKeys(Data, nameof(BAN_TIPO_CHEQUETable.CORR_TIPO_CHEQUE));
			Data.CORR_EMPRESA = GetCorrEmpresa();

			var resultado = await _service.ActivarInactivarAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
			return resultado.ErrorCode == 0 ? Ok(resultado) : BadRequest(resultado);
		}

		private int GetCorrEmpresa()
		{
			var claim = User.Claims.FirstOrDefault(e => e.Type == "CORR_EMPRESA");
			return claim != null && int.TryParse(claim.Value, out var corrEmpresa) ? corrEmpresa : 0;
		}

		private string GetUsuario()
		{
			return User.Claims.ToList().SingleOrDefault(e => e.Type == ClaimTypes.NameIdentifier).Value;
		}
	}
}
