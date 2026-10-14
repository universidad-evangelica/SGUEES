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
    // Qué hace: catálogo de medios de origen para las pantallas que lo consumen.
    // Cómo lo hace: estándar de datos cross-tabla: el controlador origen expone
    //               Get{CAMPO}_{PANTALLA} con el permiso de la pantalla que lo consume.
    [Authorize]
    [Route("[controller]")]
    [ApiController]

    public class GEN_MEDIO_ORIGENController : ControllerBase
    {
        private readonly IGEN_MEDIO_ORIGENService _service;

        public GEN_MEDIO_ORIGENController(IGEN_MEDIO_ORIGENService service)
        {
            _service = service ?? throw new ArgumentNullException(nameof(_service));
        }

        // Qué hace: medios de origen para los combos de la edición de prospectos (/aca-prospecto).
        [HttpGet("GetCORR_MEDIO_ORIGEN_ACA_PROSPECTO")]
        [Authorize(Policy = "/aca-prospecto|R")]
        public async Task<CResult> GetCORR_MEDIO_ORIGEN_ACA_PROSPECTO([FromQuery] GEN_MEDIO_ORIGENParam Data)
        {
            Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
            return await _service.GetCORR_MEDIO_ORIGEN_ACA_PROSPECTOAsync(Data);
        }
    }
}
