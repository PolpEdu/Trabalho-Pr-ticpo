--create empresa table
CREATE TABLE empresa (id_empresa serial PRIMARY KEY,
                                                nome TEXT NOT NULL,
                                                          endereco TEXT NOT NULL,
                                                                        telefone TEXT NOT NULL,
                                                                                      email TEXT);



-- specifications from the product

CREATE TABLE specification (spec_id serial PRIMARY KEY,
                                                   product_id serial NOT NULL,
                                                                     name TEXT NOT NULL,
                                                                               value TEXT);



-- Product, !ATENÇÃO: PODE HAVER PRODUTOS IGUAIS MAS COM DIFERENTES EMPRESAS 
CREATE TABLE product (product_id serial PRIMARY KEY,
                    specs_id serial NOT NULL,
                    empresaPROD serial NOT NULL,
                    name TEXT UNIQUE NOT NULL,
                    price INTEGER NOT NULL,
                    quantity INTEGER NOT NULL,
                    description TEXT NOT NULL,
                    stock INTEGER NOT NULL,
                      FOREIGN KEY(specs_id) REFERENCES specification(spec_id),
                      FOREIGN KEY(empresaPROD) REFERENCES empresa(id_empresa));


-- add product rating
CREATE TABLE rating (rating_id serial PRIMARY KEY,
                                            product_id serial NOT NULL,
                                                          user_id serial NOT NULL,
                                                                      value INTEGER NOT NULL,
                                                                                comment TEXT,
                                                                                          FOREIGN KEY(product_id) REFERENCES product(product_id),
                                                                                                            FOREIGN KEY(user_id) REFERENCES user(user_id));


-- user:
CREATE TABLE accounts (
    user_id serial PRIMARY KEY,
    username VARCHAR ( 50 ) UNIQUE NOT NULL,
    password VARCHAR ( 50 ) NOT NULL,
    email VARCHAR ( 255 ) UNIQUE NOT NULL,
    created_on TIMESTAMP NOT NULL,
        last_login TIMESTAMP 
);

CREATE TABLE roles(
   role_id serial PRIMARY KEY,
   role_name VARCHAR (255) UNIQUE NOT NULL
);

CREATE TABLE account_roles (
  user_id INT NOT NULL,
  role_id INT NOT NULL,
  grant_date TIMESTAMP,
  PRIMARY KEY (user_id, role_id),
  FOREIGN KEY (role_id)
      REFERENCES roles (role_id),
  FOREIGN KEY (user_id)
      REFERENCES accounts (user_id)
);





-- create a order composed by a list of products (and quantities)   
CREATE TABLE order (
    order_id serial PRIMARY KEY,
    user_id serial NOT NULL,
    order_date TIMESTAMP NOT NULL,
    status VARCHAR (255) NOT NULL,
    FOREIGN KEY (user_id)
        REFERENCES accounts (user_id)
);



CREATE TABLE order_product (
    order_id serial NOT NULL,
    product_id serial NOT NULL,
    quantity INTEGER NOT NULL,
    PRIMARY KEY (order_id, product_id),
    FOREIGN KEY (order_id)
    REFERENCES order(order_id),
    FOREIGN KEY (product_id)
    REFERENCES product(product_id)
);


