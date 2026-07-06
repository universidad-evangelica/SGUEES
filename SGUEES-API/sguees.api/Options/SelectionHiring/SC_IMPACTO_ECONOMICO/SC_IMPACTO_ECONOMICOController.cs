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
    public class SC_IMPACTO_ECONOMICOController : ControllerBase
    {
        private readonly ISC_IMPACTO_ECONOMICOService _service;

        public SC_IMPACTO_ECONOMICOController(ISC_IMPACTO_ECONOMICOService service)
        {
            _service = service ?? throw new ArgumentNullException(nameof(_service));
        }

        [HttpGet("GetAll")]
        [Authorize(Policy = "/sc-impacto-economico|R")]
        public async Task<CResult> GetAll([FromQuery] SC_IMPACTO_ECONOMICOParam Data)
        {
            Data.CORR_EMPRESA = GetCorrEmpresa();
            return await _service.GetAllAsync(Data);
        }

        [HttpGet("Get")]
        [Authorize(Policy = "/sc-impacto-economico|R")]
        public async Task<CResult> Get([FromQuery] SC_IMPACTO_ECONOMICOParam Data)
        {
            Data.CORR_EMPRESA = GetCorrEmpresa();
            return await _service.GetAsync(Data);
        }

        [HttpPost]
        [Authorize(Policy = "/sc-impacto-economico|C")]
        public async Task<IActionResult> Post(SC_IMPACTO_ECONOMICOTable Data)
        {
            SetCreateAudit(Data);

            var resultado = await _service.CreateAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
            return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
        }

        [HttpPut]
        [Authorize(Policy = "/sc-impacto-economico|U")]
        public async Task<IActionResult> Put(SC_IMPACTO_ECONOMICOTable Data)
        {
            ApplyPrimaryKeyFromQuery(Data);
            SetUpdateAudit(Data);

            var resultado = await _service.UpdateAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
            return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
        }

        [HttpDelete]
        [Authorize(Policy = "/sc-impacto-economico|D")]
        public async Task<IActionResult> Delete([FromQuery] SC_IMPACTO_ECONOMICOTable Data)
        {
            Data.CORR_EMPRESA = GetCorrEmpresa();

            var resultado = await _service.DeleteAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
            return resultado.ErrorCode == 0 ? Ok(resultado) : BadRequest(resultado);
        }

        [HttpPut("Activar")]
        [Authorize(Policy = "/sc-impacto-economico|U")]
        public async Task<IActionResult> Activar(SC_IMPACTO_ECONOMICOTable Data)
        {
            ApplyPrimaryKeyFromQuery(Data);
            SetUpdateAudit(Data);
            Data.ESTADO_IMPACTO_ECONOMICO = true;

            var resultado = await _service.UpdateAsync(Data, Data.USUARIO_ACTU, Data.ESTACION_ACTU);
            return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
        }

        [HttpPut("Desactivar")]
        [Authorize(Policy = "/sc-impacto-economico|U")]
        public async Task<IActionResult> Desactivar(SC_IMPACTO_ECONOMICOTable Data)
        {
            ApplyPrimaryKeyFromQuery(Data);
            SetUpdateAudit(Data);

            var resultado = await _service.DesactivarAsync(Data, Data.USUARIO_ACTU, Data.ESTACION_ACTU);
            return resultado.ErrorCode == 0 ? Ok(resultado) : BadRequest(resultado);
        }

        private int GetCorrEmpresa()
        {
            var claim = User.Claims.FirstOrDefault(e => e.Type == "CORR_EMPRESA");
            return claim != null && int.TryParse(claim.Value, out var corrEmpresa) ? corrEmpresa : 0;
        }

        private string GetUsuario()
        {
            return User.Claims.ToList().SingleOrDefault(e => e.Type == ClaimTypes.NameIdentifier).Value;
        }

        private void SetCreateAudit(SC_IMPACTO_ECONOMICOTable Data)
        {
            Data.CORR_EMPRESA = GetCorrEmpresa();
            Data.USUARIO_CREA = GetUsuario();
            Data.ESTACION_CREA = ClientInfoHelper.GetClientStation(HttpContext);
            Data.FECHA_CREA = DateTime.Now;
            Data.USUARIO_ACTU = Data.USUARIO_CREA;
            Data.ESTACION_ACTU = Data.ESTACION_CREA;
            Data.FECHA_ACTU = Data.FECHA_CREA;
            Data.ESTADO_IMPACTO_ECONOMICO ??= true;
        }

        private void SetUpdateAudit(SC_IMPACTO_ECONOMICOTable Data)
        {
            Data.CORR_EMPRESA = GetCorrEmpresa();
            Data.USUARIO_ACTU = GetUsuario();
            Data.ESTACION_ACTU = ClientInfoHelper.GetClientStation(HttpContext);
            Data.FECHA_ACTU = DateTime.Now;
            if (!Data.ESTADO_IMPACTO_ECONOMICO.HasValue)
            {
                Data.ESTADO_IMPACTO_ECONOMICO = true;
            }
        }

        private void ApplyPrimaryKeyFromQuery(SC_IMPACTO_ECONOMICOTable Data)
        {
            if (Data.CORR_IMPACTO_ECONOMICO > 0)
            {
                return;
            }

            if (int.TryParse(Request.Query["CORR_IMPACTO_ECONOMICO"], out var corr))
            {
                Data.CORR_IMPACTO_ECONOMICO = corr;
            }
        }
    }
}
