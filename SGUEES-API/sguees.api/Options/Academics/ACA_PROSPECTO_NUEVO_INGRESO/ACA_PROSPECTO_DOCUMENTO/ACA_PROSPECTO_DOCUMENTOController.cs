using System;
using System.Linq;
using System.Threading.Tasks;
using eFramework.Core;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using sguees.api.Shared;
using sguees.Models;
using sguees.Services;

namespace sguees.Controllers
{
    // Qué hace: documentación obligatoria de la solicitud de nuevo ingreso.
    // Cómo lo hace: lista los documentos del tipo 104 que cumplen la regla del prospecto
    //               y guarda el archivo en la misma carpeta que usa el portal.
    [Authorize]
    [Route("[controller]")]
    [ApiController]
    public class ACA_PROSPECTO_DOCUMENTOController : ControllerBase
    {
        private readonly IACA_PROSPECTO_DOCUMENTOService _service;

        public ACA_PROSPECTO_DOCUMENTOController(IACA_PROSPECTO_DOCUMENTOService service)
        {
            _service = service ?? throw new ArgumentNullException(nameof(service));
        }

        [HttpGet("GetAll")]
        [Authorize(Policy = "/aca-prospecto-nuevo-ingreso|R")]
        public async Task<CResult> GetAll([FromQuery] ACA_PROSPECTO_DOCUMENTOParam Data)
        {
            Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
            return await _service.GetAllAsync(Data);
        }

        // Qué hace: sube o reemplaza el archivo de un documento de esta solicitud.
        // Cómo lo hace: el mismo destino del portal (Documentacion Admision\{ciclo}_{CIF}).
        //               Un archivo nuevo queda en revisión PENDIENTE.
        [HttpPost("CargarArchivo")]
        [Authorize(Policy = "/aca-prospecto-nuevo-ingreso|U")]
        public async Task<CResult> CargarArchivo([FromForm] int CORR_PROSPECTO, [FromForm] int CORR_DOCUMENTO_ADMISION, IFormFile Archivo)
        {
            var usuario = User?.Identity?.Name;
            if (string.IsNullOrWhiteSpace(usuario))
                usuario = "SGUEES";
            if (usuario.Length > 100)
                usuario = usuario.Substring(0, 100);

            var estacion = ClientInfoHelper.GetClientStation(HttpContext) ?? "";
            if (estacion.Length > 50)
                estacion = estacion.Substring(0, 50);

            return await _service.CargarArchivoAsync(
                int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value),
                usuario,
                estacion,
                CORR_PROSPECTO,
                CORR_DOCUMENTO_ADMISION,
                Archivo);
        }
    }
}
