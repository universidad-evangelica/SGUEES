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
    
    public class SEG_FLUJO_TIPO_DOCUMENTOController : ControllerBase
    {
        private readonly ISEG_FLUJO_TIPO_DOCUMENTOService _service;
        private readonly ISEG_FLUJO_ESTADOService _estadoService; // Traemos el estado Service

        public SEG_FLUJO_TIPO_DOCUMENTOController(
            ISEG_FLUJO_TIPO_DOCUMENTOService service,
            ISEG_FLUJO_ESTADOService estadoService) // Inyectamos por constructor ambos servicios
        {
            _service = service ?? throw new ArgumentNullException(nameof(_service));
            _estadoService = estadoService ?? throw new ArgumentNullException(nameof(_estadoService));
        }

        // ======================================================
        // MÉTODOS DE TIPO DOCUMENTO (existentes)
        // ======================================================

        [HttpGet("GetAll")]
        [Authorize(Policy = "/seg-flujo-tipo-documento|R")]
        public async Task<CResult> GetAll([FromQuery] SEG_FLUJO_TIPO_DOCUMENTOParam Data)
        {
            Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
            return await _service.GetAllAsync(Data);
        }

        [HttpGet("Get")]
        [Authorize(Policy = "/seg-flujo-tipo-documento|R")]
        public async Task<CResult> Get([FromQuery] SEG_FLUJO_TIPO_DOCUMENTOParam Data)
        {
            Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
            return await _service.GetAsync(Data);
        }

        [HttpPost]
        [Authorize(Policy = "/seg-flujo-tipo-documento|C")]
        public async Task<IActionResult> Post(SEG_FLUJO_TIPO_DOCUMENTOTable Data)
        {
            Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
            Data.USUARIO_CREA = User.Claims.ToList().SingleOrDefault(e => e.Type == ClaimTypes.NameIdentifier).Value;
            Data.ESTACION_CREA = ClientInfoHelper.GetClientStation(HttpContext);
            Data.FECHA_CREA = DateTime.Now;
            Data.USUARIO_ACTU = Data.USUARIO_CREA;
            Data.ESTACION_ACTU = Data.ESTACION_CREA;
            Data.FECHA_ACTU = Data.FECHA_CREA;

            Data.ACTIVO = true;

            var resultado = await _service.CreateAsync(Data, Data.ESTACION_CREA, "e-CoffeeTech");
            return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
        }

        [HttpPut]
        [Authorize(Policy = "/seg-flujo-tipo-documento|U")]
        public async Task<IActionResult> Put(SEG_FLUJO_TIPO_DOCUMENTOTable Data)
        {
            Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
            Data.USUARIO_ACTU = User.Claims.ToList().SingleOrDefault(e => e.Type == ClaimTypes.NameIdentifier).Value;
            Data.ESTACION_ACTU = ClientInfoHelper.GetClientStation(HttpContext);
            Data.FECHA_ACTU = DateTime.Now;

            var resultado = await _service.UpdateAsync(Data, "Admin", "e-CoffeeTech");
            return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
        }

        [HttpDelete]
        [Authorize(Policy = "/seg-flujo-tipo-documento|D")]
        public async Task<IActionResult> Delete([FromQuery] SEG_FLUJO_TIPO_DOCUMENTOTable Data)
        {
            Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
            var resultado = await _service.DeleteAsync(Data, "Admin", "e-CoffeeTech");
            return resultado.ErrorCode == 0 ? Ok(resultado) : BadRequest(resultado);
        }

        // ======================================================
        // NUEVOS MÉTODOS DE ESTADOS (dentro del mismo controlador)
        // ======================================================

        [HttpGet("GetEstados")]
        [Authorize(Policy = "/seg-flujo-tipo-documento|R")] // ← Usa la misma política
        public async Task<CResult> GetEstados([FromQuery] SEG_FLUJO_ESTADOParam Data)
        {
            Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
            return await _estadoService.GetAllAsync(Data);
        }

        [HttpGet("GetEstado")]
        [Authorize(Policy = "/seg-flujo-tipo-documento|R")] // ← Usa la misma política
        public async Task<CResult> GetEstado([FromQuery] SEG_FLUJO_ESTADOParam Data)
        {
            Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
            return await _estadoService.GetAsync(Data);
        }

        [HttpPost("Estado")]
        [Authorize(Policy = "/seg-flujo-tipo-documento|C")] // ← Usa la misma política
        public async Task<IActionResult> PostEstado(SEG_FLUJO_ESTADOTable Data)
        {
            Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
            Data.USUARIO_CREA = User.Claims.ToList().SingleOrDefault(e => e.Type == ClaimTypes.NameIdentifier).Value;
            Data.ESTACION_CREA = ClientInfoHelper.GetClientStation(HttpContext);
            Data.FECHA_CREA = DateTime.Now;
            Data.USUARIO_ACTU = Data.USUARIO_CREA;
            Data.ESTACION_ACTU = Data.ESTACION_CREA;
            Data.FECHA_ACTU = Data.FECHA_CREA;
            Data.ACTIVO = true;

            var resultado = await _estadoService.CreateAsync(Data, Data.ESTACION_CREA, "e-CoffeeTech");
            return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
        }

        [HttpPut("Estado")]
        [Authorize(Policy = "/seg-flujo-tipo-documento|U")] // ← Usa la misma política
        public async Task<IActionResult> PutEstado(SEG_FLUJO_ESTADOTable Data)
        {
            Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
            Data.USUARIO_ACTU = User.Claims.ToList().SingleOrDefault(e => e.Type == ClaimTypes.NameIdentifier).Value;
            Data.ESTACION_ACTU = ClientInfoHelper.GetClientStation(HttpContext);
            Data.FECHA_ACTU = DateTime.Now;

            var resultado = await _estadoService.UpdateAsync(Data, "Admin", "e-CoffeeTech");
            return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
        }

        [HttpDelete("Estado")]
        [Authorize(Policy = "/seg-flujo-tipo-documento|D")] // ← Usa la misma política
        public async Task<IActionResult> DeleteEstado([FromQuery] SEG_FLUJO_ESTADOTable Data)
        {
            Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
            var resultado = await _estadoService.DeleteAsync(Data, "Admin", "e-CoffeeTech");
            return resultado.ErrorCode == 0 ? Ok(resultado) : BadRequest(resultado);
        }

        [HttpGet("GetEstadosByTipoDocumento")]
        [Authorize(Policy = "/seg-flujo-tipo-documento|R")] // ← Usa la misma política
        public async Task<CResult> GetEstadosByTipoDocumento([FromQuery] SEG_FLUJO_ESTADOParam Data)
        {
            Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
            return await _estadoService.GetByTipoDocumentoAsync(Data.CORR_EMPRESA, Data.CORR_TIPO_DOCUMENTO);
        }
    }
}