using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using eFramework.Core;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using sguees.api.Shared;
using sguees.Models;
using sguees.Services;

namespace sguees.Controllers
{
    // Qué hace: bitácora de los cambios hechos al editar una solicitud de nuevo ingreso.
    // Cómo lo hace: lista y guarda solo TIPO_PROSPECTO = ACA_PROSPECTO. El login sale de la sesión.
    [Authorize]
    [Route("[controller]")]
    [ApiController]
    public class ACA_PROSPECTO_BITACORAController : ControllerBase
    {
        private readonly IACA_PROSPECTO_BITACORAService _service;

        public ACA_PROSPECTO_BITACORAController(IACA_PROSPECTO_BITACORAService service)
        {
            _service = service ?? throw new ArgumentNullException(nameof(_service));
        }

        [HttpGet("GetAll")]
        [Authorize(Policy = "/aca-prospecto-nuevo-ingreso|R")]
        public async Task<CResult> GetAll([FromQuery] ACA_PROSPECTO_BITACORAParam Data)
        {
            return await _service.GetAllAsync(Data);
        }

        [HttpPost]
        [Authorize(Policy = "/aca-prospecto-nuevo-ingreso|U")]
        public async Task<IActionResult> Post(ACA_PROSPECTO_BITACORAParam Data)
        {
            var login = User.Claims.ToList().SingleOrDefault(e => e.Type == ClaimTypes.NameIdentifier)?.Value;
            var resultado = await _service.InsertAsync(Data, login, ClientInfoHelper.GetClientStation(HttpContext));
            return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
        }
    }
}
