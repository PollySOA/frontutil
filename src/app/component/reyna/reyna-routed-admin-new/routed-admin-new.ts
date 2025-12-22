import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ReynaService } from '../../../service/reyna/reyna';
import { IReyna } from '../../../model/reyna';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-routed-admin-new',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './routed-admin-new.html',
  styleUrl: './routed-admin-new.css',
})
export class RoutedAdminNew implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private reynaService = inject(ReynaService);

  reynaForm!: FormGroup;
  error: string | null = null;
  submitting: boolean = false;

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    this.reynaForm = this.fb.group({
      frase: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(1024)]],
      autor: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(255)]],
      esPublica: [false, [Validators.required]],
    });
  }

  onSubmit(): void {
    if (!this.reynaForm.valid) {
      this.reynaForm.markAllAsTouched();
      return;
    }

    this.submitting = true;
    const payload: Partial<IReyna> = {
      frase: this.reynaForm.value.frase,
      autor: this.reynaForm.value.autor,
      esPublica: this.reynaForm.value.esPublica,
    };

    this.reynaService.create(payload).subscribe({
      next: () => {
        this.submitting = false;
        this.router.navigate(['/reyna/plist']);
      },
      error: (err: HttpErrorResponse) => {
        this.submitting = false;
        this.error = 'Error al crear la frase motivacional';
        console.error(err);
      },
    });
  }

  get frase() {
    return this.reynaForm.get('frase');
  }

  get autor() {
    return this.reynaForm.get('autor');
  }

  get esPublica() {
    return this.reynaForm.get('esPublica');
  }
}
