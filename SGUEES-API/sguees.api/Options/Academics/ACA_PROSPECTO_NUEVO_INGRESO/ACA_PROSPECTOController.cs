using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Linq;
using eFramework.Core;
using sguees.Models;
using sguees.Services;
using System.Security.Claims;
using sguees.api.Shared;

namespace sguees.Controllers
{
    // Qué hace: encabezado de la solicitud de nuevo ingreso.
    // Cómo lo hace: lee y actualiza ACA_PROSPECTO. Los lookups de catálogo viven en el controlador origen, con Get{CAMPO}_ACA_PROSPECTO_NUEVO_INGRESO.
    [Authorize]
    [Route("[controller]")]
    [ApiController]

    public class ACA_PROSPECTOController : ControllerBase
    {
        private readonly IACA_PROSPECTOService _service;

        public ACA_PROSPECTOController(IACA_PROSPECTOService service)
        {
            _service = service ?? throw new ArgumentNullException(nameof(_service));
        }

        [HttpGet("GetAll")]
        [Authorize(Policy = "/aca-prospecto-nuevo-ingreso|R")]
        public async Task<CResult> GetAll([FromQuery] ACA_PROSPECTOParam Data)
        {
            Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
            return await _service.GetAllAsync(Data);
        }

        [HttpGet("Get")]
        [Authorize(Policy = "/aca-prospecto-nuevo-ingreso|R")]
        public async Task<CResult> Get([FromQuery] ACA_PROSPECTOParam Data)
        {
            Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
            return await _service.GetAsync(Data);
        }

        // Qué hace: actualiza los datos editables del encabezado (forma de ingreso y quién financia).
        // Cómo lo hace: toma CORR_PROSPECTO del body o del query, completa auditoría y llama a UpdateAsync.
        //               ESTADO y los campos de proceso no se tocan: pertenecen a la migración a estudiante.
        // Qué hace: carreras que el prospecto puede elegir en su ciclo (cambio de carrera desde el ERP).
        // Cómo lo hace: misma oferta que el formulario del aspirante, más la condición de plan vigente.
        [HttpGet("GetCORR_CARRERA_ACA_PROSPECTO_NUEVO_INGRESO")]
        [Authorize(Policy = "/aca-prospecto-nuevo-ingreso|R")]
        public async Task<CResult> GetCORR_CARRERA_ACA_PROSPECTO_NUEVO_INGRESO([FromQuery] ACA_PROSPECTOParam Data)
        {
            Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
            return await _service.GetCORR_CARRERA_ACA_PROSPECTOAsync(Data);
        }

        // Qué hace: modalidades con plan vigente de la carrera elegida.
        [HttpGet("GetCORR_MODALIDAD_ACA_PROSPECTO_NUEVO_INGRESO")]
        [Authorize(Policy = "/aca-prospecto-nuevo-ingreso|R")]
        public async Task<CResult> GetCORR_MODALIDAD_ACA_PROSPECTO_NUEVO_INGRESO([FromQuery] ACA_PROSPECTOParam Data)
        {
            Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
            return await _service.GetCORR_MODALIDAD_ACA_PROSPECTOAsync(Data);
        }

        // Qué hace: ciclos a los que se puede mover el prospecto (combo "Ciclo" del encabezado).
        [HttpGet("GetCICLO_ACA_PROSPECTO_NUEVO_INGRESO")]
        [Authorize(Policy = "/aca-prospecto-nuevo-ingreso|R")]
        public async Task<CResult> GetCICLO_ACA_PROSPECTO_NUEVO_INGRESO([FromQuery] ACA_PROSPECTOParam Data)
        {
            Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
            return await _service.GetCICLO_ACA_PROSPECTOAsync(Data);
        }

