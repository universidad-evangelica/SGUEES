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

        [HttpGet("GetDistinctValues")]
        [Authorize(Policy = "/pla-tipo-puesto|R")]
        public async Task<CResult> GetDistinctValues([FromQuery] PLA_TIPO_PUESTOParam Data)
        {
            Data.CORR_EMPRESA = GetCorrEmpresa();
            return await _service.GetDistinctValuesAsync(Data);
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
            if (!ValidateEmpresaSesion(out var resultadoEmpresa))
                return BadRequest(resultadoEmpresa);

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
            if (!ValidateEmpresaSesion(out var resultadoEmpresa))
                return BadRequest(resultadoEmpresa);

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
            if (!ValidateEmpresaSesion(out var resultadoEmpresa))
                return BadRequest(resultadoEmpresa);

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
            if (!ValidateEmpresaSesion(out var resultadoEmpresa))
                return BadRequest(resultadoEmpresa);

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
            if (!ValidateEmpresaSesion(out var resultadoEmpresa))
                return BadRequest(resultadoEmpresa);

            SetUpdateAudit(Data);

            var resultado = await _service.DesactivarAsync(Data, "Admin", "e-CoffeeTech");
            return resultado.ErrorCode == 0
                ? Ok(resultado)
                : BadRequest(resultado);
        }

        private int GetCorrEmpresa()
        {
            var claim = User.Claims.FirstOrDefault(e => e.Type == "CORR_EMPRESA");
            return claim != null && int.TryParse(claim.Value, out var corrEmpresa) ? corrEmpresa : 0;
        }

        private bool ValidateEmpresaSesion(out CResult resultado)
        {
            if (GetCorrEmpresa() > 0)
            {
                resultado = null;
                return true;
            }

            resultado = new CResult
            {
                Data = null,
                Result = false,
                CodeHelper = 0,
                ErrorCode = 4100,
                ErrorMessage = "No se pudo guardar el tipo de puesto porque su usuario no tiene una empresa asignada. Solicite que le configuren una empresa por defecto en el sistema.",
                ErrorSource = "[PLA_TIPO_PUESTOController]",
                RowsAffected = 0
            };

            return false;
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
