using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Linq;
using eFramework.Core;
using sguees.Models;
using sguees.Services;

namespace sguees.Controllers
{
    // Qué hace: catálogo de carreras para las pantallas que lo consumen.
    // Cómo lo hace: estándar de datos cross-tabla: el controlador origen expone
    //               Get{CAMPO}_{PANTALLA} con el permiso de la pantalla que lo consume.
    [Authorize]
    [Route("[controller]")]
    [ApiController]

    public class ACA_CARRERASController : ControllerBase
    {
        private readonly IACA_CARRERASService _service;

        public ACA_CARRERASController(IACA_CARRERASService service)
        {
            _service = service ?? throw new ArgumentNullException(nameof(_service));
        }

        // Qué hace: carreras para los combos de la edición de prospectos (/aca-prospecto).
        [HttpGet("GetCORR_CARRERA_ACA_PROSPECTO")]
        [Authorize(Policy = "/aca-prospecto|R")]
        public async Task<CResult> GetCORR_CARRERA_ACA_PROSPECTO([FromQuery] ACA_CARRERASParam Data)
        {
            Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
            return await _service.GetCORR_CARRERA_ACA_PROSPECTOAsync(Data);
        }
    }
}
