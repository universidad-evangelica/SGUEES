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

        // Lista todos los descriptores de puesto de la empresa en sesión; pasa los filtros del query al servicio.
        [HttpGet("GetAll")]
        [Authorize(Policy = "/sc-descriptor-puesto|R")]
        public async Task<CResult> GetAll([FromQuery] SC_DESCRIPTOR_PUESTOParam Data)
        {
            Data.CORR_EMPRESA = GetCorrEmpresa();
            return await _service.GetAllAsync(Data);
        }

        // Obtiene un descriptor por CORR_DESCRIPTOR_PUESTO y empresa de sesión.
        [HttpGet("Get")]
        [Authorize(Policy = "/sc-descriptor-puesto|R")]
        public async Task<CResult> Get([FromQuery] SC_DESCRIPTOR_PUESTOParam Data)
        {
            Data.CORR_EMPRESA = GetCorrEmpresa();
            return await _service.GetAsync(Data);
        }

        // Crea un descriptor nuevo; rellena auditoría de sesión y delega al servicio.
        [HttpPost]
        [Authorize(Policy = "/sc-descriptor-puesto|C")]
        public async Task<IActionResult> Post(SC_DESCRIPTOR_PUESTOTable Data)
        {
            // Rellena usuario, estación, fechas y empresa antes de guardar.
            SetCreateAudit(Data);

            var resultado = await _service.CreateAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
            return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
        }

        // Actualiza un descriptor existente; toma la PK del query string y actualiza auditoría.
        [HttpPut]
        [Authorize(Policy = "/sc-descriptor-puesto|U")]
        public async Task<IActionResult> Put(SC_DESCRIPTOR_PUESTOTable Data)
        {
            // Copia CORR_DESCRIPTOR_PUESTO desde la URL al cuerpo del request.
            this.ApplyQueryKeys(Data, nameof(SC_DESCRIPTOR_PUESTOTable.CORR_DESCRIPTOR_PUESTO));
            // Rellena usuario, estación y fecha de modificación.
            SetUpdateAudit(Data);

            var resultado = await _service.UpdateAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
            return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
        }

        // Guarda el entrenamiento del descriptor (inducción, semanas, responsable) con auditoría de sesión.
        [HttpPut("ActualizarEntrenamiento")]
        [Authorize(Policy = "/sc-descriptor-puesto|U")]
        public async Task<IActionResult> ActualizarEntrenamiento(SC_DESCRIPTOR_PUESTOTable Data)
        {
            if (Data != null)
            {
                // Copia CORR_DESCRIPTOR_PUESTO desde la URL al cuerpo del request.
                this.ApplyQueryKeys(Data, nameof(SC_DESCRIPTOR_PUESTOTable.CORR_DESCRIPTOR_PUESTO));
                Data.CORR_EMPRESA = GetCorrEmpresa();
                // Rellena usuario, estación y fecha de modificación.
                SetUpdateAudit(Data);
            }

            var resultado = await _service.ActualizarEntrenamientoAsync(
                Data,
                GetUsuario(),
                ClientInfoHelper.GetClientStation(HttpContext));
            return resultado.ErrorCode == 0 ? Ok(resultado) : BadRequest(resultado);
        }

        // Elimina un descriptor de la empresa en sesión; borra también sus registros hijos.
        [HttpDelete]
        [Authorize(Policy = "/sc-descriptor-puesto|D")]
        public async Task<IActionResult> Delete([FromQuery] SC_DESCRIPTOR_PUESTOTable Data)
        {
            Data.CORR_EMPRESA = GetCorrEmpresa();

            var resultado = await _service.DeleteAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
            return resultado.ErrorCode == 0 ? Ok(resultado) : BadRequest(resultado);
        }

        // Lee CORR_EMPRESA del token JWT del usuario autenticado.

        private int GetCorrEmpresa()
        {
            var claim = User.Claims.FirstOrDefault(e => e.Type == "CORR_EMPRESA");
            return claim != null && int.TryParse(claim.Value, out var corrEmpresa) ? corrEmpresa : 0;
        }

        // Lee el login del usuario desde el claim NameIdentifier.

        private string GetUsuario()
        {
            return User.Claims.ToList().SingleOrDefault(e => e.Type == ClaimTypes.NameIdentifier).Value;
        }

        // Rellena auditoría al crear: empresa, usuario, estación, fechas y valores por defecto (BORRADOR, versión 1).
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

        // Rellena auditoría al modificar: empresa, usuario, estación, fecha y estado BORRADOR si viene vacío.
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
