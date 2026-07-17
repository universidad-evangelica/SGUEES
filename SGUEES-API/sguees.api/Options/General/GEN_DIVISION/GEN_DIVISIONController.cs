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
		// Atiende la consulta del listado de divisiones y la limita a la empresa de la sesión.
		public async Task<CResult> GetAll([FromQuery] GEN_DIVISIONParam Data)
		{
			Data.CORR_EMPRESA = GetCorrEmpresa();
			return await _service.GetAllAsync(Data);
		}

		[HttpGet("Get")]
		[Authorize(Policy = "/gen-division|R")]
		// Atiende la consulta de una división específica dentro de la empresa de la sesión.
		public async Task<CResult> Get([FromQuery] GEN_DIVISIONParam Data)
		{
			Data.CORR_EMPRESA = GetCorrEmpresa();
			return await _service.GetAsync(Data);
		}

		[HttpPost]
		[Authorize(Policy = "/gen-division|C")]
		// Prepara auditoría, crea la división y traduce el resultado al estado HTTP correspondiente.
		public async Task<IActionResult> Post(GEN_DIVISIONTable Data)
		{
			SetCreateAudit(Data);

			var resultado = await _service.CreateAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
			return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
		}

		[HttpPut]
		[Authorize(Policy = "/gen-division|U")]
		// Aplica las claves de la solicitud, prepara auditoría y actualiza la división.
		public async Task<IActionResult> Put(GEN_DIVISIONTable Data)
		{
			this.ApplyQueryKeys(Data, nameof(GEN_DIVISIONTable.CORR_DIVISION));
			SetUpdateAudit(Data);

			var resultado = await _service.UpdateAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
			return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
		}

		[HttpDelete]
		[Authorize(Policy = "/gen-division|D")]
		// Valida el contexto de empresa y elimina la división indicada por sus claves.
		public async Task<IActionResult> Delete([FromQuery] GEN_DIVISIONTable Data)
		{
			Data.CORR_EMPRESA = GetCorrEmpresa();

			var resultado = await _service.DeleteAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
			return resultado.ErrorCode == 0 ? Ok(resultado) : BadRequest(resultado);
		}

		[HttpGet("GetCORR_DIVISION_GEN_GERENCIA")]
		[Authorize(Policy = "/gen-gerencia|R")]
		// Expone el catálogo de divisiones requerido por el mantenimiento relacionado y aplica el contexto de empresa.
		public async Task<CResult> GetCORR_DIVISION_GEN_GERENCIA([FromQuery] GEN_DIVISIONParam Data)
		{
			Data.CORR_EMPRESA = GetCorrEmpresa();
			return await _service.GetDivisionesAsync(Data);
		}

		// Obtiene la empresa asociada a la sesión para aislar las operaciones del usuario.
		private int GetCorrEmpresa()
		{
			var claim = User.Claims.FirstOrDefault(e => e.Type == "CORR_EMPRESA");
			return claim != null && int.TryParse(claim.Value, out var corrEmpresa) ? corrEmpresa : 0;
		}

		// Obtiene el identificador del usuario autenticado para registrar la auditoría.
		private string GetUsuario()
		{
			return User.Claims.ToList().SingleOrDefault(e => e.Type == ClaimTypes.NameIdentifier).Value;
		}

		// Completa la empresa y los datos de auditoría requeridos para crear el registro.
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

		// Completa la empresa y los datos de auditoría requeridos para actualizar el registro.
		private void SetUpdateAudit(GEN_DIVISIONTable Data)
		{
			Data.CORR_EMPRESA = GetCorrEmpresa();
			Data.USUARIO_ACTU = GetUsuario();
			Data.ESTACION_ACTU = ClientInfoHelper.GetClientStation(HttpContext);
			Data.FECHA_ACTU = DateTime.Now;
		}
	}
}
