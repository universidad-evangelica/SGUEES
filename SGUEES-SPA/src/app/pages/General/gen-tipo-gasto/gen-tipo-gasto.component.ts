import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { take } from 'rxjs/internal/operators/take';
import { environment } from 'src/environments/environment';

import { CBaseComponent } from 'src/app/FxAPI/CBaseComponent.component';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { UpdateType } from 'src/app/shared/models/UpdateType.enum';
import { AppInfoService } from 'src/app/shared/services/app-info.service';
import { GenTipoGasto } from './models/gen-tipo-gasto';
import { GenTipoGastoService } from './gen-tipo-gasto.service';
import { IParam } from 'src/app/FxAPI/IParam';

@Component({
	selector: 'app-gen-tipo-gasto',
	templateUrl: './gen-tipo-gasto.component.html',
	styleUrls: ['./gen-tipo-gasto.component.scss'],
})
export class GenTipoGastoComponent extends CBaseComponent implements OnInit {

  //#region <Declarando Variales>
  readOnly = false;
  mGEN_TIPO_GASTO_IMPUESTO: any;
  mCORR_RUBRO: any;

  // #endregion
	constructor(
		public override appInfoService: AppInfoService,
		public override router: ActivatedRoute,
		private service: GenTipoGastoService
	) {
		super(appInfoService, router);
		this.columns = this.service.getColumns();
		this.summary = this.service.getSummary();
		this.items = this.service.getItems();
	}


	//#region <Inicializando Opciones>
	ngOnInit(): void {
		this.inicializaOpciones();
		this.llenaComboBox();
		this.consultar();
	}

	inicializaOpciones() {}
	// #endregion

	//#region <Manejo de Combos>
	llenaComboBox() {
    this.getCORR_RUBROLookup();
	}

  getCORR_RUBROLookup() {
    let xWhere: IParam[] = [{ Parameter: 'OPCION_CONSULTA', Value: 2 }];

    this.appInfoService
      .getLookUp('GEN_TIPO_GASTO', 'GEN_RUBRO', 'GetCORR_RUBRO', xWhere, environment.UrlGENERALAPI)
      .pipe(take(1))
      .subscribe({
        next: (response: any) => {
          if (response.Result) {
            this.mCORR_RUBRO = response.Data;
          }
        },
        error: (error: any) => {
          this.notifyFx(error, NotifyType.Error);
        },
      });
  }
	//#endregion

	//#region <Metodos Mtto>
	fillParam(xCORR_TIPO_GASTO?: number): any {
		if (xCORR_TIPO_GASTO == undefined) {
			xCORR_TIPO_GASTO = 0;
		}
		return {
			CORR_TIPO_GASTO: xCORR_TIPO_GASTO,
		};
	}

	override fillData(xModel?: GenTipoGasto): GenTipoGasto {
		if (xModel !== undefined) {
			return {
				CORR_EMPRESA: xModel.CORR_EMPRESA,
				CORR_TIPO_GASTO: xModel.CORR_TIPO_GASTO,
				NOMBRE_TIPO_GASTO: xModel.NOMBRE_TIPO_GASTO,
				ES_SERVICIO: xModel.ES_SERVICIO,
				ES_INTANGIBLE: xModel.ES_INTANGIBLE,
			};
		} else {
			return {
				CORR_EMPRESA: 1,
				CORR_TIPO_GASTO: 0,
				NOMBRE_TIPO_GASTO: '',
				ES_SERVICIO: false,
				ES_INTANGIBLE: false,
			};
		}
	}

