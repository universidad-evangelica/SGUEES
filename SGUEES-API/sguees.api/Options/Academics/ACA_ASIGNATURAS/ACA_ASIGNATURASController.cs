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
    public class ACA_ASIGNATURASController : ControllerBase
    {
        private readonly IACA_ASIGNATURASService service;
        public ACA_ASIGNATURASController(IACA_ASIGNATURASService service) { this.service = service; }
        private int Empresa => int.TryParse(User.FindFirstValue("CORR_EMPRESA"), out var empresa) ? empresa : 0;
        private string Usuario => User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.Identity?.Name;

        [HttpGet("GetAll"), Authorize(Policy = "/aca-asignaturas|R")]
        public Task<CResult> GetAll([FromQuery] ACA_ASIGNATURASParam data)
        {
            data.CORR_EMPRESA = Empresa;
            return service.GetAllAsync(data);
        }

        [HttpPost, Authorize(Policy = "/aca-asignaturas|C")]
        public Task<IActionResult> Post([FromBody] ACA_ASIGNATURASTable data) => Save(data, false);

        [HttpPut, Authorize(Policy = "/aca-asignaturas|U")]
        public Task<IActionResult> Put([FromBody] ACA_ASIGNATURASTable data) => Save(data, true);

        private async Task<IActionResult> Save(ACA_ASIGNATURASTable data, bool update)
        {
            if (data == null) return BadRequest(new CResult { ErrorCode = 51000, ErrorMessage = "No se recibieron datos." });
            data.CORR_EMPRESA = Empresa;
            var result = await service.GuardarAsync(data, update, Usuario, ClientInfoHelper.GetClientStation(HttpContext));
            return result.Result ? Ok(result) : BadRequest(result);
        }

        [HttpGet("Carreras"), Authorize(Policy = "/aca-asignaturas|R")]
        public Task<CResult> Carreras() => service.Carreras(Empresa);

        [HttpGet("Practicas"), Authorize(Policy = "/aca-asignaturas|R")]
        public Task<CResult> MateriasPractica(int CORR_FACULTAD, int CORR_CARRERA) => service.MateriasPractica(Empresa, CORR_FACULTAD, CORR_CARRERA);

        [HttpPut("Practicas"), Authorize(Policy = "/aca-asignaturas|U")]
        public async Task<IActionResult> AsignarPractica([FromBody] ACA_ASIGNATURAS_PRACTICAInput data)
        {
            var result = await service.AsignarPractica(Empresa, data, Usuario, ClientInfoHelper.GetClientStation(HttpContext));
            return result.Result ? Ok(result) : BadRequest(result);
        }

        [HttpGet("Planes"), Authorize(Policy = "/aca-asignaturas|R")]
        public Task<CResult> Planes(int CORR_ASIGNATURA) => service.Planes(Empresa, CORR_ASIGNATURA);

        [HttpPut("Planes"), Authorize(Policy = "/aca-asignaturas|U")]
        public async Task<IActionResult> Planes([FromBody] ACA_ASIGNATURAS_PLANInput data)
        {
            var result = await service.GuardarPlan(Empresa, data, Usuario, ClientInfoHelper.GetClientStation(HttpContext));
            return result.Result ? Ok(result) : BadRequest(result);
        }

    }
}
