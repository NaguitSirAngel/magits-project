//this is our api.js
const express = require('express');
const app = express();
const courseRoute = express.Router();

// models
let Course = require('../model/Course');
let User = require('../model/User');
let Membership = require('../model/Membership');
let Schedule = require('../model/Schedule');


// Add Course
courseRoute.route('/add-course').post((req, res, next) => {
  Course.create(req.body, (error, data) => {
    if (error) {
      return next(error)
    } else {
      res.json(data)
    }
  })
});

// Add Course with membership type plan A
courseRoute.route('/add-course-membership-a').post((req, res, next) => {
  let newCourse = new Object();
  newCourse.name = req.body.name;
  newCourse.details = req.body.details;
  newCourse.max_students = req.body.max_students;

  let newMembership = new Object();
  newMembership.membership_type = req.body.membership_type;
  newMembership.cost = req.body.cost;
  newMembership.number_of_sessions = req.body.number_of_sessions;

  Course.create(newCourse, (error, data) => {
    if (error) {
      return next(error)
    } else {
      newMembership.course_id = data._id;
    }
  })

  Membership.create(newMembership, (error, data) => {
    if (error) {
      return next(error)
    } else {
      res.json(data)
    }
  })
});


// Add Course with membership type plan B
courseRoute.route('/add-course-membership-b').post((req, res, next) => {
  var newCourse = req.body.course;
  var sessionMembership = req.body.session;
  var subscriptionMembership = req.body.subscription;
  var schedules = req.body.schedule;

  Course.create(newCourse, (error, data) => {
    if (error)  return next(error);

    // add id of session and membership type if added
    if (sessionMembership!=null) {
      sessionMembership.course_id = data._id;
      sessionMembership.membership_type = 'session';

      Membership.create(sessionMembership, (error, sessionData) => {
        if (error)  return next(error);

        //find Course id and set session membership ID
        Course.findByIdAndUpdate(data._id, {
          $set: {"session_membership_id": sessionData._id}
        }, (error, data) => {
          if (error)  return next(error);
        })
      })
    }

    //create a subscription membership if added
    if (subscriptionMembership!=null) {
      subscriptionMembership.course_id = data._id;
      subscriptionMembership.membership_type = 'subscription';

        Membership.create(subscriptionMembership, (error, subscriptionData) => {
          if (error)  return next(error);

          //find Course id and set subscription membership ID
          Course.findByIdAndUpdate(data._id, {
            $set: {"subscription_membership_id": subscriptionData._id}
          }, (error, data) => {
            if (error)  return next(error);
          })
        })
    }

    //iterating through schedule array to create the schedule
    for(schedule of schedules){
      schedule.course_id = data._id;

      Schedule.create(schedule, (error, scheduleData) => {
        if (error)  return next(error);

        //find Course id and set subscription membership ID
        Course.findByIdAndUpdate(data._id, {
          $push: {"schedule": scheduleData._id}
        }, (error, data) => {
          if (error)  return next(error);
        })
      })
    }

  })

  res.json(res);
});

// testing with data callback
courseRoute.route('/add-course-test').post((req, res, next) => {
  Course.create(req.body, (error, data) => {
    if (error) {
      return next(error)
    } else {
      console.log(data);
      res.json(data)
    }
  })
});


// Get all course
courseRoute.route('/').get((req, res) => {
  Course.find((error, data) => {
    if (error) {
      return next(error)
    } else {
      res.json(data)
    }
  })
})

// Get single course
courseRoute.route('/read-course/:id').get((req, res) => {
  Course.findById(req.params.id, (error, data) => {
    if (error) {
      return next(error)
    } else {
      res.json(data)
    }
  })
})

// Get members of course
courseRoute.route('/course-members/:id').get((req, res) => {
  Course.findById(req.params.id).populate('members').exec((error, data) => {
    if (error) {
      return next(error)
    } else {
      res.json(data.members)
    }
  })
})

// Update course
courseRoute.route('/update/:id').put((req, res, next) => {
  console.log(req.body);

  Course.findByIdAndUpdate(req.params.id, {
    $set: req.body
  }, (error, data) => {
    if (error) {
      return next(error);
      console.log(error)
    } else {
      res.json(data)
      console.log('Course successfully updated!')
    }
  })
})

// add member to a course
courseRoute.route('/register-user-to-course/:id').put((req, res, next) => {
  console.log("req user_id: "+req.body.user_id);

  //find course and push member id to course members array
  Course.findByIdAndUpdate(req.params.id, {
    $push: {"members": req.body.user_id}
  }, (error, data) => {
    if (error) {
      return next(error);
      console.log(error)
    } else {

      //find user and push course ID to user courses array
      User.findByIdAndUpdate(req.body.user_id, {
        $push: {"courses": req.params.id}
      }, (error, data) => {
        if (error) {
          return next(error);
          console.log(error)
        } else {
          console.log('Course added to member!')
        }
      })

      res.json(data)
      console.log('Member successfully enrolled!')
    }
  })

  // Course.update(req.params.id,
  //   Course.members.push(req.body.members)
  // , (error, data) => {
  //   if (error) {
  //     return next(error);
  //     console.log(error)
  //   } else {
  //     res.json(data)
  //     console.log('Course successfully updated!')
  //   }
  // })

  // Course.findById(req.params.id, {
  //   $push: {"members": req.body.members}
  // }, (error, data) => {
  //   if (error) {
  //     return next(error);
  //     console.log(error)
  //   } else {
  //     res.json(data)
  //     console.log('Course successfully updated!')
  //   }
  // })


})

// Delete course
courseRoute.route('/delete-course/:id').delete((req, res, next) => {
  Course.findByIdAndRemove(req.params.id, (error, data) => {
    if (error) {
      return next(error);
    } else {
      res.status(200).json({
        msg: data
      })
    }
  })
})

module.exports = courseRoute;
