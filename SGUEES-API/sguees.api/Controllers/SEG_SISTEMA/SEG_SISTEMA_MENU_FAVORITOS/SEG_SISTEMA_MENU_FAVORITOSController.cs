using csuees.api.Controllers.SEG_SISTEMA.SEG_SISTEMA_MENU_FAVORITOS.Service;
using csuees.api.Controllers.SEG_SISTEMA.SEG_SISTEMA_MENU_FAVORITOS.DTOs;
using csuees.api.Data;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace csuees.api.Controllers.SEG_SISTEMA.SEG_SISTEMA_MENU_FAVORITOS
{
    [Route("api/[controller]")]
    [ApiController]
    public class SEG_SISTEMA_MENU_FAVORITOSController : ControllerBase
    {
        private readonly ApplicationDataContext _context;

        public SEG_SISTEMA_MENU_FAVORITOSController(ApplicationDataContext context)
        {
            _context = context;
        }

        [HttpPost("toggle")]
        public async Task<IActionResult> ToggleFavorite([FromBody] ToggleFavoriteRequest request)
        {
            try
            {
                var response = await _context.MenuFavoritos.ToggleFavoriteAsync(request);

                return Ok(response);
            }
            catch (Exception ex)
            {
                return BadRequest(
                    new
                    {
                        Message = ex.Message
                    });
            }
        }

        [HttpGet("getFavorites")]
        public async Task<IActionResult> GetFavorites([FromQuery] GetFavoriteRequest request)
        {
            try
            {
                var response = await _context.MenuFavoritos.GetFavoritesAsync(request);
                return Ok(response);
            }
            catch (Exception ex)
            {
                return BadRequest(
                    new
                    {
                        Message = ex.Message
                    });
            }
        }
    }
}
