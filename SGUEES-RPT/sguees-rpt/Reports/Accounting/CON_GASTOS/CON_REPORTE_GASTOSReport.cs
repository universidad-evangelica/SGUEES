namespace sgueesRpt.Reports.Accounting.CON_GASTOS
{
	using CrystalDecisions.CrystalReports.Engine;

	public class CON_REPORTE_GASTOSReport : ReportClass
	{
		public override string ResourceName
		{
			get { return "CON_REPORTE_GASTOSReport.rpt"; }
			set { }
		}

		public override bool NewGenerator
		{
			get { return true; }
			set { }
		}

		public override string FullResourceName
		{
			get { return "sgueesRpt.Reports.Accounting.CON_GASTOS.CON_REPORTE_GASTOSReport.rpt"; }
			set { }
		}
	}
}
