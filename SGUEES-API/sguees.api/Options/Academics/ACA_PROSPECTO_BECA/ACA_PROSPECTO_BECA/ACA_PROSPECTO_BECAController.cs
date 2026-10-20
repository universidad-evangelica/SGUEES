using System;
using System.Linq;
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
    // Cómo lo hace: muestra, inserta, actualiza y elimina ACA_PROSPECTO_BECA.
    //               Cuestionario y archivos tienen su propio controlador.
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

        private string Usuario()
        {
            var nombre = User?.Identity?.Name;
            if (string.IsNullOrWhiteSpace(nombre))
                nombre = "SGUEES";
            return nombre.Length > 30 ? nombre.Substring(0, 30) : nombre;
        }
    }
}
