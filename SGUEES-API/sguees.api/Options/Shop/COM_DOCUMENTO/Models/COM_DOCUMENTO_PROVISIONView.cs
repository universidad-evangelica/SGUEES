using System.Collections.Generic;
using sguees.Models;

namespace eadmindevprojectmanagement.Models
{
	public class COM_DOCUMENTO_PROVISIONView
	{
		public COM_PROVISIONView Provision { get; set; }
		public List<COM_PROVISION_CONTAView> Conta { get; set; }
		public int CantidadDocumentos { get; set; }
		public bool PuedeContabilizar { get; set; }
		public bool PuedeEditarConta { get; set; }
		public string Mensaje { get; set; }
	}
}
