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
    // Qué hace: catálogo de tipos de sangre para las pantallas que lo consumen.
    // Cómo lo hace: estándar de datos cross-tabla: el controlador origen expone
    //               Get{CAMPO}_{PANTALLA} con el permiso de la pantalla que lo consume.
    [Authorize]
    [Route("[controller]")]
    [ApiController]

    public class GEN_TIPO_SANGREController : ControllerBase
    {
        private readonly IGEN_TIPO_SANGREService _service;

        public GEN_TIPO_SANGREController(IGEN_TIPO_SANGREService service)
        {
            _service = service ?? throw new ArgumentNullException(nameof(_service));
        }

        // Qué hace: tipos de sangre para los combos de la edición de prospectos (/aca-prospecto).
        [HttpGet("GetCORR_TIPO_SANGRE_ACA_PROSPECTO")]
        [Authorize(Policy = "/aca-prospecto|R")]
        public async Task<CResult> GetCORR_TIPO_SANGRE_ACA_PROSPECTO([FromQuery] GEN_TIPO_SANGREParam Data)
        {
            Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
            return await _service.GetCORR_TIPO_SANGRE_ACA_PROSPECTOAsync(Data);
        }
    }
}
