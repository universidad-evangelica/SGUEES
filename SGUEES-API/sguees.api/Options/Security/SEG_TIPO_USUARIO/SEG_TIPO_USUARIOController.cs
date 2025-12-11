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
	
	public class SEG_TIPO_USUARIOController : ControllerBase
	{
		private readonly ISEG_TIPO_USUARIOService _service;
		
		public SEG_TIPO_USUARIOController(ISEG_TIPO_USUARIOService service)
		{
			_service = service ?? throw new ArgumentNullException(nameof(_service));
		}
		
		[HttpGet("GetAll")]
		[Authorize(Policy = "/seg-tipo-usuario|R")]
		public async Task<CResult> GetAll([FromQuery] SEG_TIPO_USUARIOParam Data)
		{
			return await _service.GetAllAsync(Data);
		}
		
		[HttpGet("Get")]
		[Authorize(Policy = "/seg-tipo-usuario|R")]
		public async Task<CResult> Get([FromQuery] SEG_TIPO_USUARIOParam Data)
		{
			return await _service.GetAsync(Data);
		}
		
		[HttpPost]
		[Authorize(Policy = "/seg-tipo-usuario|C")]
		public async Task<IActionResult> Post(SEG_TIPO_USUARIOTable Data)
		{
			Data.USUARIO_CREA = User.Claims.ToList().SingleOrDefault(e => e.Type == ClaimTypes.NameIdentifier).Value;
			Data.FECHA_CREA = DateTime.Now;
			Data.ESTACION_CREA = Data.ESTACION_CREA;
			Data.USUARIO_ACTU = Data.USUARIO_CREA;
			Data.FECHA_ACTU = Data.FECHA_CREA;
			Data.ESTACION_ACTU = Data.ESTACION_CREA;
			
			var resultado = await _service.CreateAsync(Data, Data.USUARIO_CREA, Data.ESTACION_CREA);
			if (resultado.ErrorCode == 0)
			{
				return StatusCode(201, resultado);
			} else {
				return BadRequest(resultado);
			}
		}
		
		[HttpPut]
		[Authorize(Policy = "/seg-tipo-usuario|U")]
		public async Task<IActionResult> Put(SEG_TIPO_USUARIOTable Data)
		{
			Data.USUARIO_CREA = User.Claims.ToList().SingleOrDefault(e => e.Type == ClaimTypes.NameIdentifier).Value;
			Data.FECHA_CREA = DateTime.Now;
			Data.ESTACION_CREA = Data.ESTACION_CREA;
			Data.USUARIO_ACTU = Data.USUARIO_CREA;
			Data.FECHA_ACTU = Data.FECHA_CREA;
			Data.ESTACION_ACTU = Data.ESTACION_CREA;
			var resultado = await _service.UpdateAsync(Data, Data.USUARIO_ACTU, Data.ESTACION_ACTU);
			if (resultado.ErrorCode == 0)
			{
				return StatusCode(201, resultado);
			} else {
				return BadRequest(resultado);
			}
		}
		
		[HttpDelete]
		[Authorize(Policy = "/seg-tipo-usuario|D")]
		public async Task<IActionResult> Delete([FromQuery] SEG_TIPO_USUARIOTable Data)
		{
			var resultado = await _service.DeleteAsync(Data, "Admin", "e-CoffeeTech");
			if (resultado.ErrorCode == 0)
			{
				return Ok(resultado);
			} else {
				return BadRequest(resultado);
			}
		}

		[HttpGet("GetTIPO_USUARIO_SEG_USUARIO")]
		[Authorize(Policy = "/seg-usuario|R")]
		public async Task<CResult> GetTIPO_USUARIO_SEG_USUARIO([FromQuery] SEG_TIPO_USUARIOParam Data)
		{
			return await _service.GetAllAsync(Data);
		}

		#region "Detalle de opciones"
		[HttpGet("GetAllSEG_TIPO_USUARIO_OPCION")]
		[Authorize(Policy = "/seg-tipo-usuario|R")]
		public async Task<CResult> GetAllSEG_USUARIO_OPCION([FromQuery] SEG_TIPO_USUARIOParam Data)
		{
			return await _service.GetAllSEG_TIPO_USUARIO_OPCION(Data);
		}

		[HttpPut("PutSEG_TIPO_USUARIO_OPCION")]
		[Authorize(Policy = "/seg-tipo-usuario|U")]
		public async Task<IActionResult> PutSEG_USUARIO_OPCION(SEG_TIPO_USUARIO_OPCIONTable Data)
		{
			Data.USUARIO_CREA = User.Claims.ToList().SingleOrDefault(e => e.Type == ClaimTypes.NameIdentifier).Value;
			Data.FECHA_CREA = DateTime.Now;
			Data.ESTACION_CREA = Data.USUARIO_CREA;
			Data.USUARIO_ACTU = Data.USUARIO_CREA;
			Data.FECHA_ACTU = Data.FECHA_CREA;
			Data.ESTACION_ACTU = Data.USUARIO_CREA;

			var resultado = await _service.UpdateSEG_TIPO_USUARIO_OPCIONAsync(Data, Data.USUARIO_CREA, Data.ESTACION_CREA);
			if (resultado.ErrorCode == 0)
			{
				return StatusCode(201, resultado);
			}
			else
			{
				return BadRequest(resultado);
			}
		}
		#endregion

		
	}
}
