using System;
using System.Linq;
using System.Threading.Tasks;
using eFramework.Core;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using sguees.Models;
using sguees.Services;

namespace sguees.Controllers
{
    // Qué hace: catálogo de sedes para las pantallas que lo consumen.
    // Cómo lo hace: estándar de datos cross-tabla: el controlador origen expone Get{CAMPO}_{PANTALLA} con el
    //               permiso de la pantalla que lo consume.
    [Authorize]
    [Route("[controller]")]
    [ApiController]
    public class GEN_SEDESController : ControllerBase
    {
        private readonly IGEN_SEDESService _service;

        public GEN_SEDESController(IGEN_SEDESService service)
        {
            _service = service ?? throw new ArgumentNullException(nameof(_service));
        }

        // Qué hace: sedes activas para el combo de "Sedes de la Facultad" (/aca-facultades).
        [HttpGet("GetCORR_SEDE_ACA_FACULTADES_SEDES")]
        [Authorize(Policy = "/aca-facultades|R")]
        public async Task<CResult> GetCORR_SEDE_ACA_FACULTADES_SEDES([FromQuery] GEN_SEDESParam Data)
        {
            var claim = User.Claims.FirstOrDefault(e => e.Type == "CORR_EMPRESA");
            Data.CORR_EMPRESA = claim != null && int.TryParse(claim.Value, out var corrEmpresa) ? corrEmpresa : 0;
            return await _service.GetCORR_SEDE_ACA_FACULTADES_SEDESAsync(Data);
        }
    }
}
