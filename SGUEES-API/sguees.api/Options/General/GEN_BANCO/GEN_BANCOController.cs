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
	public class GEN_BANCOController : ControllerBase
	{
		private readonly IGEN_BANCOService _service;

		public GEN_BANCOController(IGEN_BANCOService service)
		{
			_service = service ?? throw new ArgumentNullException(nameof(service));
		}

		[HttpGet("GetAll")]
		[Authorize(Policy = "/gen-banco|R")]
		public async Task<CResult> GetAll([FromQuery] GEN_BANCOParam Data)
		{
			Data.CORR_EMPRESA = GetCorrEmpresa();
			return await _service.GetAllAsync(Data);
		}

		[HttpGet("Get")]
		[Authorize(Policy = "/gen-banco|R")]
		public async Task<CResult> Get([FromQuery] GEN_BANCOParam Data)
		{
			Data.CORR_EMPRESA = GetCorrEmpresa();
			return await _service.GetAsync(Data);
		}

		[HttpPost]
		[Authorize(Policy = "/gen-banco|C")]
		public async Task<IActionResult> Post(GEN_BANCOTable Data)
		{
			if (!ValidateEmpresaSesion(out var resultadoEmpresa))
				return BadRequest(resultadoEmpresa);

			SetCreateAudit(Data);

			var resultado = await _service.CreateAsync(Data, Data.USUARIO_CREA, Data.ESTACION_CREA);
			return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
		}

		[HttpPut]
		[Authorize(Policy = "/gen-banco|U")]
		public async Task<IActionResult> Put(GEN_BANCOTable Data)
		{
			this.ApplyQueryKeys(Data, nameof(GEN_BANCOTable.CORR_BANCO));
			if (!ValidateEmpresaSesion(out var resultadoEmpresa))
				return BadRequest(resultadoEmpresa);

			SetUpdateAudit(Data);

			var resultado = await _service.UpdateAsync(Data, Data.USUARIO_ACTU, Data.ESTACION_ACTU);
			return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
		}

		[HttpDelete]
		[Authorize(Policy = "/gen-banco|D")]
		public async Task<IActionResult> Delete([FromQuery] GEN_BANCOTable Data)
		{
			if (!ValidateEmpresaSesion(out var resultadoEmpresa))
				return BadRequest(resultadoEmpresa);

			Data.CORR_EMPRESA = GetCorrEmpresa();
			var resultado = await _service.DeleteAsync(Data, "", "");
			return resultado.ErrorCode == 0 ? Ok(resultado) : BadRequest(resultado);
		}

		[HttpGet("GetCORR_BANCO_BAN_CUENTA_BANCARIA")]
		[Authorize(Policy = "/ban-cuenta-bancaria|R")]
		public async Task<CResult> GetCORR_BANCO_BAN_CUENTA_BANCARIA([FromQuery] GEN_BANCOParam Data)
		{
			Data.CORR_EMPRESA = GetCorrEmpresa();
			return await _service.GetAllAsync(Data);
		}

		[HttpGet("GetCORR_BANCO_BAN_TIPO_MOVI_BANCARIO")]
		[Authorize(Policy = "/ban-tipo-movi-bancario|R")]
		public async Task<CResult> GetCORR_BANCO_BAN_TIPO_MOVI_BANCARIO([FromQuery] GEN_BANCOParam Data)
		{
			Data.CORR_EMPRESA = GetCorrEmpresa();
			return await _service.GetAllAsync(Data);
		}

		[HttpPut("ActivarInactivar")]
		[Authorize(Policy = "/gen-banco|U")]
		public async Task<IActionResult> ActivarInactivar(GEN_BANCOTable Data)
		{
			this.ApplyQueryKeys(Data, nameof(GEN_BANCOTable.CORR_BANCO));
			if (!ValidateEmpresaSesion(out var resultadoEmpresa))
				return BadRequest(resultadoEmpresa);

			Data.CORR_EMPRESA = GetCorrEmpresa();

			var resultado = await _service.ActivarInactivarAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
			return resultado.ErrorCode == 0 ? Ok(resultado) : BadRequest(resultado);
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
				Data = null,
				Result = false,
				CodeHelper = 0,
				ErrorCode = 4100,
				ErrorMessage = "No se pudo guardar el banco porque su usuario no tiene una empresa asignada. Solicite que le configuren una empresa por defecto en el sistema.",
				ErrorSource = "[GEN_BANCOController]",
				RowsAffected = 0
			};

			return false;
		}

		private string GetUsuario()
		{
			return User.Claims.ToList().SingleOrDefault(e => e.Type == ClaimTypes.NameIdentifier).Value;
		}

		private void SetCreateAudit(GEN_BANCOTable Data)
		{
			Data.CORR_EMPRESA = GetCorrEmpresa();
			Data.USUARIO_CREA = GetUsuario();
			Data.ESTACION_CREA = ClientInfoHelper.GetClientStation(HttpContext);
			Data.FECHA_CREA = DateTime.Now;
			Data.USUARIO_ACTU = Data.USUARIO_CREA;
			Data.ESTACION_ACTU = Data.ESTACION_CREA;
			Data.FECHA_ACTU = Data.FECHA_CREA;
			Data.ESTADO_BANCO ??= true;
		}

		private void SetUpdateAudit(GEN_BANCOTable Data)
		{
			Data.CORR_EMPRESA = GetCorrEmpresa();
			Data.USUARIO_ACTU = GetUsuario();
			Data.ESTACION_ACTU = ClientInfoHelper.GetClientStation(HttpContext);
			Data.FECHA_ACTU = DateTime.Now;
		}
	}
}
