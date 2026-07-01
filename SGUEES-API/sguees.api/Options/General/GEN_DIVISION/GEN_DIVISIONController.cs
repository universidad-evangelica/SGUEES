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
	[ApiController]
	[Route("[controller]")]
	public class GEN_DIVISIONController : ControllerBase
	{
		private readonly IGEN_DIVISIONService _service;

		public GEN_DIVISIONController(IGEN_DIVISIONService service)
		{
			_service = service ?? throw new ArgumentNullException(nameof(_service));
		}

		[HttpGet("GetAll")]
		[Authorize(Policy = "/gen-division|R")]
		public async Task<CResult> GetAll([FromQuery] GEN_DIVISIONParam Data)
		{
			Data.CORR_EMPRESA = GetCorrEmpresa();
			return await _service.GetAllAsync(Data);
		}

		[HttpGet("GetDistinctValues")]
		[Authorize(Policy = "/gen-division|R")]
		public async Task<CResult> GetDistinctValues([FromQuery] GEN_DIVISIONParam Data)
		{
			Data.CORR_EMPRESA = GetCorrEmpresa();
			return await _service.GetDistinctValuesAsync(Data);
		}

		[HttpGet("Get")]
		[Authorize(Policy = "/gen-division|R")]
		public async Task<CResult> Get([FromQuery] GEN_DIVISIONParam Data)
		{
			Data.CORR_EMPRESA = GetCorrEmpresa();
			return await _service.GetAsync(Data);
		}

		[HttpPost]
		[Authorize(Policy = "/gen-division|C")]
		public async Task<IActionResult> Post(GEN_DIVISIONTable Data)
		{
			if (!ValidateEmpresaSesion(out var resultadoEmpresa))
				return BadRequest(resultadoEmpresa);

			SetCreateAudit(Data);

			var resultado = await _service.CreateAsync(Data, Data.ESTACION_CREA, "e-CoffeeTech");
			return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
		}

		[HttpPut]
		[Authorize(Policy = "/gen-division|U")]
		public async Task<IActionResult> Put(GEN_DIVISIONTable Data)
		{
			if (!ValidateEmpresaSesion(out var resultadoEmpresa))
				return BadRequest(resultadoEmpresa);

			SetUpdateAudit(Data);

			var resultado = await _service.UpdateAsync(Data, "Admin", "e-CoffeeTech");
			return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
		}

		[HttpDelete]
		[Authorize(Policy = "/gen-division|D")]
		public async Task<IActionResult> Delete([FromQuery] GEN_DIVISIONTable Data)
		{
			if (!ValidateEmpresaSesion(out var resultadoEmpresa))
				return BadRequest(resultadoEmpresa);

			SetUpdateAudit(Data);

			var resultado = await _service.DeleteAsync(Data, "Admin", "e-CoffeeTech");
			return resultado.ErrorCode == 0 ? Ok(resultado) : BadRequest(resultado);
		}

		[HttpGet("GetCORR_DIVISION_GEN_GERENCIA")]
		[Authorize(Policy = "/gen-gerencia|R")]
		public async Task<CResult> GetCORR_DIVISION_GEN_GERENCIA([FromQuery] GEN_DIVISIONParam Data)
		{
			Data.CORR_EMPRESA = GetCorrEmpresa();
			return await _service.GetLookUpAsync(Data);
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
				ErrorMessage = "No se pudo guardar la division porque su usuario no tiene una empresa asignada. Solicite que le configuren una empresa por defecto en el sistema.",
				ErrorSource = "[GEN_DIVISIONController]",
				RowsAffected = 0
			};

			return false;
		}

		private string GetUsuario()
		{
			return User.Claims.ToList().SingleOrDefault(e => e.Type == ClaimTypes.NameIdentifier).Value;
		}

		private void SetCreateAudit(GEN_DIVISIONTable Data)
		{
			Data.CORR_EMPRESA = GetCorrEmpresa();
			Data.USUARIO_CREA = GetUsuario();
			Data.ESTACION_CREA = ClientInfoHelper.GetClientStation(HttpContext);
			Data.FECHA_CREA = DateTime.Now;
			Data.USUARIO_ACTU = Data.USUARIO_CREA;
			Data.ESTACION_ACTU = Data.ESTACION_CREA;
			Data.FECHA_ACTU = Data.FECHA_CREA;
		}

		private void SetUpdateAudit(GEN_DIVISIONTable Data)
		{
			Data.CORR_EMPRESA = GetCorrEmpresa();
			Data.USUARIO_ACTU = GetUsuario();
			Data.ESTACION_ACTU = ClientInfoHelper.GetClientStation(HttpContext);
			Data.FECHA_ACTU = DateTime.Now;
		}
	}
}
