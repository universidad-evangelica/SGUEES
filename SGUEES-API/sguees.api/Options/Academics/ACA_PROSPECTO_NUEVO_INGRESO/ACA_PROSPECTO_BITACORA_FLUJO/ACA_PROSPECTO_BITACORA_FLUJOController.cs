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
    // Qué hace: bitácora del flujo de la solicitud de nuevo ingreso.
    // Cómo lo hace: lee el historial del flujo 104. El paso del portal muestra el CIF del prospecto.
    [Authorize]
    [Route("[controller]")]
    [ApiController]
    public class ACA_PROSPECTO_BITACORA_FLUJOController : ControllerBase
    {
        private readonly IACA_PROSPECTO_BITACORA_FLUJOService _service;

        public ACA_PROSPECTO_BITACORA_FLUJOController(IACA_PROSPECTO_BITACORA_FLUJOService service)
        {
            _service = service ?? throw new ArgumentNullException(nameof(_service));
        }

        [HttpGet("GetAll")]
        [Authorize(Policy = "/aca-prospecto-nuevo-ingreso|R")]
        public async Task<CResult> GetAll([FromQuery] ACA_PROSPECTO_BITACORA_FLUJOParam Data)
        {
            Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
            return await _service.GetAllAsync(Data);
        }
    }
}
