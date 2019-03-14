CREATE DATABASE nodejs DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci;
USE nodejs;
CREATE TABLE student(
number INT PRIMARY KEY,
name VARCHAR(16) NOT NULL,
password varchar(16) NULL
)ENGINE=InnoDB DEFAULT CHARSET=utf8;

INSERT INTO `nodejs`.`student` (`number`, `name`, `password`) VALUES ('1009030320', '周文丹', '123456');
INSERT INTO `nodejs`.`student` (`number`, `name`, `password`) VALUES ('1009030416', '杨会芳', '123456');

CREATE TABLE homework (
  UserNumber varchar(10) NOT NULL,
  WorkNumber bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  WorkName varchar(255) NOT NULL,
  WorkLocation varchar(255) DEFAULT NULL,
  UploadTime datetime DEFAULT NULL,
  PRIMARY KEY (`WorkNumber`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;