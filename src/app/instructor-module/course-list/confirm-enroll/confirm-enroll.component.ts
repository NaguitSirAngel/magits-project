import { Component, OnInit, Optional, Inject, NgZone } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { CourseService } from 'src/app/_services/course/course.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-confirm-enroll',
  templateUrl: './confirm-enroll.component.html',
  styleUrls: ['./confirm-enroll.component.css']
})
export class ConfirmEnrollComponent implements OnInit {
  courseForm: FormGroup;
  course_id: any;
  member_id: any;
  memberships: any = [];
  membership_selected: any;

  constructor(
    // DATA PASSED TO MODAL COMPONENT
    private dialogRef: MatDialogRef<ConfirmEnrollComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) private receivedData: any,
    private courseApi: CourseService,
    private fb: FormBuilder,
    private ngZone: NgZone,
    private router: Router
  ) {
    this.course_id = this.receivedData.course_id;
    this.member_id = this.receivedData.member_id;

    this.courseApi.GetCourse(this.course_id).subscribe(data => {
      // ADDS THE MEMBERSHIP TYPE TO ARRAY IF OPTION EXISTS
      if (data.session_membership != null) {
        this.memberships.push({ 'key': 'Session', 'type': data.session_membership._id,
         'number_of_sessions': data.session_membership.number_of_sessions, 'cost': data.session_membership.cost});
      }
      if (data.subscription_membership != null) {
        this.memberships.push({ 'key': 'Subscription', 'type': data.subscription_membership._id, 'cost': data.subscription_membership.cost});
      }

      // POPULATES DISPLAY FORM
      this.courseForm = this.fb.group({
        name: [{ value: data.name, disabled: true }],
        details: [{ value: data.details, disabled: true }],
        max_students: [{ value: data.max_students, disabled: true }],
        user_membership: ['', Validators.required]
      });
    });
  }

  ngOnInit() {
    this.courseForm = this.fb.group({
      name: [''],
      details: [''],
      max_students: [''],
      user_membership: ['', Validators.required]
    });
  }

  /* Get errors */
  public handleError = (controlName: string, errorName: string) => {
    return this.courseForm.controls[controlName].hasError(errorName);
  }

  enrollMember() {
    if (this.courseForm.valid) {
      if (window.confirm('Are you sure you want to enroll this member to the course?')) {
        this.courseApi.EnrolMember(this.course_id, { 'member_id': this.member_id, 'membership_id': this.membership_selected.type}).subscribe(res => {
          this.closeDialog();
          this.ngZone.run(() => this.router.navigateByUrl('/instructor/course-list'))
        });
      }
    }
  }

  closeDialog() {
    this.dialogRef.close({ event: 'close' });
  }
}
