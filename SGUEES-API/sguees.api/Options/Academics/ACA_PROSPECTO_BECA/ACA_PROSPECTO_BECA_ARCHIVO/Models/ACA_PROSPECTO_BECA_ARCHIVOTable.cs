using eFramework.Data;

namespace sguees.Models
{
    // Qué hace: llave del archivo cargado en una respuesta de documento.
    // Cómo lo hace: el archivo vive en la misma fila de ACA_PROSPECTO_BECA_RESPUESTA.
    public class ACA_PROSPECTO_BECA_ARCHIVOTable : BaseEntity
    {
        public int CORR_RESPUESTA_BECA { get; set; }
        public int CORR_PROSPECTO_BECA { get; set; }
        public int CORR_EMPRESA { get; set; }
    }
}
