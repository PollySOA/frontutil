import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { SalinasService } from '../../../service/salinas-receta';
import { ISalinasReceta } from '../../../model/salinas-receta';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-salinas-routed-admin-new',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './routed-admin-new.html',
  styleUrl: './routed-admin-new.css',
})
export class SalinasRoutedAdminNew implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private salinasService = inject(SalinasService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  salinasRecetaForm!: FormGroup;
  error: string | null = null;
  submitting: boolean = false;

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    this.salinasRecetaForm = this.fb.group({
      nombre: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(1024)
      ]],
      ingredientes: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(1024)
      ]],
      preparacion: ['', [
        Validators.required,
        Validators.minLength(3),
      ]],
      publicado: [false],
    });
  }

  onSubmit(): void {
    if (!this.salinasRecetaForm.valid) {
      this.salinasRecetaForm.markAllAsTouched();
      return;
    }

    this.submitting = true;
    const payload: Partial<ISalinasReceta> = {
      nombre: this.salinasRecetaForm.value.nombre,
      ingredientes: this.salinasRecetaForm.value.ingredientes,
      preparacion: this.salinasRecetaForm.value.preparacion,
      publicado: this.salinasRecetaForm.value.publicado,
    };

    this.salinasService.create(payload).subscribe({
      next: () => {
        this.submitting = false;
        if (this.salinasRecetaForm) {
          this.salinasRecetaForm.markAsPristine();
        }
        // inform the user
        this.snackBar.open('Post creado correctamente', 'Cerrar', { duration: 3000 });
        this.router.navigate(['/receta/plist']);
      },
      error: (err: HttpErrorResponse) => {
        this.submitting = false;
        this.error = 'Error al crear la receta';
        this.snackBar.open('Error al crear la receta', 'Cerrar', { duration: 4000 });
        console.error(err);
      },
    });
  }

  // Guard: ask confirmation if the form has unsaved changes
    canDeactivate(): boolean | Promise<boolean> | import("rxjs").Observable<boolean> {
      if (!this.salinasRecetaForm || !this.salinasRecetaForm.dirty) {
        return true;
      }
      const ref = this.dialog.open(ConfirmDialogComponent, {
        data: {
          title: 'Cambios sin guardar',
          message: 'Hay cambios sin guardar. ¿Desea salir sin guardar los cambios?'
        }
      });
      return ref.afterClosed();
    }

  get nombre() {
    return this.salinasRecetaForm.get('nombre');
  }

  get ingredientes() {
    return this.salinasRecetaForm.get('ingredientes');
  }

  get preparacion() {
    return this.salinasRecetaForm.get('preparacion');
  }

  get publicado() {
    return this.salinasRecetaForm.get('publicado');
  }
}
