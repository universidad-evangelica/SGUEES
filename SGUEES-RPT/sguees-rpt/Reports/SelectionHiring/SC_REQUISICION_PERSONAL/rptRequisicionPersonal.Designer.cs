using System.ComponentModel;
using System.Drawing;
using DevExpress.XtraPrinting;
using DevExpress.XtraReports.UI;

namespace sgueesRpt.Reports.SelectionHiring.SC_REQUISICION_PERSONAL
{
	partial class rptRequisicionPersonal
	{
		private IContainer components = null;

		private TopMarginBand topMarginBand1;
		private BottomMarginBand bottomMarginBand1;
		private DetailBand detailBand1;
		private XRPanel pnlBorder;
		private XRPanel pnlLogo;
		private XRLabel lblLogoHint;
		private XRLabel lblHdrTh;
		private XRLabel lblHdrReq;
		private XRLine lineHdr;
		private XRLabel lblSolicita;
		private XRLabel lblCantidad;
		private XRLabel lblPersonaS;
		private XRLabel lblParaOcupar;
		private XRLabel lblPuesto;
		private XRLabel lblEnDepto;
		private XRLabel lblUnidad;
		private XRLabel lblSueldoPref;
		private XRLabel lblSalario;
		private XRLabel lblModalidad;
		private XRLabel lblBoxPresencial;
		private XRLabel lblChkPresencial;
		private XRLabel lblTxtPresencial;
		private XRLabel lblBoxTeleTotal;
		private XRLabel lblChkTeleTotal;
		private XRLabel lblTxtTeleTotal;
		private XRLabel lblBoxTeleParcial;
		private XRLabel lblChkTeleParcial;
		private XRLabel lblTxtTeleParcial;
		private XRLabel lblTipoContratacion;
		private XRLabel lblBoxPermanente;
		private XRLabel lblChkPermanente;
		private XRLabel lblTxtPermanente;
		private XRLabel lblBoxTemporal;
		private XRLabel lblChkTemporal;
		private XRLabel lblTxtTemporal;
		private XRLabel lblHorarioPref;
		private XRLabel lblHorario;
		private XRLine lineMid;
		private XRLabel lblEventual;
		private XRLabel lblDesdePref;
		private XRLabel lblDesde;
		private XRLabel lblHastaPref;
		private XRLabel lblHasta;
		private XRLabel lblTiempoContrato;
		private XRLabel lblCubrir;
		private XRLabel lblBoxPromocion;
		private XRLabel lblChkPromocion;
		private XRLabel lblTxtPromocion;
		private XRLabel lblLinePromocion;
		private XRLabel lblBoxTransferencia;
		private XRLabel lblChkTransferencia;
		private XRLabel lblTxtTransferencia;
		private XRLabel lblLineTransferencia;
		private XRLabel lblBoxRenuncia;
		private XRLabel lblChkRenuncia;
		private XRLabel lblTxtRenuncia;
		private XRLabel lblLineRenuncia;
		private XRLabel lblBoxNuevaCreacion;
		private XRLabel lblChkNuevaCreacion;
		private XRLabel lblTxtNuevaCreacion;
		private XRLabel lblLineNuevaCreacion;
		private XRLabel lblBoxOtros;
		private XRLabel lblChkOtros;
		private XRLabel lblTxtOtros;
		private XRLabel lblLineOtros;
		private XRLabel lblJustificacionTitulo;
		private XRLabel lblJustificacion;
		private XRPanel pnlAprobaciones;
		private XRLabel lblAprobaciones;
		private XRLabel lblJefePref;
		private XRLabel lblJefeNombre;
		private XRLabel lblJefeFechaPref;
		private XRLabel lblJefeFecha;
		private XRLabel lblDecanoPref;
		private XRLabel lblDecanoNombre;
		private XRLabel lblDecanoFechaPref;
		private XRLabel lblDecanoFecha;
		private XRLabel lblVraPref;
		private XRLabel lblVraNombre;
		private XRLabel lblVraFechaPref;
		private XRLabel lblVraFecha;

		protected override void Dispose(bool disposing)
		{
			if (disposing && (components != null))
			{
				components.Dispose();
			}
			base.Dispose(disposing);
		}

