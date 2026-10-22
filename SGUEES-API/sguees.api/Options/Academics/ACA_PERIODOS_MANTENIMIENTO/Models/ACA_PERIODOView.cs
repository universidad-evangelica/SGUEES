using System;

namespace sguees.Models
{
    public class ACA_PERIODOView : ACA_PERIODOS_ACADEMICOSTable
    {
        public int CORR_EMPRESA { get; set; }
        public string NOMBRE_SEDE { get; set; }
        public string NOMBRE_AREA { get; set; }
        public string NOMBRE_FACULTAD { get; set; }
        public string NOMBRE_CARRERA { get; set; }
        public string ALCANCE { get; set; }
        public bool EN_USO { get; set; }
    }
}
