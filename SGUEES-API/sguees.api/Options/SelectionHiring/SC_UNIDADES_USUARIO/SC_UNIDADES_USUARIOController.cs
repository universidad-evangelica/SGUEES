// Qué hace: endpoints REST de unidades asignadas directamente a usuarios.
// Cómo: expone consulta, creación, eliminación y operaciones masivas con políticas específicas.
using System;
using System.Collections.Generic;
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
    public class SC_UNIDADES_USUARIOController : ControllerBase
    {
        private readonly ISC_UNIDADES_USUARIOService _service;

        public SC_UNIDADES_USUARIOController(ISC_UNIDADES_USUARIOService service)
        {
            _service = service ?? throw new ArgumentNullException(nameof(service));
        }

        // Qué hace: lista asignaciones de unidades a usuarios.
        // Cómo: fija la empresa de sesión y delega en GetAllAsync.
        [HttpGet("GetAll")]
        [Authorize(Policy = "/sc-unidades-usuario|R")]
        public async Task<CResult> GetAll([FromQuery] SC_UNIDADES_USUARIOParam Data)
        {
            Data.CORR_EMPRESA = GetCorrEmpresa();
            return await _service.GetAllAsync(Data);
        }

        // Qué hace: obtiene una asignación específica.
        // Cómo: fija la empresa y consulta el servicio con la llave recibida.
        [HttpGet("Get")]
        [Authorize(Policy = "/sc-unidades-usuario|R")]
        public async Task<CResult> Get([FromQuery] SC_UNIDADES_USUARIOParam Data)
        {
            Data.CORR_EMPRESA = GetCorrEmpresa();
            return await _service.GetAsync(Data);
        }

        // Qué hace: crea una asignación unidad-usuario.
        // Cómo: completa auditoría y devuelve HTTP 201 cuando el servicio finaliza correctamente.
        [HttpPost]
        [Authorize(Policy = "/sc-unidades-usuario|C")]
        public async Task<IActionResult> Post(SC_UNIDADES_USUARIOTable Data)
        {
            SetCreateAudit(Data);
            var result = await _service.CreateAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
            return result.ErrorCode == 0 ? StatusCode(201, result) : BadRequest(result);
        }

        // Qué hace: asigna al usuario todas las unidades activas.
        // Cómo: completa auditoría y ejecuta el INSERT masivo del servicio.
        [HttpPost("AsignarTodasUnidades")]
        [Authorize(Policy = "/sc-unidades-usuario|C")]
        public async Task<IActionResult> AsignarTodasUnidades(SC_UNIDADES_USUARIOTable Data)
        {
            SetCreateAudit(Data);
            var result = await _service.AsignarTodasUnidadesAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
            return result.ErrorCode == 0 ? Ok(result) : BadRequest(result);
        }

        // Qué hace: quita todas las unidades asignadas al usuario.
        // Cómo: fija empresa de sesión y ejecuta el DELETE masivo del servicio.
        [HttpPost("QuitarTodasUnidades")]
        [Authorize(Policy = "/sc-unidades-usuario|D")]
        public async Task<IActionResult> QuitarTodasUnidades(SC_UNIDADES_USUARIOTable Data)
        {
            Data.CORR_EMPRESA = GetCorrEmpresa();
            var result = await _service.QuitarTodasUnidadesAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
            return result.ErrorCode == 0 ? Ok(result) : BadRequest(result);
        }

        // Qué hace: elimina una asignación individual.
        // Cómo: fija empresa y delega el borrado de la PK compuesta al servicio.
        [HttpDelete]
        [Authorize(Policy = "/sc-unidades-usuario|D")]
        public async Task<IActionResult> Delete([FromQuery] SC_UNIDADES_USUARIOTable Data)
        {
            Data.CORR_EMPRESA = GetCorrEmpresa();
            var result = await _service.DeleteAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
            return result.ErrorCode == 0 ? Ok(result) : BadRequest(result);
        }

        // Qué hace: entrega las unidades efectivas del usuario de sesión para el lookup del descriptor.
        // Cómo: fija CORR_EMPRESA y LOGIN_SISTEMA del token y ejecuta PRAL_DATA_SC_UNIDADES_USUARIO.
        [HttpGet("GetCORR_UNIDAD_SC_DESCRIPTOR_PUESTO")]
        [Authorize(Policy = "/sc-descriptor-puesto|R")]
        public async Task<CResult> GetCORR_UNIDAD_SC_DESCRIPTOR_PUESTO([FromQuery] SC_UNIDADES_USUARIOParam Data)
        {
            Data.CORR_EMPRESA = GetCorrEmpresa();
            Data.LOGIN_SISTEMA = GetUsuario();
            return await _service.GetUnidadesUsuarioAsync(Data);
        }

        // Qué hace: unidades del usuario de sesión para sc-requisicion-personal (cascada unidad→puesto→descriptor).
        // Cómo: reutiliza PRAL_DATA_SC_UNIDADES_USUARIO; endpoint nuevo con permiso de la pantalla consumidora.
        [HttpGet("GetCORR_UNIDAD_SC_REQUISICION_PERSONAL")]
        [Authorize(Policy = "/sc-requisicion-personal|R")]
        public async Task<CResult> GetCORR_UNIDAD_SC_REQUISICION_PERSONAL([FromQuery] SC_UNIDADES_USUARIOParam Data)
        {
            Data.CORR_EMPRESA = GetCorrEmpresa();
            Data.LOGIN_SISTEMA = GetUsuario();
            return await _service.GetUnidadesUsuarioAsync(Data);
        }

        // Qué hace: obtiene CORR_EMPRESA del usuario autenticado.
        // Cómo: busca el claim y retorna cero si no puede convertirlo.
        private int GetCorrEmpresa()
        {
            var claim = User.Claims.FirstOrDefault(e => e.Type == "CORR_EMPRESA");
            return claim != null && int.TryParse(claim.Value, out var corrEmpresa) ? corrEmpresa : 0;
        }

        // Qué hace: obtiene el login del usuario autenticado.
        // Cómo: lee el claim NameIdentifier.
        private string GetUsuario() =>
            User.Claims.FirstOrDefault(e => e.Type == ClaimTypes.NameIdentifier)?.Value ?? string.Empty;

        // Qué hace: completa empresa y auditoría para inserciones.
        // Cómo: usa claims, estación cliente y fecha actual para ambos grupos de auditoría.
        private void SetCreateAudit(SC_UNIDADES_USUARIOTable Data)
        {
            Data.CORR_EMPRESA = GetCorrEmpresa();
            Data.USUARIO_CREA = GetUsuario();
            Data.ESTACION_CREA = ClientInfoHelper.GetClientStation(HttpContext);
            Data.FECHA_CREA = DateTime.Now;
            Data.USUARIO_ACTU = Data.USUARIO_CREA;
            Data.ESTACION_ACTU = Data.ESTACION_CREA;
            Data.FECHA_ACTU = Data.FECHA_CREA;
        }
    }
}
