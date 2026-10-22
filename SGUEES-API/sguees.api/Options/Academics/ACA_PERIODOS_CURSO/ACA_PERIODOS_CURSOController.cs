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
    public class ACA_PERIODOS_CURSOController : ControllerBase
    {
        private readonly IACA_PERIODOS_CURSOService service;
        public ACA_PERIODOS_CURSOController(IACA_PERIODOS_CURSOService service) { this.service = service; }
        private int Empresa => int.TryParse(User.FindFirstValue("CORR_EMPRESA"), out var empresa) ? empresa : 0;
        private string Usuario => User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.Identity?.Name;

        [HttpGet("GetAll"), Authorize(Policy = "/aca-periodos-curso,/aca-asignaturas|R")]
        public Task<CResult> GetAll([FromQuery] ACA_PERIODOS_CURSOParam data)
        {
            data.CORR_EMPRESA = Empresa;
            return service.GetAllAsync(data);
        }

        [HttpPost, Authorize(Policy = "/aca-periodos-curso|C")]
        public Task<IActionResult> Post([FromBody] ACA_PERIODOS_CURSOTable data) => Save(data, false);

        [HttpPut, Authorize(Policy = "/aca-periodos-curso|U")]
        public Task<IActionResult> Put([FromBody] ACA_PERIODOS_CURSOTable data) => Save(data, true);

        private async Task<IActionResult> Save(ACA_PERIODOS_CURSOTable data, bool update)
        {
            if (data == null) return BadRequest(new CResult { ErrorCode = 51000, ErrorMessage = "No se recibieron datos." });
            data.CORR_EMPRESA = Empresa;
            var result = await service.GuardarAsync(data, update, Usuario, ClientInfoHelper.GetClientStation(HttpContext));
            return result.Result ? Ok(result) : BadRequest(result);
        }

    }
}
