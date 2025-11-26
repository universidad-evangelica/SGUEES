import { Component, Input,NgModule, OnInit,TemplateRef, ViewChild  } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { take } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { custom } from 'devextreme/ui/dialog';
import { CBaseComponent } from 'src/app/FxAPI/CBaseComponent.component';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { UpdateType } from 'src/app/shared/models/UpdateType.enum';
import { AppInfoService } from 'src/app/shared/services/app-info.service';
import { ComCuadroComparativo } from './models/com-cuadro-comparativo';
import { ComCuadroComparativoDetaUpdate } from './com-cuadro-comparativo-deta/models/com-cuadro-comparativo-deta-update';
import { ComCuadroComparativoService } from './com-cuadro-comparativo.service';
import { DxDataGridComponent } from 'devextreme-angular/ui/data-grid';
import { ComCuadroComparativoSoliCotizacion } from './models/com-cuadro-comparativo_soli_cotizacion';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { ComCuadroComparativoDoc } from './com-cuadro-comparativo-doc/models/com-cuadro-comparativo-doc';
import { DxFormComponent } from 'devextreme-angular/ui/form';

@Component({
	selector: 'app-com-cuadro-comparativo',
	templateUrl: './com-cuadro-comparativo.component.html',
	styleUrls: ['./com-cuadro-comparativo.component.scss'],
})

export class ComCuadroComparativoComponent extends CBaseComponent implements OnInit {
	@ViewChild('dataSolicitudDisponible', { static: false }) dataSolicitudDisponible!: DxDataGridComponent;
  @ViewChild('DataCuadroComparativoDeta', { static: false }) DataCuadroComparativoDeta!: DxDataGridComponent;
  @ViewChild('DataSoliCotizaDeta', { static: false }) DataSoliCotizaDeta!: DxDataGridComponent;
  @ViewChild('DataComSoliCotizaProveedor', { static: false }) DataComSoliCotizaProveedor!: DxDataGridComponent;
  @ViewChild('selectionCellTemplate', { static: true }) selectionCellTemplate: TemplateRef<any>;
  @ViewChild('dataRowTemplate', { static: true }) dataRowTemplate!: TemplateRef<any>;
  @ViewChild('fDocumento', { static: false }) dataDocForm!: DxFormComponent;
  @ViewChild('fEliminarComentario', { static: false }) dataEliminarComentarioForm!: DxFormComponent;

	//#region <Declarando Variales>
	mESTADO_CUADRO_COMPARATIVO: any;
	mCORR_SOLI_COTIZACION: any;
	readOnly = false;
  vFECHA_INICIAL_MODAL: any;
	vFECHA_FINAL_MODAL: any;
  popupVisible = false;
  popupVisibleObservacion=false;
  mCOM_SOLICITUD_DISPONIBLE: any;
  mCOM_SOLI_COTIZACION_PROVEEDOR: any;
  mCOM_SOLI_COTIZACION_DETA: any;
  mCOM_CUADRO_COMPARATIVO_DETA: any;
  mCOM_CUADRO_COMPARATIVO_PROVEEDOR: any;
  mCOM_SOLI_COTIZA_PROVEEDOR: any;
  vANIO_PERIODO_SOLI_COTIZACION: number;
  vCORR_SOLI_COTIZACION: number;
  mCORR_UNIDAD_MEDIDA: any;
  mCOM_COTIZACION_DETA: any;
  mCOM_COTIZACION: any;
  vFECHA_INICIAL: any;
	vFECHA_FINAL: any;
  modelCuadroComparativo: ComCuadroComparativoSoliCotizacion;
  ColumnsDetalle: any;
  SELECCION: any;
  popupVisiblePdf=false;
  vPDF: any;
  PDF!: SafeUrl;
  mCOM_CUADRO_COMPARATIVO_AUTORIZACIONES: any;
  mCOM_COTIZACION_DOC: any;
  btnSolicitar = '';
  mCOM_CUADRO_COMPARATIVO_ORDEN_COMPRA: any;
  mORDEN_COMPRA: any;
  mCOM_CUADRO_COMPARATIVO_COMENTARIO: any;
  popupVisibleDoc=false;
  mDocumento: ComCuadroComparativoDoc = {
    CORR_EMPRESA: this.appInfoService.CORR_EMPRESA,
    ANIO_PERIODO: 0,
    CORR_CUADRO_COMPARATIVO: 0,
    CORR_DOCUMENTO: 0,
    NOMBRE_DOCUMENTO: '',
    DESCRIPCION_DOCUMENTO: '',
    CORR_TIPO_DOCUMENTO: 0,
    NOMBRE_TIPO_DOCUMENTO: ''
  };
  mCORR_TIPO_DOCUMENTO: any;
  vNOMBRE_ARCHIVO = '';
  fileDoc: any;
  popupVisibleEliminarComentario=false;
  eEventoEliminar: any;
	// #endregion

  constructor(
		public override appInfoService: AppInfoService,
		public override router: ActivatedRoute,
		private service: ComCuadroComparativoService,
    private sanitization: DomSanitizer
	) {
		super(appInfoService, router);
		this.columns = this.service.getColumns();
		this.summary = this.service.getSummary();
		this.items = this.service.getItems();
    this.OnValueChangeFECHA_INICIAL_MODAL = this.OnValueChangeFECHA_INICIAL_MODAL.bind(this);
		this.OnValueChangeFECHA_FINAL_MODAL = this.OnValueChangeFECHA_FINAL_MODAL.bind(this);
    this.RefrescarSolicitud = this.RefrescarSolicitud.bind(this);
    this.guardarPopup = this.guardarPopup.bind(this);
    this.hidePopup = this.hidePopup.bind(this);
    this.hideEliminacionComentarioPopup = this.hideEliminacionComentarioPopup.bind(this);
	}

	//#region <Inicializando Opciones>
	ngOnInit(): void {
		this.inicializaOpciones();
		this.llenaComboBox();
		this.consultar();
	}

	inicializaOpciones() {
    this.vFECHA_INICIAL = this.appInfoService.dateAdd(this.appInfoService.getDate(), 'day', -7);
		this.vFECHA_FINAL = this.appInfoService.getDate();
  }
	// #endregion

	//#region <Manejo de Combos>
	llenaComboBox() {
		this.getESTADO_CUADRO_COMPARATIVO();
    this.getCORR_TIPO_DOCUMENTO();
	}

