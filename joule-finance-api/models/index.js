const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');
const fs = require('fs');

// Configure database connection
let sequelize;
if (process.env.DATABASE_URL) {
  // Use Heroku's DATABASE_URL environment variable
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false // Required for Heroku Postgres
      }
    }
  });
} else {
  // Use local database for development
  sequelize = new Sequelize('joule_chat', 'postgres', 'password', {
    host: 'localhost',
    dialect: 'postgres'
  });
}

// Rest of your models/index.js code...
const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Import models
fs.readdirSync(__dirname)
  .filter(file => file.indexOf('.') !== 0 && file !== 'index.js' && file.slice(-3) === '.js')
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, DataTypes);
    db[model.name] = model;
  });

// Set up associations
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

module.exports = db; 