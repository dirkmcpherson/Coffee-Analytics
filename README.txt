Analytics API to be used with a properly formatted MongoDB in order to visualize the current user base. 

When a new DB is used, its name must be input into "api/app/server/app.js"

The methods that query to produce graphs are all $rootscope methods found in app.js. These methods are accessible from anywhere and are responsible for putting the data into the desired format. This was mainly done to simplify the structure and the code in globalController.js and may not be a best practice. Simple on-off querys to get single numbers are done as resources in globalController.js.

This build of the analytics does not allow for looking at individual users (although everything can be easily modified to allow this). 
