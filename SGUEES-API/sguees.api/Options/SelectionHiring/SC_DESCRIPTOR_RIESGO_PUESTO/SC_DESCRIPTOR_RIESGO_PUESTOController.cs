using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using eFramework.Core;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SGUEES.Models;
using SGUEES.Services;

namespace SGUEES.Controllers
{
    [Authorize]
    [ApiController]
    [Route("[controller]")]
    public class SC_DESCRIPTOR_RIESGO_PUESTOController : ControllerBase
    {
        private readonly ISC_DESCRIPTOR_RIESGO_PUESTOService _service;

        public SC_DESCRIPTOR_RIESGO_PUESTOController(ISC_DESCRIPTOR_RIESGO_PUESTOService service)
        {
            _service = service ?? throw new ArgumentNullException(nameof(_service));
        }

        [HttpGet("GetAll")]
        [Authorize(Policy = "/sc-descriptor-riesgo-puesto|R")]
        public async Task<CResult> GetAll([FromQuery] SC_DESCRIPTOR_RIESGO_PUESTOParam Data)
        {
            Data.CORR_EMPRESA = GetCorrEmpresa();
            return await _service.GetAllAsync(Data);
        }

        [HttpGet("Get")]
        [Authorize(Policy = "/sc-descriptor-riesgo-puesto|R")]
        public async Task<CResult> Get([FromQuery] SC_DESCRIPTOR_RIESGO_PUESTOParam Data)
        {
            Data.CORR_EMPRESA = GetCorrEmpresa();
            return await _service.GetAsync(Data);
        }

        [HttpPost]
        [Authorize(Policy = "/sc-descriptor-riesgo-puesto|C")]
        public async Task<IActionResult> Post(SC_DESCRIPTOR_RIESGO_PUESTOTable Data)
        {
            SetCreateAudit(Data);

            var resultado = await _service.CreateAsync(Data, Data.ESTACION_CREA, "e-CoffeeTech");
            return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
        }

        [HttpPut]
        [Authorize(Policy = "/sc-descriptor-riesgo-puesto|U")]
        public async Task<IActionResult> Put(SC_DESCRIPTOR_RIESGO_PUESTOTable Data)
        {
            SetUpdateAudit(Data);

            var resultado = await _service.UpdateAsync(Data, "Admin", "e-CoffeeTech");
            return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
        }

        [HttpDelete]
        [Authorize(Policy = "/sc-descriptor-riesgo-puesto|D")]
        public async Task<IActionResult> Delete([FromQuery] SC_DESCRIPTOR_RIESGO_PUESTOTable Data)
        {
            SetUpdateAudit(Data);

            var resultado = await _service.DeleteAsync(Data, "Admin", "e-CoffeeTech");
            return resultado.ErrorCode == 0 ? Ok(resultado) : BadRequest(resultado);
        }

        [HttpPut("Activar")]
        [Authorize(Policy = "/sc-descriptor-riesgo-puesto|U")]
        public async Task<IActionResult> Activar(SC_DESCRIPTOR_RIESGO_PUESTOTable Data)
        {
            SetUpdateAudit(Data);
            Data.ESTADO_RIESGO_PUESTO = true;

            var resultado = await _service.UpdateAsync(Data, "Admin", "e-CoffeeTech");
            return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
        }

        [HttpPut("Desactivar")]
        [Authorize(Policy = "/sc-descriptor-riesgo-puesto|D")]
        public async Task<IActionResult> Desactivar(SC_DESCRIPTOR_RIESGO_PUESTOTable Data)
        {
            SetUpdateAudit(Data);

            var resultado = await _service.DesactivarAsync(Data, "Admin", "e-CoffeeTech");
            return resultado.ErrorCode == 0 ? Ok(resultado) : BadRequest(resultado);
        }

        private int GetCorrEmpresa()
        {
            return int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
        }

        private string GetUsuario()
        {
            return User.Claims.ToList().SingleOrDefault(e => e.Type == ClaimTypes.NameIdentifier).Value;
        }

        private void SetCreateAudit(SC_DESCRIPTOR_RIESGO_PUESTOTable Data)
        {
            Data.CORR_EMPRESA = GetCorrEmpresa();
            Data.USUARIO_CREA = GetUsuario();
            Data.ESTACION_CREA = Data.USUARIO_CREA;
            Data.FECHA_CREA = DateTime.Now;
            Data.USUARIO_ACTU = Data.USUARIO_CREA;
            Data.ESTACION_ACTU = Data.ESTACION_CREA;
            Data.FECHA_ACTU = Data.FECHA_CREA;
            Data.ESTADO_RIESGO_PUESTO ??= true;
        }

        private void SetUpdateAudit(SC_DESCRIPTOR_RIESGO_PUESTOTable Data)
        {
            Data.CORR_EMPRESA = GetCorrEmpresa();
            Data.USUARIO_ACTU = GetUsuario();
            Data.ESTACION_ACTU = Data.USUARIO_ACTU;
            Data.FECHA_ACTU = DateTime.Now;
            if (!Data.ESTADO_RIESGO_PUESTO.HasValue)
            {
                Data.ESTADO_RIESGO_PUESTO = true;
            }
        }
    }
}
