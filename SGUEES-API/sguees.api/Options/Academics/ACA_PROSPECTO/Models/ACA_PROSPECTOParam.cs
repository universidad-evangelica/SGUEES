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
    }
}
