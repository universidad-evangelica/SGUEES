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
    // Qué hace: catálogo de sectores laborales para las pantallas que lo consumen.
    // Cómo lo hace: estándar de datos cross-tabla: el controlador origen expone
    //               Get{CAMPO}_{PANTALLA} con el permiso de la pantalla que lo consume.
    [Authorize]
    [Route("[controller]")]
    [ApiController]

    public class GEN_SECTOR_LABORALController : ControllerBase
    {
        private readonly IGEN_SECTOR_LABORALService _service;

        public GEN_SECTOR_LABORALController(IGEN_SECTOR_LABORALService service)
        {
            _service = service ?? throw new ArgumentNullException(nameof(_service));
        }

        // Qué hace: sectores laborales para los combos de la edición de prospectos (/aca-prospecto).
        [HttpGet("GetCORR_SECTOR_LABORAL_ACA_PROSPECTO")]
        [Authorize(Policy = "/aca-prospecto|R")]
        public async Task<CResult> GetCORR_SECTOR_LABORAL_ACA_PROSPECTO([FromQuery] GEN_SECTOR_LABORALParam Data)
        {
            Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
            return await _service.GetCORR_SECTOR_LABORAL_ACA_PROSPECTOAsync(Data);
        }
    }
}
