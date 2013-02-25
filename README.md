Node Task Board
======================
Super simple Node.js task board for sprint planning

You can access it on heroku here: http://node-task-board.herokuapp.com/

One of the cool things (maybe the only cool thing :)) of the app is that it uses node.js support for websockets. In functionality this means that changes in one client browser are reflected in real time in other client browsers

Well it is also cool that it works on IPad. At least tested on Chrome for Ipad. It also connects through web socket and support real time updates. For Ipad you have to use long-tap instead of double click to create new card.
Using it
------
After running it, to access a particular Sprint for a particular company, in the top right corner text box you simply introduce company/sprint  where company si the company name and sprint si the sprint name. For example cacique/sprint1

To create a new card, simply double click on the "not started" column. That will open a text box. Enter your new task as task_name/task_description. For example "allow login/The user should be allowed to login with different roles"


Company
--------
  [image]: http://www.caciquetechnologies.co.uk/uploads/1/3/5/3/135381/1356613741.png "Cacique"


License
----------
Copyright &copy; 2013 Carlo Scarioni  
Licensed and Distributed under the [MIT License][mit].  

[MIT]: http://www.opensource.org/licenses/mit-license.php
