using System;
using eFramework.Data;

namespace sguees.Models
{
	public class GEN_RUBRO_SUMATable: BaseEntity
	{
		public int CORR_EMPRESA { get; set; }
		public int CORR_RUBRO { get; set; }
		public int CORR_SUMA { get; set; }
	}
}
