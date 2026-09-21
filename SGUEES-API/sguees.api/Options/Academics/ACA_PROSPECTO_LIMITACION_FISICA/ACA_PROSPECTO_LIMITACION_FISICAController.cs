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
    // Qué hace: limitaciones físicas declaradas por el prospecto para la consulta de prospectos (pestaña Información personal).
    // Cómo lo hace: solo lectura con el permiso de la pantalla padre (/aca-prospecto);
    //               sin POST/PUT/DELETE hasta la fase de edición.
    [Authorize]
    [Route("[controller]")]
    [ApiController]

    public class ACA_PROSPECTO_LIMITACION_FISICAController : ControllerBase
    {
        private readonly IACA_PROSPECTO_LIMITACION_FISICAService _service;

        public ACA_PROSPECTO_LIMITACION_FISICAController(IACA_PROSPECTO_LIMITACION_FISICAService service)
        {
            _service = service ?? throw new ArgumentNullException(nameof(_service));
        }

        [HttpGet("GetAll")]
        [Authorize(Policy = "/aca-prospecto|R")]
        public async Task<CResult> GetAll([FromQuery] ACA_PROSPECTO_LIMITACION_FISICAParam Data)
        {
            Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
            return await _service.GetAllAsync(Data);
        }

        [HttpGet("Get")]
        [Authorize(Policy = "/aca-prospecto|R")]
        public async Task<CResult> Get([FromQuery] ACA_PROSPECTO_LIMITACION_FISICAParam Data)
        {
            Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
            return await _service.GetAsync(Data);
        }
    }
}
