using System.Security.Claims;
using System.Threading.Tasks;
using eFramework.Core;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using sguees.Repositories;

namespace sguees.Controllers
{
    [Authorize]
    [ApiController]
    [Route("[controller]")]
    public class ACA_AREAS_ACADEMICASController : ControllerBase
    {
        private readonly IACA_CARRERASLookupRepository _repo;
        public ACA_AREAS_ACADEMICASController(IACA_CARRERASLookupRepository repo) { _repo=repo; }

        // Fuente del catálogo, con permiso de la pantalla que lo consume.
        [HttpGet("GetCORR_AREA_ACADEMICA_ACA_CARRERAS")]
        [Authorize(Policy="/aca-carreras|R")]
        public Task<CResult> GetCORR_AREA_ACADEMICA_ACA_CARRERAS()
        {
            var empresa=int.TryParse(User.FindFirstValue("CORR_EMPRESA"),out var id) ? id : 0;
            return _repo.GetAsync(CatalogoCarrera.Areas,empresa);
        }
    }
}

