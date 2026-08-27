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
	public class SC_EXPEDIENTE_ENTREVISTAController : ControllerBase
	{
		private readonly ISC_EXPEDIENTE_ENTREVISTAService _service;

		public SC_EXPEDIENTE_ENTREVISTAController(ISC_EXPEDIENTE_ENTREVISTAService service)
		{
			_service = service ?? throw new ArgumentNullException(nameof(service));
		}

		[HttpGet("GetAll")]
		[Authorize(Policy = "/sc-expediente-candidato|R")]
		public async Task<CResult> GetAll([FromQuery] SC_EXPEDIENTE_ENTREVISTAParam Data)
		{
			Data.CORR_EMPRESA = GetCorrEmpresa();
			return await _service.GetAllAsync(Data);
		}

		[HttpGet("Get")]
		[Authorize(Policy = "/sc-expediente-candidato|R")]
		public async Task<CResult> Get([FromQuery] SC_EXPEDIENTE_ENTREVISTAParam Data)
		{
			Data.CORR_EMPRESA = GetCorrEmpresa();
			return await _service.GetAsync(Data);
		}

		[HttpPost]
		[Authorize(Policy = "/sc-expediente-candidato|C")]
		public async Task<IActionResult> Post(SC_EXPEDIENTE_ENTREVISTATable Data)
		{
			SetCreateAudit(Data);

			var resultado = await _service.CreateAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
			return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
		}

		[HttpPut]
		[Authorize(Policy = "/sc-expediente-candidato|U")]
		public async Task<IActionResult> Put(SC_EXPEDIENTE_ENTREVISTATable Data)
		{
			this.ApplyQueryKeys(Data, nameof(SC_EXPEDIENTE_ENTREVISTATable.CORR_EXPEDIENTE_ENTREVISTA));
			SetUpdateAudit(Data);

			var resultado = await _service.UpdateAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
			return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
		}

		[HttpDelete]
		[Authorize(Policy = "/sc-expediente-candidato|D")]
		public async Task<IActionResult> Delete([FromQuery] SC_EXPEDIENTE_ENTREVISTATable Data)
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

		private void SetCreateAudit(SC_EXPEDIENTE_ENTREVISTATable Data)
		{
			Data.CORR_EMPRESA = GetCorrEmpresa();
			Data.USUARIO_CREA = GetUsuario();
			Data.ESTACION_CREA = ClientInfoHelper.GetClientStation(HttpContext);
			Data.FECHA_CREA = DateTime.Now;
			Data.USUARIO_ACTU = Data.USUARIO_CREA;
			Data.ESTACION_ACTU = Data.ESTACION_CREA;
			Data.FECHA_ACTU = Data.FECHA_CREA;
		}

		private void SetUpdateAudit(SC_EXPEDIENTE_ENTREVISTATable Data)
		{
			Data.CORR_EMPRESA = GetCorrEmpresa();
			Data.USUARIO_ACTU = GetUsuario();
			Data.ESTACION_ACTU = ClientInfoHelper.GetClientStation(HttpContext);
			Data.FECHA_ACTU = DateTime.Now;
		}
	}
}
