import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ReynaService } from '../../../service/reyna/reyna';
import { IReyna } from '../../../model/reyna';
import { HttpErrorResponse } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-routed-admin-edit',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './routed-admin-edit.html',
  styleUrl: './routed-admin-edit.css',
})
export class RoutedAdminEdit implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private reynaService = inject(ReynaService);

  reynaForm!: FormGroup;
  reynaId: number | null = null;
  loading: boolean = true;
  error: string | null = null;
  submitting: boolean = false;
  private originalReyna: IReyna | null = null;

  constructor(private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.initForm();
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.reynaId = +id;
      this.loadReyna(+id);
    } else {
      this.loading = false;
      this.error = 'ID no válido';
    }
  }

  initForm(): void {
    this.reynaForm = this.fb.group({
      frase: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(1024)]],
      autor: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(255)]],
      esPublica: [false, [Validators.required]],
    });
  }

  loadReyna(id: number): void {
    this.reynaService.get(id).subscribe({
      next: (reyna: IReyna) => {
        this.originalReyna = reyna;
        this.reynaForm.patchValue({
          frase: reyna.frase,
          autor: reyna.autor,
          esPublica: reyna.esPublica,
        });
        this.loading = false;
      },
      error: (err: HttpErrorResponse) => {
        this.error = 'Error al cargar la frase motivacional';
        this.loading = false;
        console.error(err);
      },
    });
  }

  onSubmit(): void {
    if (!this.reynaForm.valid || !this.reynaId) {
      this.reynaForm.markAllAsTouched();
      return;
    }

    this.submitting = true;
    const payload: Partial<IReyna> = {
      id: this.reynaId!,
      frase: this.reynaForm.value.frase,
      autor: this.reynaForm.value.autor,
      esPublica: this.reynaForm.value.esPublica,
      // notificar
      
    };

    this.reynaService.update(payload).subscribe({
      next: () => {
        this.submitting = false;
        if(this.reynaForm){
          this.reynaForm.markAsPristine();
        }
        // notificar éxito
        this.snackBar.open('Frase motivacional guardada con éxito', 'Cerrar', { duration: 3000 });
        this.router.navigate(['/reyna/plist']);
      },
      error: (err: HttpErrorResponse) => {
        this.submitting = false;
        this.error = 'Error al guardar la frase motivacional';
        this.snackBar.open('Error al guardar la frase motivacional', 'Cerrar', { duration: 4000 });
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
