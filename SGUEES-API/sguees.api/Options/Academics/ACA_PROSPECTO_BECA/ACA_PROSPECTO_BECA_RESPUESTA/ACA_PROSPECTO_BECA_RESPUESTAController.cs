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
    // Qué hace: pestaña Cuestionario de la solicitud de beca.
    // Cómo lo hace: lee y corrige ACA_PROSPECTO_BECA_RESPUESTA. El encabezado no pasa por aquí.
    [Authorize]
    [Route("[controller]")]
    [ApiController]
    public class ACA_PROSPECTO_BECA_RESPUESTAController : ControllerBase
    {
        private readonly IACA_PROSPECTO_BECA_RESPUESTAService _service;

        public ACA_PROSPECTO_BECA_RESPUESTAController(IACA_PROSPECTO_BECA_RESPUESTAService service)
        {
            _service = service ?? throw new ArgumentNullException(nameof(service));
        }

        [HttpGet("GetRespuestas")]
        [Authorize(Policy = "/aca-prospecto-beca|R")]
        public async Task<CResult> GetRespuestas([FromQuery] ACA_PROSPECTO_BECAParam Data)
        {
            Data.CORR_EMPRESA = Empresa();
            return await _service.GetRespuestasAsync(Data);
        }

        [HttpGet("GetOpciones")]
        [Authorize(Policy = "/aca-prospecto-beca|R")]
        public async Task<CResult> GetOpciones([FromQuery] int CORR_PREGUNTA_BECA)
        {
            return await _service.GetOpcionesAsync(Empresa(), CORR_PREGUNTA_BECA);
        }

        // Qué hace: guarda la corrección de una pregunta y devuelve el puntaje recalculado.
        // Cómo lo hace: actualiza las filas de esa pregunta y recalcula el total de la solicitud.
        [HttpPut("GuardarRespuesta")]
        [Authorize(Policy = "/aca-prospecto-beca|U")]
        public async Task<CResult> GuardarRespuesta([FromBody] sguees.Services.AcaProspectoBecaRespuestaEdicion Data)
        {
            return await _service.GuardarRespuestaAsync(Empresa(), Usuario(), Data);
        }

        private int Empresa()
        {
            return int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
        }

        private string Usuario()
        {
            var nombre = User?.Identity?.Name;
            if (string.IsNullOrWhiteSpace(nombre))
                nombre = "SGUEES";
            return nombre.Length > 30 ? nombre.Substring(0, 30) : nombre;
        }
    }
}
