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
    public class SC_INDUCCIONController : ControllerBase
    {
        private readonly ISC_INDUCCIONService _service;

        public SC_INDUCCIONController(ISC_INDUCCIONService service)
        {
            _service = service ?? throw new ArgumentNullException(nameof(_service));
        }

        [HttpGet("GetAll")]
        [Authorize(Policy = "/sc-induccion|R")]
        public async Task<CResult> GetAll([FromQuery] SC_INDUCCIONParam Data)
        {
            Data.CORR_EMPRESA = GetCorrEmpresa();
            return await _service.GetAllAsync(Data);
        }

        [HttpGet("GetDistinctValues")]
        [Authorize(Policy = "/sc-induccion|R")]
        public async Task<CResult> GetDistinctValues([FromQuery] SC_INDUCCIONParam Data)
        {
            Data.CORR_EMPRESA = GetCorrEmpresa();
            return await _service.GetDistinctValuesAsync(Data);
        }

        [HttpGet("Get")]
        [Authorize(Policy = "/sc-induccion|R")]
        public async Task<CResult> Get([FromQuery] SC_INDUCCIONParam Data)
        {
            Data.CORR_EMPRESA = GetCorrEmpresa();
            return await _service.GetAsync(Data);
        }

        [HttpPost]
        [Authorize(Policy = "/sc-induccion|C")]
        public async Task<IActionResult> Post(SC_INDUCCIONTable Data)
        {
            if (!ValidateEmpresaSesion(out var resultadoEmpresa))
                return BadRequest(resultadoEmpresa);

            SetCreateAudit(Data);

            var resultado = await _service.CreateAsync(Data, Data.ESTACION_CREA, "e-CoffeeTech");
            return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
        }

        [HttpPut]
        [Authorize(Policy = "/sc-induccion|U")]
        public async Task<IActionResult> Put(SC_INDUCCIONTable Data)
        {
            if (!ValidateEmpresaSesion(out var resultadoEmpresa))
                return BadRequest(resultadoEmpresa);

            SetUpdateAudit(Data);

            var resultado = await _service.UpdateAsync(Data, "Admin", "e-CoffeeTech");
            return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
        }

        [HttpDelete]
        [Authorize(Policy = "/sc-induccion|D")]
        public async Task<IActionResult> Delete([FromQuery] SC_INDUCCIONTable Data)
        {
            if (!ValidateEmpresaSesion(out var resultadoEmpresa))
                return BadRequest(resultadoEmpresa);

            SetUpdateAudit(Data);

            var resultado = await _service.DeleteAsync(Data, "Admin", "e-CoffeeTech");
            return resultado.ErrorCode == 0 ? Ok(resultado) : BadRequest(resultado);
        }

        [HttpPut("Activar")]
        [Authorize(Policy = "/sc-induccion|U")]
        public async Task<IActionResult> Activar(SC_INDUCCIONTable Data)
        {
            if (!ValidateEmpresaSesion(out var resultadoEmpresa))
                return BadRequest(resultadoEmpresa);

            SetUpdateAudit(Data);
            Data.ESTADO_INDUCCION = true;

            var resultado = await _service.UpdateAsync(Data, "Admin", "e-CoffeeTech");
            return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
        }

        [HttpPut("Desactivar")]
        [Authorize(Policy = "/sc-induccion|U")]
        public async Task<IActionResult> Desactivar(SC_INDUCCIONTable Data)
        {
            if (!ValidateEmpresaSesion(out var resultadoEmpresa))
                return BadRequest(resultadoEmpresa);

            SetUpdateAudit(Data);

            var resultado = await _service.DesactivarAsync(Data, "Admin", "e-CoffeeTech");
            return resultado.ErrorCode == 0 ? Ok(resultado) : BadRequest(resultado);
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
                ErrorMessage = "No se pudo guardar la inducción porque su usuario no tiene una empresa asignada. Solicite que le configuren una empresa por defecto en el sistema.",
                ErrorSource = "[SC_INDUCCIONController]",
                RowsAffected = 0
            };

            return false;
        }

        private string GetUsuario()
        {
            return User.Claims.ToList().SingleOrDefault(e => e.Type == ClaimTypes.NameIdentifier).Value;
        }

        private void SetCreateAudit(SC_INDUCCIONTable Data)
        {
            Data.CORR_EMPRESA = GetCorrEmpresa();
            Data.USUARIO_CREA = GetUsuario();
            Data.ESTACION_CREA = ClientInfoHelper.GetClientStation(HttpContext);
            Data.FECHA_CREA = DateTime.Now;
            Data.USUARIO_ACTU = Data.USUARIO_CREA;
            Data.ESTACION_ACTU = Data.ESTACION_CREA;
            Data.FECHA_ACTU = Data.FECHA_CREA;
            Data.ESTADO_INDUCCION ??= true;
        }

        private void SetUpdateAudit(SC_INDUCCIONTable Data)
        {
            Data.CORR_EMPRESA = GetCorrEmpresa();
            Data.USUARIO_ACTU = GetUsuario();
            Data.ESTACION_ACTU = ClientInfoHelper.GetClientStation(HttpContext);
            Data.FECHA_ACTU = DateTime.Now;
            if (!Data.ESTADO_INDUCCION.HasValue)
            {
                Data.ESTADO_INDUCCION = true;
            }
        }
    }
}
