using System.ComponentModel.DataAnnotations;

namespace sguees.Models
{
    public class SEG_USUARIO_RESET_PASSWORDParam
    {
        [Required(ErrorMessage = "Debe especificar el Login")]
        [StringLength(30, MinimumLength = 4, ErrorMessage = "Debe especificar entre 4 y 30 caracteres")]
        public string LOGIN_SISTEMA { get; set; }

        [Required(ErrorMessage = "Debe especificar el token de reseteo")]
        public string RESET_TOKEN { get; set; }

        [Required(ErrorMessage = "Debe especificar una clave nueva")]
        public string CLAVE_USUARIO_NUEVA { get; set; }
    }
}
