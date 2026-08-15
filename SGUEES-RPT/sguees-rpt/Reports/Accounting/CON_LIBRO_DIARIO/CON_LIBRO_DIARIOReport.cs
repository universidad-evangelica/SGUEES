namespace sgueesRpt.Reports.Accounting.CON_LIBRO_DIARIO
{
	using CrystalDecisions.CrystalReports.Engine;

	public class CON_LIBRO_DIARIOReport : ReportClass
	{
		public override string ResourceName { get { return "CON_LIBRO_DIARIOReport.rpt"; } set { } }
		public override bool NewGenerator { get { return true; } set { } }
		public override string FullResourceName { get { return "sgueesRpt.Reports.Accounting.CON_LIBRO_DIARIO.CON_LIBRO_DIARIOReport.rpt"; } set { } }
	}
}
