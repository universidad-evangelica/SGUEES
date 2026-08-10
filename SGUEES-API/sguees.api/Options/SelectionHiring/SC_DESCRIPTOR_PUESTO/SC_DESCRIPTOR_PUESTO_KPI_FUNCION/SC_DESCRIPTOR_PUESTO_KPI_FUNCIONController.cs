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
    public class SC_DESCRIPTOR_PUESTO_KPI_FUNCIONController : ControllerBase
    {
        private readonly ISC_DESCRIPTOR_PUESTO_KPI_FUNCIONService _service;

        public SC_DESCRIPTOR_PUESTO_KPI_FUNCIONController(ISC_DESCRIPTOR_PUESTO_KPI_FUNCIONService service)
        {
            _service = service ?? throw new ArgumentNullException(nameof(service));
        }

        // Lista KPIs de funciones de la empresa en sesión; pasa filtros (descriptor, etc.) al servicio.
        [HttpGet("GetAll")]
        [Authorize(Policy = "/sc-descriptor-puesto|R")]
        public async Task<CResult> GetAll([FromQuery] SC_DESCRIPTOR_PUESTO_KPI_FUNCIONParam Data)
        {
            Data.CORR_EMPRESA = GetCorrEmpresa();
            return await _service.GetAllAsync(Data);
        }

        // Obtiene un KPI por CORR_KPI_FUNCION, descriptor y empresa de sesión.
        [HttpGet("Get")]
        [Authorize(Policy = "/sc-descriptor-puesto|R")]
        public async Task<CResult> Get([FromQuery] SC_DESCRIPTOR_PUESTO_KPI_FUNCIONParam Data)
        {
            Data.CORR_EMPRESA = GetCorrEmpresa();
            return await _service.GetAsync(Data);
        }

        // Lista KPIs del descriptor indicado (alias de GetAll para la pantalla del descriptor).
        [HttpGet("GetCORR_KPI_FUNCION_SC_DESCRIPTOR_PUESTO")]
        [Authorize(Policy = "/sc-descriptor-puesto|R")]
        public async Task<CResult> GetCORR_KPI_FUNCION_SC_DESCRIPTOR_PUESTO([FromQuery] SC_DESCRIPTOR_PUESTO_KPI_FUNCIONParam Data)
        {
            Data.CORR_EMPRESA = GetCorrEmpresa();
            return await _service.GetAllAsync(Data);
        }

        // Crea un KPI; rellena auditoría de sesión y delega al servicio.
        [HttpPost]
        [Authorize(Policy = "/sc-descriptor-puesto|C")]
        public async Task<IActionResult> Post(SC_DESCRIPTOR_PUESTO_KPI_FUNCIONTable Data)
        {
            // Rellena usuario, estación, fechas y empresa antes de guardar.
            SetCreateAudit(Data);

            var resultado = await _service.CreateAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
            return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
        }

        // Actualiza un KPI; toma CORR_KPI_FUNCION del query string y actualiza auditoría.
        [HttpPut]
        [Authorize(Policy = "/sc-descriptor-puesto|U")]
        public async Task<IActionResult> Put(SC_DESCRIPTOR_PUESTO_KPI_FUNCIONTable Data)
        {
            // Copia CORR_KPI_FUNCION desde la URL al cuerpo del request.
            this.ApplyQueryKeys(Data, nameof(SC_DESCRIPTOR_PUESTO_KPI_FUNCIONTable.CORR_KPI_FUNCION));
            // Rellena usuario, estación y fecha de modificación.
            SetUpdateAudit(Data);

            var resultado = await _service.UpdateAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
            return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
        }

        // Elimina un KPI de la empresa en sesión.
        [HttpDelete]
        [Authorize(Policy = "/sc-descriptor-puesto|D")]
        public async Task<IActionResult> Delete([FromQuery] SC_DESCRIPTOR_PUESTO_KPI_FUNCIONTable Data)
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

        // Rellena auditoría al crear: empresa, usuario, estación y fechas.
        private void SetCreateAudit(SC_DESCRIPTOR_PUESTO_KPI_FUNCIONTable Data)
        {
            Data.CORR_EMPRESA = GetCorrEmpresa();
            Data.USUARIO_CREA = GetUsuario();
            Data.ESTACION_CREA = ClientInfoHelper.GetClientStation(HttpContext);
            Data.FECHA_CREA = DateTime.Now;
            Data.USUARIO_ACTU = Data.USUARIO_CREA;
            Data.ESTACION_ACTU = Data.ESTACION_CREA;
            Data.FECHA_ACTU = Data.FECHA_CREA;
        }

        // Rellena auditoría al modificar: empresa, usuario, estación y fecha.
        private void SetUpdateAudit(SC_DESCRIPTOR_PUESTO_KPI_FUNCIONTable Data)
        {
            Data.CORR_EMPRESA = GetCorrEmpresa();
            Data.USUARIO_ACTU = GetUsuario();
            Data.ESTACION_ACTU = ClientInfoHelper.GetClientStation(HttpContext);
            Data.FECHA_ACTU = DateTime.Now;
        }
    }
}
