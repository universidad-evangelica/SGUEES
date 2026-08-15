using System;
using System.Linq;
using System.Threading.Tasks;
using eFramework.Core;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using sguees.Models;
using sguees.Services;

namespace sguees.Controllers
{
    [Authorize]
    [Route("[controller]")]
    [ApiController]
    public class SC_SOLICITUD_EMPLEO_TOKENController : ControllerBase
    {
        private readonly ISC_SOLICITUD_EMPLEO_PUBLICOService _service;

        public SC_SOLICITUD_EMPLEO_TOKENController(ISC_SOLICITUD_EMPLEO_PUBLICOService service)
        {
            _service = service ?? throw new ArgumentNullException(nameof(service));
        }

        [HttpGet("GetAll")]
        [Authorize(Policy = "/sc-solicitud-empleo|R")]
        public async Task<CResult> GetAll([FromQuery] SC_SOLICITUD_EMPLEO_TOKENParam data)
        {
            data.CORR_EMPRESA = GetCorrEmpresa();
            return await _service.GetAllTokenAsync(data);
        }

        [HttpPost("GenerarToken")]
        [Authorize(Policy = "/sc-solicitud-empleo|U")]
        public async Task<IActionResult> GenerarToken(SC_SOLICITUD_EMPLEO_GENERAR_TOKENParam data)
        {
            data.CORR_EMPRESA = GetCorrEmpresa();
            var resultado = await _service.GenerarTokenAsync(data);
            return resultado.Result ? Ok(resultado) : BadRequest(resultado);
        }

        private int GetCorrEmpresa()
        {
            return int.Parse(User.Claims.Single(e => e.Type == "CORR_EMPRESA").Value);
        }
    }
}
