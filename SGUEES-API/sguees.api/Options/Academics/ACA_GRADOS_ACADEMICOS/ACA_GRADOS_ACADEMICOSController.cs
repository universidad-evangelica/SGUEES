using System.Security.Claims;
using System.Threading.Tasks;
using eFramework.Core;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using sguees.Services;
using sguees.Models;

namespace sguees.Controllers
{
    [Authorize]
    [ApiController]
    [Route("[controller]")]
    public class ACA_GRADOS_ACADEMICOSController : ControllerBase
    {
        private readonly IACA_CARRERASService _repo;
        public ACA_GRADOS_ACADEMICOSController(IACA_CARRERASService repo) { _repo=repo; }

        // Fuente del catálogo, con permiso de la pantalla que lo consume.
        [HttpGet("GetCORR_GRADO_ACADEMICO_ACA_CARRERAS")]
        [Authorize(Policy="/aca-carreras|R")]
        public Task<CResult> GetCORR_GRADO_ACADEMICO_ACA_CARRERAS()
        {
            var empresa=int.TryParse(User.FindFirstValue("CORR_EMPRESA"),out var id) ? id : 0;
            return _repo.GetCatalogoAsync(CatalogoCarrera.Grados,empresa);
        }
    }
}

