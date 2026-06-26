import { Routes } from '@angular/router';
import { Home } from './home/home';
import { Ogloszenie } from './ogloszenie/ogloszenie';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'ogloszenie/:index', component: Ogloszenie },
];
