# Development

* Run 'npm run watch' to dev using nodemon

# Debug

* Run 'npm run debug'
* Open Chrome and navigate to chrome://inspect

# Testing routes

* Create a route specific .rest file to requests folder

# Environment variables

* Use .env file in project root to configure the required environment variables

# Heroku

* Build the frontend of the application running './deploy.sh' in the application's frontend directory
* Deploy the application to heroku with 'git push heroku master'
* Ensure that the application is running with 'heroku ps:scale web=1'
  * This will start a heroku dyno that runs the application
* Navigate to application's url with 'heroku open'
* View logs with 'heroku logs --tail'
* ATTENTION! Environment variables used in development are not directly available in production version of the application. To add environment variables to heroku use 'heroku config:set <variable>'