using System.Security.Claims;
using eFramework.Core;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using sguees.api.Shared;
using sguees.Models;
using sguees.Services;

namespace sguees.Controllers
{
    [ApiController, Authorize, Route("[controller]")]
    public class ACA_TIPOS_PRACTICAController : ControllerBase
    {
        private readonly IACA_TIPOS_PRACTICAService service;
        public ACA_TIPOS_PRACTICAController(IACA_TIPOS_PRACTICAService service) { this.service = service; }
        private int Empresa => int.TryParse(User.FindFirstValue("CORR_EMPRESA"), out var empresa) ? empresa : 0;
        private string Usuario => User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.Identity?.Name;

        [HttpGet("GetAll"), Authorize(Policy = "/aca-tipos-practica,/aca-asignaturas|R")]
        public Task<CResult> GetAll([FromQuery] ACA_TIPOS_PRACTICAParam data)
        {
            data.CORR_EMPRESA = Empresa;
            return service.GetAllAsync(data);
        }

        [HttpPost, Authorize(Policy = "/aca-tipos-practica|C")]
        public Task<IActionResult> Post([FromBody] ACA_TIPOS_PRACTICATable data) => Save(data, false);

        [HttpPut, Authorize(Policy = "/aca-tipos-practica|U")]
        public Task<IActionResult> Put([FromBody] ACA_TIPOS_PRACTICATable data) => Save(data, true);

        private async Task<IActionResult> Save(ACA_TIPOS_PRACTICATable data, bool update)
        {
            if (data == null) return BadRequest(new CResult { ErrorCode = 51000, ErrorMessage = "No se recibieron datos." });
            data.CORR_EMPRESA = Empresa;
            var result = await service.GuardarAsync(data, update, Usuario, ClientInfoHelper.GetClientStation(HttpContext));
            return result.Result ? Ok(result) : BadRequest(result);
        }

    }
}
