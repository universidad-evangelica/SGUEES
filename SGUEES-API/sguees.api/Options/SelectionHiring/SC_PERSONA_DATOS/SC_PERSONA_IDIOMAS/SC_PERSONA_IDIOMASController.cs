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
    public class SC_PERSONA_IDIOMASController : ControllerBase
    {
        private readonly ISC_PERSONA_IDIOMASService _service;
        public SC_PERSONA_IDIOMASController(ISC_PERSONA_IDIOMASService service) { _service = service ?? throw new ArgumentNullException(nameof(service)); }
        [HttpGet("GetAll")]
        [Authorize(Policy = "/sc-persona-datos|R")]
        public async Task<CResult> GetAll([FromQuery] SC_PERSONA_IDIOMASParam Data) { Data.CORR_EMPRESA = Empresa(); return await _service.GetAllAsync(Data); }
        [HttpGet("GetAll_SC_SOLICITUD_EMPLEO")]
        [Authorize(Policy = "/sc-solicitud-empleo,/sc-requisicion-personal|R")]
        public async Task<CResult> GetAll_SC_SOLICITUD_EMPLEO([FromQuery] SC_PERSONA_IDIOMASParam Data) { Data.CORR_EMPRESA = Empresa(); return await _service.GetAllAsync(Data); }
        [HttpGet("Get")]
        [Authorize(Policy = "/sc-persona-datos|R")]
        public async Task<CResult> Get([FromQuery] SC_PERSONA_IDIOMASParam Data) { Data.CORR_EMPRESA = Empresa(); return await _service.GetAsync(Data); }
        [HttpPost]
        [Authorize(Policy = "/sc-persona-datos|C")]
        public async Task<IActionResult> Post([FromBody] SC_PERSONA_IDIOMASTable Data)
        {
            Data.CORR_EMPRESA = Empresa(); var user = Usuario(); var station = ClientInfoHelper.GetClientStation(HttpContext); var now = DateTime.Now;
            Data.USUARIO_CREA = user; Data.ESTACION_CREA = station; Data.FECHA_CREA = now; Data.USUARIO_ACTU = user; Data.ESTACION_ACTU = station; Data.FECHA_ACTU = now;
            var result = await _service.CreateAsync(Data, user, station); return result.ErrorCode == 0 ? StatusCode(201, result) : BadRequest(result);
        }
        [HttpPut]
        [Authorize(Policy = "/sc-persona-datos|U")]
        public async Task<IActionResult> Put([FromBody] SC_PERSONA_IDIOMASTable Data, [FromQuery] int CORR_PERSONA_DATOS = 0, [FromQuery] int CORR_IDIOMA = 0)
        {
            Data.CORR_EMPRESA = Empresa(); if (CORR_PERSONA_DATOS > 0) Data.CORR_PERSONA_DATOS = CORR_PERSONA_DATOS; if (CORR_IDIOMA > 0) Data.CORR_IDIOMA = CORR_IDIOMA;
            var user = Usuario(); var station = ClientInfoHelper.GetClientStation(HttpContext); Data.USUARIO_ACTU = user; Data.ESTACION_ACTU = station; Data.FECHA_ACTU = DateTime.Now;
            var result = await _service.UpdateAsync(Data, user, station); return result.ErrorCode == 0 ? Ok(result) : BadRequest(result);
        }
        [HttpDelete]
        [Authorize(Policy = "/sc-persona-datos|D")]
        public async Task<IActionResult> Delete([FromQuery] SC_PERSONA_IDIOMASTable Data)
        {
            Data.CORR_EMPRESA = Empresa(); var user = Usuario(); var station = ClientInfoHelper.GetClientStation(HttpContext); var result = await _service.DeleteAsync(Data, user, station); return result.ErrorCode == 0 ? Ok(result) : BadRequest(result);
        }
        private int Empresa() => int.Parse(User.Claims.Single(e => e.Type == "CORR_EMPRESA").Value);
        private string Usuario() => User.Claims.Single(e => e.Type == ClaimTypes.NameIdentifier).Value;
    }
}
