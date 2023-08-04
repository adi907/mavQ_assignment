const http = require('http');

const Sequelize = require('sequelize');
const db=require('../mavQ/db-setup');

const { parse } = require('querystring');

const express=require('express');
const app=express();

const { Teacher, Course, sequelize } = require('./db-setup');

app.use(express.json());
app.use(express.urlencoded({extended:true}));


// API to Get a specific teacher record by ID
app.get('/teacher/:teacherId',(req,res)=>{
  const teacher_id=req.params.teacherId;

  if (!isNaN(teacher_id)) {
    Teacher.findByPk(teacher_id)
    .then((teacher) => {
      if (!teacher) {
        // If the teacher with the given ID is not found, return a 404 response
        res.status(404).send("Teacher Record not found");
      } else {
        // If the teacher is found, return the teacher's information in the response
        const teacherData = {
          teacher_id: teacher.teacher_id,
          name: teacher.name,
          is_active: teacher.is_active,
          designation: teacher.designation,
        };
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(teacherData));
      }
    })
    .catch((error) => {
      // If there's an error while querying the database, return a 500 response
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Internal Server Error');
    });

  }else{
    res.status(500).send("Invalid Teacher id provided");
  }

});


// API to Get a list of teachers based on filters
app.get('/teacher',(req,res)=>{
  const filters=req.query;
  Teacher.findAll({
    where:filters,
  }).then((teachers)=>{
    res.status(200).json(teachers);
  }).catch((error)=>{
    console.error('Error fetching teachers: ',error);
    res.status(500).json({error:'Internal Server Error'});
  });
});

// Function to handle POST request to create a new teacher
async function handleCreateTeacher(req, res){
  try {
    // Validate the required fields in the request body
    const requiredFields = ['teacher_id','name', 'designation'];

    for (const field of requiredFields) {
      if (!req.body.hasOwnProperty(field)) {
        return res.status(400).send(`Bad Request: Missing required field '${field}'`);
      }
    }
    
    // Create the teacher record in the database using Sequelize
    const newTeacher=await Teacher.create({
      teacher_id:req.body.teacher_id,
      name: req.body.name,
      is_active: req.body.is_active?req.body.is_active:false,
      designation: req.body.designation,
    })
      .catch((error) => {
        // If there's an error while creating the teacher, return a 500 response
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
      });
      
      res.status(200).json(newTeacher);
  } catch (error) {
    // If there's an error while parsing the request body, return a 400 response
    res.writeHead(400, { 'Content-Type': 'text/plain' });
    res.end('Bad Request: Invalid JSON payload');
  }

}

// API to Create a new teacher record using the JSON payload
app.post('/teacher',(req,res)=>{
  handleCreateTeacher(req, res);
}); 

// Function to handle POST request to create a new Course
async function handleCreateCourse(req, res) {
    try {
      // Validate the required fields in the request body
      const requiredFields = ['course_id','course_mentor','name','start_date','end_date','description','is_active'];

      for (const field of requiredFields) {
        if (!req.body.hasOwnProperty(field)) {
          return res.status(400).send(`Bad Request: Missing required field '${field}'`);
        }
      }

      // Create the teacher record in the database using Sequelize
      const newCourse=await Course.create({
        course_id:req.body.course_id,
        course_mentor: req.body.course_mentor,
        name: req.body.name,
        start_date: req.body.start_date,
        end_date: req.body.end_date,
        description: req.body.description,
        is_active: req.body.is_active?req.body.is_active:false,
      })
        .catch((error) => {
          // If there's an error while creating the teacher, return a 500 response
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          res.end('Internal Server Error');
        });
        
        // Get details of teacher
        const teacherDetails=await Teacher.findByPk(req.body.course_mentor);
        // console.log(teacherDetails);
        

        const CourseDetails={
          course_id:req.body.course_id,
          course_mentor:{
            teacher_id:teacherDetails.teacher_id,
            name:teacherDetails.name,
            is_active:teacherDetails.is_active,
            designation:teacherDetails.designation
          },
          name: req.body.name,
          start_date: req.body.start_date,
          end_date: req.body.end_date,
          description: req.body.description,
          is_active: req.body.is_active?req.body.is_active:false,
        }
        
        
        res.status(200).json(CourseDetails);
    } catch (error) {
      // If there's an error while parsing the request body, return a 400 response
      res.writeHead(400, { 'Content-Type': 'text/plain' });
      res.end('Bad Request: Invalid JSON payload');
    }

}

// API to Create a new teacher record using the JSON payload
app.post('/course',(req,res)=>{
  handleCreateCourse(req,res);
});

function handleGetCourseById(req, res, id) {

  Course.findByPk(id)
    .then((course_id) => {
      if (!course_id) {
        // If the teacher with the given ID is not found, return a 404 response
        res.status(404).send('Course Record Not Found');
      } else {
        
        // Get details of teacher
        Teacher.findByPk(course_id.course_mentor)
          .then((teacher) => {
          // If the teacher is found, return the teacher's information in the response
          const teacherDetails = {
            teacher_id: teacher.teacher_id,
            name: teacher.name,
            is_active: teacher.is_active,
            designation: teacher.designation,
          }
          
          let start_date=JSON.stringify(course_id.start_date).substring(1,11);
          let end_date=JSON.stringify(course_id.end_date).substring(1,11);

        const courseData = {
          course_id: course_id.course_id,
          course_mentor:{
            teacher_id:course_id.course_mentor,
            name:teacherDetails.name,
            is_active:teacherDetails.is_active,
            designation:teacherDetails.designation
          },
          name: course_id.name,
          start_date:start_date,
          end_date:end_date,
          description: course_id.description,
          is_active: course_id.is_active
        };
        
        res.status(200).json(courseData);
      })
        
      }
    })
    .catch((error) => {
      // If there's an error while querying the database, return a 500 response
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Internal Server Error');
    });  
}

// API to get a specific course record by ID
app.get('/course/:courseId',(req,res)=>{
  const course_id=req.params.courseId;

  if (!isNaN(course_id)) {
    handleGetCourseById(req, res, course_id);
  }else{
    res.status(500).send('Invalid Course Id');
  }

});

// API to Get a list of courses based on filters
app.get('/course',(req,res)=>{
  const filters=req.query;
  Course.findAll({
    where:filters
  }).then((courses)=>{
    res.status(200).json(courses);
  }).catch((error)=>{
    console.error('Error fetching courses: ',error);
    res.status(500).json({error:'Internal Server Error'});
  });
});


const port = 8080;
const hostname='127.0.0.1';

// Start the server 
app.listen(port,hostname,()=>{
  console.log(`Application running successfully on http://${hostname}:${port}/`);
})