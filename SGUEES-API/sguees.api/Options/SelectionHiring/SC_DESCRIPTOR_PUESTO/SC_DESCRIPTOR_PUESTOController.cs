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
    public class SC_DESCRIPTOR_PUESTOController : ControllerBase
    {
        private readonly ISC_DESCRIPTOR_PUESTOService _service;

        public SC_DESCRIPTOR_PUESTOController(ISC_DESCRIPTOR_PUESTOService service)
        {
            _service = service ?? throw new ArgumentNullException(nameof(_service));
        }

        // Obtiene el listado de descriptor de puesto aplicando los filtros recibidos.
        [HttpGet("GetAll")]
        [Authorize(Policy = "/sc-descriptor-puesto|R")]
        public async Task<CResult> GetAll([FromQuery] SC_DESCRIPTOR_PUESTOParam Data)
        {
            Data.CORR_EMPRESA = GetCorrEmpresa();
            return await _service.GetAllAsync(Data);
        }

        // Obtiene un registro de descriptor de puesto con los identificadores recibidos.
        [HttpGet("Get")]
        [Authorize(Policy = "/sc-descriptor-puesto|R")]
        public async Task<CResult> Get([FromQuery] SC_DESCRIPTOR_PUESTOParam Data)
        {
            Data.CORR_EMPRESA = GetCorrEmpresa();
            return await _service.GetAsync(Data);
        }

        // Crea un registro de descriptor de puesto con la auditoría de la sesión.
        [HttpPost]
        [Authorize(Policy = "/sc-descriptor-puesto|C")]
        public async Task<IActionResult> Post(SC_DESCRIPTOR_PUESTOTable Data)
        {
            // Completa auditoría de creación y empresa de sesión.
            SetCreateAudit(Data);

            var resultado = await _service.CreateAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
            return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
        }

        // Actualiza el registro de descriptor de puesto y su auditoría de modificación.
        [HttpPut]
        [Authorize(Policy = "/sc-descriptor-puesto|U")]
        public async Task<IActionResult> Put(SC_DESCRIPTOR_PUESTOTable Data)
        {
            // Aplica la llave primaria recibida por query string.
            this.ApplyQueryKeys(Data, nameof(SC_DESCRIPTOR_PUESTOTable.CORR_DESCRIPTOR_PUESTO));
            // Actualiza auditoría de modificación y empresa de sesión.
            SetUpdateAudit(Data);

            var resultado = await _service.UpdateAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
            return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
        }

        // Actualiza los datos de entrenamiento del descriptor con auditoría de sesión.
        [HttpPut("ActualizarEntrenamiento")]
        [Authorize(Policy = "/sc-descriptor-puesto|U")]
        public async Task<IActionResult> ActualizarEntrenamiento(SC_DESCRIPTOR_PUESTOTable Data)
        {
            if (Data != null)
            {
                // Aplica la llave primaria recibida por query string.
                this.ApplyQueryKeys(Data, nameof(SC_DESCRIPTOR_PUESTOTable.CORR_DESCRIPTOR_PUESTO));
                Data.CORR_EMPRESA = GetCorrEmpresa();
                // Actualiza auditoría de modificación y empresa de sesión.
                SetUpdateAudit(Data);
            }

            var resultado = await _service.ActualizarEntrenamientoAsync(
                Data,
                GetUsuario(),
                ClientInfoHelper.GetClientStation(HttpContext));
            return resultado.ErrorCode == 0 ? Ok(resultado) : BadRequest(resultado);
        }

        // Elimina el registro de descriptor de puesto solicitado para la empresa de la sesión.
        [HttpDelete]
        [Authorize(Policy = "/sc-descriptor-puesto|D")]
        public async Task<IActionResult> Delete([FromQuery] SC_DESCRIPTOR_PUESTOTable Data)
        {
            Data.CORR_EMPRESA = GetCorrEmpresa();

            var resultado = await _service.DeleteAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
            return resultado.ErrorCode == 0 ? Ok(resultado) : BadRequest(resultado);
        }

        // Lee CORR_EMPRESA del claim de la sesión autenticada.

        private int GetCorrEmpresa()
        {
            var claim = User.Claims.FirstOrDefault(e => e.Type == "CORR_EMPRESA");
            return claim != null && int.TryParse(claim.Value, out var corrEmpresa) ? corrEmpresa : 0;
        }

        // Obtiene el identificador de usuario desde los claims.

        private string GetUsuario()
        {
            return User.Claims.ToList().SingleOrDefault(e => e.Type == ClaimTypes.NameIdentifier).Value;
        }

        // Completa los datos de auditoría requeridos para una creación.
        private void SetCreateAudit(SC_DESCRIPTOR_PUESTOTable Data)
        {
            Data.CORR_EMPRESA = GetCorrEmpresa();
            Data.USUARIO_CREA = GetUsuario();
            Data.ESTACION_CREA = ClientInfoHelper.GetClientStation(HttpContext);
            Data.FECHA_CREA = DateTime.Now;
            Data.USUARIO_ACTU = Data.USUARIO_CREA;
            Data.ESTACION_ACTU = Data.ESTACION_CREA;
            Data.FECHA_ACTU = Data.FECHA_CREA;
            Data.ESTADO_DESCRIPTOR ??= "BORRADOR";
            Data.VERSION ??= 1;
        }

        // Completa los datos de auditoría requeridos para una actualización.
        private void SetUpdateAudit(SC_DESCRIPTOR_PUESTOTable Data)
        {
            Data.CORR_EMPRESA = GetCorrEmpresa();
            Data.USUARIO_ACTU = GetUsuario();
            Data.ESTACION_ACTU = ClientInfoHelper.GetClientStation(HttpContext);
            Data.FECHA_ACTU = DateTime.Now;
            if (string.IsNullOrWhiteSpace(Data.ESTADO_DESCRIPTOR))
            {
                Data.ESTADO_DESCRIPTOR = "BORRADOR";
            }
        }
    }
}
