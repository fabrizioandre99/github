import { ToastrService } from 'ngx-toastr';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { IDataResponse } from '../../../models/IDataResponse';
import { lastValueFrom } from 'rxjs';
import { ContrasenaService } from '../../../services/contrasena.service';
import { Router } from '@angular/router';
import { SharedDataService } from '../../../services/shared-data.service';
import {
  ElementRef,
  Input,
  isDevMode,
  QueryList,
  ViewChildren,
} from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormControl,
  ValidationErrors,
} from '@angular/forms';

function getFormArray(size: number): FormArray {
  const arr = [];

  for (let i = 0; i < size; i++) {
    arr.push(new FormControl(''));
  }
  return new FormArray(arr);
}

@Component({
  selector: 'app-codigo-confirmacion',
  templateUrl: './codigo-confirmacion.component.html',
  styleUrls: ['./codigo-confirmacion.component.css']
})

export class CodigoConfirmacionComponent implements OnInit {
  codigo: any;
  isRequired: boolean = false;
  isMinimun: boolean = false;
  fShow: boolean = false;
  loading: boolean = false;
  otpValue: string = '';


  constructor(private toastr: ToastrService, private contrasenaService: ContrasenaService,
    private router: Router, private sharedDataService: SharedDataService, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this.toastr.clear();
  }

  openAlertInfo() {
    this.toastr.info('Ingrese el código enviado a su bandeja de correo. Si no cuenta con el código comuníquese con el administrador del sistema. ', 'Código de confirmación',
      {
        timeOut: 0,
        closeButton: true,
        tapToDismiss: false,
        progressBar: false,
        extendedTimeOut: 0
      });
  }

  async confirmarCodigo() {
    try {
      if (!this.otpValue) {
        return;
      }
      if (this.otpValue?.length < 6) {
        return;
      }

      this.loading = true;

      let data: IDataResponse = await lastValueFrom(this.contrasenaService.validarCodigo(this.otpValue));

      console.log('data', data);
      if (data.exito) {
        let codigoConfirmar = data.datoAdicional;
        //console.log('codigoConfirmar', codigoConfirmar);
        this.sharedDataService.setNuevaContrasena(codigoConfirmar);
        this.router.navigate(['/nueva-contrasena']);
      } else {
        this.toastr.warning(data.mensajeUsuario, 'Advertencia');
      }

    } catch (error) {

      this.toastr.error('Existen problemas en el servidor.', 'Error');
    }
    finally {
      this.loading = false;
    }

  }


  @Input()
  set size(size: number) {
    this.inputs = getFormArray(size);
    this.#size = size;
  }

  @ViewChildren('inputEl') inputEls!: QueryList<ElementRef<HTMLInputElement>>;

  #size = 6;
  #scheduledFocus: number | null = null;


  inputs = getFormArray(this.#size);

  onChange?: (value: string) => void;
  onTouched?: () => void;

  writeValue(value: string): void {
    if (isDevMode() && value?.length) {
      throw new Error('Otp input is not supposed to be prefilled with data');
    }

    // Reset all input values
    this.inputs.setValue(new Array(this.#size).fill(''));
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    if (isDisabled) {
      this.inputs.disable();
    } else {
      this.inputs.enable();
    }
  }

  validate(control: AbstractControl<string, string>): ValidationErrors | null {
    if (!control.value || control.value.length < this.#size) {
      return {
        otpInput: 'Value is incorrect',
      };
    }

    return null;
  }

  handleKeyDown(e: KeyboardEvent, idx: number) {
    if (e.key === 'Backspace' || e.key === 'Delete') {
      if (idx > 0) {
        this.#scheduledFocus = idx - 1;
      }
    }
  }

  // Due to iOS/iPadOS Safari bug/special behavior we are forced to
  // schedule focus transition during keypress/keydown event and only
  // after input event happened - execute the transition
  // otherwise inputs don't get their values filled
  handleInput() {
    this.#updateWiredValue();

    if (this.#scheduledFocus != null) {
      this.#focusInput(this.#scheduledFocus);
      this.#scheduledFocus = null;
    }

    this.otpValue = this.inputs.controls.map(input => input.value).join('');
  }

  handleKeyPress(e: KeyboardEvent, idx: number) {
    const isDigit = /^\d$/.test(e.key); // Verifica si la tecla presionada es un número

    if (!isDigit) {
      e.preventDefault(); // Previene la acción si no es un número
      return false;
    }

    if (isDigit && idx + 1 < this.#size) {
      this.#scheduledFocus = idx + 1;
    }

    if (isDigit && this.inputs.controls[idx].value) {
      this.inputs.controls[idx].setValue('');
    }

    return isDigit;
  }

  handlePaste(e: ClipboardEvent, idx: number) {
    e.preventDefault();

    if (idx !== 0) {
      return;
    }

    const pasteData = e.clipboardData?.getData('text') ?? ''; // Proporciona una cadena vacía si pasteData es undefined
    const pasteDataNumbersOnly = pasteData.replace(/[^0-9]/g, ''); // Conserva solo números
    const maxLength = this.inputs.controls.length;
    const clippedPasteData = pasteDataNumbersOnly.substring(0, maxLength);

    for (let i = 0; i < clippedPasteData.length; i++) {
      this.inputs.controls[i].setValue(clippedPasteData[i]);
    }

    this.otpValue = clippedPasteData;
    this.#focusInput(clippedPasteData.length - 1);
    this.#updateWiredValue();
    if (this.onTouched) {
      this.onTouched();
    }
  }


  handleFocus(e: FocusEvent) {
    // Select previously entered value to replace with a new input
    (e.target as HTMLInputElement).select();
  }

  #focusInput(idx: number) {
    setTimeout(() => this.inputEls.get(idx)?.nativeElement.focus());
  }

  #updateWiredValue() {
    setTimeout(() => this.onChange?.(this.inputs.value.join('')));
  }

  isAnyFieldEmpty(): boolean {
    return this.inputs.controls.some(input => !input.value);
  }

}
