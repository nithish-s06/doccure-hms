import { AfterViewInit, Component } from '@angular/core';
import { CommandBarService } from '../../core/services/layout/command-bar.service';

@Component({
  imports: [],
  selector: 'app-header',
  styleUrl: './header.css',
  templateUrl: './header.html',
})
export class Header implements AfterViewInit {
  constructor(private commandBarService: CommandBarService) {}

  ngAfterViewInit(): void {
    this.commandBarService.init();
  }
}
