using System.Collections.Generic;
namespace sguees.Models
{
    public class AcaProspectoBecaRespuestaEdicion
    {
        public int CORR_PROSPECTO_BECA { get; set; }
        public int CORR_PREGUNTA_BECA { get; set; }
        public List<AcaProspectoBecaRespuestaFilaEdicion> Filas { get; set; } = new();
    }
}
