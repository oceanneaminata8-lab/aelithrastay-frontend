import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LanguageService } from '../../core/language.service';

@Component({
  selector: 'app-about-dev',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './about.html',
  styleUrls: ['./about.css']
})
export class AboutDevPage {
  protected readonly language = inject(LanguageService);
}
