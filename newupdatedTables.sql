
CREATE TABLE users (
	user_id	 BIGINT,
	username	 VARCHAR(50) NOT NULL,
	password	 VARCHAR(50) NOT NULL,
	email		 VARCHAR(50) UNIQUE NOT NULL,
	created_on	 TIMESTAMP NOT NULL,
	last_login	 TIMESTAMP,
	order_order_id BIGINT NOT NULL,
	PRIMARY KEY(user_id)
);

CREATE TABLE account_roles (
	grant_date	 TIMESTAMP NOT NULL,
	roles_role_id BIGINT NOT NULL,
	users_user_id BIGINT NOT NULL
);
ALTER TABLE account_roles ADD CONSTRAINT account_roles_fk1 FOREIGN KEY (roles_role_id) REFERENCES roles(role_id);
ALTER TABLE account_roles ADD CONSTRAINT account_roles_fk2 FOREIGN KEY (users_user_id) REFERENCES users(user_id);


CREATE TABLE roles (
	role_id	 BIGINT,
	role_name VARCHAR(255) UNIQUE NOT NULL,
	PRIMARY KEY(role_id)
);

ALTER TABLE users ADD CONSTRAINT users_fk1
 FOREIGN KEY (order_order_id) REFERENCES order(order_id);