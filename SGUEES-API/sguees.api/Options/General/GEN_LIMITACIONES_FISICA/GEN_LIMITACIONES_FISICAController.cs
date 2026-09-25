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
    // Qué hace: catálogo de limitaciones físicas para las pantallas que lo consumen.
    // Cómo lo hace: estándar de datos cross-tabla: el controlador origen expone
    //               Get{CAMPO}_{PANTALLA} con el permiso de la pantalla que lo consume.
    [Authorize]
    [Route("[controller]")]
    [ApiController]

    public class GEN_LIMITACIONES_FISICAController : ControllerBase
    {
        private readonly IGEN_LIMITACIONES_FISICAService _service;

        public GEN_LIMITACIONES_FISICAController(IGEN_LIMITACIONES_FISICAService service)
        {
            _service = service ?? throw new ArgumentNullException(nameof(_service));
        }

        // Qué hace: limitaciones físicas para los combos de la edición de prospectos (/aca-prospecto).
        [HttpGet("GetCORR_LIMITACION_FISICA_ACA_PROSPECTO")]
        [Authorize(Policy = "/aca-prospecto|R")]
        public async Task<CResult> GetCORR_LIMITACION_FISICA_ACA_PROSPECTO([FromQuery] GEN_LIMITACIONES_FISICAParam Data)
        {
            Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
            return await _service.GetCORR_LIMITACION_FISICA_ACA_PROSPECTOAsync(Data);
        }
    }
}
