import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors, AsyncValidatorFn } from '@angular/forms';
import { SoaresService } from '../../../service/soares';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError, debounceTime, switchMap, first } from 'rxjs/operators';

@Component({
  selector: 'app-soares-routed-user-new',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './routed-user-new.html',
  styleUrl: './routed-user-new.css',
})
export class SoaresRoutedUserNew implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private soaresService = inject(SoaresService);

  soaresForm!: FormGroup;
  error: string | null = null;
  submitting: boolean = false;
  toastMessage: string | null = null;
  toastType: 'success' | 'error' = 'success';

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    this.soaresForm = this.fb.group({
      preguntas: ['...', 
        {
          validators: [Validators.required, Validators.minLength(3), Validators.maxLength(500)],
          asyncValidators: [this.preguntaExistsValidator()],
          updateOn: 'change'
        }
      ],
    });
  }

  preguntaExistsValidator(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      if (!control.value || control.value.length < 3) {
        return of(null);
      }
      return of(control.value).pipe(
        debounceTime(300),
        switchMap(value => 
          this.soaresService.checkPreguntaExists(value).pipe(
            map(exists => exists ? { preguntaExists: true } : null),
            catchError(() => of(null))
          )
        ),
        first()
      );
    };
  }

  confirmarEnvio(): void {
    if (!this.soaresForm.valid) {
      this.soaresForm.markAllAsTouched();
      return;
    }

    this.submitting = true;
    const payload: any = {
      preguntas: this.soaresForm.value.preguntas,
      publicacion: false
    };

    this.soaresService.createOne(payload).subscribe({
      next: () => {
        this.submitting = false;
        // Cerrar modal
        const modalElement = document.getElementById('modalConfirmar');
        if (modalElement) {
          const modal = (window as any).bootstrap.Modal.getInstance(modalElement);
          if (modal) {
            modal.hide();
          }
        }
        // Mostrar toast
        this.mostrarToast('Solicitud enviada correctamente. Espera la aprobación del administrador.', 'success');
        // Redirigir después de 2 segundos
        setTimeout(() => {
          this.router.navigate(['/soares/user/plist']);
        }, 1000);
      },
      error: (err: HttpErrorResponse) => {
        this.submitting = false;
        // Cerrar modal
        const modalElement = document.getElementById('modalConfirmar');
        if (modalElement) {
          const modal = (window as any).bootstrap.Modal.getInstance(modalElement);
          if (modal) {
            modal.hide();
          }
        }
        // Mostrar toast de error
        this.mostrarToast('Error al enviar la solicitud', 'error');
        console.error(err);
      },
    });
  }

  mostrarToast(mensaje: string, tipo: 'success' | 'error'): void {
    this.toastMessage = mensaje;
    this.toastType = tipo;
    setTimeout(() => {
      this.toastMessage = null;
    }, 1000);
  }

  get preguntas() {
    return this.soaresForm.get('preguntas');
  }
}
