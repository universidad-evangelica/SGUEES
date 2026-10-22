using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using eFramework.Core;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using sguees.api.Policies;
using sguees.api.Shared;
using sguees.Models;
using sguees.Services;

namespace sguees.Controllers
{
    [Authorize]
    [ApiController]
    [Route("[controller]")]
    public class ACA_CARRERASController : ControllerBase
    {
        private readonly IACA_CARRERASService _service;
        public ACA_CARRERASController(IACA_CARRERASService service) { _service = service; }
        private int Empresa => int.TryParse(User.FindFirstValue("CORR_EMPRESA"), out var id) ? id : 0;
        private string Usuario => User.FindFirstValue(ClaimTypes.NameIdentifier);
        private string Estacion => ClientInfoHelper.GetClientStation(HttpContext);

        [HttpGet("GetAll")]
        [Authorize(Policy = "/aca-carreras|R")]
        public Task<CResult> GetAll([FromQuery] ACA_CARRERASParam data)
        {
            data.CORR_EMPRESA = Empresa;
            return _service.GetAllAsync(data);
        }
        [HttpGet("Get")]
        [Authorize(Policy = "/aca-carreras|R")]
        public Task<CResult> Get([FromQuery] ACA_CARRERASParam data)
        {
            data.CORR_EMPRESA = Empresa;
            return _service.GetAsync(data);
        }
        [HttpPost]
        [Authorize(Policy = "/aca-carreras|C")]
        public async Task<IActionResult> Post(ACA_CARRERASTable data)
        {
            data.CORR_EMPRESA = Empresa;
            var result = await _service.CreateAsync(data, Usuario, Estacion);
            return result.Result ? StatusCode(201, result) : BadRequest(result);
        }
        [HttpPut]
        [Authorize(Policy = "/aca-carreras|U")]
        public async Task<IActionResult> Put(ACA_CARRERASTable data)
        {
            this.ApplyQueryKeys(data, nameof(ACA_CARRERASTable.CORR_CARRERA));
            data.CORR_EMPRESA = Empresa;
            var result = await _service.UpdateAsync(data, Usuario, Estacion);
            return result.Result ? Ok(result) : BadRequest(result);
        }
        [HttpDelete]
        [Authorize(Policy = "/aca-carreras|D")]
        public async Task<IActionResult> Delete([FromQuery] ACA_CARRERASTable data)
        {
            data.CORR_EMPRESA = Empresa;
            var result = await _service.DeleteAsync(data, Usuario, Estacion);
            return result.Result ? Ok(result) : BadRequest(result);
        }
        [HttpPut("ActivarInactivar")]
        [Authorize(Policy = "/aca-carreras|U")]
        public async Task<IActionResult> ActivarInactivar(ACA_CARRERASTable data)
        {
            this.ApplyQueryKeys(data, nameof(ACA_CARRERASTable.CORR_CARRERA));
            data.CORR_EMPRESA = Empresa;
            var result = await _service.ActivarInactivarAsync(data, Usuario, Estacion);
            return result.Result ? Ok(result) : BadRequest(result);
        }

        [HttpGet("GetCORR_CARRERA_ACA_PROSPECTO")]
        [Authorize(Policy = PermisosProspecto.LecturaAmbos)]
        public Task<CResult> GetCORR_CARRERA_ACA_PROSPECTO([FromQuery] ACA_CARRERASParam data)
        {
            data.CORR_EMPRESA = Empresa;
            return _service.GetCORR_CARRERA_ACA_PROSPECTOAsync(data);
        }
    }
}
