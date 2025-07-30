import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CrmUserService } from './services/crm-user.service';
import { tap } from 'rxjs';
import { NavbarComponent } from './core/navbar/navbar.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})

export class AppComponent {
  title = 'crm-project';

  crmUserService=inject(CrmUserService);

  constructor(){
    this.crmUserService.getAll().pipe(
      tap(user=>console.log(user)
      )
    ).subscribe();
  }
}


