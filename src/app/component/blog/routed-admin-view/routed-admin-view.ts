import { Component } from '@angular/core';
import { IBlog } from '../../../model/blog';
import { BlogService } from '../../../service/blog';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { UnroutedAdminView } from "../unrouted-admin-view/unrouted-admin-view";

@Component({
  selector: 'app-routed-admin-view',
  imports: [UnroutedAdminView, RouterLink],
  templateUrl: './routed-admin-view.html',
  styleUrl: './routed-admin-view.css',
})
export class RoutedAdminView {
  oBlog: IBlog | null = null;

  constructor(private oBlogService: BlogService, private route: ActivatedRoute) {
    // Obtener el ID del blog desde la ruta
    const idParam = this.route.snapshot.paramMap.get('id');
    const blogId = idParam ? Number(idParam) : NaN;
    if (isNaN(blogId)) {
      console.error('Invalid blog id:', idParam);
      return;
    }
    this.getBlog(blogId);
  }

  ngOnInit() { }

  getBlog(blogId: number) {
    this.oBlogService.get(blogId).subscribe({
      next: (data: IBlog) => {
        this.oBlog = data;
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error fetching blog:', error);
      },
    });
  }
}
