using System;
using System.Linq;
using System.Threading.Tasks;
using eFramework.Core;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using sguees.Models;
using sguees.Services;

namespace sguees.Controllers
{
    // Qué hace: documentación obligatoria de la solicitud de nuevo ingreso.
    // Cómo lo hace: solo lee. El documento sale si está en el tipo 104 y cumple la regla del prospecto.
    [Authorize]
    [Route("[controller]")]
    [ApiController]
    public class ACA_PROSPECTO_DOCUMENTOController : ControllerBase
    {
        private readonly IACA_PROSPECTO_DOCUMENTOService _service;

        public ACA_PROSPECTO_DOCUMENTOController(IACA_PROSPECTO_DOCUMENTOService service)
        {
            _service = service ?? throw new ArgumentNullException(nameof(service));
        }

        [HttpGet("GetAll")]
        [Authorize(Policy = "/aca-prospecto-nuevo-ingreso|R")]
        public async Task<CResult> GetAll([FromQuery] ACA_PROSPECTO_DOCUMENTOParam Data)
        {
            Data.CORR_EMPRESA = int.Parse(User.Claims.ToList().SingleOrDefault(e => e.Type == "CORR_EMPRESA").Value);
            return await _service.GetAllAsync(Data);
        }
    }
}
