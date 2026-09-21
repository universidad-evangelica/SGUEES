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
    // Qué hace: estudios previos del prospecto para la consulta de prospectos (pestaña Información académica).
    // Cómo lo hace: solo lectura con el permiso de la pantalla padre (/aca-prospecto);
    //               sin POST/PUT/DELETE hasta la fase de edición.
    [Authorize]
    [Route("[controller]")]
    [ApiController]

    public class ACA_PROSPECTO_ESTUDIOController : ControllerBase
    {
        private readonly IACA_PROSPECTO_ESTUDIOService _service;

        public ACA_PROSPECTO_ESTUDIOController(IACA_PROSPECTO_ESTUDIOService service)
        {
            _service = service ?? throw new ArgumentNullException(nameof(_service));
        }

        [HttpGet("GetAll")]
        [Authorize(Policy = "/aca-prospecto|R")]
        public async Task<CResult> GetAll([FromQuery] ACA_PROSPECTO_ESTUDIOParam Data)
        {
            Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
            return await _service.GetAllAsync(Data);
        }

        [HttpGet("Get")]
        [Authorize(Policy = "/aca-prospecto|R")]
        public async Task<CResult> Get([FromQuery] ACA_PROSPECTO_ESTUDIOParam Data)
        {
            Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
            return await _service.GetAsync(Data);
        }
    }
}
