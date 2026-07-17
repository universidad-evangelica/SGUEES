// Endpoints REST del catálogo competencias conductuales.
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
  // Expone el CRUD y lookups de competencia conductual con autorización por política.
  public class SC_COMPETENCIAS_CONDUCTUALESController : ControllerBase
  {
    private readonly ISC_COMPETENCIAS_CONDUCTUALESService _service;

    public SC_COMPETENCIAS_CONDUCTUALESController(ISC_COMPETENCIAS_CONDUCTUALESService service)
    {
      _service = service ?? throw new ArgumentNullException(nameof(_service));
    }

    [HttpGet("GetAll")]
    [Authorize(Policy = "/sc-competencias-conductuales|R")]
    // Atiende el listado y lo limita a la empresa de la sesión.
    public async Task<CResult> GetAll([FromQuery] SC_COMPETENCIAS_CONDUCTUALESParam Data)
    {
      Data.CORR_EMPRESA = GetCorrEmpresa();
      return await _service.GetAllAsync(Data);
    }

    [HttpGet("Get")]
    [Authorize(Policy = "/sc-competencias-conductuales|R")]
    // Atiende la consulta de un registro dentro de la empresa de la sesión.
    public async Task<CResult> Get([FromQuery] SC_COMPETENCIAS_CONDUCTUALESParam Data)
    {
      Data.CORR_EMPRESA = GetCorrEmpresa();
      return await _service.GetAsync(Data);
    }

    [HttpPost]
    [Authorize(Policy = "/sc-competencias-conductuales|C")]
    // Completa auditoría y crea la competencia en la empresa de la sesión.
    public async Task<IActionResult> Post(SC_COMPETENCIAS_CONDUCTUALESTable Data)
    {
      SetCreateAudit(Data);

      var resultado = await _service.CreateAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
      return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
    }

    [HttpPut]
    [Authorize(Policy = "/sc-competencias-conductuales|U")]
    // Aplica la llave consultada y la auditoría antes de actualizar.
    public async Task<IActionResult> Put(SC_COMPETENCIAS_CONDUCTUALESTable Data)
    {
      this.ApplyQueryKeys(Data, nameof(SC_COMPETENCIAS_CONDUCTUALESTable.CORR_COMPETENCIAS_CONDUCTUALES));
      SetUpdateAudit(Data);

      var resultado = await _service.UpdateAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
      return resultado.ErrorCode == 0 ? StatusCode(201, resultado) : BadRequest(resultado);
    }

    [HttpDelete]
    [Authorize(Policy = "/sc-competencias-conductuales|D")]
    // Restringe la eliminación a la empresa de la sesión.
    public async Task<IActionResult> Delete([FromQuery] SC_COMPETENCIAS_CONDUCTUALESTable Data)
    {
      Data.CORR_EMPRESA = GetCorrEmpresa();

      var resultado = await _service.DeleteAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
      return resultado.ErrorCode == 0 ? Ok(resultado) : BadRequest(resultado);
    }

    [HttpPut("ActivarInactivar")]
    [Authorize(Policy = "/sc-competencias-conductuales|U")]
    // Cambia el estado activo/inactivo del registro indicado.
    public async Task<IActionResult> ActivarInactivar(SC_COMPETENCIAS_CONDUCTUALESTable Data)
    {
      this.ApplyQueryKeys(Data, nameof(SC_COMPETENCIAS_CONDUCTUALESTable.CORR_COMPETENCIAS_CONDUCTUALES));
      Data.CORR_EMPRESA = GetCorrEmpresa();

      var resultado = await _service.ActivarInactivarAsync(Data, GetUsuario(), ClientInfoHelper.GetClientStation(HttpContext));
      return resultado.ErrorCode == 0 ? Ok(resultado) : BadRequest(resultado);
    }

    [HttpGet("GetCORR_COMPETENCIAS_CONDUCTUALES_SC_DESCRIPTOR_PUESTO")]
    [Authorize(Policy = "/sc-descriptor-puesto|R")]
    // Provee el catálogo activo de competencias para el descriptor.
    public async Task<CResult> GetCORR_COMPETENCIAS_CONDUCTUALES_SC_DESCRIPTOR_PUESTO([FromQuery] SC_COMPETENCIAS_CONDUCTUALESParam Data)
    {
      Data.CORR_EMPRESA = GetCorrEmpresa();
      return await _service.GetCatalogoDescriptorAsync(Data);
    }

    // Lee CORR_EMPRESA del claim del usuario autenticado.
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

    // Completa empresa, usuario, estación y fechas del registro nuevo.
    private void SetCreateAudit(SC_COMPETENCIAS_CONDUCTUALESTable Data)
    {
      Data.CORR_EMPRESA = GetCorrEmpresa();
      Data.USUARIO_CREA = GetUsuario();
      Data.ESTACION_CREA = ClientInfoHelper.GetClientStation(HttpContext);
      Data.FECHA_CREA = DateTime.Now;
      Data.USUARIO_ACTU = Data.USUARIO_CREA;
      Data.ESTACION_ACTU = Data.ESTACION_CREA;
      Data.FECHA_ACTU = Data.FECHA_CREA;
      Data.ESTADO_COMPETENCIAS_CONDUCTUALES ??= true;
    }

    // Actualiza auditoría sin reemplazar la información de creación.
    private void SetUpdateAudit(SC_COMPETENCIAS_CONDUCTUALESTable Data)
    {
      Data.CORR_EMPRESA = GetCorrEmpresa();
      Data.USUARIO_ACTU = GetUsuario();
      Data.ESTACION_ACTU = ClientInfoHelper.GetClientStation(HttpContext);
      Data.FECHA_ACTU = DateTime.Now;
      if (!Data.ESTADO_COMPETENCIAS_CONDUCTUALES.HasValue)
      {
        Data.ESTADO_COMPETENCIAS_CONDUCTUALES = true;
      }
    }
  }
}
