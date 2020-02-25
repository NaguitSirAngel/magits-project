const express = require('express');
const app = express();
const announcementRoute = express.Router();

// announcement model
let Announcement = require('../model/Announcement');
let User = require('../model/User.js')

//import logging tool
let Log = require('../logging')


//create create announcement function
announcementRoute.route('/add-announcement').post((req, res, next) => {
  Announcement.create(req.body)
    .then(announcementData => {
      // console.log('creating announcement')
      return User.findByIdAndUpdate(req.body.user, {
        $push: {"announcements": announcementData._id}
      })
    })
    .then((data) => {
      // console.log('second chain')
      //log the event
      Log.newLog("new announcement created",req.body.user)
      res.json(data)
    })
    .catch(err => {
      console.log(err)
    })
});

//add an Announcement
// announcementRoute.route('/add-announcement').post((req, res, next) => {
//   Announcement.create(req.body, (error, data) => {
//     if (error) {return next(error)}

//     //add announcement ID to the announcements array of User
//     User.findByIdAndUpdate(req.body.user, {
//       $push: {"announcements": data._id}
//     }, (error, data, next) => {
//       if (error) {
//         return next(error);
//         console.log(error)
//       }

//     })

//     res.json(data)

//   })
// });


// Get all announcements
announcementRoute.route('/').get((req, res) => {
  Announcement.find((error, data) => {
    if (error) {
      return next(error)
    } else {
      res.json(data)
    }
  })
})

// Get single announcement
announcementRoute.route('/read-announcement/:id').get((req, res) => {
  Announcement.findById(req.params.id, (error, data) => {
    if (error) {
      return next(error)
    } else {
      res.json(data)
    }
  })
})

// Delete announcement
announcementRoute.route('/delete-announcement/:id').delete((req, res, next) => {
  Announcement.findByIdAndRemove(req.params.id, (error, announcementData) => {
    if (error) {return next(error);}

    //find user and remove announcement ID
    User.findByIdAndUpdate(announcementData.user, {
      $pull: {"announcements": req.params.id}
    }, (error, userData) => {
      if (error) {
        console.log(error);
        return next(error);
      }
    })

    //log the event
    Log.newLog("announcement was deleted. Subject:"+announcementData.subject, announcementData.user)
    res.json(announcementData)
  })
})

module.exports = announcementRoute;
