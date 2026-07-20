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
	// Qué hace: expone el CRUD de países y lookups para otras vistas.
	public class GEN_PAISController : ControllerBase
	{
		private readonly IGEN_PAISService _service;

		// Qué hace: inyecta el servicio; falla si no está registrado.
		public GEN_PAISController(IGEN_PAISService service)
		{
			_service = service ?? throw new ArgumentNullException(nameof(service));
		}

		[HttpGet("GetAll")]
		[Authorize(Policy = "/gen-estructura-territorial|R")]
		// Qué hace: lista países y la limita a la empresa de la sesión.
		// Cómo: llama a GetAllAsync del servicio.
		public async Task<CResult> GetAll([FromQuery] GEN_PAISParam data)
		{
			return await _service.GetAllAsync(data);
		}

		[HttpGet("Get")]
		[Authorize(Policy = "/gen-estructura-territorial|R")]
		// Qué hace: obtiene país específico dentro de la empresa de la sesión.
		// Cómo: llama a GetAsync del servicio.
		public async Task<CResult> Get([FromQuery] GEN_PAISParam data)
		{
			return await _service.GetAsync(data);
		}

		[HttpGet("GetCORR_PAIS_GEN_EMPRESA")]
		[Authorize(Policy = "/gen-empresa|R")]
		// Qué hace: entrega el catálogo de países requerido por el mantenimiento relacionado y aplica el contexto de empresa.
		// Cómo: llama a GetAllAsync del servicio.
		public async Task<CResult> GetCORR_PAIS_GEN_EMPRESA([FromQuery] GEN_PAISParam data)
		{
			return await _service.GetAllAsync(data);
		}

		[HttpGet("GetCORR_PAIS_GEN_ESTRUCTURA_TERRITORIAL")]
		[Authorize(Policy = "/gen-estructura-territorial|R")]
		// Qué hace: entrega el catálogo de países requerido por el mantenimiento relacionado y aplica el contexto de empresa.
		// Cómo: llama a GetAllAsync del servicio.
		public async Task<CResult> GetCORR_PAIS_GEN_ESTRUCTURA_TERRITORIAL([FromQuery] GEN_PAISParam data)
		{
			return await _service.GetAllAsync(data);
		}

		[HttpGet("GetCODIGO_PAIS_COM_PROVEEDOR")]
		[Authorize(Policy = "/com-proveedor|R")]
		// Qué hace: entrega el catálogo de países requerido por el mantenimiento relacionado y aplica el contexto de empresa.
		// Cómo: llama a GetAllAsync del servicio.
		public async Task<CResult> GetCODIGO_PAIS_COM_PROVEEDOR([FromQuery] GEN_PAISParam data)
		{
			return await _service.GetAllAsync(data);
		}

		[HttpPost]
		[Authorize(Policy = "/gen-estructura-territorial|C")]
		// Qué hace: crea país
		// Cómo: valida empresa, SetCreateAudit y CreateAsync del servicio.
		public async Task<IActionResult> Post(GEN_PAISTable data)
		{
			if (!ValidateEmpresaSesion(out var resultadoEmpresa))
			{
				return BadRequest(resultadoEmpresa);
			}

			SetCreateAudit(data);
			var resultado = await _service.CreateAsync(data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
			return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
		}

		[HttpPut]
		[Authorize(Policy = "/gen-estructura-territorial|U")]
		// Qué hace: actualiza país
		// Cómo: ApplyQueryKeys/SetUpdateAudit y UpdateAsync del servicio.
		public async Task<IActionResult> Put(GEN_PAISTable data)
		{
			if (!ValidateEmpresaSesion(out var resultadoEmpresa))
			{
				return BadRequest(resultadoEmpresa);
			}

			this.ApplyQueryKeys(data, nameof(GEN_PAISTable.CORR_PAIS));
			SetUpdateAudit(data);

			var resultado = await _service.UpdateAsync(data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
			return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
		}

		[HttpDelete]
		[Authorize(Policy = "/gen-estructura-territorial|D")]
		// Qué hace: elimina país indicada por sus claves.
		// Cómo: ValidateEmpresaSesion y DeleteAsync del servicio.
		public async Task<IActionResult> Delete([FromQuery] GEN_PAISTable data)
		{
			if (!ValidateEmpresaSesion(out var resultadoEmpresa))
			{
				return BadRequest(resultadoEmpresa);
			}

			var resultado = await _service.DeleteAsync(data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
			return resultado.ErrorCode == 0 ? Ok(resultado) : BadRequest(resultado);
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

		// Qué hace: verifica que la sesión tenga una empresa válida antes de guardar.
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
					"No se pudo guardar el país porque su usuario no tiene una empresa asignada. Solicite que le configuren una empresa por defecto en el sistema.",
				ErrorSource = "[GEN_PAISController]",
				RowsAffected = 0
			};

			return false;
		}

		// Qué hace: completa auditoría al crear un registro.
		private void SetCreateAudit(GEN_PAISTable data)
		{
			data.USUARIO_CREA = GetUsuario();
			data.ESTACION_CREA = ClientInfoHelper.GetClientStation(HttpContext);
			data.FECHA_CREA = DateTime.Now;
			data.USUARIO_ACTU = data.USUARIO_CREA;
			data.ESTACION_ACTU = data.ESTACION_CREA;
			data.FECHA_ACTU = data.FECHA_CREA;
		}

		// Qué hace: completa auditoría al actualizar un registro.
		private void SetUpdateAudit(GEN_PAISTable data)
		{
			data.USUARIO_ACTU = GetUsuario();
			data.ESTACION_ACTU = ClientInfoHelper.GetClientStation(HttpContext);
			data.FECHA_ACTU = DateTime.Now;
		}
	}
}
