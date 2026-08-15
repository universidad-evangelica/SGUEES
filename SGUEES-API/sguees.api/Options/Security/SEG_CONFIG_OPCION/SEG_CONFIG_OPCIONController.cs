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
	public class SEG_CONFIG_OPCIONController : ControllerBase
	{
		private readonly ISEG_CONFIG_OPCIONService _service;

		public SEG_CONFIG_OPCIONController(ISEG_CONFIG_OPCIONService service)
		{
			_service = service ?? throw new ArgumentNullException(nameof(service));
		}

		[HttpGet("GetAll")]
		[Authorize(Policy = "/seg-config-opcion|R")]
		public async Task<CResult> GetAll([FromQuery] SEG_CONFIG_OPCIONParam Data)
		{
			return await _service.GetAllAsync(Data);
		}

		[HttpGet("Get")]
		[Authorize(Policy = "/seg-config-opcion|R")]
		public async Task<CResult> Get([FromQuery] SEG_CONFIG_OPCIONParam Data)
		{
			return await _service.GetAsync(Data);
		}

		[HttpPost]
		[Authorize(Policy = "/seg-config-opcion|C")]
		public async Task<IActionResult> Post(SEG_CONFIG_OPCIONTable Data)
		{
			SetCreateAudit(Data);

			var resultado = await _service.CreateAsync(Data, Data.USUARIO_CREA, Data.ESTACION_CREA);
			return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
		}

		[HttpPut]
		[Authorize(Policy = "/seg-config-opcion|U")]
		public async Task<IActionResult> Put(SEG_CONFIG_OPCIONTable Data)
		{
			this.ApplyQueryKeys(
				Data,
				nameof(SEG_CONFIG_OPCIONTable.CODIGO_SISTEMA),
				nameof(SEG_CONFIG_OPCIONTable.CODIGO_MENU),
				nameof(SEG_CONFIG_OPCIONTable.CODIGO_OPCION));
			SetUpdateAudit(Data);

			var resultado = await _service.UpdateAsync(Data, Data.USUARIO_ACTU, Data.ESTACION_ACTU);
			return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
		}

		[HttpDelete]
		[Authorize(Policy = "/seg-config-opcion|D")]
		public async Task<IActionResult> Delete([FromQuery] SEG_CONFIG_OPCIONTable Data)
		{
			var resultado = await _service.DeleteAsync(Data, "", "");
			return resultado.ErrorCode == 0 ? Ok(resultado) : BadRequest(resultado);
		}

		private string GetUsuario()
		{
			return User.Claims.ToList().SingleOrDefault(e => e.Type == ClaimTypes.NameIdentifier).Value;
		}

		private void SetCreateAudit(SEG_CONFIG_OPCIONTable Data)
		{
			Data.USUARIO_CREA = GetUsuario();
			Data.ESTACION_CREA = ClientInfoHelper.GetClientStation(HttpContext);
			Data.FECHA_CREA = DateTime.Now;
			Data.USUARIO_ACTU = Data.USUARIO_CREA;
			Data.ESTACION_ACTU = Data.ESTACION_CREA;
			Data.FECHA_ACTU = Data.FECHA_CREA;
		}

		private void SetUpdateAudit(SEG_CONFIG_OPCIONTable Data)
		{
			Data.USUARIO_ACTU = GetUsuario();
			Data.ESTACION_ACTU = ClientInfoHelper.GetClientStation(HttpContext);
			Data.FECHA_ACTU = DateTime.Now;
		}
	}
}