	getESTADO_CUADRO_COMPARATIVO() {
		this.appInfoService
			.getLookUp('COM_CUADRO_COMPARATIVO', 'COM_LISTA', 'GetESTADO_CUADRO_COMPARATIVO', undefined, environment.UrlCOMPRASAPI)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.mESTADO_CUADRO_COMPARATIVO = response.Data;
					}
				},
				error: (error: any) => {
					this.notifyFx(error, NotifyType.Error);
				},
			});
	}
  getCORR_TIPO_DOCUMENTO() {
		this.appInfoService
			.getLookUp('COM_CUADRO_COMPARATIVO', 'COM_TIPO_DOC_FISICO', 'GetCORR_TIPO_DOCUMENTO', undefined, environment.UrlCOMPRASAPI)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.mCORR_TIPO_DOCUMENTO = response.Data;
					}
				},
				error: (error: any) => {
					this.notifyFx(error, NotifyType.Error);
				},
			});
	}
	//#endregion

	//#region <Metodos Mtto>
	fillParam(xANIO_PERIODO?: number, xCORR_CUADRO_COMPARATIVO?: number,xJUSTIFICACION_ELIMINAR?:String): any {
		if (xCORR_CUADRO_COMPARATIVO == undefined) {
      xANIO_PERIODO = 0;
			xCORR_CUADRO_COMPARATIVO = 0;
		}
		return {
      ANIO_PERIODO: xANIO_PERIODO,
			CORR_CUADRO_COMPARATIVO: xCORR_CUADRO_COMPARATIVO,
      FECHA_INICIAL: this.vFECHA_INICIAL.toISOString(),
			FECHA_FINAL: this.vFECHA_FINAL.toISOString(),
      JUSTIFICACION_ELIMINAR: xJUSTIFICACION_ELIMINAR
		};
	}

	override fillData(xModel?: ComCuadroComparativo): ComCuadroComparativo {
		if (xModel !== undefined) {
			return {
				CORR_EMPRESA: xModel.CORR_EMPRESA,
				ANIO_PERIODO: xModel.ANIO_PERIODO,
				CORR_CUADRO_COMPARATIVO: xModel.CORR_CUADRO_COMPARATIVO,
        NUMERO_CUADRO_COMPARA: xModel.NUMERO_CUADRO_COMPARA,
				FECHA_CUADRO_COMPARATIVO: xModel.FECHA_CUADRO_COMPARATIVO,
				ESTADO_CUADRO_COMPARATIVO: xModel.ESTADO_CUADRO_COMPARATIVO,
        NOMBRE_ESTADO_CUADRO_COMPARATIVO: xModel.NOMBRE_ESTADO_CUADRO_COMPARATIVO,
				USUARIO_CUADRO_COMPARATIVO: xModel.USUARIO_CUADRO_COMPARATIVO,
				OBSERVACIONES: xModel.OBSERVACIONES,
				ES_MEJOR_PRECIO: xModel.ES_MEJOR_PRECIO,
				TIENE_CREDITO_30_DIAS: xModel.TIENE_CREDITO_30_DIAS,
				TIENE_BUEN_SOPORTE_TECNICO: xModel.TIENE_BUEN_SOPORTE_TECNICO,
				TIENE_BUENA_CALIDAD_PRODUCTO: xModel.TIENE_BUENA_CALIDAD_PRODUCTO,
				TIENE_MEJOR_TIEMPO_ENTREGA: xModel.TIENE_MEJOR_TIEMPO_ENTREGA,
				BRINDA_BUENA_EXPERIENCIA_PROVEEDOR: xModel.BRINDA_BUENA_EXPERIENCIA_PROVEEDOR,
				ES_PROVEEDOR_UNICO: xModel.ES_PROVEEDOR_UNICO,
				EXISTE_OTRA_RAZON: xModel.EXISTE_OTRA_RAZON,
				NOMBRE_OTRA_RAZON: xModel.NOMBRE_OTRA_RAZON,
				ANIO_PERIODO_SOLI_COTI: xModel.ANIO_PERIODO_SOLI_COTI,
				CORR_SOLI_COTIZACION: xModel.CORR_SOLI_COTIZACION,
				USUARIO_CREA: xModel.USUARIO_CREA,
				FECHA_CREA: xModel.FECHA_CREA,
				ESTACION_CREA: xModel.ESTACION_CREA,
				USUARIO_ACTU: xModel.USUARIO_ACTU,
				FECHA_ACTU: xModel.FECHA_ACTU,
				ESTACION_ACTU: xModel.ESTACION_ACTU,
        NOMBRE_PROVEEDOR: xModel.NOMBRE_PROVEEDOR,
        NUMERO_SOLI_COTIZACION: xModel.NUMERO_SOLI_COTIZACION,
        NUMERO_SOLI_COMPRA: xModel.NUMERO_SOLI_COMPRA,
        NUMERO_COTIZACION: xModel.NUMERO_COTIZACION,
			};
		} else {
			return {
				CORR_EMPRESA: 1,
				ANIO_PERIODO: this.appInfoService.toYear(new Date()),
				CORR_CUADRO_COMPARATIVO: 0,
        NUMERO_CUADRO_COMPARA: '',
				FECHA_CUADRO_COMPARATIVO: new Date(),
				ESTADO_CUADRO_COMPARATIVO: '',
        NOMBRE_ESTADO_CUADRO_COMPARATIVO: '',
				USUARIO_CUADRO_COMPARATIVO: '',
				OBSERVACIONES: '',
				ES_MEJOR_PRECIO: true,
				TIENE_CREDITO_30_DIAS: true,
				TIENE_BUEN_SOPORTE_TECNICO: true,
				TIENE_BUENA_CALIDAD_PRODUCTO: true,
				TIENE_MEJOR_TIEMPO_ENTREGA: true,
				BRINDA_BUENA_EXPERIENCIA_PROVEEDOR: true,
				ES_PROVEEDOR_UNICO: true,
				EXISTE_OTRA_RAZON: true,
				NOMBRE_OTRA_RAZON: '',
				ANIO_PERIODO_SOLI_COTI: 0,
				CORR_SOLI_COTIZACION: 0,
				USUARIO_CREA: '',
				FECHA_CREA: new Date(),
				ESTACION_CREA: '',
				USUARIO_ACTU: '',
				FECHA_ACTU: new Date(),
				ESTACION_ACTU: '',
        NOMBRE_PROVEEDOR: '',
        NUMERO_SOLI_COTIZACION: '',
        NUMERO_SOLI_COMPRA: '',
        NUMERO_COTIZACION: '',
			};
		}
	}

  override focusedRowChanged(e: any) {
    this.model = e.row.data;
    this.refrescarBotones();
  }

  refrescarBotones()
  {
    if (this.banderaMtto !== UpdateType.Browse)
    {
      if (this.model.ESTADO_CUADRO_COMPARATIVO == 'DI') {
        this.btnSolicitar = 'Solicitar';
      } else {
        this.btnSolicitar = '';
      }
    } else {
      this.btnSolicitar = '';
    }
  }

  override nuevo(): void {
		super.nuevo();
    this.AgregarSolicitud();
	}

  override editarClick(e: any) {
		super.editarClick(e);
    this.refrescarBotones();
    this.ConsultarCuadroComparativoProveedores(e.row.data.ANIO_PERIODO,e.row.data.CORR_CUADRO_COMPARATIVO);
    this.consultarCOM_CUADRO_COMPARATIVO_DETA();
    this.consultarCOM_CUADRO_COMPARATIVO_AUTORIZACIONES();
    this.consultarDocumentos();
    this.consultarCOM_CUADRO_COMPARATIVO_ORDEN_COMPRA();
    this.consultarCOM_CUADRO_COMPARATIVO_COMENTARIO();
    if (e.row.data.ESTADO_CUADRO_COMPARATIVO != "DI") {
			setTimeout(() => {
				this.bloquear();
			});
	  }
	}

  override rowDblClick(e: any) {
		super.rowDblClick(e);
    this.refrescarBotones();
    this.ConsultarCuadroComparativoProveedores(e.data.ANIO_PERIODO,e.data.CORR_CUADRO_COMPARATIVO);
    this.consultarCOM_CUADRO_COMPARATIVO_DETA();
    this.consultarCOM_CUADRO_COMPARATIVO_AUTORIZACIONES();
    this.consultarDocumentos();
    this.consultarCOM_CUADRO_COMPARATIVO_ORDEN_COMPRA();
    this.consultarCOM_CUADRO_COMPARATIVO_COMENTARIO();
    if (e.row.data.ESTADO_CUADRO_COMPARATIVO != "DI") {
			setTimeout(() => {
				this.bloquear();
			});
	  }
	}

  override getPermiteEditar(e: any): boolean {
		if (this.permiteEdit && (e.row.data.ESTADO_CUADRO_COMPARATIVO === 'DI' )) {
			return true;
		}
		return false;
	}

  override getPermiteDele(e: any): boolean {
		if (this.permiteDele && e.row.data.ESTADO_CUADRO_COMPARATIVO === 'DI') {
			return true;
		}
		return false;
	}

	consultar() {
		this.service
			.getAll(this.fillParam())
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.models = response.Data;
					}
				},
				error: (error: any) => {
					this.notifyFx(error, NotifyType.Error);
				},
			});
	}

  ConsultarCuadroComparativoProveedores(xANIO_PERIODO: Number,xCORR_CUADRO_COMPARATIVO: Number) {
    this.service
    .getAllCOM_CUADRO_COMPARATIVO_PROVEEDOR({ ANIO_PERIODO: xANIO_PERIODO, CORR_CUADRO_COMPARATIVO: xCORR_CUADRO_COMPARATIVO })
    .pipe(take(1))
    .subscribe({
        next: (response: any) => {
            if (response.Result) {
                this.mCOM_CUADRO_COMPARATIVO_PROVEEDOR = response.Data;
                this.ColumnsDetalle = [
                    { dataField: 'CODIGO_ITEM', caption: 'Cod. Item', width: 100, visible: false, allowEditing: false },
                    { dataField: 'NOMBRE_ITEM', caption: 'Item', width: 250, allowEditing: false },
                    { dataField: 'NOMBRE_UNIDAD_MEDIDA', caption: 'U. Medida', width: 100, allowEditing: false },
                    { dataField: 'CANTIDAD', caption: 'Cant.', width: 60, allowEditing: false},
                ];

                this.mCOM_CUADRO_COMPARATIVO_PROVEEDOR.forEach((item: any) => {
                  this.ColumnsDetalle.push({
                      caption: item.NOMBRE_PROVEEDOR,
                      alignment: 'left',
                      columns: [
                          { dataField: 'PRECIO_UNITARIO_' + item.CORR_PROVEEDOR_FILA, caption: "Precio U.", width: 100, allowEditing: false },
                          { dataField: 'MONTO_SUBTOTAL_' + item.CORR_PROVEEDOR_FILA, caption: "Sub-Total", width: 100, allowEditing: false },
                          {
                              dataField: 'SELECCION_' + item.CORR_PROVEEDOR_FILA,
                              caption: " ",
                              width: 50,
                              allowEditing: true,
                          }
                      ]
                  });
              });
            }
        },
        error: (error: any) => {
            this.notifyFx(error, NotifyType.Error);
        },
    });
}

