namespace sgueesRpt.Reports.Accounting.CON_PARTIDA
{
	using CrystalDecisions.CrystalReports.Engine;

	public class PARTIDA_CONTABLEReport : ReportClass
	{
		public override string ResourceName
		{
			get { return "PARTIDA_CONTABLEReport.rpt"; }
			set { }
		}

		public override bool NewGenerator
		{
			get { return true; }
			set { }
		}

		public override string FullResourceName
		{
			get { return "sgueesRpt.Reports.Accounting.CON_PARTIDA.PARTIDA_CONTABLEReport.rpt"; }
			set { }
		}
	}
}
