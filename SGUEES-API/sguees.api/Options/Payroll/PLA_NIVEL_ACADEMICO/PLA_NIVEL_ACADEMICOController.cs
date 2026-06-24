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
    public class PLA_NIVEL_ACADEMICOController : ControllerBase
    {
        private readonly IPLA_NIVEL_ACADEMICOService _service;

        public PLA_NIVEL_ACADEMICOController(IPLA_NIVEL_ACADEMICOService service)
        {
            _service = service ?? throw new ArgumentNullException(nameof(_service));
        }

        [HttpGet("GetAll")]
        [Authorize(Policy = "/pla-nivel-academico|R")]
        public async Task<CResult> GetAll([FromQuery] PLA_NIVEL_ACADEMICOParam Data)
        {
            Data.CORR_EMPRESA = GetCorrEmpresa();
            return await _service.GetAllAsync(Data);
        }

        [HttpGet("Get")]
        [Authorize(Policy = "/pla-nivel-academico|R")]
        public async Task<CResult> Get([FromQuery] PLA_NIVEL_ACADEMICOParam Data)
        {
            Data.CORR_EMPRESA = GetCorrEmpresa();
            return await _service.GetAsync(Data);
        }

        [HttpPost]
        [Authorize(Policy = "/pla-nivel-academico|C")]
        public async Task<IActionResult> Post(PLA_NIVEL_ACADEMICOTable Data)
        {
            SetCreateAudit(Data);

            var resultado = await _service.CreateAsync(Data, Data.ESTACION_CREA, "e-CoffeeTech");
            return resultado.ErrorCode == 0
                ? StatusCode(201, resultado)
                : BadRequest(resultado);
        }

        [HttpPut]
        [Authorize(Policy = "/pla-nivel-academico|U")]
        public async Task<IActionResult> Put(PLA_NIVEL_ACADEMICOTable Data)
        {
            SetUpdateAudit(Data);

            var resultado = await _service.UpdateAsync(Data, "Admin", "e-CoffeeTech");
            return resultado.ErrorCode == 0
                ? StatusCode(201, resultado)
                : BadRequest(resultado);
        }

        [HttpDelete]
        [Authorize(Policy = "/pla-nivel-academico|D")]
        public async Task<IActionResult> Delete([FromQuery] PLA_NIVEL_ACADEMICOTable Data)
        {
            SetUpdateAudit(Data);

            var resultado = await _service.DeleteAsync(Data, "Admin", "e-CoffeeTech");
            return resultado.ErrorCode == 0
                ? Ok(resultado)
                : BadRequest(resultado);
        }

        [HttpPut("Activar")]
        [Authorize(Policy = "/pla-nivel-academico|U")]
        public async Task<IActionResult> Activar(PLA_NIVEL_ACADEMICOTable Data)
        {
            SetUpdateAudit(Data);
            Data.ESTADO_NIVEL_ACADEMICO = true;

            var resultado = await _service.UpdateAsync(Data, "Admin", "e-CoffeeTech");
            return resultado.ErrorCode == 0
                ? StatusCode(201, resultado)
                : BadRequest(resultado);
        }

        [HttpPut("Desactivar")]
        [Authorize(Policy = "/pla-nivel-academico|U")]
        public async Task<IActionResult> Desactivar(PLA_NIVEL_ACADEMICOTable Data)
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

        private void SetCreateAudit(PLA_NIVEL_ACADEMICOTable Data)
        {
            Data.CORR_EMPRESA = GetCorrEmpresa();
            Data.USUARIO_CREA = GetUsuario();
            Data.FECHA_CREA = DateTime.Now;
            Data.ESTACION_CREA = ClientInfoHelper.GetClientStation(HttpContext);
            Data.USUARIO_ACTU = Data.USUARIO_CREA;
            Data.FECHA_ACTU = Data.FECHA_CREA;
            Data.ESTACION_ACTU = Data.ESTACION_CREA;
            Data.ESTADO_NIVEL_ACADEMICO ??= true;
        }

        private void SetUpdateAudit(PLA_NIVEL_ACADEMICOTable Data)
        {
            Data.CORR_EMPRESA = GetCorrEmpresa();
            Data.USUARIO_ACTU = GetUsuario();
            Data.FECHA_ACTU = DateTime.Now;
            Data.ESTACION_ACTU = ClientInfoHelper.GetClientStation(HttpContext);
            if (!Data.ESTADO_NIVEL_ACADEMICO.HasValue)
            {
                Data.ESTADO_NIVEL_ACADEMICO = true;
            }
        }
    }
}
