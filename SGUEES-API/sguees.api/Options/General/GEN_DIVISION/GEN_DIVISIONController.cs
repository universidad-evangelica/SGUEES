// Qué hace: endpoints REST del catálogo divisiones.
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
	// Qué hace: expone el CRUD de divisiones y el lookup para gerencias.
	public class GEN_DIVISIONController : ControllerBase
	{
		private readonly IGEN_DIVISIONService _service;

		public GEN_DIVISIONController(IGEN_DIVISIONService service)
		{
			_service = service ?? throw new ArgumentNullException(nameof(_service));
		}

		[HttpGet("GetAll")]
		[Authorize(Policy = "/gen-division|R")]
		// Qué hace: lista las divisiones de la empresa en sesión.
		// Cómo: fija CORR_EMPRESA y llama a GetAllAsync del servicio.
		public async Task<CResult> GetAll([FromQuery] GEN_DIVISIONParam Data)
		{
			Data.CORR_EMPRESA = GetCorrEmpresa();
			return await _service.GetAllAsync(Data);
		}

		[HttpGet("Get")]
		[Authorize(Policy = "/gen-division|R")]
		// Qué hace: obtiene una división de la empresa en sesión.
		// Cómo: fija CORR_EMPRESA y llama a GetAsync del servicio.
		public async Task<CResult> Get([FromQuery] GEN_DIVISIONParam Data)
		{
			Data.CORR_EMPRESA = GetCorrEmpresa();
			return await _service.GetAsync(Data);
		}

		[HttpPost]
		[Authorize(Policy = "/gen-division|C")]
		// Qué hace: crea una división nueva.
		// Cómo: completa la auditoría de creación y llama a CreateAsync del servicio.
		public async Task<IActionResult> Post(GEN_DIVISIONTable Data)
		{
			SetCreateAudit(Data);

			var resultado = await _service.CreateAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
			return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
		}

		[HttpPut]
		[Authorize(Policy = "/gen-division|U")]
		// Qué hace: actualiza una división existente.
		// Cómo: copia la llave de la URL al cuerpo, completa la auditoría y llama a UpdateAsync del servicio.
		public async Task<IActionResult> Put(GEN_DIVISIONTable Data)
		{
			this.ApplyQueryKeys(Data, nameof(GEN_DIVISIONTable.CORR_DIVISION));
			SetUpdateAudit(Data);

			var resultado = await _service.UpdateAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
			return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
		}

		[HttpDelete]
		[Authorize(Policy = "/gen-division|D")]
		// Qué hace: elimina una división.
		// Cómo: fija CORR_EMPRESA y llama a DeleteAsync del servicio.
		public async Task<IActionResult> Delete([FromQuery] GEN_DIVISIONTable Data)
		{
			Data.CORR_EMPRESA = GetCorrEmpresa();

			var resultado = await _service.DeleteAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
			return resultado.ErrorCode == 0 ? Ok(resultado) : BadRequest(resultado);
		}

		[HttpGet("GetCORR_DIVISION_GEN_GERENCIA")]
		[Authorize(Policy = "/gen-gerencia|R")]
		// Qué hace: entrega divisiones para el lookup de gerencias.
		// Cómo: fija CORR_EMPRESA y llama a GetDivisionesAsync del servicio.
		public async Task<CResult> GetCORR_DIVISION_GEN_GERENCIA([FromQuery] GEN_DIVISIONParam Data)
		{
			Data.CORR_EMPRESA = GetCorrEmpresa();
			return await _service.GetDivisionesAsync(Data);
		}

		// Qué hace: obtiene CORR_EMPRESA del token de sesión.
		private int GetCorrEmpresa()
		{
			var claim = User.Claims.FirstOrDefault(e => e.Type == "CORR_EMPRESA");
			return claim != null && int.TryParse(claim.Value, out var corrEmpresa) ? corrEmpresa : 0;
		}

		// Qué hace: obtiene el usuario autenticado para auditoría.
		private string GetUsuario()
		{
			return User.Claims.ToList().SingleOrDefault(e => e.Type == ClaimTypes.NameIdentifier).Value;
		}

		// Qué hace: completa auditoría y empresa al crear un registro.
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

		// Qué hace: completa auditoría y empresa al actualizar un registro.
		private void SetUpdateAudit(GEN_DIVISIONTable Data)
		{
			Data.CORR_EMPRESA = GetCorrEmpresa();
			Data.USUARIO_ACTU = GetUsuario();
			Data.ESTACION_ACTU = ClientInfoHelper.GetClientStation(HttpContext);
			Data.FECHA_ACTU = DateTime.Now;
		}
	}
}
