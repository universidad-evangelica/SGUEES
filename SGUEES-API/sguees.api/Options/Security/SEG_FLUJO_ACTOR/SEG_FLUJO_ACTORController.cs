using sguees.api.Shared;
using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Linq;
using System.Security.Claims;
using eFramework.Core;
using sguees.Models;
using sguees.Services;

namespace sguees.Controllers
{
    [Authorize]
    [Route("[controller]")]
    [ApiController]
    
    public class SEG_FLUJO_ACTORController : ControllerBase
    {
        private readonly ISEG_FLUJO_ACTORService _service;
        
        public SEG_FLUJO_ACTORController(ISEG_FLUJO_ACTORService service)
        {
            _service = service ?? throw new ArgumentNullException(nameof(_service));
        }
        
        [HttpGet("GetAll")]
        [Authorize(Policy = "/seg-flujo-actor|R")]
        public async Task<CResult> GetAll([FromQuery] SEG_FLUJO_ACTORParam Data)
        {
            Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
            return await _service.GetAllAsync(Data);
        }
        
        [HttpGet("Get")]
        [Authorize(Policy = "/seg-flujo-actor|R")]
        public async Task<CResult> Get([FromQuery] SEG_FLUJO_ACTORParam Data)
        {
            Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
            return await _service.GetAsync(Data);
        }
        
        [HttpPost]
        [Authorize(Policy = "/seg-flujo-actor|C")]
        public async Task<IActionResult> Post(SEG_FLUJO_ACTORTable Data)
        {
            Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
            Data.USUARIO_CREA = User.Claims.ToList().SingleOrDefault(e => e.Type == ClaimTypes.NameIdentifier).Value;
            Data.ESTACION_CREA = ClientInfoHelper.GetClientStation(HttpContext);
            Data.FECHA_CREA = DateTime.Now;
            Data.USUARIO_ACTU = Data.USUARIO_CREA;
            Data.ESTACION_ACTU = Data.ESTACION_CREA;
            Data.FECHA_ACTU = Data.FECHA_CREA;
            
            // Asegurar que ACTIVO tenga valor
            Data.ACTIVO = true;
            
            var resultado = await _service.CreateAsync(Data, Data.ESTACION_CREA, "e-CoffeeTech");
            if (resultado.ErrorCode == 0)
            {
                return StatusCode(201, resultado);
            }
            else
            {
                return BadRequest(resultado);
            }
        }
        
        [HttpPut]
        [Authorize(Policy = "/seg-flujo-actor|U")]
        public async Task<IActionResult> Put(SEG_FLUJO_ACTORTable Data)
        {
            Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
            Data.USUARIO_ACTU = User.Claims.ToList().SingleOrDefault(e => e.Type == ClaimTypes.NameIdentifier).Value;
            Data.ESTACION_ACTU = ClientInfoHelper.GetClientStation(HttpContext);
            Data.FECHA_ACTU = DateTime.Now;
            
            var resultado = await _service.UpdateAsync(Data, "Admin", "e-CoffeeTech");
            if (resultado.ErrorCode == 0)
            {
                return StatusCode(201, resultado);
            }
            else
            {
                return BadRequest(resultado);
            }
        }
        [HttpGet("GetEmpleadosByUnidad")]
        [Authorize(Policy = "/seg-flujo-actor|R")]
        public async Task<CResult> GetEmpleadosByUnidad([FromQuery] SEG_FLUJO_ACTORParam Data)
        {
            Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
            return await _service.GetEmpleadosByUnidadAsync(Data);
        }

        

        [HttpDelete]
        [Authorize(Policy = "/seg-flujo-actor|D")]
        public async Task<IActionResult> Delete([FromQuery] SEG_FLUJO_ACTORTable Data)
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


        //Brindamos accesos a la vista de flujos de procesos para capturar los documentos mediante el lookup
        [HttpGet("GetCORR_FLUJO_ACTOR_SEG_FLUJO_PROCESO")]
        [Authorize(Policy = "/seg-flujo-proceso|R")]
        public async Task<CResult> GetCORR_FLUJO_ACTOR_SEG_FLUJO_PROCESO([FromQuery] SEG_FLUJO_ACTORParam Data)
        {
			Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
            return await _service.GetAllAsync(Data);
        }
    }
}