        // Qué hace: consecuencias de cambiar ciclo/carrera antes de guardar (beca a clonar, reapertura).
        // Cómo lo hace: ACA_SP_CAMBIAR_CICLO_PROSPECTO con @SOLO_VALIDAR = 1: no escribe nada.
        [HttpGet("GetVALIDAR_CAMBIO_ACA_PROSPECTO_NUEVO_INGRESO")]
        [Authorize(Policy = "/aca-prospecto-nuevo-ingreso|U")]
        public async Task<CResult> GetVALIDAR_CAMBIO_ACA_PROSPECTO_NUEVO_INGRESO([FromQuery] ACA_PROSPECTOParam Data)
        {
            Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
            return await _service.GetVALIDAR_CAMBIO_ACA_PROSPECTOAsync(Data);
        }

        // Qué hace: dice si el usuario de la sesión puede aprobar la solicitud que tiene abierta.
        [HttpGet("GetPuedeAprobar")]
        [Authorize(Policy = "/aca-prospecto-nuevo-ingreso|R")]
        public async Task<CResult> GetPuedeAprobar([FromQuery] ACA_PROSPECTOParam Data)
        {
            Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
            return await _service.GetPuedeAprobarAsync(Data, GetUsuario(), GetPermisoOpcion());
        }

        // Qué hace: aprueba la solicitud. El SP solo avanza si este login es el ejecutor del paso.
        // Cómo lo hace: en falla de negocio responde 200 con Result=false, igual que el descriptor.
        [HttpPut("Aprobar")]
        [Authorize(Policy = "/aca-prospecto-nuevo-ingreso|U")]
        public async Task<IActionResult> Aprobar(ACA_PROSPECTOParam Data)
        {
            Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
            var resultado = await _service.AccionFlujoAsync(Data, GetUsuario(), Data.OBSERVACION, ClientInfoHelper.GetClientStation(HttpContext), 3);
            return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : Ok(resultado);
        }

        // Qué hace: rechaza la solicitud si este login ejecuta el paso actual.
        [HttpPut("Rechazar")]
        [Authorize(Policy = "/aca-prospecto-nuevo-ingreso|U")]
        public async Task<IActionResult> Rechazar(ACA_PROSPECTOParam Data)
        {
            Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
            var resultado = await _service.AccionFlujoAsync(Data, GetUsuario(), Data.OBSERVACION, ClientInfoHelper.GetClientStation(HttpContext), 4);
            return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : Ok(resultado);
        }

        // Qué hace: revierte una solicitud aprobada a Ingresado, en la misma instancia.
        [HttpPut("Revertir")]
        [Authorize(Policy = "/aca-prospecto-nuevo-ingreso|U")]
        public async Task<IActionResult> Revertir(ACA_PROSPECTOParam Data)
        {
            Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
            var resultado = await _service.AccionFlujoAsync(Data, GetUsuario(), Data.OBSERVACION, ClientInfoHelper.GetClientStation(HttpContext), 5);
            return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : Ok(resultado);
        }

        [HttpPut]
        [Authorize(Policy = "/aca-prospecto-nuevo-ingreso|U")]
        public async Task<IActionResult> Put(ACA_PROSPECTOTable Data)
        {
            this.ApplyQueryKeys(Data, nameof(ACA_PROSPECTOTable.CORR_PROSPECTO));
            SetUpdateAudit(Data);

            var resultado = await _service.UpdateAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
            return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
        }

        private string GetUsuario()
        {
            return User.Claims.ToList().SingleOrDefault(e => e.Type == ClaimTypes.NameIdentifier)?.Value;
        }

        // Qué hace: permiso CRUDP de esta pantalla en el token.
        private string GetPermisoOpcion()
        {
            return User.Claims.FirstOrDefault(c => c.Type == "/aca-prospecto-nuevo-ingreso")?.Value ?? string.Empty;
        }

        private void SetUpdateAudit(ACA_PROSPECTOTable Data)
        {
            Data.USUARIO_ACTU = GetUsuario();
            Data.ESTACION_ACTU = ClientInfoHelper.GetClientStation(HttpContext);
            Data.FECHA_ACTU = DateTime.Now;
        }
    }
}
