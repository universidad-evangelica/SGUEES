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
    public class SC_RESPONSABILIDAD_CARGOController : ControllerBase
    {
        private readonly ISC_RESPONSABILIDAD_CARGOService _service;

        public SC_RESPONSABILIDAD_CARGOController(ISC_RESPONSABILIDAD_CARGOService service)
        {
            _service = service ?? throw new ArgumentNullException(nameof(_service));
        }

        [HttpGet("GetAll")]
        [Authorize(Policy = "/sc-responsabilidad-cargo|R")]
        public async Task<CResult> GetAll([FromQuery] SC_RESPONSABILIDAD_CARGOParam Data)
        {
            Data.CORR_EMPRESA = GetCorrEmpresa();
            return await _service.GetAllAsync(Data);
        }

        [HttpGet("Get")]
        [Authorize(Policy = "/sc-responsabilidad-cargo|R")]
        public async Task<CResult> Get([FromQuery] SC_RESPONSABILIDAD_CARGOParam Data)
        {
            Data.CORR_EMPRESA = GetCorrEmpresa();
            return await _service.GetAsync(Data);
        }

        [HttpGet("GetCORR_RESPONSABILIDAD_SC_DESCRIPTOR_PUESTO")]
        [Authorize(Policy = "/sc-descriptor-puesto|R")]
        // Provee responsabilidades activas para el descriptor.
        public async Task<CResult> GetCORR_RESPONSABILIDAD_SC_DESCRIPTOR_PUESTO([FromQuery] SC_RESPONSABILIDAD_CARGOParam Data)
        {
            Data.CORR_EMPRESA = GetCorrEmpresa();
            return await _service.GetCatalogoDescriptorAsync(Data);
        }

        [HttpPost]
        [Authorize(Policy = "/sc-responsabilidad-cargo|C")]
        // Completa auditoría antes de crear la responsabilidad.
        public async Task<IActionResult> Post(SC_RESPONSABILIDAD_CARGOTable Data)
        {
            SetCreateAudit(Data);

            var resultado = await _service.CreateAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
            return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
        }

        [HttpPut]
        [Authorize(Policy = "/sc-responsabilidad-cargo|U")]
        // Aplica la llave consultada y la auditoría antes de actualizar.
        public async Task<IActionResult> Put(SC_RESPONSABILIDAD_CARGOTable Data)
        {
            this.ApplyQueryKeys(Data, nameof(SC_RESPONSABILIDAD_CARGOTable.CORR_RESPONSABILIDAD));
            SetUpdateAudit(Data);

            var resultado = await _service.UpdateAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
            return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
        }

        [HttpDelete]
        [Authorize(Policy = "/sc-responsabilidad-cargo|D")]
        public async Task<IActionResult> Delete([FromQuery] SC_RESPONSABILIDAD_CARGOTable Data)
        {
            Data.CORR_EMPRESA = GetCorrEmpresa();

            var resultado = await _service.DeleteAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
            return resultado.ErrorCode == 0 ? Ok(resultado) : BadRequest(resultado);
        }

        [HttpPut("ActivarInactivar")]
        [Authorize(Policy = "/sc-responsabilidad-cargo|U")]
        public async Task<IActionResult> ActivarInactivar(SC_RESPONSABILIDAD_CARGOTable Data)
        {
            this.ApplyQueryKeys(Data, nameof(SC_RESPONSABILIDAD_CARGOTable.CORR_RESPONSABILIDAD));
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
        private void SetCreateAudit(SC_RESPONSABILIDAD_CARGOTable Data)
        {
            Data.CORR_EMPRESA = GetCorrEmpresa();
            Data.USUARIO_CREA = GetUsuario();
            Data.ESTACION_CREA = ClientInfoHelper.GetClientStation(HttpContext);
            Data.FECHA_CREA = DateTime.Now;
            Data.USUARIO_ACTU = Data.USUARIO_CREA;
            Data.ESTACION_ACTU = Data.ESTACION_CREA;
            Data.FECHA_ACTU = Data.FECHA_CREA;
            Data.ESTADO_RESPONSABILIDAD ??= true;
        }

        // Actualiza auditoría sin reemplazar la información de creación.
        private void SetUpdateAudit(SC_RESPONSABILIDAD_CARGOTable Data)
        {
            Data.CORR_EMPRESA = GetCorrEmpresa();
            Data.USUARIO_ACTU = GetUsuario();
            Data.ESTACION_ACTU = ClientInfoHelper.GetClientStation(HttpContext);
            Data.FECHA_ACTU = DateTime.Now;
            if (!Data.ESTADO_RESPONSABILIDAD.HasValue)
            {
                Data.ESTADO_RESPONSABILIDAD = true;
            }
        }
    }
}

