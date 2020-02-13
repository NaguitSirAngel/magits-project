import { Component, OnInit, Inject } from '@angular/core';
import { Course } from '../../_services/course/course';
import { MatTableDataSource } from '@angular/material';
import { CourseService } from '../../_services/course/course.service';
import { UserService } from '../../_services/user/user.service';
import { delay, first } from 'rxjs/operators';
import { AuthService } from 'src/app/_services/auth/auth.service';


export interface Courses {
  name: string;
  instructors: string;
  status: string;
}

const ELEMENT_DATA: Courses[] = [
  {name: 'Taekwondo I', instructors: 'Manny Preston', status: 'Enrolled'},
  {name: 'Judo II' , instructors: 'Midoriya Izuku', status: 'Enrolled'},
  {name: 'Tekken' , instructors: 'Kuroko Tetsuya', status: 'Not Enrolled'},
  {name: 'Street Brawl' , instructors: 'Ken Masters', status: 'Enrolled'},
];

@Component({
  selector: 'app-courses',
  templateUrl: './courses.component.html',
  styleUrls: ['./courses.component.css']
})
export class CoursesComponent implements OnInit {
 
  UserData: any = [];
  dataSource: MatTableDataSource<Courses>;
  displayedColumns: string[] = ['name', 'instructors', 'status'] ;
  token = this._authService.decode();
  value = this.token.subject;

  constructor(private courseApi: CourseService, private userApi: UserService, private _authService: AuthService) {
    this.courseApi.GetCourses().subscribe(data => {
      for(let x in data){
        let DataList: any = {};
        let tempArr: Array<String> = [];
        DataList.instructors = [];

          for(let y in data[x].instructors){
          userApi.GetUser(data[x].instructors[y]).subscribe(data1 => {
            tempArr.push(data1.firstname[0] + "." + data1.lastname)
              DataList.instructors = tempArr;
          })
        }
        DataList.status = "Not Enrolled";
        userApi.GetUser(this.value).subscribe(data2 => {
            //console.log(data[x]._id);
            //console.log(data2.courses[0].course);
            for(let z in data2.courses){
              if(data[x]._id == data2.courses[z].course){
                  DataList.status = "Enrolled";
              }
            }
        })
        DataList.name = data[x].name;
        this.UserData.push(DataList);
        this.dataSource = new MatTableDataSource<Courses>(this.UserData);
      }
    });
  }



  ngOnInit() {
  }

}

