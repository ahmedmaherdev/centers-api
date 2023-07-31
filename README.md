# Centers API

Centers API is an Express.js API project that utilizes a MySQL database. It provides various features to manage student information, exams, grades, attendances, and more.

## Technologies Used

- Node.js
- Express.js
- MySQL
- Socket.IO
- JSON Web Tokens (JWT) for authentication
- Postman for API documentation
- ...

## Features

- User Authentication:
  - Signup: Allows users to create an account by providing required details.
  - Login: Provides secure login functionality for registered users.
  - Forget Password: Allows users to reset their forgotten password via email.
  - Reset Password: Enables users to set a new password after forgetting the old one.

- Student Information:
  - School Year: Users can view and update their school year information.
  - Department: Users can view and update their department details.

- Exams and Grades:
  - Exams: Provides endpoints to manage exams and their related questions.
  - Grades: Allows users to view and update their exam grades.
  - Answers: Allows students to submit their answers to exam questions.

- Subjects:
  - Subject has departments that belongs to it.
  - Student has subjects related to his department.
    
- Attendances:
  - Sections: Admins can view and update student's attendance for different sections.

- Notes and Advertisements:
  - Notes: Provides endpoints to manage any notes for subjects.
  - Advertisements: Allows the posting and viewing of announcements.

- Game with Socket.IO:
  - Questions: Allows students to participate in a quiz-like game.
  - Winners: Provides functionality to determine and display game winners.

- More...

For detailed documentation of all available endpoints and request/response formats, please refer to the [API Documentation](https://documenter.getpostman.com/view/17068729/2s8ZDa1gCf).
