use Widgets;

CREATE TABLE user_cr (
USER_ID			CHAR(15) NOT NULL,
ROOM_ID			CHAR(15) NOT NULL,
DATE_TS			DATETIME NOT NULL,
ROOM_NAME		CHAR(15),
PRIMARY KEY(USER_ID,ROOM_ID)
);
