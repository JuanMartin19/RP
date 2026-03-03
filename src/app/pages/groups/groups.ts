import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PrimeImportsModule } from "../../prime-imports";

@Component({
  selector: 'app-groups',
  imports: [RouterLink, PrimeImportsModule],
  templateUrl: './groups.html',
  styleUrl: './groups.css',
})
export class Groups {

}
