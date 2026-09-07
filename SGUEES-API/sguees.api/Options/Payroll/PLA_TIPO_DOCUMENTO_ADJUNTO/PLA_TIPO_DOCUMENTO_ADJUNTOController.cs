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
	[Authorize]
	[ApiController]
	[Route("[controller]")]
	public class PLA_TIPO_DOCUMENTO_ADJUNTOController : ControllerBase
	{
		private readonly IPLA_TIPO_DOCUMENTO_ADJUNTOService _service;

		public PLA_TIPO_DOCUMENTO_ADJUNTOController(IPLA_TIPO_DOCUMENTO_ADJUNTOService service)
		{
			_service = service ?? throw new ArgumentNullException(nameof(service));
		}

		[HttpGet("GetAll")]
		[Authorize(Policy = "/pla-tipo-documento-adjunto|R")]
		public async Task<CResult> GetAll([FromQuery] PLA_TIPO_DOCUMENTO_ADJUNTOParam Data)
		{
			Data.CORR_EMPRESA = GetCorrEmpresa();
			return await _service.GetAllAsync(Data);
		}

		[HttpGet("Get")]
		[Authorize(Policy = "/pla-tipo-documento-adjunto|R")]
		public async Task<CResult> Get([FromQuery] PLA_TIPO_DOCUMENTO_ADJUNTOParam Data)
		{
			Data.CORR_EMPRESA = GetCorrEmpresa();
			return await _service.GetAsync(Data);
		}

		[HttpPost]
		[Authorize(Policy = "/pla-tipo-documento-adjunto|C")]
		public async Task<IActionResult> Post(PLA_TIPO_DOCUMENTO_ADJUNTOTable Data)
		{
			SetCreateAudit(Data);

			var resultado = await _service.CreateAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
			return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
		}

		[HttpPut]
		[Authorize(Policy = "/pla-tipo-documento-adjunto|U")]
		public async Task<IActionResult> Put(PLA_TIPO_DOCUMENTO_ADJUNTOTable Data)
		{
			this.ApplyQueryKeys(Data, nameof(PLA_TIPO_DOCUMENTO_ADJUNTOTable.CORR_TIPO_DOCUMENTO_ADJUNTO));
			SetUpdateAudit(Data);

			var resultado = await _service.UpdateAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
			return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
		}

		[HttpDelete]
		[Authorize(Policy = "/pla-tipo-documento-adjunto|D")]
		public async Task<IActionResult> Delete([FromQuery] PLA_TIPO_DOCUMENTO_ADJUNTOTable Data)
		{
			Data.CORR_EMPRESA = GetCorrEmpresa();

			var resultado = await _service.DeleteAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
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

		private void SetCreateAudit(PLA_TIPO_DOCUMENTO_ADJUNTOTable Data)
		{
			Data.CORR_EMPRESA = GetCorrEmpresa();
			Data.USUARIO_CREA = GetUsuario();
			Data.ESTACION_CREA = ClientInfoHelper.GetClientStation(HttpContext);
			Data.FECHA_CREA = DateTime.Now;
			Data.USUARIO_ACTU = Data.USUARIO_CREA;
			Data.ESTACION_ACTU = Data.ESTACION_CREA;
			Data.FECHA_ACTU = Data.FECHA_CREA;
		}

		private void SetUpdateAudit(PLA_TIPO_DOCUMENTO_ADJUNTOTable Data)
		{
			Data.CORR_EMPRESA = GetCorrEmpresa();
			Data.USUARIO_ACTU = GetUsuario();
			Data.ESTACION_ACTU = ClientInfoHelper.GetClientStation(HttpContext);
			Data.FECHA_ACTU = DateTime.Now;
		}
	}
}
