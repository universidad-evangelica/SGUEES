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
    // Qué hace: pestaña Archivos de la solicitud de beca.
    // Cómo lo hace: lista, abre y reemplaza los documentos de ACA_PROSPECTO_BECA_RESPUESTA.
    [Authorize]
    [Route("[controller]")]
    [ApiController]
    public class ACA_PROSPECTO_BECA_ARCHIVOController : ControllerBase
    {
        private readonly IACA_PROSPECTO_BECA_ARCHIVOService _service;

        public ACA_PROSPECTO_BECA_ARCHIVOController(IACA_PROSPECTO_BECA_ARCHIVOService service)
        {
            _service = service ?? throw new ArgumentNullException(nameof(service));
        }

        [HttpGet("GetArchivos")]
        [Authorize(Policy = "/aca-prospecto-beca|R")]
        public async Task<CResult> GetArchivos([FromQuery] ACA_PROSPECTO_BECAParam Data)
        {
            Data.CORR_EMPRESA = Empresa();
            return await _service.GetArchivosAsync(Data);
        }

        // Qué hace: envía el archivo para abrirlo en el navegador.
        // Cómo lo hace: lo toma de la carpeta del ciclo y la solicitud, no de una ruta enviada por el cliente.
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

        // Qué hace: sustituye el archivo cargado en una pregunta de documento.
        // Cómo lo hace: guarda el archivo nuevo y actualiza el nombre y la ruta de la respuesta.
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
