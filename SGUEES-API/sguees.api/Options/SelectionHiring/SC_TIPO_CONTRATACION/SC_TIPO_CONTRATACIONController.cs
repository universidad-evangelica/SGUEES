using sguees.api.Shared;
using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Linq;
using System.Security.Claims;
using eFramework.Core;
using  SGUEES.Models;
using  SGUEES.Services;

namespace SGUEES.Controllers
{
	[Authorize]
	[Route("[controller]")]
	[ApiController]
	
	public class SC_TIPO_CONTRATACIONController : ControllerBase
	{
		private readonly ISC_TIPO_CONTRATACIONService _service;
		
		public SC_TIPO_CONTRATACIONController(ISC_TIPO_CONTRATACIONService service)
		{
			_service = service ?? throw new ArgumentNullException(nameof(_service));
		}
		
		[HttpGet("GetAll")]
		[Authorize(Policy = "/sc-tipo-contratacion|R")]
		public async Task<CResult> GetAll([FromQuery] SC_TIPO_CONTRATACIONParam Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			return await _service.GetAllAsync(Data);
		}
		
		[HttpGet("Get")]
		[Authorize(Policy = "/sc-tipo-contratacion|R")]
		public async Task<CResult> Get([FromQuery] SC_TIPO_CONTRATACIONParam Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			return await _service.GetAsync(Data);
		}
		
		[HttpPost]
		[Authorize(Policy = "/sc-tipo-contratacion|C")]
		public async Task<IActionResult> Post(SC_TIPO_CONTRATACIONTable Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			Data.USUARIO_CREA = User.Claims.ToList().SingleOrDefault(e => e.Type == ClaimTypes.NameIdentifier).Value;
			Data.ESTACION_CREA = ClientInfoHelper.GetClientStation(HttpContext);
			Data.FECHA_CREA = DateTime.Now;
			Data.USUARIO_ACTU = Data.USUARIO_CREA;
			Data.ESTACION_ACTU = Data.ESTACION_CREA;
			Data.FECHA_ACTU = Data.FECHA_CREA;
			
			var resultado = await _service.CreateAsync(Data, Data.ESTACION_CREA, "e-CoffeeTech");
			if (resultado.ErrorCode == 0)
			{
				return StatusCode(201, resultado);
			} else {
				return BadRequest(resultado);
			}
		}
		
		[HttpPut]
		[Authorize(Policy = "/sc-tipo-contratacion|U")]
		public async Task<IActionResult> Put(SC_TIPO_CONTRATACIONTable Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			Data.USUARIO_CREA = User.Claims.ToList().SingleOrDefault(e => e.Type == ClaimTypes.NameIdentifier).Value;
			Data.ESTACION_CREA = ClientInfoHelper.GetClientStation(HttpContext);
			Data.FECHA_CREA = DateTime.Now;
			Data.USUARIO_ACTU = Data.USUARIO_CREA;
			Data.ESTACION_ACTU = Data.ESTACION_CREA;
			Data.FECHA_ACTU = Data.FECHA_CREA;
			var resultado = await _service.UpdateAsync(Data, "Admin", "e-CoffeeTech");
			if (resultado.ErrorCode == 0)
			{
				return StatusCode(201, resultado);
			} else {
				return BadRequest(resultado);
			}
		}

		[HttpDelete]
		[Authorize(Policy = "/sc-tipo-contratacion|D")]
		public async Task<IActionResult> Delete([FromQuery] SC_TIPO_CONTRATACIONTable Data)
		{
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			var resultado = await _service.DeleteAsync(Data, "Admin", "e-CoffeeTech");
			if (resultado.ErrorCode == 0)
			{
				return Ok(resultado);
			}
			else
			{
				return BadRequest(resultado);
			}
		}

		[HttpPut("Desactivate")]
        [Authorize(Policy = "/sc-tipo-contratacion|D")]
        public async Task<IActionResult> Desactivate([FromQuery] SC_TIPO_CONTRATACIONTable Data)
        {
            Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
			Data.ACTIVO = false;
			Data.USUARIO_ACTU = User.Claims.ToList().SingleOrDefault(e => e.Type == ClaimTypes.NameIdentifier).Value;
			Data.FECHA_ACTU = DateTime.Now;
			Data.ESTACION_ACTU = ClientInfoHelper.GetClientStation(HttpContext);
            var resultado = await _service.DesactivateAsync(Data, "Admin", "e-CoffeeTech");
            if (resultado.ErrorCode == 0)
            {
                return Ok(resultado);
            }
            else
            {
                return BadRequest(resultado);
            }
        }

        [HttpPut("Reactivate")]
        [Authorize(Policy = "/sc-tipo-contratacion|U")]
        public async Task<IActionResult> Reactivate([FromQuery] SC_TIPO_CONTRATACIONTable Data)
        {
            Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
            Data.ACTIVO = true;
            Data.USUARIO_ACTU = User.Claims.ToList().SingleOrDefault(e => e.Type == ClaimTypes.NameIdentifier).Value;
            Data.FECHA_ACTU = DateTime.Now;
            Data.ESTACION_ACTU = ClientInfoHelper.GetClientStation(HttpContext);
            var resultado = await _service.ReactivateAsync(Data, "Admin", "e-CoffeeTech");
            if (resultado.ErrorCode == 0)
            {
                return Ok(resultado);
            }
            else
            {
                return BadRequest(resultado);
            }
        }

    }
}
