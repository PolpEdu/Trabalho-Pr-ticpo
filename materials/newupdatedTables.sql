
CREATE TABLE user (nif BIGINT, username VARCHAR(50) NOT NULL,
																				password VARCHAR(50) NOT NULL,
																				email VARCHAR(50) UNIQUE NOT NULL,
																				created_on TIMESTAMP NOT NULL,
																				last_login TIMESTAMP,
																				PRIMARY KEY(nif));


CREATE TABLE product (name VARCHAR(512) UNIQUE NOT NULL,
																							price BIGINT NOT NULL,
																							description VARCHAR(512) NOT NULL,
																							id BIGINT UNIQUE NOT NULL,
																							PRIMARY KEY(id));


CREATE TABLE specification (name VARCHAR(512) NOT NULL,
																													valor_da_spec VARCHAR(512),
																													product_id BIGINT, PRIMARY KEY(product_id));


CREATE TABLE empresa (nif BIGINT, nome VARCHAR(512) NOT NULL,
																							telefone VARCHAR(512) NOT NULL,
																							email VARCHAR(512),
																							morada VARCHAR(512),
																							codigo_postal VARCHAR(10),
																							PRIMARY KEY(nif));


CREATE TABLE
order (order_id BIGINT, order_date DATE NOT NULL,
								status VARCHAR(512),
								preco_total FLOAT(8),
								PRIMARY KEY(order_id));


CREATE TABLE rating (comment VARCHAR(512),
																						quantity SMALLINT NOT NULL,
																						product_id BIGINT, user_nif BIGINT, PRIMARY KEY(product_id,user_nif));


CREATE TABLE thread (id BIGINT, main_pergunta VARCHAR(250) UNIQUE NOT NULL,
																						time_created DATE NOT NULL,
																						description VARCHAR(1024) NOT NULL,
																						product_id BIGINT NOT NULL,
																						user_nif BIGINT NOT NULL,
																						PRIMARY KEY(id));


CREATE TABLE reply (resposta VARCHAR(512) UNIQUE NOT NULL,
																					thread_id BIGINT, user_nif BIGINT, PRIMARY KEY(thread_id,user_nif));


CREATE TABLE notificacoes (id BIGINT, mensagem VARCHAR(512),
																												aberta BOOL,
																												title VARCHAR(64),
																												user_nif BIGINT NOT NULL,
																												PRIMARY KEY(id));


CREATE TABLE administrador (user_nif BIGINT, PRIMARY KEY(user_nif));


CREATE TABLE comprador (morada VARCHAR(512) NOT NULL,
																									user_nif BIGINT, PRIMARY KEY(user_nif));


CREATE TABLE old_product (started_data DATE NOT NULL,
																											end_data DATE, price_numb FLOAT(8) NOT NULL,
																											descricao VARCHAR(512),
																											nome_old VARCHAR(512) NOT NULL,
																											product_id BIGINT, PRIMARY KEY(product_id));


CREATE TABLE stock_product (stock INTEGER NOT NULL,
																													empresa_nif BIGINT, product_id BIGINT, PRIMARY KEY(empresa_nif,product_id));


CREATE TABLE compra_product (quantidade INTEGER, preco FLOAT(8),
																														order_order_id BIGINT, product_id BIGINT, PRIMARY KEY(order_order_id,product_id));


CREATE TABLE vendedor (user_nif BIGINT, PRIMARY KEY(user_nif));


CREATE TABLE computadores (product_id BIGINT UNIQUE NOT NULL,
																												PRIMARY KEY(product_id));


CREATE TABLE smartphones (product_id BIGINT UNIQUE NOT NULL,
																											PRIMARY KEY(product_id));


CREATE TABLE televisoes (product_id BIGINT UNIQUE NOT NULL,
																										PRIMARY KEY(product_id));


CREATE TABLE old_spec (name VARCHAR(512),
																								valor_spec VARCHAR(512) NOT NULL,
																								old_product_product_id BIGINT, PRIMARY KEY(old_product_product_id));


CREATE TABLE notificacoes_reply (notificacoes_id BIGINT, reply_thread_id BIGINT NOT NULL,
																																		reply_user_nif BIGINT NOT NULL,
																																		PRIMARY KEY(notificacoes_id));


CREATE TABLE vendedor_empresa (vendedor_user_nif BIGINT, empresa_nif BIGINT, PRIMARY KEY(vendedor_user_nif,empresa_nif));


CREATE TABLE comprador_order (comprador_user_nif BIGINT NOT NULL,
																															order_order_id BIGINT, PRIMARY KEY(order_order_id));


CREATE TABLE notificacoes_thread (notificacoes_id BIGINT, thread_id BIGINT NOT NULL,
																																			PRIMARY KEY(notificacoes_id));


CREATE TABLE order_notificacoes (order_order_id BIGINT NOT NULL,
																																		notificacoes_id BIGINT, PRIMARY KEY(notificacoes_id));


CREATE TABLE reply_reply (reply_thread_id BIGINT, reply_user_nif BIGINT, reply_thread_id1 BIGINT NOT NULL,
																											reply_user_nif1 BIGINT NOT NULL,
																											PRIMARY KEY(reply_thread_id,reply_user_nif));


ALTER TABLE specification ADD CONSTRAINT specification_fk1
FOREIGN KEY (product_id) REFERENCES product(id);


ALTER TABLE rating ADD CONSTRAINT rating_fk1
FOREIGN KEY (product_id) REFERENCES product(id);


