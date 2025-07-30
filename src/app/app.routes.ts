import { Routes } from '@angular/router';
import { CalendarComponent } from './features/calendar/calendar.component';

export const routes: Routes = [
    {path:"/login"},
    {path:"/dashboard"},
    {path:"/report"},
    {path:"/customers"},
    {path:"/contacts"},
    {path:"/contracts"},
    {path:"/calendar", component:CalendarComponent},
    {path:"/notifications"},
    {path:"/user"}
];