hasNonEmptyMarca(data: any, start: number, end: number): boolean {
  for (let i = start; i <= end && i < this.mCOM_CUADRO_COMPARATIVO_PROVEEDOR.length; i++) {
    const proveedor = this.mCOM_CUADRO_COMPARATIVO_PROVEEDOR[i];
    if (data['MARCA_' + proveedor.CORR_PROVEEDOR_FILA] && data['MARCA_' + proveedor.CORR_PROVEEDOR_FILA].trim() !== '') {
      return true;
    }
  }
  return false;
}

hasValidMarca(data: any): boolean {
  return this.mCOM_CUADRO_COMPARATIVO_PROVEEDOR.some(proveedor => {
    return data['MARCA_' + proveedor.CORR_PROVEEDOR_FILA]; // Verifica si hay marca
  });
}

hasValidObservaciones(data: any): boolean {
  return this.mCOM_CUADRO_COMPARATIVO_PROVEEDOR.some(proveedor => {
    return data['OBSERVACIONES_' + proveedor.CORR_PROVEEDOR_FILA]; // Verifica si hay observaciones
  });
}

onSelectionChanged(data: any, event: any,CORR_PROVEEDOR: number) {

    if (this.model.ESTADO_CUADRO_COMPARATIVO != 'DI')
    {
        this.loadingVisible = false;
        this.notifyFx('El estado de la cotización debe estar en Digitado para modificaciones.', NotifyType.Error);
        return;
    }

    this.loadingVisible = true;

    const updateModel: ComCuadroComparativoDetaUpdate = {
      CORR_EMPRESA: data.CORR_EMPRESA, // Ajustar según la estructura de tu objeto data
      ANIO_PERIODO: data.ANIO_PERIODO, // Ajustar según la estructura de tu objeto data
      CORR_CUADRO_COMPARATIVO: data.CORR_CUADRO_COMPARATIVO, // Ajustar según la estructura de tu objeto data
      CODIGO_ITEM: data.CODIGO_ITEM, // Ajustar según la estructura de tu objeto data
      CORR_PROVEEDOR: CORR_PROVEEDOR,
      SELECCION: event.value
    };

    this.service
        .updateCOM_CUADRO_COMPARATIVO_DETA(updateModel)
        .pipe(take(1))
        .subscribe({
            next: (response: any) => {
                this.loadingVisible = false;
                if (response.Result) {
                    this.notifyFx('Registro Actualizado con exito!', NotifyType.Success);
                    this.consultarCOM_CUADRO_COMPARATIVO_DETA();
                }
            },
            error: (error: any) => {
                this.loadingVisible = false;
                this.notifyFx(error, NotifyType.Error);
            },
        });
}

