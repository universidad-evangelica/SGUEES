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
    // Qué hace: encabezado de la solicitud de beca.
    // Consulta las solicitudes y ejecuta el flujo mediante el servicio de aplicación.
    // Cuestionario y archivos tienen su propio controlador.
    [Authorize]
    [Route("[controller]")]
    [ApiController]
    public class ACA_PROSPECTO_BECAController : ControllerBase
    {
        private readonly IACA_PROSPECTO_BECAService _service;

        public ACA_PROSPECTO_BECAController(IACA_PROSPECTO_BECAService service)
        {
            _service = service ?? throw new ArgumentNullException(nameof(service));
        }

        [HttpGet("GetAll")]
        [Authorize(Policy = "/aca-prospecto-beca|R")]
        public async Task<CResult> GetAll([FromQuery] ACA_PROSPECTO_BECAParam Data)
        {
            Data.CORR_EMPRESA = Empresa();
            return await _service.GetAllAsync(Data);
        }

        [HttpGet("Get")]
        [Authorize(Policy = "/aca-prospecto-beca|R")]
        public async Task<CResult> Get([FromQuery] ACA_PROSPECTO_BECAParam Data)
        {
            Data.CORR_EMPRESA = Empresa();
            return await _service.GetAsync(Data);
        }

        [HttpPost]
        [Authorize(Policy = "/aca-prospecto-beca|C")]
        public async Task<IActionResult> Post(ACA_PROSPECTO_BECATable Data)
        {
            Data.CORR_EMPRESA = Empresa();
            var resultado = await _service.CreateAsync(Data, Usuario(), ClientInfoHelper.GetClientStation(HttpContext));
            return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
        }

        [HttpPut]
        [Authorize(Policy = "/aca-prospecto-beca|U")]
        public async Task<IActionResult> Put(ACA_PROSPECTO_BECATable Data)
        {
            var resultado = await _service.UpdateAsync(Data, Usuario(), ClientInfoHelper.GetClientStation(HttpContext));
            return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
        }

        [HttpDelete]
        [Authorize(Policy = "/aca-prospecto-beca|D")]
        public async Task<IActionResult> Delete(ACA_PROSPECTO_BECATable Data)
        {
            var resultado = await _service.DeleteAsync(Data, Usuario(), ClientInfoHelper.GetClientStation(HttpContext));
            return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
        }

        private int Empresa()
        {
            return int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
        }

        [HttpGet("GetFlujo")]
        [Authorize(Policy = "/aca-prospecto-beca|R")]
        public Task<CResult> GetFlujo([FromQuery]int CORR_PROSPECTO_BECA) => _service.GetFlujoAsync(Empresa(),CORR_PROSPECTO_BECA,Usuario());

        [HttpGet("GetBitacoraFlujo")]
        [Authorize(Policy = "/aca-prospecto-beca|R")]
        public Task<CResult> GetBitacoraFlujo([FromQuery]int CORR_PROSPECTO_BECA) => _service.GetBitacoraFlujoAsync(Empresa(),CORR_PROSPECTO_BECA);

        [HttpGet("GetBitacora")]
        [Authorize(Policy = "/aca-prospecto-beca|R")]
        public Task<CResult> GetBitacora([FromQuery]int CORR_PROSPECTO_BECA) => _service.GetBitacoraEdicionAsync(Empresa(),CORR_PROSPECTO_BECA);

        [HttpPost("IniciarRevision")]
        [Authorize(Policy = "/aca-prospecto-beca|U")]
        public Task<IActionResult> IniciarRevision(BecaSolicitudResolucion data) => Resolver(data,"INICIAR");

        [HttpPost("Otorgar")]
        [Authorize(Policy = "/aca-prospecto-beca|U")]
        public Task<IActionResult> Otorgar(BecaSolicitudResolucion data) => Resolver(data,"OTORGAR");

        [HttpPost("NoOtorgar")]
        [Authorize(Policy = "/aca-prospecto-beca|U")]
        public Task<IActionResult> NoOtorgar(BecaSolicitudResolucion data) => Resolver(data,"NO_OTORGAR");

        private async Task<IActionResult> Resolver(BecaSolicitudResolucion data, string operacion)
        {
            var result=await _service.AccionFlujoAsync(Empresa(),data,operacion,Usuario(),ClientInfoHelper.GetClientStation(HttpContext));
            return result.Result ? Ok(result) : BadRequest(result);
        }

        private string Usuario()
        {
            return User.FindFirstValue(ClaimTypes.NameIdentifier) ?? string.Empty;
        }
    }
}
