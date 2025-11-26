import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { take } from 'rxjs/internal/operators/take';
import { environment } from 'src/environments/environment';

import { CBaseComponent } from 'src/app/FxAPI/CBaseComponent.component';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { UpdateType } from 'src/app/shared/models/UpdateType.enum';
import { AppInfoService } from 'src/app/shared/services/app-info.service';
import { GenRubro } from './models/gen-rubro';
import { GenRubroService } from './gen-rubro.service';
import { IParam } from 'src/app/FxAPI/IParam';

@Component({
	selector: 'app-gen-rubro',
	templateUrl: './gen-rubro.component.html',
	styleUrls: ['./gen-rubro.component.scss'],
})
export class GenRubroComponent extends CBaseComponent implements OnInit {

  //#region <Declarando Variales>
  mCLASE_RUBRO: any;
  mTIPO_APLICACION:any;
  mSUMA_RESTA:any ;
  readOnly = false;
  mGEN_RUBRO_IMPUESTO: any;
  mGEN_RUBRO_SUMA: any;
  mCORR_IMPUESTO: any;
  mCORR_RUBRO: any;
  // #endregion
	constructor(
		public override appInfoService: AppInfoService,
		public override router: ActivatedRoute,
		private service: GenRubroService
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
		this.getCLASE_RUBRO();
    this.getTIPO_APLICACION();
    this.getSUMA_RESTA();
    this.GetCORR_IMPUESTO();
    this.GetCORR_RUBRO();
	}

