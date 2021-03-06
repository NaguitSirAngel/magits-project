import { Component, OnInit, NgZone } from '@angular/core';
import { AnnouncementService } from '../../../_services/announcement/announcement.service';
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { Router } from '@angular/router';
import { DatePipe, Location } from '@angular/common';
import { AuthService } from '../../../_services/auth/auth.service';

@Component({
  selector: 'app-create-announcement',
  templateUrl: './create-announcement.component.html',
  styleUrls: ['./create-announcement.component.css']
})

export class CreateAnnouncementComponent implements OnInit {
  announcementForm: FormGroup;
  currentDate = new Date();
  user_id: any;

  constructor(
    public fb: FormBuilder,
    private announcementApi: AnnouncementService,
    private ngZone: NgZone,
    private router: Router,
    private datePipe: DatePipe,
    private location: Location,
    private _authService: AuthService
  ) {
    this.user_id = this._authService.decode().subject;
  }

  ngOnInit() {
    this.AnnouncementForm();
  }

  AnnouncementForm() {
    this.announcementForm = this.fb.group({
      subject: ['', [Validators.required]],
      content: ['', Validators.required],
      user: [this.user_id]
    });
  }

  /* Get errors */
  public handleError = (controlName: string, errorName: string) => {
    return this.announcementForm.controls[controlName].hasError(errorName);
  }

  submitAnnouncementForm() {
    if (this.announcementForm.valid) {
      if (window.confirm('Are you sure you want to send this announcement?')) {
        this.announcementApi.AddAnnouncement(this.announcementForm.value).subscribe(res => {
          this.ngZone.run(() => this.router.navigateByUrl('/admin/announcements'))
        });
      }
    }
  }

  backPressed() {
    this.location.back();
  }
}
