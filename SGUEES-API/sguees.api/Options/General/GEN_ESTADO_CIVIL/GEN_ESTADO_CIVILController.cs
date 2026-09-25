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
    // Qué hace: catálogo de estados civiles para las pantallas que lo consumen.
    // Cómo lo hace: estándar de datos cross-tabla: el controlador origen expone
    //               Get{CAMPO}_{PANTALLA} con el permiso de la pantalla que lo consume.
    [Authorize]
    [Route("[controller]")]
    [ApiController]

    public class GEN_ESTADO_CIVILController : ControllerBase
    {
        private readonly IGEN_ESTADO_CIVILService _service;

        public GEN_ESTADO_CIVILController(IGEN_ESTADO_CIVILService service)
        {
            _service = service ?? throw new ArgumentNullException(nameof(_service));
        }

        // Qué hace: estados civiles para los combos de la edición de prospectos (/aca-prospecto).
        [HttpGet("GetCORR_ESTADO_CIVIL_ACA_PROSPECTO")]
        [Authorize(Policy = "/aca-prospecto|R")]
        public async Task<CResult> GetCORR_ESTADO_CIVIL_ACA_PROSPECTO([FromQuery] GEN_ESTADO_CIVILParam Data)
        {
            Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
            return await _service.GetCORR_ESTADO_CIVIL_ACA_PROSPECTOAsync(Data);
        }
    }
}
