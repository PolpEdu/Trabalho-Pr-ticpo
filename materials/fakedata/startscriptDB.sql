--important things from onda to the actual script:
--1. change text to VARCHAR, CTRL+R to replace IT
 --2. product id from big integer to SERIAL (it's easier to implement the table like this)
 --3. notification id from big integer to SERIAL (it's easier to implement the table like this)
 --4. thread id from big integer to SERIAL (it's easier to implement the table like this)
 --5. resposta_id from big integer to SERIAL (it's easier to implement the table like this)
 --6. order_id from big integer to SERIAL (it's easier to implement the table like this)
 --7. old product id from big integer to SERIAL (it's easier to implement the table like this)
 -- create a procedure to make orders: CALL order(nif, id_produto, quantidade);
/*
I usually end my procedures with COMMIT and when an error occurs I use ROLLBACK! Is it wrong? Wrong is a strong word. Let's just say it's not a good practice. Making (packaged) functions and procedures is all about modularization: making reusable pieces of code. When a function/procedure contains ROLLBACK or COMMIT statements, it stops being reusable as it messes up the transaction of the caller. So it's better not to use ROLLBACK or COMMIT in your procedures
and leave it to the topmost caller.
*/ --TODO: needs testing this procedure
 
CREATE or replace procedure orderEXEC(nif orders.users_nif%type, idprod products.id%type,qnt stock_product.stock%type, statusOrder orders.status%type) LANGUAGE plpgsql AS $$
DECLARE
      new_order_id orders.order_id%type;
BEGIN
      -- check if the product exists
      IF NOT EXISTS (SELECT * FROM products WHERE id = idprod) THEN
            RAISE EXCEPTION 'Product does not exist';
      END IF;
      -- check if the user exists
      IF NOT EXISTS (SELECT * FROM users WHERE nif = nif) THEN
            RAISE EXCEPTION 'User does not exist';
      END IF;

      -- check if the stock in stock_product table is greater than the quantity ordered
      IF NOT EXISTS (SELECT * FROM stock_product WHERE products_id = idprod AND stock >= qnt) THEN
            RAISE EXCEPTION 'Not enough stock';
      END IF;

      -- update the stock in stock_product table
      UPDATE stock_product SET stock = stock - qnt WHERE products_id = idprod;

      --create a new order and return his id
      INSERT INTO orders (users_nif, status, order_date)VALUES (nif, statusOrder, now()) RETURNING id INTO new_order_id;

      -- create a new compra_product
      INSERT INTO compra_product (quantidade, preco, orders_order_id, products_id) VALUES (qnt,
      (SELECT preco FROM products WHERE id = idprod),
      new_order_id,
      idprod);

END;
$$;

-- call it like: CALL orderEXEC(nif, idprod, qnt, statusOrder);
 --delete all tables

DROP SCHEMA public CASCADE;


CREATE SCHEMA public;

--start to creating tables:

CREATE TABLE users (nif BIGINT UNIQUE NOT NULL,
                                      username VARCHAR(50) UNIQUE NOT NULL,
                                                                  password VARCHAR(150) NOT NULL,
                                                                                        email VARCHAR(50) UNIQUE NOT NULL,
                                                                                                                 created_on TIMESTAMP NOT NULL,
                                                                                                                                      last_login TIMESTAMP,
                                                                                                                                                 PRIMARY KEY(nif));


CREATE TABLE products (name VARCHAR(512) UNIQUE NOT NULL,
                                                price FLOAT(8) NOT NULL,
                                                               description VARCHAR(512),
                                                                           id SERIAL, PRIMARY KEY(id));


CREATE TABLE specification (name VARCHAR(512) NOT NULL,
                                              valor_da_spec VARCHAR(512),
                                                            products_id BIGINT, PRIMARY KEY(products_id));


CREATE TABLE empresas (nif BIGINT, nome VARCHAR(512) NOT NULL,
                                                     telefone VARCHAR(512) NOT NULL,
                                                                           email VARCHAR(512),
                                                                                 morada VARCHAR(512),
                                                                                        codigo_postal VARCHAR(10),
                                                                                                      PRIMARY KEY(nif));


CREATE TABLE orders (order_id SERIAL, order_date DATE NOT NULL,
                                                      status VARCHAR(512),
                                                             preco_total FLOAT(8),
                                                                         users_nif BIGINT NOT NULL,
                                                                                          PRIMARY KEY(order_id));


CREATE TABLE rating (comment VARCHAR(512),
                             quantity SMALLINT NOT NULL,
                                               products_id BIGINT, users_nif BIGINT, PRIMARY KEY(products_id,users_nif));


CREATE TABLE thread (id SERIAL, main_pergunta VARCHAR(250) UNIQUE NOT NULL,
                                                                  time_created DATE NOT NULL,
                                                                                    description VARCHAR(1024) NOT NULL,
                                                                                                              products_id BIGINT NOT NULL,
                                                                                                                                 users_nif BIGINT NOT NULL,
                                                                                                                                                  PRIMARY KEY(id));


CREATE TABLE reply (resposta_id SERIAL, varchar VARCHAR(1024) NOT NULL,
                                                              thread_id BIGINT NOT NULL,
                                                                               users_nif BIGINT NOT NULL,
                                                                                                PRIMARY KEY(resposta_id));


CREATE TABLE notificacoes (id SERIAL, mensagem VARCHAR(512),
                                               aberta BOOL,
                                               title VARCHAR(64),
                                                     users_nif BIGINT NOT NULL,
                                                                      PRIMARY KEY(id));


CREATE TABLE administrador (users_nif BIGINT UNIQUE NOT NULL,
                                                    PRIMARY KEY(users_nif));


CREATE TABLE comprador (morada VARCHAR(512) NOT NULL,
                                            users_nif BIGINT UNIQUE NOT NULL,
                                                                    PRIMARY KEY(users_nif));


CREATE TABLE stock_product (stock INTEGER NOT NULL,
                                          empresas_nif BIGINT, products_id BIGINT, PRIMARY KEY(empresas_nif,products_id));


CREATE TABLE compra_product (quantidade INTEGER, preco FLOAT(8),
                                                       orders_order_id BIGINT, products_id BIGINT, PRIMARY KEY(orders_order_id,products_id));


CREATE TABLE vendedor (users_nif BIGINT UNIQUE NOT NULL,
                                               PRIMARY KEY(users_nif));


CREATE TABLE computadores (products_id BIGINT UNIQUE NOT NULL,
                                                     PRIMARY KEY(products_id));


CREATE TABLE smartphones (products_id BIGINT UNIQUE NOT NULL,
                                                    PRIMARY KEY(products_id));


CREATE TABLE televisoes (products_id BIGINT UNIQUE NOT NULL,
                                                   PRIMARY KEY(products_id));


CREATE TABLE old_products (name VARCHAR(512) NOT NULL,
                                             price INTEGER NOT NULL,
                                                           description VARCHAR(2048),
                                                                       date_added DATE NOT NULL,
                                                                                       id SERIAL, PRIMARY KEY(id));


CREATE TABLE old_product_versions (version BIGINT NOT NULL,
                                                  old_products_id BIGINT NOT NULL,
                                                                         products_id BIGINT NOT NULL);


CREATE TABLE notificacoes_reply (notificacoes_id BIGINT, reply_resposta_id BIGINT NOT NULL,
                                                                                  PRIMARY KEY(notificacoes_id));


CREATE TABLE vendedor_empresas (vendedor_users_nif BIGINT, empresas_nif BIGINT, PRIMARY KEY(vendedor_users_nif,empresas_nif));


CREATE TABLE notificacoes_thread (notificacoes_id BIGINT, thread_id BIGINT NOT NULL,
                                                                           PRIMARY KEY(notificacoes_id));


CREATE TABLE orders_notificacoes (orders_order_id BIGINT NOT NULL,
                                                         notificacoes_id BIGINT, PRIMARY KEY(notificacoes_id));


CREATE TABLE reply_reply (reply_resposta_id BIGINT, reply_resposta_id1 BIGINT NOT NULL,
                                                                              PRIMARY KEY(reply_resposta_id));


ALTER TABLE specification ADD CONSTRAINT specification_fk1
FOREIGN KEY (products_id) REFERENCES products(id);


ALTER TABLE orders ADD CONSTRAINT orders_fk1
FOREIGN KEY (users_nif) REFERENCES users(nif);


ALTER TABLE rating ADD CONSTRAINT rating_fk1
FOREIGN KEY (products_id) REFERENCES products(id);


ALTER TABLE rating ADD CONSTRAINT rating_fk2
FOREIGN KEY (users_nif) REFERENCES users(nif);


ALTER TABLE rating ADD CONSTRAINT constraint_0 CHECK (quantity<6
                                                      AND quantity>=0);


ALTER TABLE thread ADD CONSTRAINT thread_fk1
FOREIGN KEY (products_id) REFERENCES products(id);


ALTER TABLE thread ADD CONSTRAINT thread_fk2
FOREIGN KEY (users_nif) REFERENCES users(nif);


ALTER TABLE reply ADD CONSTRAINT reply_fk1
FOREIGN KEY (thread_id) REFERENCES thread(id);


ALTER TABLE reply ADD CONSTRAINT reply_fk2
FOREIGN KEY (users_nif) REFERENCES users(nif);


ALTER TABLE notificacoes ADD CONSTRAINT notificacoes_fk1
FOREIGN KEY (users_nif) REFERENCES users(nif);


ALTER TABLE administrador ADD CONSTRAINT administrador_fk1
FOREIGN KEY (users_nif) REFERENCES users(nif);


ALTER TABLE comprador ADD CONSTRAINT comprador_fk1
FOREIGN KEY (users_nif) REFERENCES users(nif);


ALTER TABLE stock_product ADD CONSTRAINT stock_product_fk1
FOREIGN KEY (empresas_nif) REFERENCES empresas(nif);


ALTER TABLE stock_product ADD CONSTRAINT stock_product_fk2
FOREIGN KEY (products_id) REFERENCES products(id);


ALTER TABLE compra_product ADD CONSTRAINT compra_product_fk1
FOREIGN KEY (orders_order_id) REFERENCES orders(order_id);


ALTER TABLE compra_product ADD CONSTRAINT compra_product_fk2
FOREIGN KEY (products_id) REFERENCES products(id);


ALTER TABLE vendedor ADD CONSTRAINT vendedor_fk1
FOREIGN KEY (users_nif) REFERENCES users(nif);


ALTER TABLE computadores ADD CONSTRAINT computadores_fk1
FOREIGN KEY (products_id) REFERENCES products(id);


ALTER TABLE smartphones ADD CONSTRAINT smartphones_fk1
FOREIGN KEY (products_id) REFERENCES products(id);


ALTER TABLE televisoes ADD CONSTRAINT televisoes_fk1
FOREIGN KEY (products_id) REFERENCES products(id);


ALTER TABLE old_product_versions ADD CONSTRAINT old_product_versions_fk1
FOREIGN KEY (old_products_id) REFERENCES old_products(id);


ALTER TABLE old_product_versions ADD CONSTRAINT old_product_versions_fk2
FOREIGN KEY (products_id) REFERENCES products(id);


ALTER TABLE notificacoes_reply ADD CONSTRAINT notificacoes_reply_fk1
FOREIGN KEY (notificacoes_id) REFERENCES notificacoes(id);


ALTER TABLE notificacoes_reply ADD CONSTRAINT notificacoes_reply_fk2
FOREIGN KEY (reply_resposta_id) REFERENCES reply(resposta_id);


ALTER TABLE vendedor_empresas ADD CONSTRAINT vendedor_empresas_fk1
FOREIGN KEY (vendedor_users_nif) REFERENCES vendedor(users_nif);


ALTER TABLE vendedor_empresas ADD CONSTRAINT vendedor_empresas_fk2
FOREIGN KEY (empresas_nif) REFERENCES empresas(nif);


ALTER TABLE notificacoes_thread ADD CONSTRAINT notificacoes_thread_fk1
FOREIGN KEY (notificacoes_id) REFERENCES notificacoes(id);


ALTER TABLE notificacoes_thread ADD CONSTRAINT notificacoes_thread_fk2
FOREIGN KEY (thread_id) REFERENCES thread(id);


ALTER TABLE orders_notificacoes ADD CONSTRAINT orders_notificacoes_fk1
FOREIGN KEY (orders_order_id) REFERENCES orders(order_id);


ALTER TABLE orders_notificacoes ADD CONSTRAINT orders_notificacoes_fk2
FOREIGN KEY (notificacoes_id) REFERENCES notificacoes(id);


ALTER TABLE reply_reply ADD CONSTRAINT reply_reply_fk1
FOREIGN KEY (reply_resposta_id) REFERENCES reply(resposta_id);


ALTER TABLE reply_reply ADD CONSTRAINT reply_reply_fk2
FOREIGN KEY (reply_resposta_id1) REFERENCES reply(resposta_id);

