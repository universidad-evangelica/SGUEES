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
    public class ACA_CARRERAS_CONFIGController : ControllerBase
    {
        private readonly IACA_CARRERAS_CONFIGService service;
        public ACA_CARRERAS_CONFIGController(IACA_CARRERAS_CONFIGService service) { this.service = service; }
        private int Empresa => int.TryParse(User.FindFirstValue("CORR_EMPRESA"), out var e) ? e : 0;
        [HttpGet("Catalogos"), Authorize(Policy = "/aca-carreras,/aca-facultades|R")] public Task<CResult> Catalogos() => service.Catalogos(Empresa);
        [HttpGet("Facultad"), Authorize(Policy = "/aca-facultades|R")] public Task<CResult> Facultad(int CORR_FACULTAD) => service.Facultad(Empresa, CORR_FACULTAD);
        [HttpGet("Costos"), Authorize(Policy = "/aca-carreras|R")] public Task<CResult> Costos(int CORR_CARRERA) => service.Costos(Empresa, CORR_CARRERA);
        [HttpPost("Costos"), Authorize(Policy = "/aca-carreras|C")] public Task<IActionResult> Post(sguees.Models.ACA_CostoInput d) => Save(d, false);
        [HttpPut("Costos"), Authorize(Policy = "/aca-carreras|U")] public Task<IActionResult> Put(sguees.Models.ACA_CostoInput d) => Save(d, true);
        private async Task<IActionResult> Save(sguees.Models.ACA_CostoInput d, bool update) { if (d == null || (update ? d.CORR_COSTO <= 0 : d.CORR_COSTO != 0)) return BadRequest(new CResult { ErrorCode = 51000, ErrorMessage = "Identificador de costo inválido." }); var r = await service.GuardarCosto(Empresa, d, User.FindFirstValue(ClaimTypes.NameIdentifier), ClientInfoHelper.GetClientStation(HttpContext)); return r.Result ? Ok(r) : BadRequest(r); }
    }
}
