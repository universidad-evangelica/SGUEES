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
	[Authorize]
	[Route("[controller]")]
	[ApiController]
	public class GEN_CLIENTEController : ControllerBase
	{
		private readonly IGEN_CLIENTEService _service;

		public GEN_CLIENTEController(IGEN_CLIENTEService service)
		{
			_service = service ?? throw new ArgumentNullException(nameof(service));
		}

		[HttpGet("GetAll")]
		[Authorize(Policy = "/gen-cliente|R")]
		public async Task<CResult> GetAll([FromQuery] GEN_CLIENTEParam Data)
		{
			Data.CORR_EMPRESA = GetCorrEmpresa();
			return await _service.GetAllAsync(Data);
		}

		[HttpGet("Get")]
		[Authorize(Policy = "/gen-cliente|R")]
		public async Task<CResult> Get([FromQuery] GEN_CLIENTEParam Data)
		{
			Data.CORR_EMPRESA = GetCorrEmpresa();
			return await _service.GetAsync(Data);
		}

		[HttpPost]
		[Authorize(Policy = "/gen-cliente|C")]
		public async Task<IActionResult> Post(GEN_CLIENTETable Data)
		{
			if (!ValidateEmpresaSesion(out var resultadoEmpresa))
				return BadRequest(resultadoEmpresa);

			SetCreateAudit(Data);
			var resultado = await _service.CreateAsync(Data, Data.USUARIO_CREA, Data.ESTACION_CREA);
			return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
		}

		[HttpPut]
		[Authorize(Policy = "/gen-cliente|U")]
		public async Task<IActionResult> Put(GEN_CLIENTETable Data)
		{
			this.ApplyQueryKeys(Data, nameof(GEN_CLIENTETable.CORR_CLIENTE));
			if (!ValidateEmpresaSesion(out var resultadoEmpresa))
				return BadRequest(resultadoEmpresa);

			SetUpdateAudit(Data);
			var resultado = await _service.UpdateAsync(Data, Data.USUARIO_ACTU, Data.ESTACION_ACTU);
			return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
		}

		[HttpDelete]
		[Authorize(Policy = "/gen-cliente|D")]
		public async Task<IActionResult> Delete([FromQuery] GEN_CLIENTETable Data)
		{
			if (!ValidateEmpresaSesion(out var resultadoEmpresa))
				return BadRequest(resultadoEmpresa);

			Data.CORR_EMPRESA = GetCorrEmpresa();
			var resultado = await _service.DeleteAsync(Data, string.Empty, string.Empty);
			return resultado.ErrorCode == 0 ? Ok(resultado) : BadRequest(resultado);
		}

		[HttpPut("ActivarInactivar")]
		[Authorize(Policy = "/gen-cliente|U")]
		public async Task<IActionResult> ActivarInactivar(GEN_CLIENTETable Data)
		{
			this.ApplyQueryKeys(Data, nameof(GEN_CLIENTETable.CORR_CLIENTE));
			if (!ValidateEmpresaSesion(out var resultadoEmpresa))
				return BadRequest(resultadoEmpresa);

			Data.CORR_EMPRESA = GetCorrEmpresa();
			var resultado = await _service.ActivarInactivarAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
			return resultado.ErrorCode == 0 ? Ok(resultado) : BadRequest(resultado);
		}

		[HttpGet("GetCORR_CLIENTE_BAN_SOLI_CHEQUE")]
		[Authorize(Policy = "/ban-soli-cheque|R")]
		public async Task<CResult> GetCORR_CLIENTE_BAN_SOLI_CHEQUE([FromQuery] GEN_CLIENTEParam Data)
		{
			Data.CORR_EMPRESA = GetCorrEmpresa();
			return await _service.GetAllAsync(Data);
		}

		[HttpGet("GetCORR_CLIENTE_BAN_CHEQUE")]
		[Authorize(Policy = "/ban-cheque|R")]
		public async Task<CResult> GetCORR_CLIENTE_BAN_CHEQUE([FromQuery] GEN_CLIENTEParam Data)
		{
			Data.CORR_EMPRESA = GetCorrEmpresa();
			return await _service.GetAllAsync(Data);
		}

		[HttpGet("GetCORR_CLIENTE_BAN_DOCUMENTO")]
		[Authorize(Policy = "/ban-documento|R")]
		public async Task<CResult> GetCORR_CLIENTE_BAN_DOCUMENTO([FromQuery] GEN_CLIENTEParam Data)
		{
			Data.CORR_EMPRESA = GetCorrEmpresa();
			return await _service.GetAllAsync(Data);
		}

		private int GetCorrEmpresa()
		{
			var claim = User.Claims.FirstOrDefault(e => e.Type == "CORR_EMPRESA");
			return claim != null && int.TryParse(claim.Value, out var corrEmpresa) ? corrEmpresa : 0;
		}

		private bool ValidateEmpresaSesion(out CResult resultado)
		{
			if (GetCorrEmpresa() > 0)
			{
				resultado = null;
				return true;
			}

			resultado = new CResult
			{
				Result = false,
				ErrorCode = 4100,
				ErrorMessage = "No se pudo guardar el cliente porque su usuario no tiene una empresa asignada.",
				ErrorSource = "[GEN_CLIENTEController]",
			};
			return false;
		}

		private string GetUsuario() =>
			User.Claims.Single(e => e.Type == ClaimTypes.NameIdentifier).Value;

		private void SetCreateAudit(GEN_CLIENTETable Data)
		{
			Data.CORR_EMPRESA = GetCorrEmpresa();
			Data.USUARIO_CREA = GetUsuario();
			Data.ESTACION_CREA = ClientInfoHelper.GetClientStation(HttpContext);
			Data.FECHA_CREA = DateTime.Now;
			Data.USUARIO_ACTU = Data.USUARIO_CREA;
			Data.ESTACION_ACTU = Data.ESTACION_CREA;
			Data.FECHA_ACTU = Data.FECHA_CREA;
			Data.ESTA_ACTIVO ??= true;
		}

		private void SetUpdateAudit(GEN_CLIENTETable Data)
		{
			Data.CORR_EMPRESA = GetCorrEmpresa();
			Data.USUARIO_ACTU = GetUsuario();
			Data.ESTACION_ACTU = ClientInfoHelper.GetClientStation(HttpContext);
			Data.FECHA_ACTU = DateTime.Now;
		}
	}
}
