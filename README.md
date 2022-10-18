# Financial expenses tracker

#### This project is a personal goal of mine, being able to provide others with a financial tracker so the might be able to have good control of their finances. The language of the project is on this first version spanish.

## Distinctiveness and Complexity

#### My project satisfies the complexity required by the course because:
##### - I have used most of the knowledge taught through out the course. I have used Django as a framework to establish the base for backend and frontend communication of the project. I have used the facilities provided by Django to manage users registration and login. 
#### - Just as in Projects 3 and 4, i have created an API to connect my SQLite database with my frontend via a fetch call in Javascript. In that way, i was able to dinamically load content without refreshing the page and also being able to dinamically generate content such as tables and charts. Most of the content in the website has been displayed as a single page application.
#### - I used Chartjs to generate graphics with Javascript in order to let users have a better and more enjoyable display of their information.
#### - I made use of Django API in templating by loading some dynamic data such as current year in the footer.
#### - I added the option of reset password making use of this Django functionality, a process where Django generates a token for the user to recover a lost password.
#### - One of the more challenging functions i had to create was on Javascript, general_summary(). The main purpose of this function is to generate a dynamic table with the data received from the database. Here i display a summary of monthly expenses by category of expense. Being that users dont always expend in every category, i had to create a logic so that if there was no data for a specific category in a given month, a table cell still had to be created ("&nbsp;") in order to maintain a coherent info display for other months where that data existed. For this purpose i used to conditionals, both refering to boolen values. First to check if there was data on that category and if not, create an empty cell. Another conditional to check if i had already created an empty cell, so i didnt create another one again. This was an interesting challenge.

## Contents:
### Django db Models:
#### I have created 4 different models for my app. First i extended User with an AbstractUser. Then i made a Profile model with a OnetoOneField in order to gave more dynamic customization for the user by allowing him to change a "nickname" of his preference. For the main content i have Categories, Transactions and Budget. Each of this models manage the structural information of the app. For Transactions and Budget i created a serialization function to transform the query data into JSON.

### Python functions (views.py):
#### Here i created different functions. The ones which are not related to a single page application are register, login, and password reset. 
#### Starting with the single page application we have the index function. 
#### The other functions are mainly API called from Javascript such as setnickname and change_password which interact with the Profile model in the backend. Then we have load_transactions which receives a month and year and retrieves information back from the DB, as well as summary_month which gives the user a monthly detail of their expenses. All this are HTTP GET requests.
#### For POST and PUT requests we have new_transaction, delete_transaction and update_transaction receiving the last 2 an id from the PUT request to update the database.
#### Another GET request is the general_summary which receives the year as input data to load all the transactions for an entire year, giving back to the frontend a display of charts and tables.
#### For GET, POST and PUT, we have budget, add_budget and delete and update budget which modify the database on the Budget db model.

## HTML
### Layout:
#### For the basic template called Layout.html i referenced styles.css for little changes on the design but i mainly used Bootstrap 5 for all the layout of the website, as well as font display, table creation and responsiveness. I added a google font called Montserrat for better design. And also added "Font Awesome icons" for the footer and a call to "ChartJs" for the graphs. 
#### I created a navbar with Bootstrap as well as a footer and a block body template tag to call on the other templates.
#### Also as well, at the end of the body i included the Javascript script and also the Bootstrap Javascript CDN.

### Static:
#### On static files, i have included images and my CSS and Javascript files.

### Javascript:
#### Here is where most of the app HTML creation and backend interaction is done, making Javascript the programming language more widely used on the creation of this webapp (64%). 
#### Similar to projects 3 and 4, i have an eventlistener waiting for the DOM content to be loaded. This way i can interact which the navbar and load some predetermined functions with the users first interaction with the webapp. This function also makes call to load_page JS function, which hides or displays blocks of HTML on the single page application.
#### A distribution of the Javascript functions is like follows:
#### For GET requests, i have functions such as load_budget, createGraph, general_summary, summary_month and load_transactions. This functions mainly use GET requests to get data from the backend and create HTML such as tables and graphs (canvas) and display them to the user.
#### For POST requests i have functions such as add_budget, add_new_transaction which create new data on the database by interacting with the backend, sending info from HTML forms which value was received on Javascript.
#### For PUT requests, i created functions such as update_budget, delete_budget, updateTransaction and eraseTransactions. On this functions, the frontend passed the id of the item in the database to be modified.
#### For interactions with the user we have to functions. transactions_onchange which sense when the user has changed the select input option for month and year and load the required get functions appropiately to display different data. We also have toggle_transaction_summary which changes the display between indivual monthly transactions and a month summary divided by categories of expenses.

## How to run your application
#### In order to run the app, a requirements.txt file is included on the project Github.