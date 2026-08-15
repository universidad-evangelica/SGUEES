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
    public class SC_ORGANIGRAMA_ESTRUCTURAL_JEFES_UNIDADESController : ControllerBase
    {
        private readonly ISC_ORGANIGRAMA_ESTRUCTURAL_JEFES_UNIDADESService _service;

        public SC_ORGANIGRAMA_ESTRUCTURAL_JEFES_UNIDADESController(ISC_ORGANIGRAMA_ESTRUCTURAL_JEFES_UNIDADESService service)
        {
            _service = service ?? throw new ArgumentNullException(nameof(_service));
        }

        [HttpGet("GetByUnidad")]
        [Authorize(Policy = "/sc-organigrama-estructural-unidades|R")]
        public async Task<CResult> GetByUnidad([FromQuery] SC_ORGANIGRAMA_ESTRUCTURAL_JEFES_UNIDADESParam Data)
        {
            Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
            return await _service.GetByUnidadAsync(Data);
        }

        // Qué hace: entrega jefes activos de una unidad (con NOMBRE_EMPLEADO) para Reporta a del descriptor.
        // Cómo: fija CORR_EMPRESA, ACTIVO=1 y llama GetByUnidadAsync filtrando por CORR_UNIDAD.
        [HttpGet("GetCORR_EMPLEADO_SC_DESCRIPTOR_PUESTO")]
        [Authorize(Policy = "/sc-descriptor-puesto|R")]
        public async Task<CResult> GetCORR_EMPLEADO_SC_DESCRIPTOR_PUESTO([FromQuery] SC_ORGANIGRAMA_ESTRUCTURAL_JEFES_UNIDADESParam Data)
        {
            Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
            Data.ACTIVO = 1;
            return await _service.GetByUnidadAsync(Data);
        }

        [HttpGet("GetEmpleadosByUnidad")]
        [Authorize(Policy = "/sc-organigrama-estructural-unidades|R")]
        public async Task<CResult> GetEmpleadosByUnidad([FromQuery] SC_ORGANIGRAMA_ESTRUCTURAL_JEFES_UNIDADESParam Data)
        {
            Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
            return await _service.GetEmpleadosByUnidadAsync(Data);
        }

        [HttpGet("Get")]
        [Authorize(Policy = "/sc-organigrama-estructural-unidades|R")]
        public async Task<CResult> Get([FromQuery] SC_ORGANIGRAMA_ESTRUCTURAL_JEFES_UNIDADESParam Data)
        {
            Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
            return await _service.GetAsync(Data);
        }

        [HttpPost]
        [Authorize(Policy = "/sc-organigrama-estructural-unidades|C")]
        public async Task<IActionResult> Post(SC_ORGANIGRAMA_ESTRUCTURAL_JEFES_UNIDADESTable Data)
        {
            Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
            Data.USUARIO_CREA = User.Claims.ToList().SingleOrDefault(e => e.Type == ClaimTypes.NameIdentifier).Value;
            Data.ESTACION_CREA = ClientInfoHelper.GetClientStation(HttpContext);
            Data.FECHA_CREA = DateTime.Now;
            Data.USUARIO_ACTU = Data.USUARIO_CREA;
            Data.ESTACION_ACTU = Data.ESTACION_CREA;
            Data.FECHA_ACTU = Data.FECHA_CREA;

            var resultado = await _service.CreateAsync(Data, Data.ESTACION_CREA, "e-CoffeeTech");
            return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
        }

        [HttpPut]
        [Authorize(Policy = "/sc-organigrama-estructural-unidades|U")]
        public async Task<IActionResult> Put(SC_ORGANIGRAMA_ESTRUCTURAL_JEFES_UNIDADESTable Data)
        {
            Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
            Data.USUARIO_ACTU = User.Claims.ToList().SingleOrDefault(e => e.Type == ClaimTypes.NameIdentifier).Value;
            Data.ESTACION_ACTU = ClientInfoHelper.GetClientStation(HttpContext);
            Data.FECHA_ACTU = DateTime.Now;

            var resultado = await _service.UpdateAsync(Data, "Admin", "e-CoffeeTech");
            return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
        }

        [HttpDelete]
        [Authorize(Policy = "/sc-organigrama-estructural-unidades|D")]
        public async Task<IActionResult> Delete([FromQuery] SC_ORGANIGRAMA_ESTRUCTURAL_JEFES_UNIDADESTable Data)
        {
            Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
            var resultado = await _service.DeleteAsync(Data, "Admin", "e-CoffeeTech");
            return resultado.ErrorCode == 0 ? Ok(resultado) : BadRequest(resultado);
        }
    }
}