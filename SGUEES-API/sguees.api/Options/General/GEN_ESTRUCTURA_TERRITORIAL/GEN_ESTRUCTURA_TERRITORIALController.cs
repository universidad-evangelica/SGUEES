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
	[Route("[controller]")]
	[ApiController]
	public class GEN_ESTRUCTURA_TERRITORIALController : ControllerBase
	{
		private readonly IGEN_ESTRUCTURA_TERRITORIALService _service;

		public GEN_ESTRUCTURA_TERRITORIALController(IGEN_ESTRUCTURA_TERRITORIALService service)
		{
			_service = service ?? throw new ArgumentNullException(nameof(service));
		}

		[HttpGet("GetAllPaises")]
		[Authorize(Policy = "/gen-estructura-territorial|R")]
		public async Task<CResult> GetAllPaises([FromQuery] GEN_ESTRUCTURA_TERRITORIAL_PAISParam data)
		{
			data.CORR_EMPRESA = GetCorrEmpresa();
			return await _service.GetAllPaisesAsync(data);
		}

		[HttpGet("GetPais")]
		[Authorize(Policy = "/gen-estructura-territorial|R")]
		public async Task<CResult> GetPais([FromQuery] GEN_ESTRUCTURA_TERRITORIAL_PAISParam data)
		{
			data.CORR_EMPRESA = GetCorrEmpresa();
			return await _service.GetPaisAsync(data);
		}

		[HttpPost("Pais")]
		[Authorize(Policy = "/gen-estructura-territorial|C")]
		public async Task<IActionResult> PostPais(GEN_ESTRUCTURA_TERRITORIAL_PAISTable data)
		{
			if (!ValidateEmpresaSesion(out var resultadoEmpresa))
			{
				return BadRequest(resultadoEmpresa);
			}

			SetCreateAudit(data);
			var resultado = await _service.CreatePaisAsync(data, data.ESTACION_CREA, "e-CoffeeTech");
			return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
		}

		[HttpPut("Pais")]
		[Authorize(Policy = "/gen-estructura-territorial|U")]
		public async Task<IActionResult> PutPais([FromBody] GEN_ESTRUCTURA_TERRITORIAL_PAISTable data)
		{
			if (data == null)
			{
				return BadRequest(new CResult
				{
					Result = false,
					ErrorCode = -1,
					ErrorMessage = "No se recibieron datos del país.",
					ErrorSource = "[GEN_ESTRUCTURA_TERRITORIALController]",
				});
			}

			if (!ValidateEmpresaSesion(out var resultadoEmpresa))
			{
				return BadRequest(resultadoEmpresa);
			}

			SetUpdateAudit(data);
			var resultado = await _service.UpdatePaisAsync(data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
			return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
		}

		[HttpDelete("Pais")]
		[Authorize(Policy = "/gen-estructura-territorial|D")]
		public async Task<IActionResult> DeletePais([FromQuery] GEN_ESTRUCTURA_TERRITORIAL_PAISTable data)
		{
			if (!ValidateEmpresaSesion(out var resultadoEmpresa))
			{
				return BadRequest(resultadoEmpresa);
			}

			var resultado = await _service.DeletePaisAsync(data, "Admin", "e-CoffeeTech");
			return resultado.ErrorCode == 0 ? Ok(resultado) : BadRequest(resultado);
		}

		[HttpGet("GetAllDeptos")]
		[Authorize(Policy = "/gen-estructura-territorial|R")]
		public async Task<CResult> GetAllDeptos([FromQuery] GEN_ESTRUCTURA_TERRITORIAL_DEPTOParam data)
		{
			data.CORR_EMPRESA = GetCorrEmpresa();
			return await _service.GetAllDeptosAsync(data);
		}

		[HttpGet("GetDepto")]
		[Authorize(Policy = "/gen-estructura-territorial|R")]
		public async Task<CResult> GetDepto([FromQuery] GEN_ESTRUCTURA_TERRITORIAL_DEPTOParam data)
		{
			data.CORR_EMPRESA = GetCorrEmpresa();
			return await _service.GetDeptoAsync(data);
		}

		[HttpPost("Depto")]
		[Authorize(Policy = "/gen-estructura-territorial|C")]
		public async Task<IActionResult> PostDepto(GEN_ESTRUCTURA_TERRITORIAL_DEPTOTable data)
		{
			if (!ValidateEmpresaSesion(out var resultadoEmpresa))
			{
				return BadRequest(resultadoEmpresa);
			}

			SetCreateAudit(data);
			var resultado = await _service.CreateDeptoAsync(data, data.ESTACION_CREA, "e-CoffeeTech");
			return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
		}

		[HttpPut("Depto")]
		[Authorize(Policy = "/gen-estructura-territorial|U")]
		public async Task<IActionResult> PutDepto(GEN_ESTRUCTURA_TERRITORIAL_DEPTOTable data)
		{
			if (!ValidateEmpresaSesion(out var resultadoEmpresa))
			{
				return BadRequest(resultadoEmpresa);
			}

			SetUpdateAudit(data);
			var resultado = await _service.UpdateDeptoAsync(data, "Admin", "e-CoffeeTech");
			return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
		}

		[HttpDelete("Depto")]
		[Authorize(Policy = "/gen-estructura-territorial|D")]
		public async Task<IActionResult> DeleteDepto([FromQuery] GEN_ESTRUCTURA_TERRITORIAL_DEPTOTable data)
		{
			if (!ValidateEmpresaSesion(out var resultadoEmpresa))
			{
				return BadRequest(resultadoEmpresa);
			}

			var resultado = await _service.DeleteDeptoAsync(data, "Admin", "e-CoffeeTech");
			return resultado.ErrorCode == 0 ? Ok(resultado) : BadRequest(resultado);
		}

		[HttpGet("GetAllMunicipios")]
		[Authorize(Policy = "/gen-estructura-territorial|R")]
		public async Task<CResult> GetAllMunicipios([FromQuery] GEN_ESTRUCTURA_TERRITORIAL_MUNICIPIOParam data)
		{
			data.CORR_EMPRESA = GetCorrEmpresa();
			return await _service.GetAllMunicipiosAsync(data);
		}

		[HttpGet("GetMunicipio")]
		[Authorize(Policy = "/gen-estructura-territorial|R")]
		public async Task<CResult> GetMunicipio([FromQuery] GEN_ESTRUCTURA_TERRITORIAL_MUNICIPIOParam data)
		{
			data.CORR_EMPRESA = GetCorrEmpresa();
			return await _service.GetMunicipioAsync(data);
		}

		[HttpPost("Municipio")]
		[Authorize(Policy = "/gen-estructura-territorial|C")]
		public async Task<IActionResult> PostMunicipio(GEN_ESTRUCTURA_TERRITORIAL_MUNICIPIOTable data)
		{
			if (!ValidateEmpresaSesion(out var resultadoEmpresa))
			{
				return BadRequest(resultadoEmpresa);
			}

			SetCreateAudit(data);
			var resultado = await _service.CreateMunicipioAsync(data, data.ESTACION_CREA, "e-CoffeeTech");
			return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
		}

		[HttpPut("Municipio")]
		[Authorize(Policy = "/gen-estructura-territorial|U")]
		public async Task<IActionResult> PutMunicipio(GEN_ESTRUCTURA_TERRITORIAL_MUNICIPIOTable data)
		{
			if (!ValidateEmpresaSesion(out var resultadoEmpresa))
			{
				return BadRequest(resultadoEmpresa);
			}

			SetUpdateAudit(data);
			var resultado = await _service.UpdateMunicipioAsync(data, "Admin", "e-CoffeeTech");
			return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
		}

		[HttpDelete("Municipio")]
		[Authorize(Policy = "/gen-estructura-territorial|D")]
		public async Task<IActionResult> DeleteMunicipio([FromQuery] GEN_ESTRUCTURA_TERRITORIAL_MUNICIPIOTable data)
		{
			if (!ValidateEmpresaSesion(out var resultadoEmpresa))
			{
				return BadRequest(resultadoEmpresa);
			}

			var resultado = await _service.DeleteMunicipioAsync(data, "Admin", "e-CoffeeTech");
			return resultado.ErrorCode == 0 ? Ok(resultado) : BadRequest(resultado);
		}

		[HttpGet("GetAllDistritos")]
		[Authorize(Policy = "/gen-estructura-territorial|R")]
		public async Task<CResult> GetAllDistritos([FromQuery] GEN_ESTRUCTURA_TERRITORIAL_DISTRITOParam data)
		{
			data.CORR_EMPRESA = GetCorrEmpresa();
			return await _service.GetAllDistritosAsync(data);
		}

		[HttpGet("GetDistrito")]
		[Authorize(Policy = "/gen-estructura-territorial|R")]
		public async Task<CResult> GetDistrito([FromQuery] GEN_ESTRUCTURA_TERRITORIAL_DISTRITOParam data)
		{
			data.CORR_EMPRESA = GetCorrEmpresa();
			return await _service.GetDistritoAsync(data);
		}

		[HttpPost("Distrito")]
		[Authorize(Policy = "/gen-estructura-territorial|C")]
		public async Task<IActionResult> PostDistrito(GEN_ESTRUCTURA_TERRITORIAL_DISTRITOTable data)
		{
			if (!ValidateEmpresaSesion(out var resultadoEmpresa))
			{
				return BadRequest(resultadoEmpresa);
			}

			SetCreateAudit(data);
			var resultado = await _service.CreateDistritoAsync(data, data.ESTACION_CREA, "e-CoffeeTech");
			return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
		}

		[HttpPut("Distrito")]
		[Authorize(Policy = "/gen-estructura-territorial|U")]
		public async Task<IActionResult> PutDistrito(GEN_ESTRUCTURA_TERRITORIAL_DISTRITOTable data)
		{
			if (!ValidateEmpresaSesion(out var resultadoEmpresa))
			{
				return BadRequest(resultadoEmpresa);
			}

			SetUpdateAudit(data);
			var resultado = await _service.UpdateDistritoAsync(data, "Admin", "e-CoffeeTech");
			return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
		}

		[HttpDelete("Distrito")]
		[Authorize(Policy = "/gen-estructura-territorial|D")]
		public async Task<IActionResult> DeleteDistrito([FromQuery] GEN_ESTRUCTURA_TERRITORIAL_DISTRITOTable data)
		{
			if (!ValidateEmpresaSesion(out var resultadoEmpresa))
			{
				return BadRequest(resultadoEmpresa);
			}

			var resultado = await _service.DeleteDistritoAsync(data, "Admin", "e-CoffeeTech");
			return resultado.ErrorCode == 0 ? Ok(resultado) : BadRequest(resultado);
		}

		private int GetCorrEmpresa()
		{
			var claim = User.Claims.FirstOrDefault(e => e.Type == "CORR_EMPRESA");
			return claim != null && int.TryParse(claim.Value, out var corrEmpresa) ? corrEmpresa : 0;
		}

		private string GetUsuario()
		{
			return User.Claims.FirstOrDefault(e => e.Type == ClaimTypes.NameIdentifier)?.Value
				?? User.Identity?.Name
				?? "Sistema";
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
				ErrorMessage =
					"No se pudo guardar la estructura territorial porque su usuario no tiene una empresa asignada. Solicite que le configuren una empresa por defecto en el sistema.",
				ErrorSource = "[GEN_ESTRUCTURA_TERRITORIALController]",
				RowsAffected = 0
			};

			return false;
		}

		private void SetCreateAudit(GEN_ESTRUCTURA_TERRITORIAL_PAISTable data)
		{
			data.USUARIO_CREA = GetUsuario();
			data.ESTACION_CREA = ClientInfoHelper.GetClientStation(HttpContext);
			data.FECHA_CREA = DateTime.Now;
			data.USUARIO_ACTU = data.USUARIO_CREA;
			data.ESTACION_ACTU = data.ESTACION_CREA;
			data.FECHA_ACTU = data.FECHA_CREA;
		}

		private void SetUpdateAudit(GEN_ESTRUCTURA_TERRITORIAL_PAISTable data)
		{
			data.USUARIO_ACTU = GetUsuario();
			data.ESTACION_ACTU = ClientInfoHelper.GetClientStation(HttpContext);
			data.FECHA_ACTU = DateTime.Now;
		}

		private void SetCreateAudit(GEN_ESTRUCTURA_TERRITORIAL_DEPTOTable data)
		{
			data.USUARIO_CREA = GetUsuario();
			data.ESTACION_CREA = ClientInfoHelper.GetClientStation(HttpContext);
			data.FECHA_CREA = DateTime.Now;
			data.USUARIO_ACTU = data.USUARIO_CREA;
			data.ESTACION_ACTU = data.ESTACION_CREA;
			data.FECHA_ACTU = data.FECHA_CREA;
		}

		private void SetUpdateAudit(GEN_ESTRUCTURA_TERRITORIAL_DEPTOTable data)
		{
			data.USUARIO_ACTU = GetUsuario();
			data.ESTACION_ACTU = ClientInfoHelper.GetClientStation(HttpContext);
			data.FECHA_ACTU = DateTime.Now;
		}

		private void SetCreateAudit(GEN_ESTRUCTURA_TERRITORIAL_MUNICIPIOTable data)
		{
			data.USUARIO_CREA = GetUsuario();
			data.ESTACION_CREA = ClientInfoHelper.GetClientStation(HttpContext);
			data.FECHA_CREA = DateTime.Now;
			data.USUARIO_ACTU = data.USUARIO_CREA;
			data.ESTACION_ACTU = data.ESTACION_CREA;
			data.FECHA_ACTU = data.FECHA_CREA;
		}

		private void SetUpdateAudit(GEN_ESTRUCTURA_TERRITORIAL_MUNICIPIOTable data)
		{
			data.USUARIO_ACTU = GetUsuario();
			data.ESTACION_ACTU = ClientInfoHelper.GetClientStation(HttpContext);
			data.FECHA_ACTU = DateTime.Now;
		}

		private void SetCreateAudit(GEN_ESTRUCTURA_TERRITORIAL_DISTRITOTable data)
		{
			data.USUARIO_CREA = GetUsuario();
			data.ESTACION_CREA = ClientInfoHelper.GetClientStation(HttpContext);
			data.FECHA_CREA = DateTime.Now;
			data.USUARIO_ACTU = data.USUARIO_CREA;
			data.ESTACION_ACTU = data.ESTACION_CREA;
			data.FECHA_ACTU = data.FECHA_CREA;
		}

		private void SetUpdateAudit(GEN_ESTRUCTURA_TERRITORIAL_DISTRITOTable data)
		{
			data.USUARIO_ACTU = GetUsuario();
			data.ESTACION_ACTU = ClientInfoHelper.GetClientStation(HttpContext);
			data.FECHA_ACTU = DateTime.Now;
		}
	}
}
