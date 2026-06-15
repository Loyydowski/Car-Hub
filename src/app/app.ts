import { Component, signal } from '@angular/core';
import {FormsModule} from '@angular/forms'
import { CommonModule } from '@angular/common';
type pictures = {
id:string,
ImgPath:string,
likes:number,
price:number,
brand:string
model:string
}


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [FormsModule,CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  czySzukaBMW: boolean = true;
  czySzukaAudi: boolean = true;
  czySzukaMercedes: boolean = true;
      Advertisements : pictures[] = [
        {id: "audi", ImgPath: "audi1.png",likes: 12,price: 15000, brand: "Audi",model: "a4"},
        {id: "mercedes", ImgPath: "mercedes1.png",likes: 15,price: 25000, brand: "Mercedes",model: "benz"},
          {id: "audi", ImgPath: "audi2.png",likes: 52,price: 35000, brand: "Audi",model: "a3"},
          {id: "mercedes",ImgPath: "mercedes2.png",likes: 24,price: 15000, brand: "Mercedes",model: "cabro"},
          {id: "mercedes",ImgPath: "mercedes3.png",likes: 52,price: 7000, brand: "Mercedes",model: "boost"},
            {id: "audi", ImgPath: "audi3.png",likes: 122,price: 25000, brand: "Audi",model: "m3"},
             {id: "bmw", ImgPath: "bmw.png",likes: 222,price: 35000, brand: "BMW",model: "e34"},
              {id: "bmw", ImgPath: "bmw2.png",likes: 4,price: 41000, brand: "BMW",model: "e46"},
               {id: "bmw", ImgPath: "bmw3.png",likes: 1222,price: 135000, brand: "BMW",model: "quadro"},
             

 
]
          get filter():pictures[]{
            return this.Advertisements.filter(
              a =>
              (
                (a.id === "audi" && this.czySzukaAudi) ||
                (a.id === "bmw" && this.czySzukaBMW) ||
                (a.id === "mercedes" && this.czySzukaMercedes)

              )
            )
          }

}
