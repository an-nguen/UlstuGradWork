import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { UserService } from '@core/services/user.service';

@Component({
  selector: 'app-user-login',
  templateUrl: './user-login.component.html',
  styleUrl: './user-login.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserLoginComponent implements OnInit {

  constructor(
    private readonly _service: UserService
  ) { }

  public ngOnInit(): void {
    throw new Error('Method not implemented.');
  }

}