  override nuevo(): void {
    super.nuevo();
    this.consultarGEN_TIPO_GASTO_IMPUESTO();
  }
  override editarClick(e: any): void {
    this.model=e.row.data;
    super.editarClick(e);
    this.consultarGEN_TIPO_GASTO_IMPUESTO();
  }
  override rowDblClick(e: any): void {
    super.rowDblClick(e);
    this.consultarGEN_TIPO_GASTO_IMPUESTO();
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

	guardar(xTieneDetalle?: Function, data?: any): void {
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
              if (xTieneDetalle) {
								this.AsignaStatus(UpdateType.Update);
								data.CORR_RUBRO = response.Data.CORR_RUBRO;
								xTieneDetalle(data);
							} else {
								this.AsignaStatus(UpdateType.Browse);
								this.notifyFx('Registro creado con exito!', NotifyType.Success);
							}
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
							const vIndex = this.models.findIndex((item: any) => item.CORR_TIPO_GASTO === response.Data.CORR_TIPO_GASTO);
							this.models[vIndex] = response.Data;
							this.AsignaStatus(UpdateType.Browse);
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
		super.cancelar((item: any) => item.CORR_TIPO_GASTO === this.modelUpdate.CORR_TIPO_GASTO);
	}

	rowRemoving(e: any) {
		this.service
			.delete(this.fillParam(e.data.CORR_TIPO_GASTO))
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.notifyFx('Registro eliminado con exito!', NotifyType.Success);
						e.component.refresh();
					} else {
						e.cancel = true;
						this.notifyFx(response.ErrorMessage, NotifyType.Error);
					}
				},
				error: (error: any) => {
					e.cancel = true;
					this.notifyFx(error, NotifyType.Error);
				},
			});
	}

	override bloquear(): void {
		this.dataForm.instance.getEditor('CORR_TIPO_GASTO')?.option('readOnly', true);
		this.dataForm.instance.getEditor('NOMBRE_TIPO_GASTO')?.option('readOnly', true);
		this.dataForm.instance.getEditor('ES_SERVICIO')?.option('readOnly', true);
		this.dataForm.instance.getEditor('ES_INTANGIBLE')?.option('readOnly', true);
		this.readOnly = true;
	}

  override habilitar(): void {
		this.readOnly = false;
	}
	override setFocus() {
		setTimeout(() => {
			this.dataForm.instance.getEditor('NOMBRE_TIPO_GASTO')?.focus();
		});
	}
	//#endregion

	selectedLookUpLista(vRow: any): any {
		return vRow[0].Key;
	}
  selectedLookUpCORR_RUBRO(vRow: any): any {
		return vRow[0].CORR_RUBRO;
	}

  //#region <Impuestos>
  consultarGEN_TIPO_GASTO_IMPUESTO() {
    this.service
      .getAllGEN_TIPO_GASTO_IMPUESTO({ CORR_TIPO_GASTO: this.model.CORR_TIPO_GASTO })
      .pipe(take(1))
      .subscribe({
        next: (response: any) => {
          if (response.Result) {
            this.mGEN_TIPO_GASTO_IMPUESTO = response.Data;
          }
        },
        error: (error: any) => {
          this.notifyFx(error, NotifyType.Error);
        },
      });
  }

  gDataTipoGastoImpuestoInitNewRow(e:any){
    e.data.CORR_TIPO_GASTO = this.model.CORR_TIPO_GASTO;
    e.data.CORR_RUBRO = 0;
    e.data.IMPUESTO_INCLUIDO = false;
    e.data.ORDEN_TOTAL = 0;
    e.data.PERMITE_EDITAR = false;
  }

  gDataTipoGastoImpuestoRowInserting(e:any){
    e.data.CORR_TIPO_GASTO = this.model.CORR_TIPO_GASTO;
    this.loadingVisible = true;
    const isCanceled=new Promise((resolve, reject) => {
      let insertDeta = (data: any) => {
        this.service
          .insertGEN_TIPO_GASTO_IMPUESTO(data)
          .pipe(take(1))
          .subscribe({
            next: (response: any) => {
              if (response.Result) {
                data=response.Data;
                this.loadingVisible = false;
								this.notifyFx('Registro guardado con exito!', NotifyType.Success);
								resolve(false);
              }
            },
            error: (error: any) => {
              this.loadingVisible = false;
              this.notifyFx(error, NotifyType.Error);
              reject(error);
            },
          });
      }

      if (this.banderaMtto === UpdateType.Add) {
        if (!this.service.esValido(this.model, this.notifyFx)) {
					this.loadingVisible = false;
					reject('Debe completar la información del tipo de gasto');
				}
				this.guardar(insertDeta, e.data);
			} else if (this.banderaMtto === UpdateType.Update) {
				e.data.CORR_TIPO_GASTO = this.model.CORR_TIPO_GASTO;
				insertDeta(e.data);
			}
    });
    e.cancel=isCanceled;
  }

  gDataTipoGastoImpuestoRowUpdating(e:any){
    e.data.CORR_TIPO_GASTO = this.model.CORR_TIPO_GASTO;
    this.loadingVisible = true;
    this.service
      .updateGEN_TIPO_GASTO_IMPUESTO(e.data)
      .pipe(take(1))
      .subscribe({
        next: (response: any) => {
          if (response.Result) {
            this.loadingVisible = false;
            this.notifyFx('Registro actualizado con éxito!', NotifyType.Success);
          }
        },
        error: (error: any) => {
          this.loadingVisible = false;
          this.notifyFx(error, NotifyType.Error);
        },
      });
  }

  gDataTipoGastoImpuestoRowRemoving(e:any){
    this.service
      .deleteGEN_TIPO_GASTO_IMPUESTO(e.data)
      .pipe(take(1))
      .subscribe({
        next: (response: any) => {
          if (response.Result) {
            this.notifyFx('Registro eliminado con éxito!', NotifyType.Success);
          }
        },
        error: (error: any) => {
          this.notifyFx(error, NotifyType.Error);
        },
      });
  }
  gDataTipoGastoImpuestoRowValidating(e:any){
    if (e.newData.CORR_RUBRO === 0) {
      this.loadingVisible = false;
      e.errorText = 'Debe seleccionar un rubro';
      e.isValid = false;
    }
  }
  //#endregion
}
