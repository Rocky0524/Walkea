import { Component } from '@angular/core';
import { RouterLink } from '@angular/router'; 
import { MapaComponent } from '../mapa/mapa';
@Component({
  selector: 'app-bienvenida',
  standalone: true,
  imports: [RouterLink], 
  templateUrl: './bienvenida.html',
  styleUrl: './bienvenida.css'
})
export class BienvenidaComponent {

  
 }