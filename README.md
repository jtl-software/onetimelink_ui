JTL-OneTimeLink UI
==================

A User Interface for the JTL-OneTimeLink API. 

# Requirements

* NodeJS >= 8
* yarn

# Building for production

* Install dependencies using `yarn`
* Configure the application using the config file located at *src/config/config.production.json*
* Build the application using `yarn build`
* The *build/* directory can now be served with a webserver of your choice

# How to develop

* Install dependencies using `yarn`
* Configure the application using the config file located at *src/config/config.json*
* Run `yarn start` to start a watcher
* Change any files and reload the web page once the watcher has finished building

# To Do

* Make application configurable
* build process with webpack
* refactor code and write tests