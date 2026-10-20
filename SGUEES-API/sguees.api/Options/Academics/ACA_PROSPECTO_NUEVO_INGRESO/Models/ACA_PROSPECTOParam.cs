using System;
using eFramework.Data;

namespace sguees.Models
{
    public class ACA_PROSPECTOParam : BaseParam
    {
        public int CORR_EMPRESA { get; set; }
        public int CORR_PROSPECTO { get; set; }
        public short ANIO { get; set; }
        public byte NUMERO_PERIODO { get; set; }
        // Carrera elegida, para listar sus modalidades con plan vigente.
        public int CORR_CARRERA { get; set; }
        // Modalidad elegida, para validar el cambio de ciclo/carrera antes de guardar.
        public int CORR_MODALIDAD { get; set; }
        // Comentario que queda en la bitácora al aprobar.
        public string OBSERVACION { get; set; }
        // Datos mínimos del alta. El CIF, el plan y el período los resuelve el registro de admisión.
        public string NOMBRES { get; set; }
        public string APELLIDO1 { get; set; }
        public string APELLIDO2 { get; set; }
        public DateTime? FECHA_NACIMIENTO { get; set; }
        public string FORMA_INGRESO { get; set; }
        public string CORREO { get; set; }
        public string TELEFONO { get; set; }
    }
}
