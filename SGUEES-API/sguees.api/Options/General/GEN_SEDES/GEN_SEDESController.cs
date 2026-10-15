using System.Security.Claims;
using System.Threading.Tasks;
using eFramework.Core;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using sguees.Models;
using sguees.Services;
namespace sguees.Controllers
{
    [Authorize]
    [ApiController]
    [Route("[controller]")]
    public class GEN_SEDESController : ControllerBase
    {
        private readonly IACA_CARRERAS_SEDESService _service;
        public GEN_SEDESController(IACA_CARRERAS_SEDESService service) { _service=service; }
        [HttpGet("GetCORR_SEDE_ACA_CARRERAS")]
        [Authorize(Policy="/aca-carreras|R")]
        public Task<CResult> GetCORR_SEDE_ACA_CARRERAS([FromQuery] ACA_CARRERAS_SEDESParam data)
        {
            data.CORR_EMPRESA=int.TryParse(User.FindFirstValue("CORR_EMPRESA"),out var id)?id:0;
            return _service.GetSedesAsync(data);
        }
    }
}
