using System.ComponentModel.DataAnnotations;

namespace sguees.Models
{
    public class SEG_USUARIO_FORGOT_PASSWORDParam
    {
        [Required(ErrorMessage = "Debe especificar el Login")]
        [StringLength(30, MinimumLength = 4, ErrorMessage = "Debe especificar entre 4 y 30 caracteres")]
        public string LOGIN_SISTEMA { get; set; }
    }
}
