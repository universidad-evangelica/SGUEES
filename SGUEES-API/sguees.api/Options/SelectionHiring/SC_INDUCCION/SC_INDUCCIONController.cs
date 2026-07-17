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

        [HttpGet("GetCORR_INDUCCION_SC_DESCRIPTOR_PUESTO")]
        [Authorize(Policy = "/sc-descriptor-puesto|R")]
        // Provee inducciones activas para el descriptor.
        public async Task<CResult> GetCORR_INDUCCION_SC_DESCRIPTOR_PUESTO(
            [FromQuery] SC_INDUCCIONParam Data)
        {
            Data.CORR_EMPRESA = GetCorrEmpresa();
            return await _service.GetCatalogoDescriptorAsync(Data);
        }

        [HttpGet("GetAll")]
        [Authorize(Policy = "/sc-induccion|R")]
        public async Task<CResult> GetAll([FromQuery] SC_INDUCCIONParam Data)
        {
            Data.CORR_EMPRESA = GetCorrEmpresa();
            return await _service.GetAllAsync(Data);
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
        // Completa auditoría antes de crear la inducción.
        public async Task<IActionResult> Post(SC_INDUCCIONTable Data)
        {
            SetCreateAudit(Data);

            var resultado = await _service.CreateAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
            return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
        }

        [HttpPut]
        [Authorize(Policy = "/sc-induccion|U")]
        // Aplica la llave consultada y la auditoría antes de actualizar.
        public async Task<IActionResult> Put(SC_INDUCCIONTable Data)
        {
            this.ApplyQueryKeys(Data, nameof(SC_INDUCCIONTable.CORR_INDUCCION));
            SetUpdateAudit(Data);

            var resultado = await _service.UpdateAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
            return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
        }

        [HttpDelete]
        [Authorize(Policy = "/sc-induccion|D")]
        public async Task<IActionResult> Delete([FromQuery] SC_INDUCCIONTable Data)
        {
            Data.CORR_EMPRESA = GetCorrEmpresa();

            var resultado = await _service.DeleteAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
            return resultado.ErrorCode == 0 ? Ok(resultado) : BadRequest(resultado);
        }

        [HttpPut("ActivarInactivar")]
        [Authorize(Policy = "/sc-induccion|U")]
        public async Task<IActionResult> ActivarInactivar(SC_INDUCCIONTable Data)
        {
            this.ApplyQueryKeys(Data, nameof(SC_INDUCCIONTable.CORR_INDUCCION));
            Data.CORR_EMPRESA = GetCorrEmpresa();

            var resultado = await _service.ActivarInactivarAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
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

        // Completa empresa, usuario, estación y fechas del registro nuevo.
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

        // Actualiza auditoría sin reemplazar la información de creación.
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
