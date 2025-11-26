using System.ComponentModel.DataAnnotations;

namespace scuees.Models
{
    public class SEG_USUARIO_LOGINParam
    {

        [Required(ErrorMessage = "Debe especificar el Login")]
		[StringLength(30, MinimumLength = 4, ErrorMessage = "Debe especificar entre 4 y 30 caracteres")]	            
        public string LOGIN_SISTEMA { get; set; }
        [Required(ErrorMessage = "Debe especificar una clave")]
        public string CLAVE_USUARIO { get; set; }
        public string CLAVE_USUARIO_NUEVA { get; set; }
        public string CODIGO_SUITE { get; set; }="SCUEES";
    }
}
