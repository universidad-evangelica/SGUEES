namespace sgueesRpt.Reports.Accounting.BALANCE_GENERAL
{
	using CrystalDecisions.CrystalReports.Engine;

	public class BALANCE_GENERALReport : ReportClass
	{
		public override string ResourceName { get { return "BALANCE_GENERALReport.rpt"; } set { } }
		public override bool NewGenerator { get { return true; } set { } }
		public override string FullResourceName { get { return "sgueesRpt.Reports.Accounting.BALANCE_GENERAL.BALANCE_GENERALReport.rpt"; } set { } }
	}
}
