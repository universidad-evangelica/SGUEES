using System;
using System.Threading.Tasks;
using eFramework.Core;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using sguees.Models;
using sguees.Services;

namespace sguees.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class SC_SOLICITUD_EMPLEO_PUBLICOController : ControllerBase
    {
        private readonly ISC_SOLICITUD_EMPLEO_PUBLICOService _service;

        public SC_SOLICITUD_EMPLEO_PUBLICOController(ISC_SOLICITUD_EMPLEO_PUBLICOService service)
        {
            _service = service ?? throw new ArgumentNullException(nameof(service));
        }

        [AllowAnonymous]
        [HttpGet("ValidarToken")]
        public async Task<CResult> ValidarToken([FromQuery] SC_SOLICITUD_EMPLEO_PUBLICOParam data)
        {
            return await _service.ValidarTokenAsync(data);
        }

        /// <summary>
        /// Precarga del formulario público cuando YA_TIENE_DATOS (reabrir link).
        /// </summary>
        [AllowAnonymous]
        [HttpGet("GetDatos")]
        public async Task<CResult> GetDatos([FromQuery] SC_SOLICITUD_EMPLEO_PUBLICOParam data)
        {
            return await _service.GetDatosAsync(data);
        }

        [AllowAnonymous]
        [HttpPost("SubirFoto")]
        [RequestSizeLimit(6 * 1024 * 1024)]
        public async Task<IActionResult> SubirFoto([FromForm] string TOKEN, IFormFile file)
        {
            var resultado = await _service.SubirFotoAsync(TOKEN, file);
            return resultado.Result ? Ok(resultado) : BadRequest(resultado);
        }

        [AllowAnonymous]
        [HttpPost("Completar")]
        public async Task<IActionResult> Completar(SC_SOLICITUD_EMPLEO_COMPLETARParam data)
        {
            var resultado = await _service.CompletarAsync(data);
            return resultado.Result ? Ok(resultado) : BadRequest(resultado);
        }
    }
}
