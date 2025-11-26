import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, NgModule, Output } from '@angular/core';
import { DxButtonModule } from 'devextreme-angular/ui/button';
import { DxToolbarModule } from 'devextreme-angular/ui/toolbar';

@Component({
	selector: 'app-barra-data-mtto',
	templateUrl: './barra-data-mtto.component.html',
	styleUrls: ['./barra-data-mtto.component.scss'],
})
export class BarraDataMttoComponent {
	@Input() tituloVentana: string = '';
	@Input() isBrowse: boolean = false;
	@Input() isForm: boolean = false;
	@Input() permiteAdd: boolean = false;
	@Input() showRefresh: boolean = false;
	@Input() showDates: boolean = false;
	@Input() items: any[] = [];
	@Input() FECHA_INICIAL: Date = new Date();
	@Output() FECHA_INICIALChange = new EventEmitter<any>();
	@Input() FECHA_FINAL: Date = new Date();
	@Output() FECHA_FINALChange = new EventEmitter<any>();
	@Output() nuevo = new EventEmitter<any>();
	@Output() guardar = new EventEmitter<any>();
	@Output() cancelar = new EventEmitter<any>();
	@Output() consultar = new EventEmitter<any>();

	//Botón 1
  @Input() btn1: string = '';
	@Input() btn1Icon: string = '';
	@Input() btn1Location: string = 'before';
	@Input() btn1Type: string = 'default';
	@Input() btn1Height: number = 30;
	@Input() btn1Width: number = 80;
  @Input() btn1Mode: string = 'contained';
	@Output() btn1Click = new EventEmitter<any>();

	//Botón 2
	@Input() btn2: string = '';
  @Input() btn2Icon: string = '';
	@Input() btn2Location: string = 'before';
	@Input() btn2Type: string = 'default';
	@Input() btn2Height: number = 30;
	@Input() btn2Width: number = 80;
  @Input() btn2Mode: string = 'contained';
	@Output() btn2Click = new EventEmitter<any>();

	//Botón 3
	@Input() btn3: string = '';
  @Input() btn3Icon: string = '';
	@Input() btn3Location: string = 'before';
	@Input() btn3Type: string = 'default';
	@Input() btn3Height: number = 30;
	@Input() btn3Width: number = 80;
  @Input() btn3Mode: string = 'contained';
	@Output() btn3Click = new EventEmitter<any>();

	//Botón 4
	@Input() btn4: string = '';
  @Input() btn4Icon: string = '';
	@Input() btn4Location: string = 'before';
	@Input() btn4Type: string = 'default';
	@Input() btn4Height: number = 30;
	@Input() btn4Width: number = 80;
  @Input() btn4Mode: string = 'contained';
	@Output() btn4Click = new EventEmitter<any>();

  //Botón 5
	@Input() btn5: string = '';
  @Input() btn5Icon: string = '';
	@Input() btn5Location: string = 'before';
	@Input() btn5Type: string = 'default';
	@Input() btn5Height: number = 30;
	@Input() btn5Width: number = 80;
  @Input() btn5Mode: string = 'contained';
	@Output() btn5Click = new EventEmitter<any>();

  //Botón 6
	@Input() btn6: string = '';
  @Input() btn6Icon: string = '';
	@Input() btn6Location: string = 'before';
	@Input() btn6Type: string = 'default';
	@Input() btn6Height: number = 30;
	@Input() btn6Width: number = 80;
  @Input() btn6Mode: string = 'contained';
	@Output() btn6Click = new EventEmitter<any>();

  constructor() {
		this.OnNuevo = this.OnNuevo.bind(this);
		this.OnGuardar = this.OnGuardar.bind(this);
		this.OnCancelar = this.OnCancelar.bind(this);
		this.OnConsultar = this.OnConsultar.bind(this);
		this.Onbtn1Click = this.Onbtn1Click.bind(this);
		this.Onbtn2Click = this.Onbtn2Click.bind(this);
		this.Onbtn3Click = this.Onbtn3Click.bind(this);
		this.Onbtn4Click = this.Onbtn4Click.bind(this);
    this.Onbtn5Click = this.Onbtn5Click.bind(this);
    this.Onbtn6Click = this.Onbtn6Click.bind(this);
		this.OnValueChangeFECHA_INICIAL = this.OnValueChangeFECHA_INICIAL.bind(this);
		this.OnValueChangeFECHA_FINAL = this.OnValueChangeFECHA_FINAL.bind(this);
	}

	OnNuevo() {
		this.nuevo.emit();
	}

	OnGuardar() {
		this.guardar.emit();
	}

	OnCancelar() {
		this.cancelar.emit();
	}

	OnConsultar() {
		this.consultar.emit();
	}

	Onbtn1Click() {
		this.btn1Click.emit();
	}

	Onbtn2Click() {
		this.btn2Click.emit();
	}

	Onbtn3Click() {
		this.btn3Click.emit();
	}

	Onbtn4Click() {
		this.btn4Click.emit();
	}

  Onbtn5Click() {
		this.btn5Click.emit();
	}

  Onbtn6Click() {
		this.btn6Click.emit();
	}

	OnValueChangeFECHA_INICIAL(e: any) {
		this.FECHA_INICIALChange.emit(e.value);
	}

	OnValueChangeFECHA_FINAL(e: any) {
		this.FECHA_FINALChange.emit(e.value);
	}
}

@NgModule({
	imports: [DxButtonModule, DxToolbarModule, CommonModule],
	declarations: [BarraDataMttoComponent],
	exports: [BarraDataMttoComponent],
})
export class BarraDataMttoModule {}
