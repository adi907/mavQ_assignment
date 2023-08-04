const http = require('http');

const Sequelize = require('sequelize');
const dbConfig=require('./db-config');


// const sequelize = new Sequelize('mavQ', 'root', 'ramlal the street dog123', {
const sequelize = new Sequelize(dbConfig.DATABASE, dbConfig.USER, dbConfig.PASSWORD, {
    host: dbConfig.HOST,
    dialect: dbConfig.DIALECT
});

const Teacher = sequelize.define('teacher',
  {
    teacher_id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
    },
    name: Sequelize.STRING,
    is_active:Sequelize.BOOLEAN,
    designation:Sequelize.STRING
  },
  {
    tableName: 'teacher',
    timestamps: false,
  }
);

const Course = sequelize.define('course',
  {
    course_id:{
      type: Sequelize.INTEGER,
      primaryKey: true,
    },
    course_mentor: {
        type: Sequelize.INTEGER,
        references: {
          model: Teacher,
          key: 'teacher_id',
        },
    },
    name: Sequelize.STRING,
    start_date:Sequelize.DATE,
    end_date:Sequelize.DATE,
    description:Sequelize.STRING,
    is_active:Sequelize.BOOLEAN
  },
  {
    tableName: 'course',
    timestamps: false,
  }
);

sequelize.sync()
  .then(() => {
    console.log('database synced');
  })
  .catch((error) => {
    console.warn('database not synced')
    console.log(error);
  });

module.exports={
    Teacher,Course,sequelize
};