ALTER TABLE rating ADD CONSTRAINT rating_fk2
FOREIGN KEY (user_nif) REFERENCES user(nif);


ALTER TABLE rating ADD CONSTRAINT constraint_0 CHECK (quantity<6
																																																						AND quantity>=0);


ALTER TABLE thread ADD CONSTRAINT thread_fk1
FOREIGN KEY (product_id) REFERENCES product(id);


ALTER TABLE thread ADD CONSTRAINT thread_fk2
FOREIGN KEY (user_nif) REFERENCES user(nif);


ALTER TABLE reply ADD CONSTRAINT reply_fk1
FOREIGN KEY (thread_id) REFERENCES thread(id);


ALTER TABLE reply ADD CONSTRAINT reply_fk2
FOREIGN KEY (user_nif) REFERENCES user(nif);


ALTER TABLE notificacoes ADD CONSTRAINT notificacoes_fk1
FOREIGN KEY (user_nif) REFERENCES user(nif);


ALTER TABLE administrador ADD CONSTRAINT administrador_fk1
FOREIGN KEY (user_nif) REFERENCES user(nif);


ALTER TABLE comprador ADD CONSTRAINT comprador_fk1
FOREIGN KEY (user_nif) REFERENCES user(nif);


ALTER TABLE old_product ADD CONSTRAINT old_product_fk1
FOREIGN KEY (product_id) REFERENCES product(id);


ALTER TABLE stock_product ADD CONSTRAINT stock_product_fk1
FOREIGN KEY (empresa_nif) REFERENCES empresa(nif);


ALTER TABLE stock_product ADD CONSTRAINT stock_product_fk2
FOREIGN KEY (product_id) REFERENCES product(id);


ALTER TABLE compra_product ADD CONSTRAINT compra_product_fk1
FOREIGN KEY (order_order_id) REFERENCES order(order_id);


ALTER TABLE compra_product ADD CONSTRAINT compra_product_fk2
FOREIGN KEY (product_id) REFERENCES product(id);


ALTER TABLE vendedor ADD CONSTRAINT vendedor_fk1
FOREIGN KEY (user_nif) REFERENCES user(nif);


ALTER TABLE computadores ADD CONSTRAINT computadores_fk1
FOREIGN KEY (product_id) REFERENCES product(id);


ALTER TABLE smartphones ADD CONSTRAINT smartphones_fk1
FOREIGN KEY (product_id) REFERENCES product(id);


ALTER TABLE televisoes ADD CONSTRAINT televisoes_fk1
FOREIGN KEY (product_id) REFERENCES product(id);


ALTER TABLE old_spec ADD CONSTRAINT old_spec_fk1
FOREIGN KEY (old_product_product_id) REFERENCES old_product(product_id);


ALTER TABLE notificacoes_reply ADD CONSTRAINT notificacoes_reply_fk1
FOREIGN KEY (notificacoes_id) REFERENCES notificacoes(id);


ALTER TABLE notificacoes_reply ADD CONSTRAINT notificacoes_reply_fk2
FOREIGN KEY (reply_thread_id) REFERENCES reply(thread_id);


ALTER TABLE notificacoes_reply ADD CONSTRAINT notificacoes_reply_fk3
FOREIGN KEY (reply_user_nif) REFERENCES reply(user_nif);


ALTER TABLE vendedor_empresa ADD CONSTRAINT vendedor_empresa_fk1
FOREIGN KEY (vendedor_user_nif) REFERENCES vendedor(user_nif);


ALTER TABLE vendedor_empresa ADD CONSTRAINT vendedor_empresa_fk2
FOREIGN KEY (empresa_nif) REFERENCES empresa(nif);


ALTER TABLE comprador_order ADD CONSTRAINT comprador_order_fk1
FOREIGN KEY (comprador_user_nif) REFERENCES comprador(user_nif);


ALTER TABLE comprador_order ADD CONSTRAINT comprador_order_fk2
FOREIGN KEY (order_order_id) REFERENCES order(order_id);


ALTER TABLE notificacoes_thread ADD CONSTRAINT notificacoes_thread_fk1
FOREIGN KEY (notificacoes_id) REFERENCES notificacoes(id);


ALTER TABLE notificacoes_thread ADD CONSTRAINT notificacoes_thread_fk2
FOREIGN KEY (thread_id) REFERENCES thread(id);


ALTER TABLE order_notificacoes ADD CONSTRAINT order_notificacoes_fk1
FOREIGN KEY (order_order_id) REFERENCES order(order_id);


ALTER TABLE order_notificacoes ADD CONSTRAINT order_notificacoes_fk2
FOREIGN KEY (notificacoes_id) REFERENCES notificacoes(id);


ALTER TABLE reply_reply ADD CONSTRAINT reply_reply_fk1
FOREIGN KEY (reply_thread_id) REFERENCES reply(thread_id);


ALTER TABLE reply_reply ADD CONSTRAINT reply_reply_fk2
FOREIGN KEY (reply_user_nif) REFERENCES reply(user_nif);


ALTER TABLE reply_reply ADD CONSTRAINT reply_reply_fk3
FOREIGN KEY (reply_thread_id1) REFERENCES reply(thread_id);


ALTER TABLE reply_reply ADD CONSTRAINT reply_reply_fk4
FOREIGN KEY (reply_user_nif1) REFERENCES reply(user_nif);

