using System.ComponentModel.DataAnnotations;

namespace sguees.Models
{
    public class SC_SOLICITUD_EMPLEO_GENERAR_TOKENParam
    {
        public int CORR_EMPRESA { get; set; }

        [Range(1, int.MaxValue, ErrorMessage = "La solicitud de empleo es requerida.")]
        public int CORR_SOLICITUD_EMPLEO { get; set; }
    }
}
