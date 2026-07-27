using System.ComponentModel.DataAnnotations;

namespace sguees.Models
{
    public class SC_SOLICITUD_EMPLEO_PUBLICOParam
    {
        [Required(ErrorMessage = "El token es requerido.")]
        public string TOKEN { get; set; }
    }
}
