// Qué hace: endpoints REST del catálogo tipos de institución.
// Cómo lo hace: CRUD + ActivarInactivar con auditoría por claims (sin empresa).
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
	public class GEN_TIPO_INSTITUCIONController : ControllerBase
	{
		private readonly IGEN_TIPO_INSTITUCIONService _service;

		public GEN_TIPO_INSTITUCIONController(IGEN_TIPO_INSTITUCIONService service)
		{
			_service = service ?? throw new ArgumentNullException(nameof(service));
		}

		[HttpGet("GetAll")]
		[Authorize(Policy = "/gen-tipo-institucion|R")]
		public async Task<CResult> GetAll([FromQuery] GEN_TIPO_INSTITUCIONParam Data)
			=> await _service.GetAllAsync(Data);

		[HttpGet("Get")]
		[Authorize(Policy = "/gen-tipo-institucion|R")]
		public async Task<CResult> Get([FromQuery] GEN_TIPO_INSTITUCIONParam Data)
			=> await _service.GetAsync(Data);

		[HttpPost]
		[Authorize(Policy = "/gen-tipo-institucion|C")]
		public async Task<IActionResult> Post(GEN_TIPO_INSTITUCIONTable Data)
		{
			SetCreateAudit(Data);
			var resultado = await _service.CreateAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
			return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
		}

		[HttpPut]
		[Authorize(Policy = "/gen-tipo-institucion|U")]
		public async Task<IActionResult> Put(GEN_TIPO_INSTITUCIONTable Data)
		{
			this.ApplyQueryKeys(Data, nameof(GEN_TIPO_INSTITUCIONTable.CORR_TIPO_INSTITUCION));
			SetUpdateAudit(Data);
			var resultado = await _service.UpdateAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
			return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
		}

		[HttpDelete]
		[Authorize(Policy = "/gen-tipo-institucion|D")]
		public async Task<IActionResult> Delete([FromQuery] GEN_TIPO_INSTITUCIONTable Data)
		{
			var resultado = await _service.DeleteAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
			return resultado.ErrorCode == 0 ? Ok(resultado) : BadRequest(resultado);
		}

		[HttpPut("ActivarInactivar")]
		[Authorize(Policy = "/gen-tipo-institucion|U")]
		public async Task<IActionResult> ActivarInactivar(GEN_TIPO_INSTITUCIONTable Data)
		{
			this.ApplyQueryKeys(Data, nameof(GEN_TIPO_INSTITUCIONTable.CORR_TIPO_INSTITUCION));
			var resultado = await _service.ActivarInactivarAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
			return resultado.ErrorCode == 0 ? Ok(resultado) : BadRequest(resultado);
		}

		private string GetUsuario()
			=> User.Claims.ToList().SingleOrDefault(e => e.Type == ClaimTypes.NameIdentifier)?.Value ?? string.Empty;

		private void SetCreateAudit(GEN_TIPO_INSTITUCIONTable Data)
		{
			Data.USUARIO_CREA = GetUsuario();
			Data.ESTACION_CREA = ClientInfoHelper.GetClientStation(HttpContext);
			Data.FECHA_CREA = DateTime.Now;
			Data.USUARIO_ACTU = Data.USUARIO_CREA;
			Data.ESTACION_ACTU = Data.ESTACION_CREA;
			Data.FECHA_ACTU = Data.FECHA_CREA;
			Data.ACTIVO ??= true;
		}

		private void SetUpdateAudit(GEN_TIPO_INSTITUCIONTable Data)
		{
			Data.USUARIO_ACTU = GetUsuario();
			Data.ESTACION_ACTU = ClientInfoHelper.GetClientStation(HttpContext);
			Data.FECHA_ACTU = DateTime.Now;
		}
	}
}
