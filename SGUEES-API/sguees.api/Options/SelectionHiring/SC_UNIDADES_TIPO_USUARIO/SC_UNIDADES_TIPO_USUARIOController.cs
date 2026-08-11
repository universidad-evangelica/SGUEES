// Qué hace: endpoints REST de unidades asignadas por tipo de usuario (tabla intermedia).
// Cómo: expone GetAll, Get, Post, Delete y ActivarInactivar, llamando a ISC_UNIDADES_TIPO_USUARIOService.
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
    // Qué hace: controlador de unidades por tipo de usuario.
    // Cómo: expone el CRUD y ActivarInactivar de la asignación unidad-rol, cada acción protegida con Authorize por política.
    public class SC_UNIDADES_TIPO_USUARIOController : ControllerBase
    {
        private readonly ISC_UNIDADES_TIPO_USUARIOService _service;

        public SC_UNIDADES_TIPO_USUARIOController(ISC_UNIDADES_TIPO_USUARIOService service)
        {
            _service = service ?? throw new ArgumentNullException(nameof(service));
        }

        [HttpGet("GetAll")]
        [Authorize(Policy = "/sc-unidades-tipo-usuario|R")]
        // Qué hace: lista las unidades asignadas a roles.
        // Cómo: fija CORR_EMPRESA de la sesión y llama a GetAllAsync del servicio (filtra por TIPO_USUARIO si viene).
        public async Task<CResult> GetAll([FromQuery] SC_UNIDADES_TIPO_USUARIOParam Data)
        {
            Data.CORR_EMPRESA = GetCorrEmpresa();
            return await _service.GetAllAsync(Data);
        }

        [HttpGet("Get")]
        [Authorize(Policy = "/sc-unidades-tipo-usuario|R")]
        // Qué hace: obtiene una asignación unidad-rol específica.
        // Cómo: fija CORR_EMPRESA de la sesión y llama a GetAsync del servicio.
        public async Task<CResult> Get([FromQuery] SC_UNIDADES_TIPO_USUARIOParam Data)
        {
            Data.CORR_EMPRESA = GetCorrEmpresa();
            return await _service.GetAsync(Data);
        }

        [HttpPost]
        [Authorize(Policy = "/sc-unidades-tipo-usuario|C")]
        // Qué hace: crea una asignación de unidad a un tipo de usuario.
        // Cómo: completa auditoría con SetCreateAudit y llama a CreateAsync del servicio.
        public async Task<IActionResult> Post(SC_UNIDADES_TIPO_USUARIOTable Data)
        {
            SetCreateAudit(Data);

            var resultado = await _service.CreateAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
            return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
        }

        [HttpPost("AsignarTodasUnidades")]
        [Authorize(Policy = "/sc-unidades-tipo-usuario|C")]
        // Qué hace: asigna al rol todas las unidades activas del organigrama en una sola operación.
        // Cómo: completa auditoría y llama a AsignarTodasUnidadesAsync (INSERT...SELECT en el repositorio).
        public async Task<IActionResult> AsignarTodasUnidades(SC_UNIDADES_TIPO_USUARIOTable Data)
        {
            SetCreateAudit(Data);

            var resultado = await _service.AsignarTodasUnidadesAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
            return resultado.ErrorCode == 0 ? Ok(resultado) : BadRequest(resultado);
        }

        [HttpDelete]
        [Authorize(Policy = "/sc-unidades-tipo-usuario|D")]
        // Qué hace: elimina una asignación de unidad a un tipo de usuario.
        // Cómo: fija CORR_EMPRESA de la sesión y llama a DeleteAsync del servicio.
        public async Task<IActionResult> Delete([FromQuery] SC_UNIDADES_TIPO_USUARIOTable Data)
        {
            Data.CORR_EMPRESA = GetCorrEmpresa();

            var resultado = await _service.DeleteAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
            return resultado.ErrorCode == 0 ? Ok(resultado) : BadRequest(resultado);
        }

        [HttpPut("ActivarInactivar")]
        [Authorize(Policy = "/sc-unidades-tipo-usuario|U")]
        // Qué hace: activa o inactiva la asignación de unidad al rol (tabla intermedia).
        // Cómo: aplica CORR_UNIDAD y TIPO_USUARIO de la query, fija CORR_EMPRESA y llama a ActivarInactivarAsync del servicio.
        public async Task<IActionResult> ActivarInactivar(SC_UNIDADES_TIPO_USUARIOTable Data)
        {
            this.ApplyQueryKeys(
                Data,
                nameof(SC_UNIDADES_TIPO_USUARIOTable.CORR_UNIDAD),
                nameof(SC_UNIDADES_TIPO_USUARIOTable.TIPO_USUARIO));
            Data.CORR_EMPRESA = GetCorrEmpresa();

            var resultado = await _service.ActivarInactivarAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
            return resultado.ErrorCode == 0 ? Ok(resultado) : BadRequest(resultado);
        }

        // Qué hace: entrega las unidades asignadas al rol del usuario para el descriptor de puesto.
        // Cómo: fija CORR_EMPRESA y TIPO_USUARIO del token; GetAllAsync; deja solo asignaciones activas.
        [HttpGet("GetCORR_UNIDAD_SC_DESCRIPTOR_PUESTO")]
        [Authorize(Policy = "/sc-descriptor-puesto|R")]
        public async Task<CResult> GetCORR_UNIDAD_SC_DESCRIPTOR_PUESTO([FromQuery] SC_UNIDADES_TIPO_USUARIOParam Data)
        {
            Data.CORR_EMPRESA = GetCorrEmpresa();
            Data.TIPO_USUARIO = GetTipoUsuario();
            var resultado = await _service.GetAllAsync(Data);
            if (resultado.Result && resultado.Data is List<SC_UNIDADES_TIPO_USUARIOView> list)
            {
                var activos = list
                    .Where(x => x.ACTIVO != false)
                    .OrderBy(x => x.NOMBRE_UNIDAD)
                    .ToList();
                resultado.Data = activos;
                resultado.RowsAffected = activos.Count;
            }

            return resultado;
        }

        // Qué hace: obtiene CORR_EMPRESA del claim del usuario autenticado.
        // Cómo: busca el claim CORR_EMPRESA y lo parsea a int; si falta, retorna 0.
        private int GetCorrEmpresa()
        {
            var claim = User.Claims.FirstOrDefault(e => e.Type == "CORR_EMPRESA");
            return claim != null && int.TryParse(claim.Value, out var corrEmpresa) ? corrEmpresa : 0;
        }

        // Qué hace: obtiene el tipo de usuario (rol) del token.
        // Cómo: lee el claim TIPO_USUARIO; si falta o no es numérico, retorna 0.
        private int GetTipoUsuario()
        {
            var claim = User.Claims.FirstOrDefault(e => e.Type == "TIPO_USUARIO");
            return claim != null && int.TryParse(claim.Value, out var tipoUsuario) ? tipoUsuario : 0;
        }

        // Qué hace: obtiene el identificador de usuario desde los claims.
        // Cómo: lee el claim NameIdentifier del usuario autenticado.
        private string GetUsuario()
        {
            return User.Claims.ToList().SingleOrDefault(e => e.Type == ClaimTypes.NameIdentifier).Value;
        }

        // Qué hace: completa auditoría de creación y empresa de sesión antes del insert.
        // Cómo: asigna CORR_EMPRESA, usuarios, estaciones, fechas y ACTIVO por defecto en true.
        private void SetCreateAudit(SC_UNIDADES_TIPO_USUARIOTable Data)
        {
            Data.CORR_EMPRESA = GetCorrEmpresa();
            Data.USUARIO_CREA = GetUsuario();
            Data.ESTACION_CREA = ClientInfoHelper.GetClientStation(HttpContext);
            Data.FECHA_CREA = DateTime.Now;
            Data.USUARIO_ACTU = Data.USUARIO_CREA;
            Data.ESTACION_ACTU = Data.ESTACION_CREA;
            Data.FECHA_ACTU = Data.FECHA_CREA;
            Data.ACTIVO ??= true;
        }
    }
}
