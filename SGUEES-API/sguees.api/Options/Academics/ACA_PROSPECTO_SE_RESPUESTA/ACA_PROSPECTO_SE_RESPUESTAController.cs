using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Linq;
using eFramework.Core;
using sguees.Models;
using sguees.Services;
using System.Security.Claims;
using sguees.api.Shared;

namespace sguees.Controllers
{
    // Qué hace: preguntas de la versión del estudio socioeconómico con su respuesta para la consulta de prospectos (pestaña Información económica).
    // Cómo lo hace: solo lectura con el permiso de la pantalla padre (/aca-prospecto);
    //               sin POST/PUT/DELETE hasta la fase de edición.
    [Authorize]
    [Route("[controller]")]
    [ApiController]

    public class ACA_PROSPECTO_SE_RESPUESTAController : ControllerBase
    {
        private readonly IACA_PROSPECTO_SE_RESPUESTAService _service;

        public ACA_PROSPECTO_SE_RESPUESTAController(IACA_PROSPECTO_SE_RESPUESTAService service)
        {
            _service = service ?? throw new ArgumentNullException(nameof(_service));
        }

        [HttpGet("GetAll")]
        [Authorize(Policy = "/aca-prospecto|R")]
        public async Task<CResult> GetAll([FromQuery] ACA_PROSPECTO_SE_RESPUESTAParam Data)
        {
            Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
            return await _service.GetAllAsync(Data);
        }

        [HttpGet("Get")]
        [Authorize(Policy = "/aca-prospecto|R")]
        public async Task<CResult> Get([FromQuery] ACA_PROSPECTO_SE_RESPUESTAParam Data)
        {
            Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
            return await _service.GetAsync(Data);
        }

        // Qué hace: guarda de una vez todas las respuestas del estudio socioeconómico del prospecto.
        // Cómo lo hace: recibe el lote (una fila por pregunta) y delega en GuardarAsync; la auditoría
        //               (usuario del token y estación) la aplica el repositorio en cada fila.
        [HttpPut("Guardar")]
        [Authorize(Policy = "/aca-prospecto|U")]
        public async Task<IActionResult> Guardar(ACA_PROSPECTO_SE_RESPUESTA_GUARDARParam Data)
        {
            var resultado = await _service.GuardarAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
            return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
        }

        private string GetUsuario()
        {
            return User.Claims.ToList().SingleOrDefault(e => e.Type == ClaimTypes.NameIdentifier)?.Value;
        }
    }
}