	getCLASE_RUBRO() {
		this.appInfoService
			.getLookUp('GEN_RUBRO', 'GEN_LISTA', 'GetCLASE_RUBRO', undefined, environment.UrlGENERALAPI)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.mCLASE_RUBRO = response.Data;
					}
				},
				error: (error: any) => {
					this.notifyFx(error, NotifyType.Error);
				},
			});
	}
  getTIPO_APLICACION() {
		this.appInfoService
			.getLookUp('GEN_RUBRO', 'GEN_LISTA', 'GetTIPO_APLICACION', undefined, environment.UrlGENERALAPI)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.mTIPO_APLICACION = response.Data;
					}
				},
				error: (error: any) => {
					this.notifyFx(error, NotifyType.Error);
				},
			});
	}
  getSUMA_RESTA() {
		this.appInfoService
			.getLookUp('GEN_RUBRO', 'GEN_LISTA', 'GetSUMA_RESTA', undefined, environment.UrlGENERALAPI)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.mSUMA_RESTA = response.Data;
					}
				},
				error: (error: any) => {
					this.notifyFx(error, NotifyType.Error);
				},
			});
	}
  GetCORR_IMPUESTO() {
      let xWhere: IParam[] = [{ Parameter: 'OPCION_CONSULTA', Value: 2 }];
      this.appInfoService
        .getLookUp('GEN_RUBRO', 'GEN_RUBRO', 'GetCORR_IMPUESTO', xWhere, environment.UrlGENERALAPI)
        .pipe(take(1))
        .subscribe({
          next: (response: any) => {
            if (response.Result) {
              this.mCORR_IMPUESTO = response.Data;
            }
          },
          error: (error: any) => {
            this.notifyFx(error, NotifyType.Error);
          },
        });
  }
  GetCORR_RUBRO() {
    let xWhere: IParam[] = [{ Parameter: 'OPCION_CONSULTA', Value: 0 }];
    this.appInfoService
      .getLookUp('GEN_RUBRO', 'GEN_RUBRO', 'GetCORR_RUBRO', xWhere, environment.UrlGENERALAPI)
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
	fillParam(xCORR_RUBRO?: number): any {
		if (xCORR_RUBRO == undefined) {
			xCORR_RUBRO = 0;
		}
		return {
			CORR_RUBRO: xCORR_RUBRO,
		};
	}

	override fillData(xModel?: GenRubro): GenRubro {
		if (xModel !== undefined) {
			return {
				CORR_EMPRESA: xModel.CORR_EMPRESA,
				CORR_RUBRO: xModel.CORR_RUBRO,
				NOMBRE_RUBRO: xModel.NOMBRE_RUBRO,
				DESCRIPCION_RUBRO: xModel.DESCRIPCION_RUBRO,
				ES_IMPUESTO: xModel.ES_IMPUESTO,
				POR_IMPUESTO: xModel.POR_IMPUESTO,
				MUESTRA_DETALLE: xModel.MUESTRA_DETALLE,
				MUESTRA_TOTAL: xModel.MUESTRA_TOTAL,
				SUMA_RESTA: xModel.SUMA_RESTA,
				NOMBRE_SUMA_RESTA: xModel.NOMBRE_SUMA_RESTA,
				CLASE_RUBRO: xModel.CLASE_RUBRO,
				NOMBRE_CLASE_RUBRO: xModel.NOMBRE_CLASE_RUBRO,
				TIPO_APLICACION: xModel.TIPO_APLICACION,
				NOMBRE_TIPO_APLICACION: xModel.NOMBRE_TIPO_APLICACION,
			};
		} else {
			return {
				CORR_EMPRESA: 1,
				CORR_RUBRO: 0,
				NOMBRE_RUBRO: '',
				DESCRIPCION_RUBRO: '',
				ES_IMPUESTO: false,
				POR_IMPUESTO: 0,
				MUESTRA_DETALLE: false,
				MUESTRA_TOTAL: false,
				SUMA_RESTA: 0,
				NOMBRE_SUMA_RESTA: '',
				CLASE_RUBRO: '',
				NOMBRE_CLASE_RUBRO: '',
				TIPO_APLICACION: '',
				NOMBRE_TIPO_APLICACION: '',
			};
		}
	}

  override nuevo(): void {
    super.nuevo();
    this.consultarGEN_RUBRO_IMPUESTO();
    this.consultarGEN_RUBRO_SUMA();
  }
  override editarClick(e:any) {
    this.model=e.row.data;
    super.editarClick(e);
    this.consultarGEN_RUBRO_IMPUESTO();
    this.consultarGEN_RUBRO_SUMA();
  }

  override rowDblClick(e: any) {
    super.rowDblClick(e);
    this.consultarGEN_RUBRO_IMPUESTO();
    this.consultarGEN_RUBRO_SUMA();
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
							const vIndex = this.models.findIndex((item: any) => item.CORR_RUBRO === response.Data.CORR_RUBRO);
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
		super.cancelar((item: any) => item.CORR_RUBRO === this.modelUpdate.CORR_RUBRO);
	}

	rowRemoving(e: any) {
		this.service
			.delete(this.fillParam(e.data.CORR_RUBRO))
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
		this.dataForm.instance.getEditor('CORR_RUBRO')?.option('readOnly', true);
		this.dataForm.instance.getEditor('NOMBRE_RUBRO')?.option('readOnly', true);
		this.dataForm.instance.getEditor('DESCRIPCION_RUBRO')?.option('readOnly', true);
		this.dataForm.instance.getEditor('ES_IMPUESTO')?.option('readOnly', true);
		this.dataForm.instance.getEditor('POR_IMPUESTO')?.option('readOnly', true);
		this.dataForm.instance.getEditor('MUESTRA_DETALLE')?.option('readOnly', true);
		this.dataForm.instance.getEditor('MUESTRA_TOTAL')?.option('readOnly', true);
		this.dataForm.instance.getEditor('SUMA_RESTA')?.option('readOnly', true);
		this.dataForm.instance.getEditor('CLASE_RUBRO')?.option('readOnly', true);
		this.dataForm.instance.getEditor('TIPO_APLICACION')?.option('readOnly', true);
		this.dataForm.instance.getEditor('CUENTA_CONTABLE')?.option('readOnly', true);
		this.dataForm.instance.getEditor('CODIGO_FEL')?.option('readOnly', true);
		this.readOnly = true;
	}

	override habilitar(): void {
		this.readOnly = false;
	}

	override setFocus() {
		setTimeout(() => {
			this.dataForm.instance.getEditor('NOMBRE_RUBRO')?.focus();
		});
	}
	//#endregion

	selectedLookUpLista(vRow: any): any {
		return vRow[0].Key;
	}
	selectedLookUpCORR_IMPUESTO(vRow: any): any {
		return vRow[0].CORR_RUBRO;
	}
  selectedLookUpCORR_RUBRO(vRow: any): any {
		return vRow[0].CORR_RUBRO;
	}
  // #region <Impuestos>
	consultarGEN_RUBRO_IMPUESTO() {
		this.service
			.getAllGEN_RUBRO_IMPUESTO({ CORR_RUBRO: this.model.CORR_RUBRO })
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.mGEN_RUBRO_IMPUESTO = response.Data;
					}
				},
				error: (error: any) => {
					this.notifyFx(error, NotifyType.Error);
				},
			});
	}
	gDataRubroImpuestoInitNewRow(e: any) {
		e.data.CORR_RUBRO = this.model.CORR_RUBRO;
		e.data.CORR_IMPUESTO = 0;
    e.data.IMPUESTO_INCLUIDO = false;
		// this.getCORR_STAKEHOLDER();
	}
	gDataRubroImpuestoRowInserting(e: any) {
		const isCanceled = new Promise((resolve, reject) => {
			this.loadingVisible = true;

			let insertDeta = (data: any) => {
				this.service
					.insertGEN_RUBRO_IMPUESTO(data)
					.pipe(take(1))
					.subscribe({
						next: (response: any) => {
							if (response.Result) {
								data.CORR_IMPUESTO = response.Data.CORR_IMPUESTO;
								data.IMPUESTO_INCLUIDO = response.Data.IMPUESTO_INCLUIDO;
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
			};

			if (this.banderaMtto === UpdateType.Add) {
				if (!this.service.esValido(this.model, this.notifyFx)) {
					this.loadingVisible = false;
					reject('Debe completar la información del rubro');
				}
				this.guardar(insertDeta, e.data);
			} else if (this.banderaMtto === UpdateType.Update) {
				e.data.CORR_RUBRO = this.model.CORR_RUBRO;
				insertDeta(e.data);
			}
		});
		e.cancel = isCanceled;
	}

	gDataRubroImpuestoRowUpdated(e: any) {
		e.data.CORR_RUBRO = this.model.CORR_RUBRO;
		this.loadingVisible = true;
		this.service
			.updateGEN_RUBRO_IMPUESTO(e.data)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.loadingVisible = false;
						this.notifyFx('Registro guardado con exito!', NotifyType.Success);
					}
				},
				error: (error: any) => {
					this.loadingVisible = false;
					this.notifyFx(error, NotifyType.Error);
				},
			});
	}

	gDataRubroImpuestoRowRemoving(e: any) {
		e.data.CORR_RUBRO = this.model.CORR_RUBRO;
		this.loadingVisible = true;
		this.service
			.deleteGEN_RUBRO_IMPUESTO(e.data)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.loadingVisible = false;
						this.notifyFx('Registro eliminado con exito!', NotifyType.Success);
					}
				},
				error: (error: any) => {
					e.cancel = true;
					this.loadingVisible = false;
					this.notifyFx(error, NotifyType.Error);
				},
			});
	}
  gDataRubroImpuestoRowValidating(e: any) {
    if (e.newData.CORR_IMPUESTO === 0) {
      this.loadingVisible = false;
			e.errorText = 'Debe seleccionar un impuesto';
			e.isValid = false;
			return;
    }
	}
	// #endregion

  // #region <Suma>
  consultarGEN_RUBRO_SUMA() {
    this.service
      .getAllGEN_RUBRO_SUMA({ CORR_RUBRO: this.model.CORR_RUBRO })
      .pipe(take(1))
      .subscribe({
        next: (response: any) => {
          if (response.Result) {
            this.mGEN_RUBRO_SUMA = response.Data;
          }
        },
        error: (error: any) => {
          this.notifyFx(error, NotifyType.Error);
        },
      });
  }
  gDataRubroSumaInitNewRow(e: any) {
    e.data.CORR_RUBRO = this.model.CORR_RUBRO;
    e.data.CORR_SUMA = 0;
    // this.getCORR_STAKEHOLDER();
  }
  gDataRubroSumaRowInserting(e: any) {
    const isCanceled = new Promise((resolve, reject) => {
      this.loadingVisible = true;

      let insertDeta = (data: any) => {
        this.service
          .insertGEN_RUBRO_SUMA(data)
          .pipe(take(1))
          .subscribe({
            next: (response: any) => {
              if (response.Result) {
                data.CORR_SUMA = response.Data.CORR_SUMA;
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
      };

      if (this.banderaMtto === UpdateType.Add) {
        if (!this.service.esValido(this.model, this.notifyFx)) {
          this.loadingVisible = false;
          reject('Debe completar la información del rubro');
        }
        this.guardar(insertDeta, e.data);
      } else if (this.banderaMtto === UpdateType.Update) {
        e.data.CORR_RUBRO = this.model.CORR_RUBRO;
        insertDeta(e.data);
      }
    });
    e.cancel = isCanceled;
  }

  gDataRubroSumaRowUpdated(e: any) {
    e.data.CORR_RUBRO = this.model.CORR_RUBRO;
    this.loadingVisible = true;
    this.service
      .updateGEN_RUBRO_SUMA(e.data)
      .pipe(take(1))
      .subscribe({
        next: (response: any) => {
          if (response.Result) {
            this.loadingVisible = false;
            this.notifyFx('Registro guardado con exito!', NotifyType.Success);
          }
        },
        error: (error: any) => {
          this.loadingVisible = false;
          this.notifyFx(error, NotifyType.Error);
        },
      });
  }
  gDataRubroSumaRowRemoving(e: any) {
    e.data.CORR_RUBRO = this.model.CORR_RUBRO;
    this.loadingVisible = true;
    this.service
      .deleteGEN_RUBRO_SUMA(e.data)
      .pipe(take(1))
      .subscribe({
        next: (response: any) => {
          if (response.Result) {
            this.loadingVisible = false;
            this.notifyFx('Registro eliminado con exito!', NotifyType.Success);
          }
        },
        error: (error: any) => {
          e.cancel = true;
          this.loadingVisible = false;
          this.notifyFx(error, NotifyType.Error);
        },
      });
  }
  gDataRubroSumaRowValidating(e: any) {
    if (e.newData.CORR_SUMA === 0) {
      this.loadingVisible = false;
      e.errorText = 'Debe seleccionar un rubro';
      e.isValid = false;
      return;
    }
  }
  // #endregion
}
