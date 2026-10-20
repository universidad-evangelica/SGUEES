// Qué hace: endpoints REST del catálogo tipo contacto.
// Cómo lo hace: CRUD + ActivarInactivar con auditoría por claims (sin empresa).
using System;
using System.Collections.Generic;
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
	public class GEN_TIPO_CONTACTOController : ControllerBase
	{
		private readonly IGEN_TIPO_CONTACTOService _service;

		public GEN_TIPO_CONTACTOController(IGEN_TIPO_CONTACTOService service)
		{
			_service = service ?? throw new ArgumentNullException(nameof(service));
		}

		[HttpGet("GetAll")]
		[Authorize(Policy = "/gen-tipo-contacto|R")]
		public async Task<CResult> GetAll([FromQuery] GEN_TIPO_CONTACTOParam Data)
		{
			return await _service.GetAllAsync(Data);
		}

		// Qué hace: lookup de tipos de contacto activos para el tab Contactos de gen-empleado.
		// Cómo: reutiliza GetAll y deja solo ACTIVO_TIPO_CONTACTO.
		[HttpGet("GetCORR_TIPO_CONTACTO_GEN_EMPLEADO")]
		[Authorize(Policy = "/gen-empleado|R")]
		public async Task<CResult> GetCORR_TIPO_CONTACTO_GEN_EMPLEADO()
		{
			var resultado = await _service.GetAllAsync(new GEN_TIPO_CONTACTOParam());
			if (resultado?.Data is IEnumerable<GEN_TIPO_CONTACTOView> rows)
			{
				var activos = rows.Where(x => x.ACTIVO_TIPO_CONTACTO != false).ToList();
				resultado.Data = activos;
				resultado.RowsAffected = activos.Count;
			}
			return resultado;
		}

		[HttpGet("Get")]
		[Authorize(Policy = "/gen-tipo-contacto|R")]
		public async Task<CResult> Get([FromQuery] GEN_TIPO_CONTACTOParam Data)
		{
			return await _service.GetAsync(Data);
		}

		[HttpPost]
		[Authorize(Policy = "/gen-tipo-contacto|C")]
		public async Task<IActionResult> Post(GEN_TIPO_CONTACTOTable Data)
		{
			SetCreateAudit(Data);
			var resultado = await _service.CreateAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
			return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
		}

		[HttpPut]
		[Authorize(Policy = "/gen-tipo-contacto|U")]
		public async Task<IActionResult> Put(GEN_TIPO_CONTACTOTable Data)
		{
			this.ApplyQueryKeys(Data, nameof(GEN_TIPO_CONTACTOTable.CORR_TIPO_CONTACTO));
			SetUpdateAudit(Data);
			var resultado = await _service.UpdateAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
			return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
		}

		[HttpDelete]
		[Authorize(Policy = "/gen-tipo-contacto|D")]
		public async Task<IActionResult> Delete([FromQuery] GEN_TIPO_CONTACTOTable Data)
		{
			var resultado = await _service.DeleteAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
			return resultado.ErrorCode == 0 ? Ok(resultado) : BadRequest(resultado);
		}

		[HttpPut("ActivarInactivar")]
		[Authorize(Policy = "/gen-tipo-contacto|U")]
		public async Task<IActionResult> ActivarInactivar(GEN_TIPO_CONTACTOTable Data)
		{
			this.ApplyQueryKeys(Data, nameof(GEN_TIPO_CONTACTOTable.CORR_TIPO_CONTACTO));
			var resultado = await _service.ActivarInactivarAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
			return resultado.ErrorCode == 0 ? Ok(resultado) : BadRequest(resultado);
		}

		private string GetUsuario()
		{
			return User.Claims.ToList().SingleOrDefault(e => e.Type == ClaimTypes.NameIdentifier)?.Value ?? string.Empty;
		}

		private void SetCreateAudit(GEN_TIPO_CONTACTOTable Data)
		{
			Data.USUARIO_CREA = GetUsuario();
			Data.ESTACION_CREA = ClientInfoHelper.GetClientStation(HttpContext);
			Data.FECHA_CREA = DateTime.Now;
			Data.USUARIO_ACTU = Data.USUARIO_CREA;
			Data.ESTACION_ACTU = Data.ESTACION_CREA;
			Data.FECHA_ACTU = Data.FECHA_CREA;
			Data.ACTIVO_TIPO_CONTACTO ??= true;
			Data.ACTIVO_CARACTERES ??= false;
			Data.NUMERO_CARACTERES ??= 0;
		}

		private void SetUpdateAudit(GEN_TIPO_CONTACTOTable Data)
		{
			Data.USUARIO_ACTU = GetUsuario();
			Data.ESTACION_ACTU = ClientInfoHelper.GetClientStation(HttpContext);
			Data.FECHA_ACTU = DateTime.Now;
			if (!Data.ACTIVO_TIPO_CONTACTO.HasValue)
			{
				Data.ACTIVO_TIPO_CONTACTO = true;
			}
			if (!Data.ACTIVO_CARACTERES.HasValue)
			{
				Data.ACTIVO_CARACTERES = false;
			}
			if (!Data.NUMERO_CARACTERES.HasValue)
			{
				Data.NUMERO_CARACTERES = 0;
			}
		}
	}
}

