using System;
using System.Linq;
using System.Threading.Tasks;
using eFramework.Core;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using sguees.Models;
using sguees.Services;

namespace sguees.Controllers
{
    // Qué hace: consulta administrativa de solicitudes de beca (Académico → Consultas).
    // Cómo lo hace: solo lectura. El listado es por ciclo; el detalle son las respuestas ya guardadas.
    [Authorize]
    [Route("[controller]")]
    [ApiController]
    public class ACA_PROSPECTO_BECAController : ControllerBase
    {
        private readonly IACA_PROSPECTO_BECAService _service;

        public ACA_PROSPECTO_BECAController(IACA_PROSPECTO_BECAService service)
        {
            _service = service ?? throw new ArgumentNullException(nameof(_service));
        }

        [HttpGet("GetAll")]
        [Authorize(Policy = "/aca-prospecto-beca|R")]
        public async Task<CResult> GetAll([FromQuery] ACA_PROSPECTO_BECAParam Data)
        {
            Data.CORR_EMPRESA = Empresa();
            return await _service.GetAllAsync(Data);
        }

        [HttpGet("GetRespuestas")]
        [Authorize(Policy = "/aca-prospecto-beca|R")]
        public async Task<CResult> GetRespuestas([FromQuery] ACA_PROSPECTO_BECAParam Data)
        {
            Data.CORR_EMPRESA = Empresa();
            return await _service.GetRespuestasAsync(Data);
        }

        [HttpGet("GetArchivos")]
        [Authorize(Policy = "/aca-prospecto-beca|R")]
        public async Task<CResult> GetArchivos([FromQuery] ACA_PROSPECTO_BECAParam Data)
        {
            Data.CORR_EMPRESA = Empresa();
            return await _service.GetArchivosAsync(Data);
        }

        // Qué hace: envía el archivo para abrirlo en el navegador.
        [HttpGet("GetArchivo")]
        [Authorize(Policy = "/aca-prospecto-beca|R")]
        public async Task<IActionResult> GetArchivo([FromQuery] ACA_PROSPECTO_BECAParam Data)
        {
            Data.CORR_EMPRESA = Empresa();
            var archivo = await _service.AbrirArchivoAsync(Data);
            if (archivo?.Stream == null)
                return NotFound();
            Response.Headers.ContentDisposition = "inline";
            Response.RegisterForDispose(archivo.Stream);
            return File(archivo.Stream, archivo.ContentType ?? "application/octet-stream");
        }

        [HttpGet("GetOpciones")]
        [Authorize(Policy = "/aca-prospecto-beca|R")]
        public async Task<CResult> GetOpciones([FromQuery] int CORR_PREGUNTA_BECA)
        {
            return await _service.GetOpcionesAsync(Empresa(), CORR_PREGUNTA_BECA);
        }

        // Qué hace: guarda la corrección de una pregunta y devuelve el puntaje recalculado.
        [HttpPut("GuardarRespuesta")]
        [Authorize(Policy = "/aca-prospecto-beca|U")]
        public async Task<CResult> GuardarRespuesta([FromBody] AcaProspectoBecaRespuestaEdicion Data)
        {
            return await _service.GuardarRespuestaAsync(Empresa(), Usuario(), Data);
        }

        // Qué hace: sustituye el archivo cargado en una pregunta de documento.
        [HttpPost("ReemplazarArchivo")]
        [Authorize(Policy = "/aca-prospecto-beca|U")]
        [RequestSizeLimit(6_000_000)]
        public async Task<CResult> ReemplazarArchivo([FromForm] int CORR_PROSPECTO_BECA, [FromForm] int CORR_RESPUESTA_BECA, IFormFile Archivo)
        {
            return await _service.ReemplazarArchivoAsync(Empresa(), Usuario(), CORR_PROSPECTO_BECA, CORR_RESPUESTA_BECA, Archivo);
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