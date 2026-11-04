using System;

namespace sguees.Models
{
    public class ACA_PERIODOCatalogo
    {
        public string TIPO { get; set; }
        public int Key { get; set; }
        public string Value { get; set; }
        public bool ACTIVO { get; set; }
        public int? CORR_SEDE { get; set; }
        public int? CORR_AREA_ACADEMICA { get; set; }
        public int? CORR_FACULTAD { get; set; }
    }
}
