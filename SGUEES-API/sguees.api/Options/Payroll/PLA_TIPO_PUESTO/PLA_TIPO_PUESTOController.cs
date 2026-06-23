using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using eFramework.Core;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using sguees.api.Shared;
using SGUEES.Models;
using SGUEES.Services;

namespace SGUEES.Controllers
{
    [Authorize]
    [ApiController]
    [Route("[controller]")]
    public class PLA_TIPO_PUESTOController : ControllerBase
    {
        private readonly IPLA_TIPO_PUESTOService _service;

        public PLA_TIPO_PUESTOController(IPLA_TIPO_PUESTOService service)
        {
            _service = service ?? throw new ArgumentNullException(nameof(_service));
        }

        [HttpGet("GetAll")]
        [Authorize(Policy = "/pla-tipo-puesto|R")]
        public async Task<CResult> GetAll([FromQuery] PLA_TIPO_PUESTOParam Data)
        {
            Data.CORR_EMPRESA = GetCorrEmpresa();
            return await _service.GetAllAsync(Data);
        }

        [HttpGet("Get")]
        [Authorize(Policy = "/pla-tipo-puesto|R")]
        public async Task<CResult> Get([FromQuery] PLA_TIPO_PUESTOParam Data)
        {
            Data.CORR_EMPRESA = GetCorrEmpresa();
            return await _service.GetAsync(Data);
        }

        [HttpPost]
        [Authorize(Policy = "/pla-tipo-puesto|C")]
        public async Task<IActionResult> Post(PLA_TIPO_PUESTOTable Data)
        {
            SetCreateAudit(Data);

            var resultado = await _service.CreateAsync(Data, Data.ESTACION_CREA, "e-CoffeeTech");
            return resultado.ErrorCode == 0
                ? StatusCode(201, resultado)
                : BadRequest(resultado);
        }

        [HttpPut]
        [Authorize(Policy = "/pla-tipo-puesto|U")]
        public async Task<IActionResult> Put(PLA_TIPO_PUESTOTable Data)
        {
            SetUpdateAudit(Data);

            var resultado = await _service.UpdateAsync(Data, "Admin", "e-CoffeeTech");
            return resultado.ErrorCode == 0
                ? StatusCode(201, resultado)
                : BadRequest(resultado);
        }

        [HttpDelete]
        [Authorize(Policy = "/pla-tipo-puesto|D")]
        public async Task<IActionResult> Delete([FromQuery] PLA_TIPO_PUESTOTable Data)
        {
            SetUpdateAudit(Data);

            var resultado = await _service.DeleteAsync(Data, "Admin", "e-CoffeeTech");
            return resultado.ErrorCode == 0
                ? Ok(resultado)
                : BadRequest(resultado);
        }

        [HttpPut("Activar")]
        [Authorize(Policy = "/pla-tipo-puesto|U")]
        public async Task<IActionResult> Activar(PLA_TIPO_PUESTOTable Data)
        {
            SetUpdateAudit(Data);
            Data.ESTADO_TIPO_PUESTO = true;

            var resultado = await _service.UpdateAsync(Data, "Admin", "e-CoffeeTech");
            return resultado.ErrorCode == 0
                ? StatusCode(201, resultado)
                : BadRequest(resultado);
        }

        [HttpPut("Desactivar")]
        [Authorize(Policy = "/pla-tipo-puesto|U")]
        public async Task<IActionResult> Desactivar(PLA_TIPO_PUESTOTable Data)
        {
            SetUpdateAudit(Data);

            var resultado = await _service.DesactivarAsync(Data, "Admin", "e-CoffeeTech");
            return resultado.ErrorCode == 0
                ? Ok(resultado)
                : BadRequest(resultado);
        }

        private int GetCorrEmpresa()
        {
            return int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
        }

        private string GetUsuario()
        {
            return User.Claims.ToList().SingleOrDefault(e => e.Type == ClaimTypes.NameIdentifier).Value;
        }

        private void SetCreateAudit(PLA_TIPO_PUESTOTable Data)
        {
            Data.CORR_EMPRESA = GetCorrEmpresa();
            Data.USUARIO_CREA = GetUsuario();
            Data.FECHA_CREA = DateTime.Now;
            Data.ESTACION_CREA = ClientInfoHelper.GetClientStation(HttpContext);
            Data.USUARIO_ACTU = Data.USUARIO_CREA;
            Data.FECHA_ACTU = Data.FECHA_CREA;
            Data.ESTACION_ACTU = Data.ESTACION_CREA;
            Data.ESTADO_TIPO_PUESTO ??= true;
        }

        private void SetUpdateAudit(PLA_TIPO_PUESTOTable Data)
        {
            Data.CORR_EMPRESA = GetCorrEmpresa();
            Data.USUARIO_ACTU = GetUsuario();
            Data.FECHA_ACTU = DateTime.Now;
            Data.ESTACION_ACTU = ClientInfoHelper.GetClientStation(HttpContext);
            if (!Data.ESTADO_TIPO_PUESTO.HasValue)
            {
                Data.ESTADO_TIPO_PUESTO = true;
            }
        }
    }
}
