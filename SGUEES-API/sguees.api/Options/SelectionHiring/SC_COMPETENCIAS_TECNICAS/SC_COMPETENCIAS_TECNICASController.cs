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
    public class SC_COMPETENCIAS_TECNICASController : ControllerBase
    {
        private readonly ISC_COMPETENCIAS_TECNICASService _service;

        public SC_COMPETENCIAS_TECNICASController(ISC_COMPETENCIAS_TECNICASService service)
        {
            _service = service ?? throw new ArgumentNullException(nameof(service));
        }

        [HttpGet("GetAll")]
        [Authorize(Policy = "/sc-competencias-tecnicas|R")]
        public async Task<CResult> GetAll([FromQuery] SC_COMPETENCIAS_TECNICASParam Data)
        {
            Data.CORR_EMPRESA = GetCorrEmpresa();
            return await _service.GetAllAsync(Data);
        }

        [HttpGet("Get")]
        [Authorize(Policy = "/sc-competencias-tecnicas|R")]
        public async Task<CResult> Get([FromQuery] SC_COMPETENCIAS_TECNICASParam Data)
        {
            Data.CORR_EMPRESA = GetCorrEmpresa();
            return await _service.GetAsync(Data);
        }

        [HttpGet("GetPadres")]
        [Authorize(Policy = "/sc-competencias-tecnicas|R")]
        public async Task<CResult> GetPadres([FromQuery] SC_COMPETENCIAS_TECNICASParam Data)
        {
            Data.CORR_EMPRESA = GetCorrEmpresa();
            return await _service.GetPadresAsync(Data);
        }

        [HttpGet("GetNextCodigo")]
        [Authorize(Policy = "/sc-competencias-tecnicas|R")]
        public async Task<CResult> GetNextCodigo([FromQuery] SC_COMPETENCIAS_TECNICASParam Data)
        {
            Data.CORR_EMPRESA = GetCorrEmpresa();
            return await _service.GetNextCodigoAsync(Data);
        }

        [HttpPost]
        [Authorize(Policy = "/sc-competencias-tecnicas|C")]
        public async Task<IActionResult> Post(SC_COMPETENCIAS_TECNICASTable Data)
        {
            SetCreateAudit(Data);

            var resultado = await _service.CreateAsync(Data, Data.ESTACION_CREA, "e-CoffeeTech");
            return resultado.ErrorCode == 0
                ? StatusCode(201, resultado)
                : BadRequest(resultado);
        }

        [HttpPut]
        [Authorize(Policy = "/sc-competencias-tecnicas|U")]
        public async Task<IActionResult> Put(SC_COMPETENCIAS_TECNICASTable Data)
        {
            SetUpdateAudit(Data);

            var resultado = await _service.UpdateAsync(Data, "Admin", "e-CoffeeTech");
            return resultado.ErrorCode == 0
                ? StatusCode(201, resultado)
                : BadRequest(resultado);
        }

        [HttpDelete]
        [Authorize(Policy = "/sc-competencias-tecnicas|D")]
        public async Task<IActionResult> Delete([FromQuery] SC_COMPETENCIAS_TECNICASTable Data)
        {
            SetUpdateAudit(Data);

            var resultado = await _service.DeleteAsync(Data, "Admin", "e-CoffeeTech");
            return resultado.ErrorCode == 0
                ? Ok(resultado)
                : BadRequest(resultado);
        }

        [HttpPut("Activar")]
        [Authorize(Policy = "/sc-competencias-tecnicas|U")]
        public async Task<IActionResult> Activar(SC_COMPETENCIAS_TECNICASTable Data)
        {
            SetUpdateAudit(Data);
            Data.ESTADO_COMPETENCIAS_TECNICAS = true;

            var resultado = await _service.UpdateAsync(Data, "Admin", "e-CoffeeTech");
            return resultado.ErrorCode == 0
                ? StatusCode(201, resultado)
                : BadRequest(resultado);
        }

        [HttpPut("Desactivar")]
        [Authorize(Policy = "/sc-competencias-tecnicas|U")]
        public async Task<IActionResult> Desactivar(SC_COMPETENCIAS_TECNICASTable Data)
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

        private void SetCreateAudit(SC_COMPETENCIAS_TECNICASTable Data)
        {
            Data.CORR_EMPRESA = GetCorrEmpresa();
            Data.USUARIO_CREA = GetUsuario();
            Data.ESTACION_CREA = ClientInfoHelper.GetClientStation(HttpContext);
            Data.FECHA_CREA = DateTime.Now;
            Data.USUARIO_ACTU = Data.USUARIO_CREA;
            Data.ESTACION_ACTU = Data.ESTACION_CREA;
            Data.FECHA_ACTU = Data.FECHA_CREA;
            Data.ESTADO_COMPETENCIAS_TECNICAS ??= true;
        }

        private void SetUpdateAudit(SC_COMPETENCIAS_TECNICASTable Data)
        {
            Data.CORR_EMPRESA = GetCorrEmpresa();
            Data.USUARIO_ACTU = GetUsuario();
            Data.ESTACION_ACTU = ClientInfoHelper.GetClientStation(HttpContext);
            Data.FECHA_ACTU = DateTime.Now;
            if (!Data.ESTADO_COMPETENCIAS_TECNICAS.HasValue)
            {
                Data.ESTADO_COMPETENCIAS_TECNICAS = true;
            }
        }
    }
}
