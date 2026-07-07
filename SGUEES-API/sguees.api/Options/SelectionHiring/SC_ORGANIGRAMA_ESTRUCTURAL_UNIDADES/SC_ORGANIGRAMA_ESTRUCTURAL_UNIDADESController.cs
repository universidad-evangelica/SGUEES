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

    public class SC_ORGANIGRAMA_ESTRUCTURAL_UNIDADESController : ControllerBase
    {
        private readonly ISC_ORGANIGRAMA_ESTRUCTURAL_UNIDADESService _service;
        private readonly ISC_ORGANIGRAMA_ESTRUCTURAL_NIVELService _nivelService;

        public SC_ORGANIGRAMA_ESTRUCTURAL_UNIDADESController(
            ISC_ORGANIGRAMA_ESTRUCTURAL_UNIDADESService service,
            ISC_ORGANIGRAMA_ESTRUCTURAL_NIVELService nivelService)
        {
            _service = service ?? throw new ArgumentNullException(nameof(_service));
            _nivelService = nivelService ?? throw new ArgumentNullException(nameof(_nivelService));
        }

        // ======================================================
        // MÉTODOS DE UNIDADES
        // ======================================================

        [HttpGet("GetAll")]
        [Authorize(Policy = "/sc-organigrama-estructural-unidades|R")]
        public async Task<CResult> GetAll([FromQuery] SC_ORGANIGRAMA_ESTRUCTURAL_UNIDADESParam Data)
        {
            Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
            return await _service.GetAllAsync(Data);
        }

        [HttpGet("Get")]
        [Authorize(Policy = "/sc-organigrama-estructural-unidades|R")]
        public async Task<CResult> Get([FromQuery] SC_ORGANIGRAMA_ESTRUCTURAL_UNIDADESParam Data)
        {
            Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
            return await _service.GetAsync(Data);
        }

        [HttpPost]
        [Authorize(Policy = "/sc-organigrama-estructural-unidades|C")]
        public async Task<IActionResult> Post(SC_ORGANIGRAMA_ESTRUCTURAL_UNIDADESTable Data)
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
        [Authorize(Policy = "/sc-organigrama-estructural-unidades|U")]
        public async Task<IActionResult> Put(SC_ORGANIGRAMA_ESTRUCTURAL_UNIDADESTable Data)
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
        public async Task<IActionResult> Delete([FromQuery] SC_ORGANIGRAMA_ESTRUCTURAL_UNIDADESTable Data)
        {
            Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
            var resultado = await _service.DeleteAsync(Data, "Admin", "e-CoffeeTech");
            return resultado.ErrorCode == 0 ? Ok(resultado) : BadRequest(resultado);
        }


        [HttpGet("GetCORR_UNIDADES_SC_ORGANIGRAMA_ESTRUCTURAL_UNIDADES")]
        [Authorize(Policy = "/sc-organigrama-estructural-unidades|R")]
        public async Task<CResult> GetCORR_UNIDADES_SC_ORGANIGRAMA_ESTRUCTURAL_UNIDADES([FromQuery] SC_ORGANIGRAMA_ESTRUCTURAL_UNIDADESParam Data)
        {
            Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);

            //Data.OPCION_CONSULTA = 1; // opcional, si quieres solo activas
            return await _service.GetAllAsync(Data);
        }

        // ======================================================
        // MÉTODOS DE NIVELES (Sub-recurso dentro del mismo controlador)
        // ======================================================

        [HttpGet("GetNiveles")]
        [Authorize(Policy = "/sc-organigrama-estructural-unidades|R")]
        public async Task<CResult> GetNiveles([FromQuery] SC_ORGANIGRAMA_ESTRUCTURAL_NIVELParam Data)
        {
            Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
            return await _nivelService.GetAllAsync(Data);
        }

        [HttpGet("GetNivel")]
        [Authorize(Policy = "/sc-organigrama-estructural-unidades|R")]
        public async Task<CResult> GetNivel([FromQuery] SC_ORGANIGRAMA_ESTRUCTURAL_NIVELParam Data)
        {
            Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
            return await _nivelService.GetAsync(Data);
        }

        [HttpPost("Nivel")]
        [Authorize(Policy = "/sc-organigrama-estructural-unidades|C")]
        public async Task<IActionResult> PostNivel(SC_ORGANIGRAMA_ESTRUCTURAL_NIVELTable Data)
        {
            Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
            Data.USUARIO_CREA = User.Claims.ToList().SingleOrDefault(e => e.Type == ClaimTypes.NameIdentifier).Value;
            Data.ESTACION_CREA = ClientInfoHelper.GetClientStation(HttpContext);
            Data.FECHA_CREA = DateTime.Now;
            Data.USUARIO_ACTU = Data.USUARIO_CREA;
            Data.ESTACION_ACTU = Data.ESTACION_CREA;
            Data.FECHA_ACTU = Data.FECHA_CREA;
            Data.ACTIVO = true;

            var resultado = await _nivelService.CreateAsync(Data, Data.ESTACION_CREA, "e-CoffeeTech");
            return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
        }

        [HttpPut("Nivel")]
        [Authorize(Policy = "/sc-organigrama-estructural-unidades|U")]
        public async Task<IActionResult> PutNivel(SC_ORGANIGRAMA_ESTRUCTURAL_NIVELTable Data)
        {
            Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
            Data.USUARIO_ACTU = User.Claims.ToList().SingleOrDefault(e => e.Type == ClaimTypes.NameIdentifier).Value;
            Data.ESTACION_ACTU = ClientInfoHelper.GetClientStation(HttpContext);
            Data.FECHA_ACTU = DateTime.Now;

            var resultado = await _nivelService.UpdateAsync(Data, "Admin", "e-CoffeeTech");
            return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
        }

        [HttpDelete("Nivel")]
        [Authorize(Policy = "/sc-organigrama-estructural-unidades|D")]
        public async Task<IActionResult> DeleteNivel([FromQuery] SC_ORGANIGRAMA_ESTRUCTURAL_NIVELTable Data)
        {
            Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
            var resultado = await _nivelService.DeleteAsync(Data, "Admin", "e-CoffeeTech");
            return resultado.ErrorCode == 0 ? Ok(resultado) : BadRequest(resultado);
        }

        [HttpGet("GetNivelesActivos")]
        [Authorize(Policy = "/sc-organigrama-estructural-unidades|R")]
        public async Task<CResult> GetNivelesActivos([FromQuery] SC_ORGANIGRAMA_ESTRUCTURAL_NIVELParam Data)
        {
            Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
            Data.OPCION_CONSULTA = 1; // Solo activos
            return await _nivelService.GetAllAsync(Data);
        }
    }
}