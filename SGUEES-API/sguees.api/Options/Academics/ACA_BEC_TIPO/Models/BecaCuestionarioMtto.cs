using System;
using System.Collections.Generic;
namespace SGUEES.Models {
 public enum BecaElemento { Seccion=1,Pregunta=2,Opcion=3,Puntaje=4,Dependencia=5 }
 public sealed class BecaCuestionarioCambio {
  public int CORR_EMPRESA {get;set;} public int CORR_BECA {get;set;} public int CORR_FORMULARIO_VERSION {get;set;} public int ID {get;set;}
  public BecaElemento ELEMENTO {get;set;} public byte[] VERSION_REGISTRO {get;set;}
  public int? CORR_SECCION_BECA {get;set;} public int? CORR_PREGUNTA_BECA {get;set;} public int? CORR_OPCION_BECA {get;set;}
  public string NOMBRE_SECCION {get;set;} public string DESCRIPCION {get;set;} public int? ORDEN {get;set;}
  public decimal? PUNTAJE_MAXIMO {get;set;} public decimal? PORCENTAJE_SECCION {get;set;}
  public string CODIGO_PREGUNTA {get;set;} public string TEXTO_PREGUNTA {get;set;} public string AYUDA {get;set;}
  public string TIPO_RESPUESTA {get;set;} public bool? REQUERIDO {get;set;} public string TEXTO_OPCION {get;set;}
  public decimal? PUNTAJE {get;set;} public decimal? PORCENTAJE {get;set;} public DateTime? FECHA_INICIO {get;set;} public DateTime? FECHA_FIN {get;set;}
  public int? CORR_PREGUNTA_PADRE {get;set;} public int? CORR_OPCION_PADRE {get;set;} public int? CORR_PREGUNTA_HIJA {get;set;}
 }
 public sealed class BecaSeccionFila { public int CORR_SECCION_BECA {get;set;} public string NOMBRE_SECCION {get;set;} public string DESCRIPCION {get;set;} public int ORDEN {get;set;} public decimal? PUNTAJE_MAXIMO {get;set;} public decimal? PORCENTAJE_SECCION {get;set;} }
 public sealed class BecaPreguntaFila { public int CORR_SECCION_BECA {get;set;} public int CORR_PREGUNTA_BECA {get;set;} public string CODIGO_PREGUNTA {get;set;} public string TEXTO_PREGUNTA {get;set;} public string AYUDA {get;set;} public string TIPO_RESPUESTA {get;set;} public bool REQUERIDO {get;set;} public int ORDEN {get;set;} }
 public sealed class BecaOpcionFila { public int CORR_PREGUNTA_BECA {get;set;} public int CORR_OPCION_BECA {get;set;} public string TEXTO_OPCION {get;set;} public int ORDEN {get;set;} }
 public sealed class BecaPuntajeFila { public int CORR_PREGUNTA_BECA {get;set;} public int CORR_PUNTAJE_BECA {get;set;} public int? CORR_OPCION_BECA {get;set;} public string TEXTO_OPCION {get;set;} public decimal PUNTAJE {get;set;} public decimal PORCENTAJE {get;set;} public DateTime FECHA_INICIO {get;set;} public DateTime? FECHA_FIN {get;set;} }
 public sealed class BecaDependenciaFila { public int CORR_DEPENDENCIA_BECA {get;set;} public int CORR_PREGUNTA_PADRE {get;set;} public int CORR_OPCION_PADRE {get;set;} public int CORR_PREGUNTA_HIJA {get;set;} public string PREGUNTA_PADRE {get;set;} public string OPCION_PADRE {get;set;} public string PREGUNTA_HIJA {get;set;} }
 public sealed class BecaCuestionarioContenido { public BecaVersionFila VERSION {get;set;} public List<BecaSeccionFila> SECCIONES {get;set;} public List<BecaPreguntaFila> PREGUNTAS {get;set;} public List<BecaOpcionFila> OPCIONES {get;set;} public List<BecaPuntajeFila> PUNTAJES {get;set;} public List<BecaDependenciaFila> DEPENDENCIAS {get;set;} }
 public sealed class BecaCuestionarioCreado { public int? CORR_FORMULARIO_BECA {get;set;} public int CORR_FORMULARIO_VERSION {get;set;} }
}
