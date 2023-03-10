CREATE TABLE Users (
    id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL CHECK (LENGTH(name) > 6),
    email VARCHAR(255) UNIQUE NOT NULL CHECK (LENGTH(email) > 6),
    phone VARCHAR(12) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin' , 'manager' , 'parent' , 'student'),
    photo VARCHAR(255) DEFAULT '/img/users/default.jpg',
    passwordChangedAt TIMESTAMP,
    passwordResetToken VARCHAR(255),
    passwordResetExpires TIMESTAMP,
    updatedAt TIMESTAMP NOT NULL DEFAULT NOW() ON UPDATE NOW(), 
    createdAt TIMESTAMP NOT NULL DEFAULT NOW(),
    isActive BOOLEAN DEFAULT true,
    isSuspended BOOLEAN DEFAULT false  
);
