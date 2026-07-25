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
    
    public class SEG_FLUJO_ESTADOController : ControllerBase
    {
        private readonly ISEG_FLUJO_ESTADOService _service;
        
        public SEG_FLUJO_ESTADOController(ISEG_FLUJO_ESTADOService service)
        {
            _service = service ?? throw new ArgumentNullException(nameof(_service));
        }
        
        [HttpGet("GetAll")]
        [Authorize(Policy = "/seg-flujo-tipo-documento|R")]
        public async Task<CResult> GetAll([FromQuery] SEG_FLUJO_ESTADOParam Data)
        {
            Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
            return await _service.GetAllAsync(Data);
        }
        
        [HttpGet("Get")]
        [Authorize(Policy = "/seg-flujo-tipo-documento|R")]
        public async Task<CResult> Get([FromQuery] SEG_FLUJO_ESTADOParam Data)
        {
            Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
            return await _service.GetAsync(Data);
        }

        [HttpGet("GetByTipoDocumento")]
        [Authorize(Policy = "/seg-flujo-tipo-documento|R")]
        public async Task<CResult> GetByTipoDocumento([FromQuery] SEG_FLUJO_ESTADOParam Data)
        {
            Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
            return await _service.GetByTipoDocumentoAsync(Data.CORR_EMPRESA, Data.CORR_TIPO_DOCUMENTO);
        }
        
        [HttpPost]
        [Authorize(Policy = "/seg-flujo-tipo-documento|C")]
        public async Task<IActionResult> Post(SEG_FLUJO_ESTADOTable Data)
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
        [Authorize(Policy = "/seg-flujo-tipo-documento|U")]
        public async Task<IActionResult> Put(SEG_FLUJO_ESTADOTable Data)
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
        
        [HttpDelete]
        [Authorize(Policy = "/seg-flujo-tipo-documento|D")]
        public async Task<IActionResult> Delete([FromQuery] SEG_FLUJO_ESTADOTable Data)
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

        [HttpGet("GetIniciales")]
        [Authorize(Policy = "/seg-flujo-tipo-documento|R")]
        public async Task<CResult> GetIniciales([FromQuery] SEG_FLUJO_ESTADOParam Data)
        {
            Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
           
            return await _service.GetAllAsync(Data);
        }

        [HttpGet("GetFinales")]
        [Authorize(Policy = "/seg-flujo-tipo-documento|R")]
        public async Task<CResult> GetFinales([FromQuery] SEG_FLUJO_ESTADOParam Data)
        {
            Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
            
            return await _service.GetAllAsync(Data);
        }

        [HttpGet("GetCORR_ESTADO_SEG_FLUJO_PROCESO")]
        [Authorize(Policy = "/seg-flujo-proceso|R")]
        public async Task<CResult> GetCORR_ESTADO_SEG_FLUJO_PROCESO([FromQuery] SEG_FLUJO_ESTADOParam Data)
        {
            Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
            return await _service.GetAllAsync(Data);
        }
    }
}