formatDecimal(value: any): string {
  const parsedValue = parseFloat(value);
  if (!isNaN(parsedValue)) {
    return parsedValue.toFixed(2);
  } else {
    return ''; // o cualquier valor predeterminado si el valor no es numérico
  }
}

consultarCOM_CUADRO_COMPARATIVO_DETA() {
  this.service
    .getAllCOM_CUADRO_COMPARATIVO_DETA({ ANIO_PERIODO: this.model.ANIO_PERIODO, CORR_CUADRO_COMPARATIVO: this.model.CORR_CUADRO_COMPARATIVO })
    .pipe(take(1))
    .subscribe({
      next: (response: any) => {
        if (response.Result) {
          this.mCOM_CUADRO_COMPARATIVO_DETA = response.Data;
        }
      },
      error: (error: any) => {
        this.notifyFx(error, NotifyType.Error);
      },

    });
}

consultarCOM_CUADRO_COMPARATIVO_COMENTARIO() {
  this.service
    .getAllCOM_CUADRO_COMPARATIVO_COMENTARIO({ ANIO_PERIODO: this.model.ANIO_PERIODO, CORR_CUADRO_COMPARATIVO: this.model.CORR_CUADRO_COMPARATIVO })
    .pipe(take(1))
    .subscribe({
      next: (response: any) => {
        if (response.Result) {
          this.mCOM_CUADRO_COMPARATIVO_COMENTARIO = response.Data;
        }
      },
      error: (error: any) => {
        this.notifyFx(error, NotifyType.Error);
      },

    });
}
	guardar(): void {
		if (!this.service.esValido(this.model, this.notifyFx)) {
			return;
		}

		this.loadingVisible = true;
		if (this.banderaMtto === UpdateType.Add) {
			this.service
				.insert(this.model)
				.pipe(take(1))
				.subscribe({
					next: (response: any) => {
						if (response.Result) {
							this.models.push(response.Data);
							this.model = response.Data;
							this.AsignaStatus(UpdateType.Browse);
              this.refrescarBotones();
							this.notifyFx('Registro creado con exito!', NotifyType.Success);
						} else {
							this.notifyFx(response.ErrorMessage, NotifyType.Error);
						}
						this.loadingVisible = false;
					},
					error: (error: any) => {
						this.notifyFx(error, NotifyType.Error);
						this.loadingVisible = false;
					},
				});
		} else if (this.banderaMtto === UpdateType.Update) {
			this.service
				.update(this.model)
				.pipe(take(1))
				.subscribe({
					next: (response: any) => {
						if (response.Result) {
							this.model = response.Data;
							const vIndex = this.models.findIndex((item: any) => item.CORR_CUADRO_COMPARATIVO === response.Data.CORR_CUADRO_COMPARATIVO);
							this.models[vIndex] = response.Data;
							this.AsignaStatus(UpdateType.Browse);
              this.refrescarBotones();
							this.notifyFx('Registro modificado con exito!', NotifyType.Success);
						} else {
							this.notifyFx(response.ErrorMessage, NotifyType.Error);
						}
						this.loadingVisible = false;
					},
					error: (error: any) => {
						this.notifyFx(error, NotifyType.Error);
						this.loadingVisible = false;
					},
				});
		}
	}

  override cancelar(): void {
		const cancelRow = () => {
			this.AsignaStatus(UpdateType.Browse);
			this.getPermisos(this.appInfoService.getPermiso(this.urlOpcion));
      this.refrescarBotones();
		};
		if (this.banderaMtto === UpdateType.Add || this.banderaMtto === UpdateType.Update) {
			this.confirmaCancelar(() => {
				this.model = this.modelUpdate;
				const vIndex = this.models.findIndex((item: any) => item.CORR_CUADRO_COMPARATIVO === this.modelUpdate.CORR_CUADRO_COMPARATIVO);
				this.models[vIndex] = this.modelUpdate;
				cancelRow();
			});
		} else {
			cancelRow();
		}
	}

	rowRemoving(e: any) {
    this.popupVisibleEliminarComentario=true;
    this.eEventoEliminar=e;
	}

	override bloquear(): void {
		this.dataForm.instance.getEditor('ANIO_PERIODO')?.option('readOnly', true);
		this.dataForm.instance.getEditor('CORR_CUADRO_COMPARATIVO')?.option('readOnly', true);
		this.dataForm.instance.getEditor('FECHA_CUADRO_COMPARATIVO')?.option('readOnly', true);
		this.dataForm.instance.getEditor('ESTADO_CUADRO_COMPARATIVO')?.option('readOnly', true);
		this.dataForm.instance.getEditor('USUARIO_CUADRO_COMPARATIVO')?.option('readOnly', true);
		this.dataForm.instance.getEditor('OBSERVACIONES')?.option('readOnly', true);
		this.dataForm.instance.getEditor('ES_MEJOR_PRECIO')?.option('readOnly', true);
		this.dataForm.instance.getEditor('TIENE_CREDITO_30_DIAS')?.option('readOnly', true);
		this.dataForm.instance.getEditor('TIENE_BUEN_SOPORTE_TECNICO')?.option('readOnly', true);
		this.dataForm.instance.getEditor('TIENE_BUENA_CALIDAD_PRODUCTO')?.option('readOnly', true);
		this.dataForm.instance.getEditor('TIENE_MEJOR_TIEMPO_ENTREGA')?.option('readOnly', true);
		this.dataForm.instance.getEditor('BRINDA_BUENA_EXPERIENCIA_PROVEEDOR')?.option('readOnly', true);
		this.dataForm.instance.getEditor('ES_PROVEEDOR_UNICO')?.option('readOnly', true);
		this.dataForm.instance.getEditor('EXISTE_OTRA_RAZON')?.option('readOnly', true);
		this.dataForm.instance.getEditor('NOMBRE_OTRA_RAZON')?.option('readOnly', true);
		this.dataForm.instance.getEditor('ANIO_PERIODO_SOLI_COTI')?.option('readOnly', true);
		this.dataForm.instance.getEditor('CORR_SOLI_COTIZACION')?.option('readOnly', true);
		this.readOnly = true;
	}

	override habilitar(): void {
		this.readOnly = false;
	}

	override setFocus() {
		setTimeout(() => {
			this.dataForm.instance.getEditor('NOMBRE_CUADRO_COMPARATIVO')?.focus();
		});
	}
	//#endregion

	selectedLookUpLista(vRow: any): any {
		return vRow[0].Key;
	}

  selectedLookUpCORR_UNIDAD_MEDIDA(vRow: any): any {
		return vRow[0].CORR_UNIDAD_MEDIDA;
	}

  OnValueChangeFECHA_INICIAL_MODAL(e: any) {
		this.vFECHA_INICIAL_MODAL = e.value;
	}

	OnValueChangeFECHA_FINAL_MODAL(e: any) {
		this.vFECHA_FINAL_MODAL = e.value;
	}

  AgregarSolicitud(){
    this.vFECHA_INICIAL_MODAL = this.appInfoService.dateAdd(this.appInfoService.getDate(), 'day', -7);
    this.vFECHA_FINAL_MODAL = this.appInfoService.getDate();
    this.popupVisible = true;
    this.ConsultarSolicitudDisponible();
  }

  RefrescarSolicitud(): void {
    this.ConsultarSolicitudDisponible();
  }

  focusedRowChangedSolicitudDisponible(e: any) {
    if(this.dataSolicitudDisponible.focusedRowIndex>=0)
      {
        if (this.banderaMtto === UpdateType.Add)
        {
          this.model = e.row.data;
        }
        this.vCORR_SOLI_COTIZACION=e.row.data.CORR_SOLI_COTIZACION;
        this.vANIO_PERIODO_SOLI_COTIZACION = e.row.data.ANIO_PERIODO;
        this.consultarCOM_SOLI_COTIZACION_DETA(this.vANIO_PERIODO_SOLI_COTIZACION,this.vCORR_SOLI_COTIZACION);
        this.ConsultarProveedores(this.vANIO_PERIODO_SOLI_COTIZACION,this.vCORR_SOLI_COTIZACION);
        this.DataSoliCotizaDeta.focusedRowIndex=0;
        this.DataComSoliCotizaProveedor.focusedRowIndex=0;
      }else{
        this.mCOM_SOLI_COTIZACION_DETA=null;
        this.mCOM_SOLI_COTIZACION_PROVEEDOR=null;
      }

  }

  ConsultarSolicitudDisponible() {
    this.service
			.getAllSOLICITUD_COMPRA_DISPONIBLE({ FECHA_INICIAL: this.vFECHA_INICIAL_MODAL.toISOString(), FECHA_FINAL: this.vFECHA_FINAL_MODAL.toISOString(), ANIO_PERIODO: this.model.ANIO_PERIODO,CORR_CUADRO_COMPARATIVO: this.model.CORR_CUADRO_COMPARATIVO})
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
            if(response.Data.length > 0)
            {
						  this.mCOM_SOLICITUD_DISPONIBLE = response.Data;
              this.mCOM_SOLI_COTIZACION_DETA=null;
              this.mCOM_SOLI_COTIZACION_PROVEEDOR=null;
              this.dataSolicitudDisponible.focusedRowIndex=-1;
            }else{
              this.mCOM_SOLICITUD_DISPONIBLE = null;
              this.mCOM_SOLI_COTIZACION_DETA=null;
              this.mCOM_SOLI_COTIZACION_PROVEEDOR=null;
              this.dataSolicitudDisponible.instance.refresh(true);
            }
					}
				},
				error: (error: any) => {
					this.notifyFx(error, NotifyType.Error);
				},

			});
  }

  consultarCOM_SOLI_COTIZACION_DETA(xANIO_PERIODO_SOLI_COTIZA,xCORR_SOLI_COTIZA) {
		this.service
			.getAllCOM_SOLI_COTIZACION_DETA({ ANIO_PERIODO: xANIO_PERIODO_SOLI_COTIZA, CORR_SOLI_COTIZACION: xCORR_SOLI_COTIZA })
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.mCOM_SOLI_COTIZACION_DETA = response.Data;
					}
				},
				error: (error: any) => {
					this.notifyFx(error, NotifyType.Error);
				},

			});
	}

  ConsultarProveedores(xANIO_PERIODO: Number,xCORR_SOLI_COTIZACION: Number) {

    this.service
    .getAllCOM_SOLI_COTIZACION_PROVEEDOR({ ANIO_PERIODO: xANIO_PERIODO, CORR_SOLI_COTIZACION: xCORR_SOLI_COTIZACION})
    .pipe(take(1))
    .subscribe({
      next: (response: any) => {
        if (response.Result) {
          this.mCOM_SOLI_COTIZACION_PROVEEDOR = response.Data;
        }
      },
      error: (error: any) => {
        this.notifyFx(error, NotifyType.Error);
      },

    });
}

  guardarPopup() {
      this.GuardarModal();
  }

  hidePopup() {
    if(this.banderaMtto == UpdateType.Add)
    {
      this.confirmaCancelar(() => {
        this.popupVisible = false;
        this.AsignaStatus(UpdateType.Browse);
			  this.getPermisos(this.appInfoService.getPermiso(this.urlOpcion));
     });
    }else if(this.banderaMtto == UpdateType.Update)
    {
      this.confirmaCancelar(() => {
        this.popupVisible = false;
        //this.AsignaStatus(UpdateType.Browse);
			  //this.getPermisos(this.appInfoService.getPermiso(this.urlOpcion));
     });
    }
  }

  GuardarModal(): void
  {
    this.loadingVisible = true;
    if (this.banderaMtto === UpdateType.Update)
    {
      if(this.mCOM_SOLICITUD_DISPONIBLE.length <= 0)
      {
        this.notifyFx('No existen Solicitudes para generar un cuadro comparativo..', NotifyType.Error);
        this.loadingVisible = false;
        return;
      }
      this.guardar();
    }
    if(this.vCORR_SOLI_COTIZACION != 0)
    {
      this.modelCuadroComparativo = {
        CORR_EMPRESA: 0,
        ANIO_PERIODO: this.appInfoService.toYear(new Date()),
        CORR_CUADRO_COMPARATIVO: 0,
        FECHA_CUADRO_COMPARATIVO: new Date(),
        ESTADO_CUADRO_COMPARATIVO: 'DI',
        USUARIO_CUADRO_COMPARATIVO: '',
        NOMBRE_ESTADO_CUADRO_COMPARATIVO: '',
        OBSERVACIONES: this.mCOM_SOLICITUD_DISPONIBLE
                      .filter((y) => y.SELECCION === true)
                      .map((y) => (y.OBSERVACIONES))
                      .join(' '),
        ES_MEJOR_PRECIO: false,
        TIENE_CREDITO_30_DIAS: false,
        TIENE_BUEN_SOPORTE_TECNICO: false,
        TIENE_BUENA_CALIDAD_PRODUCTO: false,
        TIENE_MEJOR_TIEMPO_ENTREGA: false,
        BRINDA_BUENA_EXPERIENCIA_PROVEEDOR: false,
        ES_PROVEEDOR_UNICO: false,
        EXISTE_OTRA_RAZON: false,
        NOMBRE_OTRA_RAZON: '',
        USUARIO_CREA: '',
        ESTACION_CREA: '',
        FECHA_CREA: new Date(),
        USUARIO_ACTU: '',
        ESTACION_ACTU: '',
        FECHA_ACTU: new Date(),
        SOLICITUDES: this.mCOM_SOLICITUD_DISPONIBLE
            .filter((y) => y.SELECCION === true)
            .map((y) => ({
                CORR_EMPRESA: 0, // Asegúrate de que este campo exista
                ANIO_PERIODO: 0, // Asegúrate de que este campo exista
                CORR_CUADRO_COMPARATIVO: 0, // Asegúrate de que este campo exista
                ANIO_PERIODO_SOLI_COTI: y.ANIO_PERIODO, // O lo que corresponda
                CORR_SOLI_COTIZACION: y.CORR_SOLI_COTIZACION // Asegúrate de que este campo exista
            }))

    };

      this.service
      .GenerarCuadroCompartivo( this.modelCuadroComparativo)
      .pipe(take(1))
      .subscribe({
        next: (response: any) => {
          if (response.Result) {
              this.AsignaStatus(UpdateType.Update);
              this.models.push(response.Data);
              this.model = response.Data;
              this.ConsultarCuadroComparativoProveedores(this.model.ANIO_PERIODO,this.model.CORR_CUADRO_COMPARATIVO);
              this.consultarCOM_CUADRO_COMPARATIVO_DETA();
              this.consultarCOM_CUADRO_COMPARATIVO_AUTORIZACIONES();
              this.consultarCOM_CUADRO_COMPARATIVO_COMENTARIO();
              this.consultarCOM_CUADRO_COMPARATIVO_ORDEN_COMPRA();
              this.refrescarBotones();
							this.notifyFx('Registro creado con exito!', NotifyType.Success);
              this.popupVisible=false;
              this.loadingVisible = false;this.model
          } else {
            this.notifyFx(response.ErrorMessage, NotifyType.Error);
          }
          this.loadingVisible = false;
        },
        error: (error: any) => {
          this.notifyFx(error, NotifyType.Error);
          this.loadingVisible = false;
        },
      });
    }
  }

  ConsultarCotizacionesDeta(xANIO_PERIODO: Number,xCORR_CUADRO_COMPARATIVO: Number) {
      this.service
      .GetAllCOM_CUADRO_COMPARATIVO_COTIZACION_DETA({ ANIO_PERIODO: xANIO_PERIODO, CORR_CUADRO_COMPARATIVO: xCORR_CUADRO_COMPARATIVO})
      .pipe(take(1))
      .subscribe({
        next: (response: any) => {
          if (response.Result) {
            this.mCOM_COTIZACION_DETA = response.Data;
            this.DataCuadroComparativoDeta.focusedRowIndex=0;
          }
        },
        error: (error: any) => {
          this.notifyFx(error, NotifyType.Error);
        },

      });
  }

  AgregarObservacion(){
    this.popupVisibleObservacion = true;
    this.ConsultarCotizacionesDeta(this.model.ANIO_PERIODO,this.model.CORR_CUADRO_COMPARATIVO);
  }

  hidePopupObservacion() {
    if(this.banderaMtto == UpdateType.Add)
    {
      this.confirmaCancelar(() => {
        this.popupVisibleObservacion = false;
        this.AsignaStatus(UpdateType.Browse);
			  this.getPermisos(this.appInfoService.getPermiso(this.urlOpcion));
     });
    }else if(this.banderaMtto == UpdateType.Update)
    {
      this.confirmaCancelar(() => {
        this.popupVisibleObservacion = false;
     });
    }
  }

  guardarPopupObservacion(){
    this.loadingVisible = true;
    if (this.mCOM_COTIZACION_DETA.length > 0) {
      this.service
      .UpdateCuadroCompartivoDeta( this.mCOM_COTIZACION_DETA)
      .pipe(take(1))
      .subscribe({
        next: (response: any) => {
          if (response.Result) {
              this.AsignaStatus(UpdateType.Update);
              this.mCOM_CUADRO_COMPARATIVO_DETA = null;
              this.consultarCOM_CUADRO_COMPARATIVO_DETA();
              this.DataCuadroComparativoDeta.instance.refresh();
							this.notifyFx('Registro actualizado con exito!', NotifyType.Success);
              this.popupVisibleObservacion=false;
              this.loadingVisible = false;this.model
          } else {
            this.notifyFx(response.ErrorMessage, NotifyType.Error);
          }
          this.loadingVisible = false;
        },
        error: (error: any) => {
          this.notifyFx(error, NotifyType.Error);
          this.loadingVisible = false;
        },
      });
    }else{
      this.notifyFx('No existen Registros para actualizar..', NotifyType.Error);
      this.loadingVisible = false;
      return;
    }

  }

  Solicitar(): void {
    const confirpreli = custom({
      title: 'Confirmación de Cuadro Comparativo',
      messageHtml: '¿Realmente quiere solicitar el cuadro comparativo?',
      buttons: [
        {
          text: 'Si',
          onClick: (e: any) => {
            this.loadingVisible = true;
            if(this.model.CORR_CUADRO_COMPARATIVO>0)
            {
              if (this.banderaMtto === UpdateType.Update)
              {
                this.service
                .update(this.model)
                .pipe(take(1))
                .subscribe({
                  next: (response: any) => {
                    if (response.Result) {
                      this.model = response.Data;
                      const vIndex = this.models.findIndex((item: any) => item.CORR_CUADRO_COMPARATIVO === response.Data.CORR_CUADRO_COMPARATIVO);
                      this.models[vIndex] = response.Data;
                      this.service
                      .Solicitar(this.model)
                      .pipe(take(1))
                      .subscribe({
                        next: (response: any) => {
                          if (response.Result) {
                            this.notifyFx('Solicitado con exito..!', NotifyType.Success);
                            this.model = response.Data;
                            const vIndex = this.models.findIndex((item: any) => item.CORR_CUADRO_COMPARATIVO === response.Data.CORR_CUADRO_COMPARATIVO);
                            this.models[vIndex] = response.Data;
                            if (this.model.ESTADO_CUADRO_COMPARATIVO != "DI") {
                              setTimeout(() => {
                                this.bloquear();
                              });
                            }
                            this.banderaMtto = UpdateType.Not_Defined;
		                        this.consultarDocumentos();
                            this.consultarCOM_CUADRO_COMPARATIVO_AUTORIZACIONES();
                            this.consultarCOM_CUADRO_COMPARATIVO_ORDEN_COMPRA();
                            this.refrescarBotones();
                          } else {
                            this.notifyFx(response.ErrorMessage, NotifyType.Error);
                          }
                          this.loadingVisible = false;
                        },
                        error: (error: any) => {
                          this.notifyFx(error, NotifyType.Error);
                          this.loadingVisible = false;
                        },
                      });
                    } else {
                      this.notifyFx(response.ErrorMessage, NotifyType.Error);
                    }
                    this.loadingVisible = false;
                  },
                  error: (error: any) => {
                    this.notifyFx(error, NotifyType.Error);
                    this.loadingVisible = false;
                  },
                });
              }
            }
          },
        },
        {
          text: 'No',
          onClick: (e: any) => false,
        },
      ],
    });
    confirpreli.show().then((dialogResult: any) => {});
  }

  //#region <Visualizar Pdf>
  obtenerPDF() {
    this.loadingVisible = true;
    this.service
      .getPDF(this.fillParam(this.model.ANIO_PERIODO,this.model.CORR_CUADRO_COMPARATIVO))
      .pipe(take(1))
      .subscribe({
        next: (vPDF: any) => {
          if (vPDF != undefined) {
            this.PDF = this.sanitization.bypassSecurityTrustResourceUrl(window.URL.createObjectURL(vPDF));
            this.popupVisiblePdf = true;
          } else {
            this.notifyFx("Error al generar PDF", NotifyType.Error);
          }
          this.loadingVisible = false;
        },
        error: (error: any) => {
          this.notifyFx(error, NotifyType.Error);
          this.loadingVisible = false;
        },
      });
  }

  descargarPDF() {
    this.loadingVisible = true;
    this.appInfoService.downloadFile(this.vPDF, 'CuadroComparativoNo.'+this.model.ANIO_PERIODO.toString()+'-'+this.model.CORR_CUADRO_COMPARATIVO.toString()+'.pdf');
    this.popupVisiblePdf = false;
    this.loadingVisible = false;

  }
  hidePdfPopup() {
    this.popupVisiblePdf = false;
    this.LimpiarPdf();
  }

  LimpiarPdf() {
    //this.vPDF = null;
    this.PDF = null;
  }
  //#endregion

  //#region <Autorizaciones>
  consultarCOM_CUADRO_COMPARATIVO_AUTORIZACIONES() {
    this.service
      .getAllCOM_CUADRO_COMPARATIVO_AUTORIZACIONES({ ANIO_PERIODO: this.model.ANIO_PERIODO, CORR_CUADRO_COMPARATIVO: this.model.CORR_CUADRO_COMPARATIVO })
      .pipe(take(1))
      .subscribe({
        next: (response: any) => {
          if (response.Result) {
            this.mCOM_CUADRO_COMPARATIVO_AUTORIZACIONES = response.Data;
          }
        },
        error: (error: any) => {
          this.notifyFx(error, NotifyType.Error);
        },

      });
  }
  //#endregion
  //#region <COM_COTIZACION_DOC>

  gDataCotizacionDocRowDblClick(e: any) {
    if (e.rowType === 'data') {
      this.loadingVisible = true;
      const param = {
        CORR_DOCUMENTO: e.data.CORR_DOCUMENTO,
        NOMBRE_ARCHIVO: e.data.NOMBRE_ARCHIVO
      };
      this.service
      .getDoc(param)
      .pipe(take(1))
      .subscribe({
        next: (vDoc: any) => {
          if (vDoc != undefined) {
            this.PDF = this.sanitization.bypassSecurityTrustResourceUrl(window.URL.createObjectURL(vDoc));
            this.loadingVisible = false;
            this.popupVisiblePdf = true;
          } else {
            this.notifyFx("Error al generar documento", NotifyType.Error);
          }
          this.loadingVisible = false;
        },
        error: (error: any) => {
          this.loadingVisible = false;
          this.notifyFx(error.error, NotifyType.Error);
        },
      });
    }
  }

  gDataCotizacionDocRowRemoving(e: any) {
    const isCanceled = new Promise((resolve, reject) => {
    if (this.model.ESTADO_COTIZACION != 'DI') {
        this.loadingVisible = false;
        reject('Ya No se permite eliminar el Documento');
        return;
    }
    if (e.data.CLASE_ORIGEN_DOCUMENTO != 'CU') {
      this.loadingVisible = false;
      reject('No se permite eliminar documentos de origen diferente a Cuadro Comparativo');
      return;
    }
    this.loadingVisible = true;
    this.service
      .deleteCOM_COTIZACION_DOC(e.data)
      .pipe(take(1))
      .subscribe({
        next: (response: any) => {
          if (response.Result) {
            this.loadingVisible = false;
            this.notifyFx('Registro eliminado con exito!', NotifyType.Success);
            resolve(false);
          } else {
            this.loadingVisible = false;
            this.notifyFx(response.ErrorMessage, NotifyType.Error);
            reject(response.ErrorMessage);
          }
        },
        error: (error: any) => {
          e.cancel = true;
          this.loadingVisible = false;
          this.notifyFx(error, NotifyType.Error);
        },
      });
    });
    e.cancel = isCanceled;
  }
  consultarDocumentos(): void {
    this.service
    .getAllCOM_COTIZACION_DOC({ ANIO_PERIODO: this.model.ANIO_PERIODO, CORR_CUADRO_COMPARATIVO: this.model.CORR_CUADRO_COMPARATIVO })
    .pipe(take(1))
    .subscribe({
      next: (response: any) => {
        if (response.Result) {
          this.mCOM_COTIZACION_DOC = response.Data;
        }
      },
      error: (error: any) => {
        this.notifyFx(error, NotifyType.Error);
      },

    });
  }
  AgregarDocumento(e: any) {
    this.popupVisibleDoc = true;
  }

  guardarDocPopup() {
    if (this.fileDoc) {
      if (this.mDocumento.NOMBRE_DOCUMENTO == '') {
        this.notifyFx('Debe ingresar un nombre para el documento', NotifyType.Error);
        return;
      }
      if (this.mDocumento.CORR_TIPO_DOCUMENTO == 0) {
        this.notifyFx('Debe seleccionar un tipo de documento', NotifyType.Error);
        return;
      }
      if (this.fileDoc.size<=0) {
        this.notifyFx('Debe seleccionar un documento', NotifyType.Error);
        return;
      }
      if (this.fileDoc.size<=10485760) {
        this.loadingVisible = true;
        const formData = new FormData();
        formData.append('CORR_EMPRESA', this.appInfoService.CORR_EMPRESA.toString());
        formData.append('ANIO_PERIODO', this.model.ANIO_PERIODO.toString());
        formData.append('CORR_CUADRO_COMPARATIVO', this.model.CORR_CUADRO_COMPARATIVO.toString());
        formData.append('CORR_DOCUMENTO', '0');
        formData.append('NOMBRE_DOCUMENTO', this.mDocumento.NOMBRE_DOCUMENTO.toString());
        formData.append('DESCRIPCION_DOCUMENTO', this.mDocumento.DESCRIPCION_DOCUMENTO.toString());
        formData.append('CORR_TIPO_DOCUMENTO', this.mDocumento.CORR_TIPO_DOCUMENTO.toString());
        formData.append('RUTA_DOCUMENTO', '-');
        formData.append('NOMBRE_ARCHIVO',  this.vNOMBRE_ARCHIVO);
        formData.append('FOTO_DOCUMENTO', this.fileDoc, this.fileDoc.name);

        this.service.insertDoc(formData).pipe(take(1)).subscribe(
          (response: any) => {
            if (response.Result) {
              this.notifyFx('Documento guardado con exito!', NotifyType.Success);
              this.LimpiarDoc();
              this.consultarDocumentos();
            } else {
              this.notifyFx(response.ErrorMessage, NotifyType.Error);
            }
            this.loadingVisible = false;
          },
          (error: any) => {
            this.notifyFx(error, NotifyType.Error);
            this.loadingVisible = false;
          }
        );
        this.popupVisibleDoc = false;
      } else {
        this.notifyFx('Debe seleccionar un PDF con máximo de 2 MB de peso', NotifyType.Error);
      }
    }
  }

  hideDocPopup() {
    this.popupVisibleDoc = false;
    this.LimpiarDoc();
  }

  LimpiarDoc() {
    this.dataDocForm.instance.clear();
    this.vNOMBRE_ARCHIVO = '';
    this.fileDoc = null;
  }

  onDocSelected(e: any) {
    const file: File = e.target.files[0];
    if (file)
    {
      if (file.size<=2097152)
      {
        this.fileDoc = file;
        this.vNOMBRE_ARCHIVO = this.fileDoc.name;
        this.mDocumento.NOMBRE_DOCUMENTO = this.fileDoc.name;
        if (this.mCORR_TIPO_DOCUMENTO.length>0)
        {
          this.mDocumento.CORR_TIPO_DOCUMENTO = this.mCORR_TIPO_DOCUMENTO[0].CORR_TIPO_DOCUMENTO;
        }
      } else {
        this.notifyFx('Debe seleccionar un archivo con máximo de 2 MB de peso', NotifyType.Error);
      }
    }
  }

  selectedLookUpCORR_TIPO_DOCUMENTO(vRow: any): any {
    return vRow[0].CORR_TIPO_DOCUMENTO;
  }
  //#endregion

  //#region <Orden Compra>
  consultarCOM_CUADRO_COMPARATIVO_ORDEN_COMPRA() {
    this.service
      .getAllCOM_CUADRO_COMPARATIVO_ORDEN_COMPRA({ ANIO_PERIODO: this.model.ANIO_PERIODO, CORR_CUADRO_COMPARATIVO: this.model.CORR_CUADRO_COMPARATIVO })
      .pipe(take(1))
      .subscribe({
        next: (response: any) => {
          if (response.Result) {
            this.mCOM_CUADRO_COMPARATIVO_ORDEN_COMPRA = response.Data;
          }
        },
        error: (error: any) => {
          this.notifyFx(error, NotifyType.Error);
        },

      });
  }
  gDataCuadroComparativoOrdenesCompraFocusedRowChanged(e: any) {
		this.mORDEN_COMPRA=e.row.data;
	}
  obtenerPDFOrdenCompra() {
    this.loadingVisible = true;
    this.service
      .getPDFOrdenCompra({ ANIO_PERIODO: this.model.ANIO_PERIODO, CORR_CUADRO_COMPARATIVO: this.model.CORR_CUADRO_COMPARATIVO, NUMERO_ORDEN: this.mORDEN_COMPRA.NUMERO_ORDEN })
      .pipe(take(1))
      .subscribe({
        next: (vPDF: any) => {
          if (vPDF != undefined) {
            this.PDF = this.sanitization.bypassSecurityTrustResourceUrl(window.URL.createObjectURL(vPDF));
            this.popupVisiblePdf = true;
          } else {
            this.notifyFx("Error al generar PDF", NotifyType.Error);
          }
          this.loadingVisible = false;
        },
        error: (error: any) => {
          this.notifyFx(error, NotifyType.Error);
          this.loadingVisible = false;
        },
      });

  }
  //#endregion
  //#region <Agregar Justificacion Eliminacion>
  guardarEliminarComentarioPopup() {
    if (this.model.COMENTARIO == '') {
      this.notifyFx('Debe Digitar un Motivo', NotifyType.Error);
      return;
    }

    this.loadingVisible = true;
    this.service
			.delete(this.fillParam(this.eEventoEliminar.data.ANIO_PERIODO,this.eEventoEliminar.data.CORR_CUADRO_COMPARATIVO,this.model.JUSTIFICACION_ELIMINAR))
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.notifyFx('Registro eliminado con exito!', NotifyType.Success);
						this.eEventoEliminar.component.refresh();
					} else {
						this.eEventoEliminar.cancel = true;
						this.notifyFx(response.ErrorMessage, NotifyType.Error);
					}
				},
				error: (error: any) => {
					this.eEventoEliminar.cancel = true;
					this.notifyFx(error, NotifyType.Error);
				},
			});
    this.loadingVisible = false;
    this.popupVisibleEliminarComentario = false;
  }

  hideEliminacionComentarioPopup() {
    this.popupVisibleEliminarComentario = false;
    this.loadingVisible = false;
    this.consultar();
    this.LimpiarEliminarComentario();
  }

  LimpiarEliminarComentario() {
    this.dataEliminarComentarioForm.instance.clear();
  }
  //#endregion
}
