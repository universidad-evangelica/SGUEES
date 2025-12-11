using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Linq;
using System.Security.Claims;
using eFramework.Core;
using  sguees.Models;
using  sguees.Services;

namespace sguees.Controllers
{
	[Authorize]
	[Route("[controller]")]
	[ApiController]
	
	public class COM_PROVEEDORController : ControllerBase
	{
		private readonly ICOM_PROVEEDORService _service;
		
		public COM_PROVEEDORController(ICOM_PROVEEDORService service)
		{
			_service = service ?? throw new ArgumentNullException(nameof(_service));
		}
		
		[HttpGet("GetAll")]
		[Authorize(Policy = "/com-proveedor|R")]
		public async Task<CResult> GetAll([FromQuery] COM_PROVEEDORParam Data)
		{
			return await _service.GetAllAsync(Data);
		}
		
		[HttpGet("Get")]
		[Authorize(Policy = "/com-proveedor|R")]
		public async Task<CResult> Get([FromQuery] COM_PROVEEDORParam Data)
		{
			return await _service.GetAsync(Data);
		}

		[HttpGet("GetProveedorActu")]
		[Authorize(Policy = "/com-proveedor-actu|R")]
		public async Task<CResult> GetProveedorActu([FromQuery] COM_PROVEEDORParam Data)
		{
			Data.LOGIN_SISTEMA = User.Claims.ToList().SingleOrDefault(e => e.Type == ClaimTypes.NameIdentifier).Value;
			return await _service.GetProveedorActuAsync(Data);
		}
		
		[HttpPost]
		[Authorize(Policy = "/com-proveedor|C")]
		public async Task<IActionResult> Post(COM_PROVEEDORTable Data)
		{
			Data.USUARIO_CREA = User.Claims.ToList().SingleOrDefault(e => e.Type == ClaimTypes.NameIdentifier).Value;
			Data.FECHA_CREA = DateTime.Now;
			Data.ESTACION_CREA = Data.USUARIO_CREA;
			Data.USUARIO_ACTU = Data.USUARIO_CREA;
			Data.FECHA_ACTU = Data.FECHA_CREA;
			Data.ESTACION_ACTU = Data.ESTACION_CREA;
			
			var resultado = await _service.CreateAsync(Data, Data.ESTACION_CREA, "e-CoffeeTech");
			if (resultado.ErrorCode == 0)
			{
				return StatusCode(201, resultado);
			} else {
				return BadRequest(resultado);
			}
		}
		
		[HttpPut]
		[Authorize(Policy = "/com-proveedor|U")]
		public async Task<IActionResult> Put(COM_PROVEEDORTable Data)
		{
			Data.USUARIO_CREA = User.Claims.ToList().SingleOrDefault(e => e.Type == ClaimTypes.NameIdentifier).Value;
			Data.FECHA_CREA = DateTime.Now;
			Data.ESTACION_CREA = Data.USUARIO_CREA;
			Data.USUARIO_ACTU = Data.USUARIO_CREA;
			Data.FECHA_ACTU = Data.FECHA_CREA;
			Data.ESTACION_ACTU = Data.ESTACION_CREA;
			var resultado = await _service.UpdateAsync(Data, "Admin", "e-CoffeeTech");
			if (resultado.ErrorCode == 0)
			{
				return StatusCode(201, resultado);
			} else {
				return BadRequest(resultado);
			}
		}

		[HttpPut("PutActu")]
		[Authorize(Policy = "/com-proveedor-actu|U")]
		public async Task<IActionResult> PutActu(COM_PROVEEDORTable Data)
		{
			var UserName= User.Claims.ToList().SingleOrDefault(e => e.Type == ClaimTypes.Name).Value;
			var CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			Data.USUARIO_CREA = User.Claims.ToList().SingleOrDefault(e => e.Type == ClaimTypes.NameIdentifier).Value;
			Data.FECHA_CREA = DateTime.Now;
			Data.ESTACION_CREA = Data.USUARIO_CREA;
			Data.USUARIO_ACTU = Data.USUARIO_CREA;
			Data.FECHA_ACTU = Data.FECHA_CREA;
			Data.ESTACION_ACTU = Data.ESTACION_CREA;
			var resultado = await _service.UpdateConEnvioCorreoAsync(Data, "Admin", "e-CoffeeTech",CORR_EMPRESA,UserName);
			if (resultado.ErrorCode == 0)
			{
				return StatusCode(201, resultado);
			} else {
				return BadRequest(resultado);
			}
		}
		
		[HttpDelete]
		[Authorize(Policy = "/com-proveedor|D")]
		public async Task<IActionResult> Delete([FromQuery] COM_PROVEEDORTable Data)
		{
			var resultado = await _service.DeleteAsync(Data, "Admin", "e-CoffeeTech");
			if (resultado.ErrorCode == 0)
			{
				return Ok(resultado);
			} else {
				return BadRequest(resultado);
			}
		}

		[HttpGet("GetCORR_PROVEEDOR_COM_DOCUMENTO")]
        [Authorize(Policy = "/com-documento|R")]
        public async Task<CResult> GetCORR_PROVEEDOR_COM_DOCUMENTO([FromQuery] COM_PROVEEDORParam Data)
        {
            return await _service.GetProveedoresAsync(Data);
        }

		[HttpGet("GetCORR_PROVEEDOR_COMPRAS_COM_DOCUMENTO")]
        [Authorize(Policy = "/com-documento|R")]
        public async Task<CResult> GetCORR_PROVEEDOR_COMPRAS_COM_DOCUMENTO([FromQuery] COM_PROVEEDORParam Data)
        {
            return await _service.GetProveedoresComprasAsync(Data);
        }
	}
}
