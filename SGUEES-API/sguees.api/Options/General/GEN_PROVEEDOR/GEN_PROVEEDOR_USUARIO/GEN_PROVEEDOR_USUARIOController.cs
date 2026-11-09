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
	public class GEN_PROVEEDOR_USUARIOController : ControllerBase
	{
		private readonly IGEN_PROVEEDOR_USUARIOService _service;

		public GEN_PROVEEDOR_USUARIOController(IGEN_PROVEEDOR_USUARIOService service)
		{
			_service = service ?? throw new ArgumentNullException(nameof(service));
		}

		[HttpGet("GetAll")]
		[Authorize(Policy = "/gen-proveedor|R")]
		public async Task<CResult> GetAll([FromQuery] GEN_PROVEEDOR_USUARIOParam Data)
		{
			Data.CORR_EMPRESA = GetCorrEmpresa();
			return await _service.GetAllAsync(Data);
		}

		[HttpGet("Get")]
		[Authorize(Policy = "/gen-proveedor|R")]
		public async Task<CResult> Get([FromQuery] GEN_PROVEEDOR_USUARIOParam Data)
		{
			Data.CORR_EMPRESA = GetCorrEmpresa();
			return await _service.GetAsync(Data);
		}

		[HttpPost]
		[Authorize(Policy = "/gen-proveedor|C")]
		public async Task<IActionResult> Post(GEN_PROVEEDOR_USUARIOTable Data)
		{
			if (!ValidateEmpresaSesion(out var resultadoEmpresa))
			{
				return BadRequest(resultadoEmpresa);
			}

			Data.CORR_EMPRESA = GetCorrEmpresa();
			var resultado = await _service.CreateAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
			return resultado.ErrorCode == 0 && resultado.Result ? StatusCode(201, resultado) : BadRequest(resultado);
		}

		[HttpPut]
		[Authorize(Policy = "/gen-proveedor|U")]
		public async Task<IActionResult> Put(GEN_PROVEEDOR_USUARIOTable Data)
		{
			this.ApplyQueryKeys(Data, nameof(GEN_PROVEEDOR_USUARIOTable.CORR_PROVEEDOR), nameof(GEN_PROVEEDOR_USUARIOTable.LOGIN_SISTEMA));
			if (!ValidateEmpresaSesion(out var resultadoEmpresa))
			{
				return BadRequest(resultadoEmpresa);
			}

			Data.CORR_EMPRESA = GetCorrEmpresa();
			var resultado = await _service.UpdateAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
			return resultado.ErrorCode == 0 && resultado.Result ? Ok(resultado) : BadRequest(resultado);
		}

		[HttpDelete]
		[Authorize(Policy = "/gen-proveedor|D")]
		public async Task<IActionResult> Delete([FromQuery] GEN_PROVEEDOR_USUARIOTable Data)
		{
			if (!ValidateEmpresaSesion(out var resultadoEmpresa))
			{
				return BadRequest(resultadoEmpresa);
			}

			Data.CORR_EMPRESA = GetCorrEmpresa();
			var resultado = await _service.DeleteAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
			return resultado.ErrorCode == 0 && resultado.Result ? Ok(resultado) : BadRequest(resultado);
		}

		[HttpPost("ReasignarClave")]
		[Authorize(Policy = "/gen-proveedor|U")]
		public async Task<IActionResult> ReasignarClave(GEN_PROVEEDOR_USUARIO_CLAVEParam Data)
		{
			if (!ValidateEmpresaSesion(out var resultadoEmpresa))
			{
				return BadRequest(resultadoEmpresa);
			}

			Data.CORR_EMPRESA = GetCorrEmpresa();
			var resultado = await _service.CambioClaveAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
			return resultado.ErrorCode == 0 && resultado.Result ? Ok(resultado) : BadRequest(resultado);
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
				ErrorCode = 4100,
				ErrorMessage = "No se pudo completar la operación porque su usuario no tiene una empresa asignada.",
				ErrorSource = "[GEN_PROVEEDOR_USUARIOController]",
				RowsAffected = 0,
			};
			return false;
		}

		private string GetUsuario() =>
			User.Claims.Single(e => e.Type == ClaimTypes.NameIdentifier).Value;
	}
}