		private void InitializeComponent()
		{
            this.topMarginBand1 = new DevExpress.XtraReports.UI.TopMarginBand();
            this.bottomMarginBand1 = new DevExpress.XtraReports.UI.BottomMarginBand();
            this.detailBand1 = new DevExpress.XtraReports.UI.DetailBand();
            this.pnlBorder = new DevExpress.XtraReports.UI.XRPanel();
            this.pnlLogo = new DevExpress.XtraReports.UI.XRPanel();
            this.lblLogoHint = new DevExpress.XtraReports.UI.XRLabel();
            this.lblHdrTh = new DevExpress.XtraReports.UI.XRLabel();
            this.lblHdrReq = new DevExpress.XtraReports.UI.XRLabel();
            this.lineHdr = new DevExpress.XtraReports.UI.XRLine();
            this.lblSolicita = new DevExpress.XtraReports.UI.XRLabel();
            this.lblCantidad = new DevExpress.XtraReports.UI.XRLabel();
            this.lblPersonaS = new DevExpress.XtraReports.UI.XRLabel();
            this.lblParaOcupar = new DevExpress.XtraReports.UI.XRLabel();
            this.lblPuesto = new DevExpress.XtraReports.UI.XRLabel();
            this.lblEnDepto = new DevExpress.XtraReports.UI.XRLabel();
            this.lblUnidad = new DevExpress.XtraReports.UI.XRLabel();
            this.lblSueldoPref = new DevExpress.XtraReports.UI.XRLabel();
            this.lblSalario = new DevExpress.XtraReports.UI.XRLabel();
            this.lblModalidad = new DevExpress.XtraReports.UI.XRLabel();
            this.lblBoxPresencial = new DevExpress.XtraReports.UI.XRLabel();
            this.lblChkPresencial = new DevExpress.XtraReports.UI.XRLabel();
            this.lblTxtPresencial = new DevExpress.XtraReports.UI.XRLabel();
            this.lblBoxTeleTotal = new DevExpress.XtraReports.UI.XRLabel();
            this.lblChkTeleTotal = new DevExpress.XtraReports.UI.XRLabel();
            this.lblTxtTeleTotal = new DevExpress.XtraReports.UI.XRLabel();
            this.lblBoxTeleParcial = new DevExpress.XtraReports.UI.XRLabel();
            this.lblChkTeleParcial = new DevExpress.XtraReports.UI.XRLabel();
            this.lblTxtTeleParcial = new DevExpress.XtraReports.UI.XRLabel();
            this.lblTipoContratacion = new DevExpress.XtraReports.UI.XRLabel();
            this.lblBoxPermanente = new DevExpress.XtraReports.UI.XRLabel();
            this.lblChkPermanente = new DevExpress.XtraReports.UI.XRLabel();
            this.lblTxtPermanente = new DevExpress.XtraReports.UI.XRLabel();
            this.lblBoxTemporal = new DevExpress.XtraReports.UI.XRLabel();
            this.lblChkTemporal = new DevExpress.XtraReports.UI.XRLabel();
            this.lblTxtTemporal = new DevExpress.XtraReports.UI.XRLabel();
            this.lblHorarioPref = new DevExpress.XtraReports.UI.XRLabel();
            this.lblHorario = new DevExpress.XtraReports.UI.XRLabel();
            this.lineMid = new DevExpress.XtraReports.UI.XRLine();
            this.lblEventual = new DevExpress.XtraReports.UI.XRLabel();
            this.lblDesdePref = new DevExpress.XtraReports.UI.XRLabel();
            this.lblDesde = new DevExpress.XtraReports.UI.XRLabel();
            this.lblHastaPref = new DevExpress.XtraReports.UI.XRLabel();
            this.lblHasta = new DevExpress.XtraReports.UI.XRLabel();
            this.lblTiempoContrato = new DevExpress.XtraReports.UI.XRLabel();
            this.lblCubrir = new DevExpress.XtraReports.UI.XRLabel();
            this.lblBoxPromocion = new DevExpress.XtraReports.UI.XRLabel();
            this.lblChkPromocion = new DevExpress.XtraReports.UI.XRLabel();
            this.lblTxtPromocion = new DevExpress.XtraReports.UI.XRLabel();
            this.lblLinePromocion = new DevExpress.XtraReports.UI.XRLabel();
            this.lblBoxTransferencia = new DevExpress.XtraReports.UI.XRLabel();
            this.lblChkTransferencia = new DevExpress.XtraReports.UI.XRLabel();
            this.lblTxtTransferencia = new DevExpress.XtraReports.UI.XRLabel();
            this.lblLineTransferencia = new DevExpress.XtraReports.UI.XRLabel();
            this.lblBoxRenuncia = new DevExpress.XtraReports.UI.XRLabel();
            this.lblChkRenuncia = new DevExpress.XtraReports.UI.XRLabel();
            this.lblTxtRenuncia = new DevExpress.XtraReports.UI.XRLabel();
            this.lblLineRenuncia = new DevExpress.XtraReports.UI.XRLabel();
            this.lblBoxNuevaCreacion = new DevExpress.XtraReports.UI.XRLabel();
            this.lblChkNuevaCreacion = new DevExpress.XtraReports.UI.XRLabel();
            this.lblTxtNuevaCreacion = new DevExpress.XtraReports.UI.XRLabel();
            this.lblLineNuevaCreacion = new DevExpress.XtraReports.UI.XRLabel();
            this.lblBoxOtros = new DevExpress.XtraReports.UI.XRLabel();
            this.lblChkOtros = new DevExpress.XtraReports.UI.XRLabel();
            this.lblTxtOtros = new DevExpress.XtraReports.UI.XRLabel();
            this.lblLineOtros = new DevExpress.XtraReports.UI.XRLabel();
            this.lblJustificacionTitulo = new DevExpress.XtraReports.UI.XRLabel();
            this.lblJustificacion = new DevExpress.XtraReports.UI.XRLabel();
            this.pnlAprobaciones = new DevExpress.XtraReports.UI.XRPanel();
            this.lblAprobaciones = new DevExpress.XtraReports.UI.XRLabel();
            this.lblJefePref = new DevExpress.XtraReports.UI.XRLabel();
            this.lblJefeNombre = new DevExpress.XtraReports.UI.XRLabel();
            this.lblJefeFechaPref = new DevExpress.XtraReports.UI.XRLabel();
            this.lblJefeFecha = new DevExpress.XtraReports.UI.XRLabel();
            this.lblDecanoPref = new DevExpress.XtraReports.UI.XRLabel();
            this.lblDecanoNombre = new DevExpress.XtraReports.UI.XRLabel();
            this.lblDecanoFechaPref = new DevExpress.XtraReports.UI.XRLabel();
            this.lblDecanoFecha = new DevExpress.XtraReports.UI.XRLabel();
            this.lblVraPref = new DevExpress.XtraReports.UI.XRLabel();
            this.lblVraNombre = new DevExpress.XtraReports.UI.XRLabel();
            this.lblVraFechaPref = new DevExpress.XtraReports.UI.XRLabel();
            this.lblVraFecha = new DevExpress.XtraReports.UI.XRLabel();
            ((System.ComponentModel.ISupportInitialize)(this)).BeginInit();
            // 
            // topMarginBand1
            // 
            this.topMarginBand1.HeightF = 40F;
            this.topMarginBand1.Name = "topMarginBand1";
            // 
            // bottomMarginBand1
            // 
            this.bottomMarginBand1.HeightF = 40F;
            this.bottomMarginBand1.Name = "bottomMarginBand1";
            // 
            // detailBand1
            // 
            this.detailBand1.Controls.AddRange(new DevExpress.XtraReports.UI.XRControl[] {
            this.pnlBorder});
            this.detailBand1.HeightF = 920F;
            this.detailBand1.Name = "detailBand1";
            // 
            // pnlBorder
            // 
            this.pnlBorder.Borders = ((DevExpress.XtraPrinting.BorderSide)((((DevExpress.XtraPrinting.BorderSide.Left | DevExpress.XtraPrinting.BorderSide.Top) 
            | DevExpress.XtraPrinting.BorderSide.Right) 
            | DevExpress.XtraPrinting.BorderSide.Bottom)));
            this.pnlBorder.BorderWidth = 1F;
            this.pnlBorder.Controls.AddRange(new DevExpress.XtraReports.UI.XRControl[] {
            this.pnlLogo,
            this.lblHdrTh,
            this.lblHdrReq,
            this.lineHdr,
            this.lblSolicita,
            this.lblCantidad,
            this.lblPersonaS,
            this.lblParaOcupar,
            this.lblPuesto,
            this.lblEnDepto,
            this.lblUnidad,
            this.lblSueldoPref,
            this.lblSalario,
            this.lblModalidad,
            this.lblBoxPresencial,
            this.lblChkPresencial,
            this.lblTxtPresencial,
            this.lblBoxTeleTotal,
            this.lblChkTeleTotal,
            this.lblTxtTeleTotal,
            this.lblBoxTeleParcial,
            this.lblChkTeleParcial,
            this.lblTxtTeleParcial,
            this.lblTipoContratacion,
            this.lblBoxPermanente,
            this.lblChkPermanente,
            this.lblTxtPermanente,
            this.lblBoxTemporal,
            this.lblChkTemporal,
            this.lblTxtTemporal,
            this.lblHorarioPref,
            this.lblHorario,
            this.lineMid,
            this.lblEventual,
            this.lblDesdePref,
            this.lblDesde,
            this.lblHastaPref,
            this.lblHasta,
            this.lblTiempoContrato,
            this.lblCubrir,
            this.lblBoxPromocion,
            this.lblChkPromocion,
            this.lblTxtPromocion,
            this.lblLinePromocion,
            this.lblBoxTransferencia,
            this.lblChkTransferencia,
            this.lblTxtTransferencia,
            this.lblLineTransferencia,
            this.lblBoxRenuncia,
            this.lblChkRenuncia,
            this.lblTxtRenuncia,
            this.lblLineRenuncia,
            this.lblBoxNuevaCreacion,
            this.lblChkNuevaCreacion,
            this.lblTxtNuevaCreacion,
            this.lblLineNuevaCreacion,
            this.lblBoxOtros,
            this.lblChkOtros,
            this.lblTxtOtros,
            this.lblLineOtros,
            this.lblJustificacionTitulo,
            this.lblJustificacion,
            this.pnlAprobaciones});
            this.pnlBorder.LocationFloat = new DevExpress.Utils.PointFloat(0F, 0F);
            this.pnlBorder.Name = "pnlBorder";
            this.pnlBorder.SizeF = new System.Drawing.SizeF(750F, 910F);
            // 
            // pnlLogo
            // 
            this.pnlLogo.Borders = ((DevExpress.XtraPrinting.BorderSide)((((DevExpress.XtraPrinting.BorderSide.Left | DevExpress.XtraPrinting.BorderSide.Top) 
            | DevExpress.XtraPrinting.BorderSide.Right) 
            | DevExpress.XtraPrinting.BorderSide.Bottom)));
            this.pnlLogo.BorderWidth = 1F;
            this.pnlLogo.Controls.AddRange(new DevExpress.XtraReports.UI.XRControl[] {
            this.lblLogoHint});
            this.pnlLogo.LocationFloat = new DevExpress.Utils.PointFloat(10F, 10F);
            this.pnlLogo.Name = "pnlLogo";
            this.pnlLogo.SizeF = new System.Drawing.SizeF(90F, 90F);
            // 
            // lblLogoHint
            // 
            this.lblLogoHint.Font = new DevExpress.Drawing.DXFont("Arial", 7F);
            this.lblLogoHint.LocationFloat = new DevExpress.Utils.PointFloat(5F, 35F);
            this.lblLogoHint.Name = "lblLogoHint";
            this.lblLogoHint.SizeF = new System.Drawing.SizeF(80F, 30F);
            this.lblLogoHint.Text = "(Logo)";
            this.lblLogoHint.TextAlignment = DevExpress.XtraPrinting.TextAlignment.MiddleCenter;
            // 
            // lblHdrTh
            // 
            this.lblHdrTh.BackColor = System.Drawing.Color.FromArgb(((int)(((byte)(255)))), ((int)(((byte)(242)))), ((int)(((byte)(0)))));
            this.lblHdrTh.Borders = ((DevExpress.XtraPrinting.BorderSide)((((DevExpress.XtraPrinting.BorderSide.Left | DevExpress.XtraPrinting.BorderSide.Top) 
            | DevExpress.XtraPrinting.BorderSide.Right) 
            | DevExpress.XtraPrinting.BorderSide.Bottom)));
            this.lblHdrTh.Font = new DevExpress.Drawing.DXFont("Arial", 11F, DevExpress.Drawing.DXFontStyle.Bold);
            this.lblHdrTh.LocationFloat = new DevExpress.Utils.PointFloat(110F, 20F);
            this.lblHdrTh.Name = "lblHdrTh";
            this.lblHdrTh.Padding = new DevExpress.XtraPrinting.PaddingInfo(4, 4, 0, 0, 100F);
            this.lblHdrTh.SizeF = new System.Drawing.SizeF(300F, 55F);
            this.lblHdrTh.Text = "DEPARTAMENTO DE TALENTO HUMANO";
            this.lblHdrTh.TextAlignment = DevExpress.XtraPrinting.TextAlignment.MiddleCenter;
            // 
            // lblHdrReq
            // 
            this.lblHdrReq.BackColor = System.Drawing.Color.FromArgb(((int)(((byte)(255)))), ((int)(((byte)(242)))), ((int)(((byte)(0)))));
            this.lblHdrReq.Borders = ((DevExpress.XtraPrinting.BorderSide)((((DevExpress.XtraPrinting.BorderSide.Left | DevExpress.XtraPrinting.BorderSide.Top) 
            | DevExpress.XtraPrinting.BorderSide.Right) 
            | DevExpress.XtraPrinting.BorderSide.Bottom)));
            this.lblHdrReq.Font = new DevExpress.Drawing.DXFont("Arial", 11F, DevExpress.Drawing.DXFontStyle.Bold);
            this.lblHdrReq.LocationFloat = new DevExpress.Utils.PointFloat(420F, 20F);
            this.lblHdrReq.Name = "lblHdrReq";
            this.lblHdrReq.Padding = new DevExpress.XtraPrinting.PaddingInfo(4, 4, 0, 0, 100F);
            this.lblHdrReq.SizeF = new System.Drawing.SizeF(310F, 55F);
            this.lblHdrReq.Text = "REQUISICIÓN DE PERSONAL";
            this.lblHdrReq.TextAlignment = DevExpress.XtraPrinting.TextAlignment.MiddleCenter;
            // 
            // lineHdr
            // 
            this.lineHdr.ForeColor = System.Drawing.Color.FromArgb(((int)(((byte)(0)))), ((int)(((byte)(51)))), ((int)(((byte)(102)))));
            this.lineHdr.LineWidth = 3F;
            this.lineHdr.LocationFloat = new DevExpress.Utils.PointFloat(10F, 110F);
            this.lineHdr.Name = "lineHdr";
            this.lineHdr.SizeF = new System.Drawing.SizeF(720F, 5F);
            // 
            // lblSolicita
            // 
            this.lblSolicita.Font = new DevExpress.Drawing.DXFont("Arial", 9F);
            this.lblSolicita.LocationFloat = new DevExpress.Utils.PointFloat(10F, 125F);
            this.lblSolicita.Name = "lblSolicita";
            this.lblSolicita.Padding = new DevExpress.XtraPrinting.PaddingInfo(2, 2, 0, 0, 100F);
            this.lblSolicita.SizeF = new System.Drawing.SizeF(250F, 18F);
            this.lblSolicita.Text = "Se solicita autorización para contratar a";
            this.lblSolicita.TextAlignment = DevExpress.XtraPrinting.TextAlignment.MiddleLeft;
            // 
            // lblCantidad
            // 
            this.lblCantidad.Borders = DevExpress.XtraPrinting.BorderSide.Bottom;
            this.lblCantidad.ExpressionBindings.AddRange(new DevExpress.XtraReports.UI.ExpressionBinding[] {
            new DevExpress.XtraReports.UI.ExpressionBinding("BeforePrint", "Text", "[CANTIDAD_PLAZAS]")});
            this.lblCantidad.Font = new DevExpress.Drawing.DXFont("Arial", 9F, DevExpress.Drawing.DXFontStyle.Bold);
            this.lblCantidad.LocationFloat = new DevExpress.Utils.PointFloat(260F, 125F);
            this.lblCantidad.Name = "lblCantidad";
            this.lblCantidad.Padding = new DevExpress.XtraPrinting.PaddingInfo(2, 2, 0, 0, 100F);
            this.lblCantidad.SizeF = new System.Drawing.SizeF(40F, 18F);
            this.lblCantidad.TextAlignment = DevExpress.XtraPrinting.TextAlignment.MiddleCenter;
            // 
            // lblPersonaS
            // 
            this.lblPersonaS.Font = new DevExpress.Drawing.DXFont("Arial", 9F);
            this.lblPersonaS.LocationFloat = new DevExpress.Utils.PointFloat(305F, 125F);
            this.lblPersonaS.Name = "lblPersonaS";
            this.lblPersonaS.Padding = new DevExpress.XtraPrinting.PaddingInfo(2, 2, 0, 0, 100F);
            this.lblPersonaS.SizeF = new System.Drawing.SizeF(80F, 18F);
            this.lblPersonaS.Text = "persona(s)";
            this.lblPersonaS.TextAlignment = DevExpress.XtraPrinting.TextAlignment.MiddleLeft;
            // 
            // lblParaOcupar
            // 
            this.lblParaOcupar.Font = new DevExpress.Drawing.DXFont("Arial", 9F);
            this.lblParaOcupar.LocationFloat = new DevExpress.Utils.PointFloat(10F, 150F);
            this.lblParaOcupar.Name = "lblParaOcupar";
            this.lblParaOcupar.Padding = new DevExpress.XtraPrinting.PaddingInfo(2, 2, 0, 0, 100F);
            this.lblParaOcupar.SizeF = new System.Drawing.SizeF(150F, 18F);
            this.lblParaOcupar.Text = "Para ocupar el puesto de";
            this.lblParaOcupar.TextAlignment = DevExpress.XtraPrinting.TextAlignment.MiddleLeft;
            // 
            // lblPuesto
            // 
            this.lblPuesto.Borders = DevExpress.XtraPrinting.BorderSide.Bottom;
            this.lblPuesto.ExpressionBindings.AddRange(new DevExpress.XtraReports.UI.ExpressionBinding[] {
            new DevExpress.XtraReports.UI.ExpressionBinding("BeforePrint", "Text", "[NOMBRE_PUESTO]")});
            this.lblPuesto.Font = new DevExpress.Drawing.DXFont("Arial", 9F, DevExpress.Drawing.DXFontStyle.Bold);
            this.lblPuesto.LocationFloat = new DevExpress.Utils.PointFloat(165F, 150F);
            this.lblPuesto.Name = "lblPuesto";
            this.lblPuesto.Padding = new DevExpress.XtraPrinting.PaddingInfo(2, 2, 0, 0, 100F);
            this.lblPuesto.SizeF = new System.Drawing.SizeF(340F, 18F);
            this.lblPuesto.TextAlignment = DevExpress.XtraPrinting.TextAlignment.MiddleLeft;
            // 
            // lblEnDepto
            // 
            this.lblEnDepto.Font = new DevExpress.Drawing.DXFont("Arial", 9F);
            this.lblEnDepto.LocationFloat = new DevExpress.Utils.PointFloat(10F, 175F);
            this.lblEnDepto.Name = "lblEnDepto";
            this.lblEnDepto.Padding = new DevExpress.XtraPrinting.PaddingInfo(2, 2, 0, 0, 100F);
            this.lblEnDepto.SizeF = new System.Drawing.SizeF(140F, 18F);
            this.lblEnDepto.Text = "en el departamento de";
            this.lblEnDepto.TextAlignment = DevExpress.XtraPrinting.TextAlignment.MiddleLeft;
            // 
            // lblUnidad
            // 
            this.lblUnidad.Borders = DevExpress.XtraPrinting.BorderSide.Bottom;
            this.lblUnidad.ExpressionBindings.AddRange(new DevExpress.XtraReports.UI.ExpressionBinding[] {
            new DevExpress.XtraReports.UI.ExpressionBinding("BeforePrint", "Text", "[NOMBRE_UNIDAD]")});
            this.lblUnidad.Font = new DevExpress.Drawing.DXFont("Arial", 9F, DevExpress.Drawing.DXFontStyle.Bold);
            this.lblUnidad.LocationFloat = new DevExpress.Utils.PointFloat(155F, 175F);
            this.lblUnidad.Name = "lblUnidad";
            this.lblUnidad.Padding = new DevExpress.XtraPrinting.PaddingInfo(2, 2, 0, 0, 100F);
            this.lblUnidad.SizeF = new System.Drawing.SizeF(350F, 18F);
            this.lblUnidad.TextAlignment = DevExpress.XtraPrinting.TextAlignment.MiddleLeft;
            // 
            // lblSueldoPref
            // 
            this.lblSueldoPref.Font = new DevExpress.Drawing.DXFont("Arial", 9F);
            this.lblSueldoPref.LocationFloat = new DevExpress.Utils.PointFloat(10F, 200F);
            this.lblSueldoPref.Name = "lblSueldoPref";
            this.lblSueldoPref.Padding = new DevExpress.XtraPrinting.PaddingInfo(2, 2, 0, 0, 100F);
            this.lblSueldoPref.SizeF = new System.Drawing.SizeF(55F, 18F);
            this.lblSueldoPref.Text = "Sueldo $";
            this.lblSueldoPref.TextAlignment = DevExpress.XtraPrinting.TextAlignment.MiddleLeft;
            // 
            // lblSalario
            // 
            this.lblSalario.Borders = DevExpress.XtraPrinting.BorderSide.Bottom;
            this.lblSalario.ExpressionBindings.AddRange(new DevExpress.XtraReports.UI.ExpressionBinding[] {
            new DevExpress.XtraReports.UI.ExpressionBinding("BeforePrint", "Text", "[SALARIO]!{0:n2}")});
            this.lblSalario.Font = new DevExpress.Drawing.DXFont("Arial", 9F, DevExpress.Drawing.DXFontStyle.Bold);
            this.lblSalario.LocationFloat = new DevExpress.Utils.PointFloat(70F, 200F);
            this.lblSalario.Name = "lblSalario";
            this.lblSalario.Padding = new DevExpress.XtraPrinting.PaddingInfo(2, 2, 0, 0, 100F);
            this.lblSalario.SizeF = new System.Drawing.SizeF(120F, 18F);
            this.lblSalario.TextAlignment = DevExpress.XtraPrinting.TextAlignment.MiddleLeft;
            // 
            // lblModalidad
            // 
            this.lblModalidad.Font = new DevExpress.Drawing.DXFont("Arial", 9F, DevExpress.Drawing.DXFontStyle.Bold);
            this.lblModalidad.LocationFloat = new DevExpress.Utils.PointFloat(10F, 235F);
            this.lblModalidad.Name = "lblModalidad";
            this.lblModalidad.Padding = new DevExpress.XtraPrinting.PaddingInfo(2, 2, 0, 0, 100F);
            this.lblModalidad.SizeF = new System.Drawing.SizeF(130F, 18F);
            this.lblModalidad.Text = "Modalidad de trabajo:";
            this.lblModalidad.TextAlignment = DevExpress.XtraPrinting.TextAlignment.MiddleLeft;
            // 
            // lblBoxPresencial
            // 
            this.lblBoxPresencial.Borders = ((DevExpress.XtraPrinting.BorderSide)((((DevExpress.XtraPrinting.BorderSide.Left | DevExpress.XtraPrinting.BorderSide.Top) 
            | DevExpress.XtraPrinting.BorderSide.Right) 
            | DevExpress.XtraPrinting.BorderSide.Bottom)));
            this.lblBoxPresencial.LocationFloat = new DevExpress.Utils.PointFloat(145F, 237F);
            this.lblBoxPresencial.Name = "lblBoxPresencial";
            this.lblBoxPresencial.SizeF = new System.Drawing.SizeF(14F, 14F);
            this.lblBoxPresencial.Text = " ";
            // 
            // lblChkPresencial
            // 
            this.lblChkPresencial.Font = new DevExpress.Drawing.DXFont("Arial", 8F, DevExpress.Drawing.DXFontStyle.Bold);
            this.lblChkPresencial.LocationFloat = new DevExpress.Utils.PointFloat(145F, 235F);
            this.lblChkPresencial.Name = "lblChkPresencial";
            this.lblChkPresencial.SizeF = new System.Drawing.SizeF(14F, 16F);
            this.lblChkPresencial.Text = " ";
            this.lblChkPresencial.TextAlignment = DevExpress.XtraPrinting.TextAlignment.MiddleCenter;
            // 
            // lblTxtPresencial
            // 
            this.lblTxtPresencial.Font = new DevExpress.Drawing.DXFont("Arial", 9F);
            this.lblTxtPresencial.LocationFloat = new DevExpress.Utils.PointFloat(163F, 235F);
            this.lblTxtPresencial.Name = "lblTxtPresencial";
            this.lblTxtPresencial.SizeF = new System.Drawing.SizeF(120F, 18F);
            this.lblTxtPresencial.Text = "Presencial";
            this.lblTxtPresencial.TextAlignment = DevExpress.XtraPrinting.TextAlignment.MiddleLeft;
            // 
            // lblBoxTeleTotal
            // 
            this.lblBoxTeleTotal.Borders = ((DevExpress.XtraPrinting.BorderSide)((((DevExpress.XtraPrinting.BorderSide.Left | DevExpress.XtraPrinting.BorderSide.Top) 
            | DevExpress.XtraPrinting.BorderSide.Right) 
            | DevExpress.XtraPrinting.BorderSide.Bottom)));
            this.lblBoxTeleTotal.LocationFloat = new DevExpress.Utils.PointFloat(280F, 237F);
            this.lblBoxTeleTotal.Name = "lblBoxTeleTotal";
            this.lblBoxTeleTotal.SizeF = new System.Drawing.SizeF(14F, 14F);
            this.lblBoxTeleTotal.Text = " ";
            // 
            // lblChkTeleTotal
            // 
            this.lblChkTeleTotal.Font = new DevExpress.Drawing.DXFont("Arial", 8F, DevExpress.Drawing.DXFontStyle.Bold);
            this.lblChkTeleTotal.LocationFloat = new DevExpress.Utils.PointFloat(280F, 235F);
            this.lblChkTeleTotal.Name = "lblChkTeleTotal";
            this.lblChkTeleTotal.SizeF = new System.Drawing.SizeF(14F, 16F);
            this.lblChkTeleTotal.Text = " ";
            this.lblChkTeleTotal.TextAlignment = DevExpress.XtraPrinting.TextAlignment.MiddleCenter;
            // 
            // lblTxtTeleTotal
            // 
            this.lblTxtTeleTotal.Font = new DevExpress.Drawing.DXFont("Arial", 9F);
            this.lblTxtTeleTotal.LocationFloat = new DevExpress.Utils.PointFloat(298F, 235F);
            this.lblTxtTeleTotal.Name = "lblTxtTeleTotal";
            this.lblTxtTeleTotal.SizeF = new System.Drawing.SizeF(120F, 18F);
            this.lblTxtTeleTotal.Text = "Teletrabajo Total";
            this.lblTxtTeleTotal.TextAlignment = DevExpress.XtraPrinting.TextAlignment.MiddleLeft;
            // 
            // lblBoxTeleParcial
            // 
            this.lblBoxTeleParcial.Borders = ((DevExpress.XtraPrinting.BorderSide)((((DevExpress.XtraPrinting.BorderSide.Left | DevExpress.XtraPrinting.BorderSide.Top) 
            | DevExpress.XtraPrinting.BorderSide.Right) 
            | DevExpress.XtraPrinting.BorderSide.Bottom)));
            this.lblBoxTeleParcial.LocationFloat = new DevExpress.Utils.PointFloat(450F, 237F);
            this.lblBoxTeleParcial.Name = "lblBoxTeleParcial";
            this.lblBoxTeleParcial.SizeF = new System.Drawing.SizeF(14F, 14F);
            this.lblBoxTeleParcial.Text = " ";
            // 
            // lblChkTeleParcial
            // 
            this.lblChkTeleParcial.Font = new DevExpress.Drawing.DXFont("Arial", 8F, DevExpress.Drawing.DXFontStyle.Bold);
            this.lblChkTeleParcial.LocationFloat = new DevExpress.Utils.PointFloat(450F, 235F);
            this.lblChkTeleParcial.Name = "lblChkTeleParcial";
            this.lblChkTeleParcial.SizeF = new System.Drawing.SizeF(14F, 16F);
            this.lblChkTeleParcial.Text = " ";
            this.lblChkTeleParcial.TextAlignment = DevExpress.XtraPrinting.TextAlignment.MiddleCenter;
            // 
            // lblTxtTeleParcial
            // 
            this.lblTxtTeleParcial.Font = new DevExpress.Drawing.DXFont("Arial", 9F);
            this.lblTxtTeleParcial.LocationFloat = new DevExpress.Utils.PointFloat(468F, 235F);
            this.lblTxtTeleParcial.Name = "lblTxtTeleParcial";
            this.lblTxtTeleParcial.SizeF = new System.Drawing.SizeF(120F, 18F);
            this.lblTxtTeleParcial.Text = "Teletrabajo Parcial";
            this.lblTxtTeleParcial.TextAlignment = DevExpress.XtraPrinting.TextAlignment.MiddleLeft;
            // 
            // lblTipoContratacion
            // 
            this.lblTipoContratacion.Font = new DevExpress.Drawing.DXFont("Arial", 9F, DevExpress.Drawing.DXFontStyle.Bold);
            this.lblTipoContratacion.LocationFloat = new DevExpress.Utils.PointFloat(520.0001F, 125F);
            this.lblTipoContratacion.Name = "lblTipoContratacion";
            this.lblTipoContratacion.Padding = new DevExpress.XtraPrinting.PaddingInfo(2, 2, 0, 0, 100F);
            this.lblTipoContratacion.SizeF = new System.Drawing.SizeF(138F, 18F);
            this.lblTipoContratacion.Text = "Tipo de contratación:";
            this.lblTipoContratacion.TextAlignment = DevExpress.XtraPrinting.TextAlignment.MiddleLeft;
            // 
            // lblBoxPermanente
            // 
            this.lblBoxPermanente.Borders = ((DevExpress.XtraPrinting.BorderSide)((((DevExpress.XtraPrinting.BorderSide.Left | DevExpress.XtraPrinting.BorderSide.Top) 
            | DevExpress.XtraPrinting.BorderSide.Right) 
            | DevExpress.XtraPrinting.BorderSide.Bottom)));
            this.lblBoxPermanente.LocationFloat = new DevExpress.Utils.PointFloat(520F, 152F);
            this.lblBoxPermanente.Name = "lblBoxPermanente";
            this.lblBoxPermanente.SizeF = new System.Drawing.SizeF(14F, 14F);
            this.lblBoxPermanente.Text = " ";
            // 
            // lblChkPermanente
            // 
            this.lblChkPermanente.Font = new DevExpress.Drawing.DXFont("Arial", 8F, DevExpress.Drawing.DXFontStyle.Bold);
            this.lblChkPermanente.LocationFloat = new DevExpress.Utils.PointFloat(520F, 150F);
            this.lblChkPermanente.Name = "lblChkPermanente";
            this.lblChkPermanente.SizeF = new System.Drawing.SizeF(14F, 16F);
            this.lblChkPermanente.Text = " ";
            this.lblChkPermanente.TextAlignment = DevExpress.XtraPrinting.TextAlignment.MiddleCenter;
            // 
            // lblTxtPermanente
            // 
            this.lblTxtPermanente.Font = new DevExpress.Drawing.DXFont("Arial", 9F);
            this.lblTxtPermanente.LocationFloat = new DevExpress.Utils.PointFloat(538F, 150F);
            this.lblTxtPermanente.Name = "lblTxtPermanente";
            this.lblTxtPermanente.SizeF = new System.Drawing.SizeF(120F, 18F);
            this.lblTxtPermanente.Text = "Permanente";
            this.lblTxtPermanente.TextAlignment = DevExpress.XtraPrinting.TextAlignment.MiddleLeft;
            // 
            // lblBoxTemporal
            // 
            this.lblBoxTemporal.Borders = ((DevExpress.XtraPrinting.BorderSide)((((DevExpress.XtraPrinting.BorderSide.Left | DevExpress.XtraPrinting.BorderSide.Top) 
            | DevExpress.XtraPrinting.BorderSide.Right) 
            | DevExpress.XtraPrinting.BorderSide.Bottom)));
            this.lblBoxTemporal.LocationFloat = new DevExpress.Utils.PointFloat(640F, 152F);
            this.lblBoxTemporal.Name = "lblBoxTemporal";
            this.lblBoxTemporal.SizeF = new System.Drawing.SizeF(14F, 14F);
            this.lblBoxTemporal.Text = " ";
            // 
            // lblChkTemporal
            // 
            this.lblChkTemporal.Font = new DevExpress.Drawing.DXFont("Arial", 8F, DevExpress.Drawing.DXFontStyle.Bold);
            this.lblChkTemporal.LocationFloat = new DevExpress.Utils.PointFloat(640F, 150F);
            this.lblChkTemporal.Name = "lblChkTemporal";
            this.lblChkTemporal.SizeF = new System.Drawing.SizeF(14F, 16F);
            this.lblChkTemporal.Text = " ";
            this.lblChkTemporal.TextAlignment = DevExpress.XtraPrinting.TextAlignment.MiddleCenter;
            // 
            // lblTxtTemporal
            // 
            this.lblTxtTemporal.Font = new DevExpress.Drawing.DXFont("Arial", 9F);
            this.lblTxtTemporal.LocationFloat = new DevExpress.Utils.PointFloat(658F, 150F);
            this.lblTxtTemporal.Name = "lblTxtTemporal";
            this.lblTxtTemporal.SizeF = new System.Drawing.SizeF(120F, 18F);
            this.lblTxtTemporal.Text = "Temporal";
            this.lblTxtTemporal.TextAlignment = DevExpress.XtraPrinting.TextAlignment.MiddleLeft;
            // 
            // lblHorarioPref
            // 
            this.lblHorarioPref.Font = new DevExpress.Drawing.DXFont("Arial", 9F, DevExpress.Drawing.DXFontStyle.Bold);
            this.lblHorarioPref.LocationFloat = new DevExpress.Utils.PointFloat(520F, 180F);
            this.lblHorarioPref.Name = "lblHorarioPref";
            this.lblHorarioPref.Padding = new DevExpress.XtraPrinting.PaddingInfo(2, 2, 0, 0, 100F);
            this.lblHorarioPref.SizeF = new System.Drawing.SizeF(120F, 18F);
            this.lblHorarioPref.Text = "Horario de trabajo:";
            this.lblHorarioPref.TextAlignment = DevExpress.XtraPrinting.TextAlignment.MiddleLeft;
            // 
            // lblHorario
            // 
            this.lblHorario.Borders = ((DevExpress.XtraPrinting.BorderSide)((((DevExpress.XtraPrinting.BorderSide.Left | DevExpress.XtraPrinting.BorderSide.Top) 
            | DevExpress.XtraPrinting.BorderSide.Right) 
            | DevExpress.XtraPrinting.BorderSide.Bottom)));
            this.lblHorario.ExpressionBindings.AddRange(new DevExpress.XtraReports.UI.ExpressionBinding[] {
            new DevExpress.XtraReports.UI.ExpressionBinding("BeforePrint", "Text", "[HORARIO]")});
            this.lblHorario.Font = new DevExpress.Drawing.DXFont("Arial", 9F);
            this.lblHorario.LocationFloat = new DevExpress.Utils.PointFloat(520F, 200F);
            this.lblHorario.Multiline = true;
            this.lblHorario.Name = "lblHorario";
            this.lblHorario.Padding = new DevExpress.XtraPrinting.PaddingInfo(2, 2, 0, 0, 100F);
            this.lblHorario.SizeF = new System.Drawing.SizeF(210F, 35F);
            this.lblHorario.TextAlignment = DevExpress.XtraPrinting.TextAlignment.TopLeft;
            // 
            // lineMid
            // 
            this.lineMid.LocationFloat = new DevExpress.Utils.PointFloat(10F, 270F);
            this.lineMid.Name = "lineMid";
            this.lineMid.SizeF = new System.Drawing.SizeF(720F, 2F);
            // 
            // lblEventual
            // 
            this.lblEventual.Font = new DevExpress.Drawing.DXFont("Arial", 9F);
            this.lblEventual.LocationFloat = new DevExpress.Utils.PointFloat(10F, 285F);
            this.lblEventual.Name = "lblEventual";
            this.lblEventual.Padding = new DevExpress.XtraPrinting.PaddingInfo(2, 2, 0, 0, 100F);
            this.lblEventual.SizeF = new System.Drawing.SizeF(250F, 18F);
            this.lblEventual.Text = "Si es eventual indicar por cuanto tiempo:";
            this.lblEventual.TextAlignment = DevExpress.XtraPrinting.TextAlignment.MiddleLeft;
            // 
            // lblDesdePref
            // 
            this.lblDesdePref.Font = new DevExpress.Drawing.DXFont("Arial", 9F);
            this.lblDesdePref.LocationFloat = new DevExpress.Utils.PointFloat(265F, 285F);
            this.lblDesdePref.Name = "lblDesdePref";
            this.lblDesdePref.Padding = new DevExpress.XtraPrinting.PaddingInfo(2, 2, 0, 0, 100F);
            this.lblDesdePref.SizeF = new System.Drawing.SizeF(40F, 18F);
            this.lblDesdePref.Text = "desde:";
            this.lblDesdePref.TextAlignment = DevExpress.XtraPrinting.TextAlignment.MiddleLeft;
            // 
            // lblDesde
            // 
            this.lblDesde.Borders = DevExpress.XtraPrinting.BorderSide.Bottom;
            this.lblDesde.ExpressionBindings.AddRange(new DevExpress.XtraReports.UI.ExpressionBinding[] {
            new DevExpress.XtraReports.UI.ExpressionBinding("BeforePrint", "Text", "[FECHA_DESDE]!{0:dd/MM/yyyy}")});
            this.lblDesde.Font = new DevExpress.Drawing.DXFont("Arial", 9F);
            this.lblDesde.LocationFloat = new DevExpress.Utils.PointFloat(310F, 285F);
            this.lblDesde.Name = "lblDesde";
            this.lblDesde.Padding = new DevExpress.XtraPrinting.PaddingInfo(2, 2, 0, 0, 100F);
            this.lblDesde.SizeF = new System.Drawing.SizeF(90F, 18F);
            this.lblDesde.TextAlignment = DevExpress.XtraPrinting.TextAlignment.MiddleCenter;
            // 
            // lblHastaPref
            // 
            this.lblHastaPref.Font = new DevExpress.Drawing.DXFont("Arial", 9F);
            this.lblHastaPref.LocationFloat = new DevExpress.Utils.PointFloat(410F, 285F);
            this.lblHastaPref.Name = "lblHastaPref";
            this.lblHastaPref.Padding = new DevExpress.XtraPrinting.PaddingInfo(2, 2, 0, 0, 100F);
            this.lblHastaPref.SizeF = new System.Drawing.SizeF(40F, 18F);
            this.lblHastaPref.Text = "hasta:";
            this.lblHastaPref.TextAlignment = DevExpress.XtraPrinting.TextAlignment.MiddleLeft;
            // 
            // lblHasta
            // 
            this.lblHasta.Borders = DevExpress.XtraPrinting.BorderSide.Bottom;
            this.lblHasta.ExpressionBindings.AddRange(new DevExpress.XtraReports.UI.ExpressionBinding[] {
            new DevExpress.XtraReports.UI.ExpressionBinding("BeforePrint", "Text", "[FECHA_HASTA]!{0:dd/MM/yyyy}")});
            this.lblHasta.Font = new DevExpress.Drawing.DXFont("Arial", 9F);
            this.lblHasta.LocationFloat = new DevExpress.Utils.PointFloat(455F, 285F);
            this.lblHasta.Name = "lblHasta";
            this.lblHasta.Padding = new DevExpress.XtraPrinting.PaddingInfo(2, 2, 0, 0, 100F);
            this.lblHasta.SizeF = new System.Drawing.SizeF(90F, 18F);
            this.lblHasta.TextAlignment = DevExpress.XtraPrinting.TextAlignment.MiddleCenter;
            // 
            // lblTiempoContrato
            // 
            this.lblTiempoContrato.ExpressionBindings.AddRange(new DevExpress.XtraReports.UI.ExpressionBinding[] {
            new DevExpress.XtraReports.UI.ExpressionBinding("BeforePrint", "Text", "[TIEMPO_CONTRATO_TXT]")});
            this.lblTiempoContrato.Font = new DevExpress.Drawing.DXFont("Arial", 9F, DevExpress.Drawing.DXFontStyle.Bold);
            this.lblTiempoContrato.LocationFloat = new DevExpress.Utils.PointFloat(555F, 285F);
            this.lblTiempoContrato.Name = "lblTiempoContrato";
            this.lblTiempoContrato.Padding = new DevExpress.XtraPrinting.PaddingInfo(2, 2, 0, 0, 100F);
            this.lblTiempoContrato.SizeF = new System.Drawing.SizeF(170F, 18F);
            this.lblTiempoContrato.TextAlignment = DevExpress.XtraPrinting.TextAlignment.MiddleLeft;
            // 
            // lblCubrir
            // 
            this.lblCubrir.Font = new DevExpress.Drawing.DXFont("Arial", 9F, DevExpress.Drawing.DXFontStyle.Bold);
            this.lblCubrir.LocationFloat = new DevExpress.Utils.PointFloat(10F, 320F);
            this.lblCubrir.Name = "lblCubrir";
            this.lblCubrir.Padding = new DevExpress.XtraPrinting.PaddingInfo(2, 2, 0, 0, 100F);
            this.lblCubrir.SizeF = new System.Drawing.SizeF(180F, 18F);
            this.lblCubrir.Text = "Para cubrir vacante por:";
            this.lblCubrir.TextAlignment = DevExpress.XtraPrinting.TextAlignment.MiddleLeft;
            // 
            // lblBoxPromocion
            // 
            this.lblBoxPromocion.Borders = ((DevExpress.XtraPrinting.BorderSide)((((DevExpress.XtraPrinting.BorderSide.Left | DevExpress.XtraPrinting.BorderSide.Top) 
            | DevExpress.XtraPrinting.BorderSide.Right) 
            | DevExpress.XtraPrinting.BorderSide.Bottom)));
            this.lblBoxPromocion.LocationFloat = new DevExpress.Utils.PointFloat(10F, 347F);
            this.lblBoxPromocion.Name = "lblBoxPromocion";
            this.lblBoxPromocion.SizeF = new System.Drawing.SizeF(14F, 14F);
            this.lblBoxPromocion.Text = " ";
            // 
            // lblChkPromocion
            // 
            this.lblChkPromocion.Font = new DevExpress.Drawing.DXFont("Arial", 8F, DevExpress.Drawing.DXFontStyle.Bold);
            this.lblChkPromocion.LocationFloat = new DevExpress.Utils.PointFloat(10F, 345F);
            this.lblChkPromocion.Name = "lblChkPromocion";
            this.lblChkPromocion.SizeF = new System.Drawing.SizeF(14F, 16F);
            this.lblChkPromocion.Text = " ";
            this.lblChkPromocion.TextAlignment = DevExpress.XtraPrinting.TextAlignment.MiddleCenter;
            // 
            // lblTxtPromocion
            // 
            this.lblTxtPromocion.Font = new DevExpress.Drawing.DXFont("Arial", 9F);
            this.lblTxtPromocion.LocationFloat = new DevExpress.Utils.PointFloat(28F, 345F);
            this.lblTxtPromocion.Name = "lblTxtPromocion";
            this.lblTxtPromocion.SizeF = new System.Drawing.SizeF(200F, 18F);
            this.lblTxtPromocion.Text = "Promoción (¿de quién?)";
            this.lblTxtPromocion.TextAlignment = DevExpress.XtraPrinting.TextAlignment.MiddleLeft;
            // 
            // lblLinePromocion
            // 
            this.lblLinePromocion.Borders = DevExpress.XtraPrinting.BorderSide.Bottom;
            this.lblLinePromocion.ExpressionBindings.AddRange(new DevExpress.XtraReports.UI.ExpressionBinding[] {
            new DevExpress.XtraReports.UI.ExpressionBinding("BeforePrint", "Text", "[TEXTO_SUSTITUTO]")});
            this.lblLinePromocion.LocationFloat = new DevExpress.Utils.PointFloat(240F, 345F);
            this.lblLinePromocion.Name = "lblLinePromocion";
            this.lblLinePromocion.SizeF = new System.Drawing.SizeF(490F, 18F);
            // 
            // lblBoxTransferencia
            // 
            this.lblBoxTransferencia.Borders = ((DevExpress.XtraPrinting.BorderSide)((((DevExpress.XtraPrinting.BorderSide.Left | DevExpress.XtraPrinting.BorderSide.Top) 
            | DevExpress.XtraPrinting.BorderSide.Right) 
            | DevExpress.XtraPrinting.BorderSide.Bottom)));
            this.lblBoxTransferencia.LocationFloat = new DevExpress.Utils.PointFloat(10F, 372F);
            this.lblBoxTransferencia.Name = "lblBoxTransferencia";
            this.lblBoxTransferencia.SizeF = new System.Drawing.SizeF(14F, 14F);
            this.lblBoxTransferencia.Text = " ";
            // 
            // lblChkTransferencia
            // 
            this.lblChkTransferencia.Font = new DevExpress.Drawing.DXFont("Arial", 8F, DevExpress.Drawing.DXFontStyle.Bold);
            this.lblChkTransferencia.LocationFloat = new DevExpress.Utils.PointFloat(10F, 370F);
            this.lblChkTransferencia.Name = "lblChkTransferencia";
            this.lblChkTransferencia.SizeF = new System.Drawing.SizeF(14F, 16F);
            this.lblChkTransferencia.Text = " ";
            this.lblChkTransferencia.TextAlignment = DevExpress.XtraPrinting.TextAlignment.MiddleCenter;
            // 
            // lblTxtTransferencia
            // 
            this.lblTxtTransferencia.Font = new DevExpress.Drawing.DXFont("Arial", 9F);
            this.lblTxtTransferencia.LocationFloat = new DevExpress.Utils.PointFloat(28F, 370F);
            this.lblTxtTransferencia.Name = "lblTxtTransferencia";
            this.lblTxtTransferencia.SizeF = new System.Drawing.SizeF(200F, 18F);
            this.lblTxtTransferencia.Text = "Transferencia (¿de quién?)";
            this.lblTxtTransferencia.TextAlignment = DevExpress.XtraPrinting.TextAlignment.MiddleLeft;
            // 
            // lblLineTransferencia
            // 
            this.lblLineTransferencia.Borders = DevExpress.XtraPrinting.BorderSide.Bottom;
            this.lblLineTransferencia.ExpressionBindings.AddRange(new DevExpress.XtraReports.UI.ExpressionBinding[] {
            new DevExpress.XtraReports.UI.ExpressionBinding("BeforePrint", "Text", "[TEXTO_SUSTITUTO]")});
            this.lblLineTransferencia.LocationFloat = new DevExpress.Utils.PointFloat(240F, 370F);
            this.lblLineTransferencia.Name = "lblLineTransferencia";
            this.lblLineTransferencia.SizeF = new System.Drawing.SizeF(490F, 18F);
            // 
            // lblBoxRenuncia
            // 
            this.lblBoxRenuncia.Borders = ((DevExpress.XtraPrinting.BorderSide)((((DevExpress.XtraPrinting.BorderSide.Left | DevExpress.XtraPrinting.BorderSide.Top) 
            | DevExpress.XtraPrinting.BorderSide.Right) 
            | DevExpress.XtraPrinting.BorderSide.Bottom)));
            this.lblBoxRenuncia.LocationFloat = new DevExpress.Utils.PointFloat(10F, 397F);
            this.lblBoxRenuncia.Name = "lblBoxRenuncia";
            this.lblBoxRenuncia.SizeF = new System.Drawing.SizeF(14F, 14F);
            this.lblBoxRenuncia.Text = " ";
            // 
            // lblChkRenuncia
            // 
            this.lblChkRenuncia.Font = new DevExpress.Drawing.DXFont("Arial", 8F, DevExpress.Drawing.DXFontStyle.Bold);
            this.lblChkRenuncia.LocationFloat = new DevExpress.Utils.PointFloat(10F, 395F);
            this.lblChkRenuncia.Name = "lblChkRenuncia";
            this.lblChkRenuncia.SizeF = new System.Drawing.SizeF(14F, 16F);
            this.lblChkRenuncia.Text = " ";
            this.lblChkRenuncia.TextAlignment = DevExpress.XtraPrinting.TextAlignment.MiddleCenter;
            // 
            // lblTxtRenuncia
            // 
            this.lblTxtRenuncia.Font = new DevExpress.Drawing.DXFont("Arial", 9F);
            this.lblTxtRenuncia.LocationFloat = new DevExpress.Utils.PointFloat(28F, 395F);
            this.lblTxtRenuncia.Name = "lblTxtRenuncia";
            this.lblTxtRenuncia.SizeF = new System.Drawing.SizeF(200F, 18F);
            this.lblTxtRenuncia.Text = "Renuncia (¿de quién?)";
            this.lblTxtRenuncia.TextAlignment = DevExpress.XtraPrinting.TextAlignment.MiddleLeft;
            // 
            // lblLineRenuncia
            // 
            this.lblLineRenuncia.Borders = DevExpress.XtraPrinting.BorderSide.Bottom;
            this.lblLineRenuncia.ExpressionBindings.AddRange(new DevExpress.XtraReports.UI.ExpressionBinding[] {
            new DevExpress.XtraReports.UI.ExpressionBinding("BeforePrint", "Text", "[TEXTO_SUSTITUTO]")});
            this.lblLineRenuncia.LocationFloat = new DevExpress.Utils.PointFloat(240F, 395F);
            this.lblLineRenuncia.Name = "lblLineRenuncia";
            this.lblLineRenuncia.SizeF = new System.Drawing.SizeF(490F, 18F);
            // 
            // lblBoxNuevaCreacion
            // 
            this.lblBoxNuevaCreacion.Borders = ((DevExpress.XtraPrinting.BorderSide)((((DevExpress.XtraPrinting.BorderSide.Left | DevExpress.XtraPrinting.BorderSide.Top) 
            | DevExpress.XtraPrinting.BorderSide.Right) 
            | DevExpress.XtraPrinting.BorderSide.Bottom)));
            this.lblBoxNuevaCreacion.LocationFloat = new DevExpress.Utils.PointFloat(10F, 422F);
            this.lblBoxNuevaCreacion.Name = "lblBoxNuevaCreacion";
            this.lblBoxNuevaCreacion.SizeF = new System.Drawing.SizeF(14F, 14F);
            this.lblBoxNuevaCreacion.Text = " ";
            // 
            // lblChkNuevaCreacion
            // 
            this.lblChkNuevaCreacion.Font = new DevExpress.Drawing.DXFont("Arial", 8F, DevExpress.Drawing.DXFontStyle.Bold);
            this.lblChkNuevaCreacion.LocationFloat = new DevExpress.Utils.PointFloat(10F, 420F);
            this.lblChkNuevaCreacion.Name = "lblChkNuevaCreacion";
            this.lblChkNuevaCreacion.SizeF = new System.Drawing.SizeF(14F, 16F);
            this.lblChkNuevaCreacion.Text = " ";
            this.lblChkNuevaCreacion.TextAlignment = DevExpress.XtraPrinting.TextAlignment.MiddleCenter;
            // 
            // lblTxtNuevaCreacion
            // 
            this.lblTxtNuevaCreacion.Font = new DevExpress.Drawing.DXFont("Arial", 9F);
            this.lblTxtNuevaCreacion.LocationFloat = new DevExpress.Utils.PointFloat(28F, 420F);
            this.lblTxtNuevaCreacion.Name = "lblTxtNuevaCreacion";
            this.lblTxtNuevaCreacion.SizeF = new System.Drawing.SizeF(200F, 18F);
            this.lblTxtNuevaCreacion.Text = "Puesto de nueva creación";
            this.lblTxtNuevaCreacion.TextAlignment = DevExpress.XtraPrinting.TextAlignment.MiddleLeft;
            // 
            // lblLineNuevaCreacion
            // 
            this.lblLineNuevaCreacion.Borders = DevExpress.XtraPrinting.BorderSide.Bottom;
            this.lblLineNuevaCreacion.LocationFloat = new DevExpress.Utils.PointFloat(240F, 420F);
            this.lblLineNuevaCreacion.Name = "lblLineNuevaCreacion";
            this.lblLineNuevaCreacion.SizeF = new System.Drawing.SizeF(490F, 18F);
            this.lblLineNuevaCreacion.Text = " ";
            // 
            // lblBoxOtros
            // 
            this.lblBoxOtros.Borders = ((DevExpress.XtraPrinting.BorderSide)((((DevExpress.XtraPrinting.BorderSide.Left | DevExpress.XtraPrinting.BorderSide.Top) 
            | DevExpress.XtraPrinting.BorderSide.Right) 
            | DevExpress.XtraPrinting.BorderSide.Bottom)));
            this.lblBoxOtros.LocationFloat = new DevExpress.Utils.PointFloat(10F, 447F);
            this.lblBoxOtros.Name = "lblBoxOtros";
            this.lblBoxOtros.SizeF = new System.Drawing.SizeF(14F, 14F);
            this.lblBoxOtros.Text = " ";
            // 
            // lblChkOtros
            // 
            this.lblChkOtros.Font = new DevExpress.Drawing.DXFont("Arial", 8F, DevExpress.Drawing.DXFontStyle.Bold);
            this.lblChkOtros.LocationFloat = new DevExpress.Utils.PointFloat(10F, 445F);
            this.lblChkOtros.Name = "lblChkOtros";
            this.lblChkOtros.SizeF = new System.Drawing.SizeF(14F, 16F);
            this.lblChkOtros.Text = " ";
            this.lblChkOtros.TextAlignment = DevExpress.XtraPrinting.TextAlignment.MiddleCenter;
            // 
            // lblTxtOtros
            // 
            this.lblTxtOtros.Font = new DevExpress.Drawing.DXFont("Arial", 9F);
            this.lblTxtOtros.LocationFloat = new DevExpress.Utils.PointFloat(28F, 445F);
            this.lblTxtOtros.Name = "lblTxtOtros";
            this.lblTxtOtros.SizeF = new System.Drawing.SizeF(200F, 18F);
            this.lblTxtOtros.Text = "Otros";
            this.lblTxtOtros.TextAlignment = DevExpress.XtraPrinting.TextAlignment.MiddleLeft;
            // 
            // lblLineOtros
            // 
            this.lblLineOtros.Borders = DevExpress.XtraPrinting.BorderSide.Bottom;
            this.lblLineOtros.ExpressionBindings.AddRange(new DevExpress.XtraReports.UI.ExpressionBinding[] {
            new DevExpress.XtraReports.UI.ExpressionBinding("BeforePrint", "Text", "[JUSTIFICACION]")});
            this.lblLineOtros.LocationFloat = new DevExpress.Utils.PointFloat(240F, 445F);
            this.lblLineOtros.Name = "lblLineOtros";
            this.lblLineOtros.SizeF = new System.Drawing.SizeF(490F, 18F);
            // 
            // lblJustificacionTitulo
            // 
            this.lblJustificacionTitulo.Font = new DevExpress.Drawing.DXFont("Arial", 9F, DevExpress.Drawing.DXFontStyle.Bold);
            this.lblJustificacionTitulo.LocationFloat = new DevExpress.Utils.PointFloat(10F, 485F);
            this.lblJustificacionTitulo.Name = "lblJustificacionTitulo";
            this.lblJustificacionTitulo.Padding = new DevExpress.XtraPrinting.PaddingInfo(2, 2, 0, 0, 100F);
            this.lblJustificacionTitulo.SizeF = new System.Drawing.SizeF(200F, 20F);
            this.lblJustificacionTitulo.Text = "JUSTIFICACIÓN";
            this.lblJustificacionTitulo.TextAlignment = DevExpress.XtraPrinting.TextAlignment.MiddleLeft;
            // 
            // lblJustificacion
            // 
            this.lblJustificacion.Borders = ((DevExpress.XtraPrinting.BorderSide)((((DevExpress.XtraPrinting.BorderSide.Left | DevExpress.XtraPrinting.BorderSide.Top) 
            | DevExpress.XtraPrinting.BorderSide.Right) 
            | DevExpress.XtraPrinting.BorderSide.Bottom)));
            this.lblJustificacion.ExpressionBindings.AddRange(new DevExpress.XtraReports.UI.ExpressionBinding[] {
            new DevExpress.XtraReports.UI.ExpressionBinding("BeforePrint", "Text", "[JUSTIFICACION]")});
            this.lblJustificacion.Font = new DevExpress.Drawing.DXFont("Arial", 9F);
            this.lblJustificacion.LocationFloat = new DevExpress.Utils.PointFloat(10F, 510F);
            this.lblJustificacion.Multiline = true;
            this.lblJustificacion.Name = "lblJustificacion";
            this.lblJustificacion.Padding = new DevExpress.XtraPrinting.PaddingInfo(2, 2, 0, 0, 100F);
            this.lblJustificacion.SizeF = new System.Drawing.SizeF(720F, 80F);
            this.lblJustificacion.TextAlignment = DevExpress.XtraPrinting.TextAlignment.TopLeft;
            // 
            // pnlAprobaciones
            // 
            this.pnlAprobaciones.BackColor = System.Drawing.Color.FromArgb(((int)(((byte)(217)))), ((int)(((byte)(217)))), ((int)(((byte)(217)))));
            this.pnlAprobaciones.Borders = ((DevExpress.XtraPrinting.BorderSide)((((DevExpress.XtraPrinting.BorderSide.Left | DevExpress.XtraPrinting.BorderSide.Top) 
            | DevExpress.XtraPrinting.BorderSide.Right) 
            | DevExpress.XtraPrinting.BorderSide.Bottom)));
            this.pnlAprobaciones.Controls.AddRange(new DevExpress.XtraReports.UI.XRControl[] {
            this.lblAprobaciones,
            this.lblJefePref,
            this.lblJefeNombre,
            this.lblJefeFechaPref,
            this.lblJefeFecha,
            this.lblDecanoPref,
            this.lblDecanoNombre,
            this.lblDecanoFechaPref,
            this.lblDecanoFecha,
            this.lblVraPref,
            this.lblVraNombre,
            this.lblVraFechaPref,
            this.lblVraFecha});
            this.pnlAprobaciones.LocationFloat = new DevExpress.Utils.PointFloat(10F, 610F);
            this.pnlAprobaciones.Name = "pnlAprobaciones";
            this.pnlAprobaciones.SizeF = new System.Drawing.SizeF(720F, 280F);
            // 
            // lblAprobaciones
            // 
            this.lblAprobaciones.BackColor = System.Drawing.Color.FromArgb(((int)(((byte)(217)))), ((int)(((byte)(217)))), ((int)(((byte)(217)))));
            this.lblAprobaciones.Font = new DevExpress.Drawing.DXFont("Arial", 12F, DevExpress.Drawing.DXFontStyle.Bold);
            this.lblAprobaciones.LocationFloat = new DevExpress.Utils.PointFloat(0F, 0F);
            this.lblAprobaciones.Name = "lblAprobaciones";
            this.lblAprobaciones.SizeF = new System.Drawing.SizeF(720F, 28F);
            this.lblAprobaciones.Text = "APROBACIONES";
            this.lblAprobaciones.TextAlignment = DevExpress.XtraPrinting.TextAlignment.MiddleCenter;
            // 
            // lblJefePref
            // 
            this.lblJefePref.Font = new DevExpress.Drawing.DXFont("Arial", 9F, DevExpress.Drawing.DXFontStyle.Bold);
            this.lblJefePref.LocationFloat = new DevExpress.Utils.PointFloat(15F, 50F);
            this.lblJefePref.Name = "lblJefePref";
            this.lblJefePref.Padding = new DevExpress.XtraPrinting.PaddingInfo(2, 2, 0, 0, 100F);
            this.lblJefePref.SizeF = new System.Drawing.SizeF(130F, 18F);
            this.lblJefePref.Text = "JEFE INMEDIATO:";
            this.lblJefePref.TextAlignment = DevExpress.XtraPrinting.TextAlignment.MiddleLeft;
            // 
            // lblJefeNombre
            // 
            this.lblJefeNombre.Borders = DevExpress.XtraPrinting.BorderSide.Bottom;
            this.lblJefeNombre.LocationFloat = new DevExpress.Utils.PointFloat(150F, 50F);
            this.lblJefeNombre.Name = "lblJefeNombre";
            this.lblJefeNombre.SizeF = new System.Drawing.SizeF(350F, 18F);
            this.lblJefeNombre.Text = " ";
            // 
            // lblJefeFechaPref
            // 
            this.lblJefeFechaPref.Font = new DevExpress.Drawing.DXFont("Arial", 9F, DevExpress.Drawing.DXFontStyle.Bold);
            this.lblJefeFechaPref.LocationFloat = new DevExpress.Utils.PointFloat(510.0001F, 50F);
            this.lblJefeFechaPref.Name = "lblJefeFechaPref";
            this.lblJefeFechaPref.Padding = new DevExpress.XtraPrinting.PaddingInfo(2, 2, 0, 0, 100F);
            this.lblJefeFechaPref.SizeF = new System.Drawing.SizeF(59.99994F, 18F);
            this.lblJefeFechaPref.Text = "FECHA:";
            this.lblJefeFechaPref.TextAlignment = DevExpress.XtraPrinting.TextAlignment.MiddleLeft;
            // 
            // lblJefeFecha
            // 
            this.lblJefeFecha.Borders = DevExpress.XtraPrinting.BorderSide.Bottom;
            this.lblJefeFecha.LocationFloat = new DevExpress.Utils.PointFloat(575F, 50F);
            this.lblJefeFecha.Name = "lblJefeFecha";
            this.lblJefeFecha.SizeF = new System.Drawing.SizeF(120F, 18F);
            this.lblJefeFecha.Text = " ";
            // 
            // lblDecanoPref
            // 
            this.lblDecanoPref.Font = new DevExpress.Drawing.DXFont("Arial", 9F, DevExpress.Drawing.DXFontStyle.Bold);
            this.lblDecanoPref.LocationFloat = new DevExpress.Utils.PointFloat(15F, 120F);
            this.lblDecanoPref.Name = "lblDecanoPref";
            this.lblDecanoPref.Padding = new DevExpress.XtraPrinting.PaddingInfo(2, 2, 0, 0, 100F);
            this.lblDecanoPref.SizeF = new System.Drawing.SizeF(220F, 18F);
            this.lblDecanoPref.Text = "DECANO, GERENTE O DIRECTOR:";
            this.lblDecanoPref.TextAlignment = DevExpress.XtraPrinting.TextAlignment.MiddleLeft;
            // 
            // lblDecanoNombre
            // 
            this.lblDecanoNombre.Borders = DevExpress.XtraPrinting.BorderSide.Bottom;
            this.lblDecanoNombre.LocationFloat = new DevExpress.Utils.PointFloat(240F, 120F);
            this.lblDecanoNombre.Name = "lblDecanoNombre";
            this.lblDecanoNombre.SizeF = new System.Drawing.SizeF(260F, 18F);
            this.lblDecanoNombre.Text = " ";
            // 
            // lblDecanoFechaPref
            // 
            this.lblDecanoFechaPref.Font = new DevExpress.Drawing.DXFont("Arial", 9F, DevExpress.Drawing.DXFontStyle.Bold);
            this.lblDecanoFechaPref.LocationFloat = new DevExpress.Utils.PointFloat(510.0001F, 119.9999F);
            this.lblDecanoFechaPref.Name = "lblDecanoFechaPref";
            this.lblDecanoFechaPref.Padding = new DevExpress.XtraPrinting.PaddingInfo(2, 2, 0, 0, 100F);
            this.lblDecanoFechaPref.SizeF = new System.Drawing.SizeF(59.99994F, 18F);
            this.lblDecanoFechaPref.Text = "FECHA:";
            this.lblDecanoFechaPref.TextAlignment = DevExpress.XtraPrinting.TextAlignment.MiddleLeft;
            // 
            // lblDecanoFecha
            // 
            this.lblDecanoFecha.Borders = DevExpress.XtraPrinting.BorderSide.Bottom;
            this.lblDecanoFecha.LocationFloat = new DevExpress.Utils.PointFloat(575F, 120F);
            this.lblDecanoFecha.Name = "lblDecanoFecha";
            this.lblDecanoFecha.SizeF = new System.Drawing.SizeF(120F, 18F);
            this.lblDecanoFecha.Text = " ";
            // 
            // lblVraPref
            // 
            this.lblVraPref.Font = new DevExpress.Drawing.DXFont("Arial", 9F, DevExpress.Drawing.DXFontStyle.Bold);
            this.lblVraPref.LocationFloat = new DevExpress.Utils.PointFloat(15F, 190F);
            this.lblVraPref.Name = "lblVraPref";
            this.lblVraPref.Padding = new DevExpress.XtraPrinting.PaddingInfo(2, 2, 0, 0, 100F);
            this.lblVraPref.SizeF = new System.Drawing.SizeF(230F, 18F);
            this.lblVraPref.Text = "VRA / VRITE / VRIV / GG / DIGGEI:";
            this.lblVraPref.TextAlignment = DevExpress.XtraPrinting.TextAlignment.MiddleLeft;
            // 
            // lblVraNombre
            // 
            this.lblVraNombre.Borders = DevExpress.XtraPrinting.BorderSide.Bottom;
            this.lblVraNombre.LocationFloat = new DevExpress.Utils.PointFloat(250F, 190F);
            this.lblVraNombre.Name = "lblVraNombre";
            this.lblVraNombre.SizeF = new System.Drawing.SizeF(250F, 18F);
            this.lblVraNombre.Text = " ";
            // 
            // lblVraFechaPref
            // 
            this.lblVraFechaPref.Font = new DevExpress.Drawing.DXFont("Arial", 9F, DevExpress.Drawing.DXFontStyle.Bold);
            this.lblVraFechaPref.LocationFloat = new DevExpress.Utils.PointFloat(510.0001F, 190F);
            this.lblVraFechaPref.Name = "lblVraFechaPref";
            this.lblVraFechaPref.Padding = new DevExpress.XtraPrinting.PaddingInfo(2, 2, 0, 0, 100F);
            this.lblVraFechaPref.SizeF = new System.Drawing.SizeF(59.99994F, 18F);
            this.lblVraFechaPref.Text = "FECHA:";
            this.lblVraFechaPref.TextAlignment = DevExpress.XtraPrinting.TextAlignment.MiddleLeft;
            // 
            // lblVraFecha
            // 
            this.lblVraFecha.Borders = DevExpress.XtraPrinting.BorderSide.Bottom;
            this.lblVraFecha.LocationFloat = new DevExpress.Utils.PointFloat(575F, 190F);
            this.lblVraFecha.Name = "lblVraFecha";
            this.lblVraFecha.SizeF = new System.Drawing.SizeF(120F, 18F);
            this.lblVraFecha.Text = " ";
            // 
            // rptRequisicionPersonal
            // 
            this.Bands.AddRange(new DevExpress.XtraReports.UI.Band[] {
            this.topMarginBand1,
            this.detailBand1,
            this.bottomMarginBand1});
            this.Font = new DevExpress.Drawing.DXFont("Arial", 9F);
            this.Margins = new DevExpress.Drawing.DXMargins(40F, 40F, 40F, 40F);
            this.Version = "24.2";
            ((System.ComponentModel.ISupportInitialize)(this)).EndInit();

		}
	}
}

