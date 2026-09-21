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
    // Qué hace: datos de períodos académicos que consumen otras pantallas.
    // Cómo lo hace: estándar de datos cross-tabla: el controlador origen expone
    //               Get{CAMPO}_{PANTALLA} con el permiso de la pantalla que lo consume.
    [Authorize]
    [Route("[controller]")]
    [ApiController]

    public class ACA_PERIODOS_ACADEMICOSController : ControllerBase
    {
        private readonly IACA_PERIODOS_ACADEMICOSService _service;

        public ACA_PERIODOS_ACADEMICOSController(IACA_PERIODOS_ACADEMICOSService service)
        {
            _service = service ?? throw new ArgumentNullException(nameof(_service));
        }

        [HttpGet("GetCICLO_ACA_PROSPECTO")]
        [Authorize(Policy = "/aca-prospecto|R")]
        public async Task<CResult> GetCICLO_ACA_PROSPECTO([FromQuery] ACA_PERIODOS_ACADEMICOSParam Data)
        {
            Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
            return await _service.GetCICLO_ACA_PROSPECTOAsync(Data);
        }
    }
}
