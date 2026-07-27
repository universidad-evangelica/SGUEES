using System.ComponentModel.DataAnnotations;

namespace sguees.Models
{
    public class SC_SOLICITUD_EMPLEO_COMPLETARParam
    {
        [Required(ErrorMessage = "El token es requerido.")]
        public string TOKEN { get; set; }

        [Required(ErrorMessage = "El primer nombre es requerido.")]
        [StringLength(50)]
        public string NOMBRE1 { get; set; }

        [StringLength(50)]
        public string NOMBRE2 { get; set; }

        [Required(ErrorMessage = "El primer apellido es requerido.")]
        [StringLength(50)]
        public string APELLIDO1 { get; set; }

        [StringLength(50)]
        public string APELLIDO2 { get; set; }

        // Agregar aquí los nuevos campos del formulario de solicitud de empleo.
    }
}
