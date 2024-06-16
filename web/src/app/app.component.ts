import { ChangeDetectionStrategy, Component } from '@angular/core';
import { HubConnectionBuilder } from '@microsoft/signalr';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {

  constructor() {
    const connection = new HubConnectionBuilder()
      .withUrl(`${environment.BASE_URL}/notification`)
      .build();

    connection.on('book-indexing', (result) => {
      console.log(result);
    });

    connection.start().then()
  }

}
