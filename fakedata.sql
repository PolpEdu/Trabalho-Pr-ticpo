INSERT INTO roles (role_name)
VALUES ('Administrador');


INSERT INTO roles (role_name)
VALUES ('Vendedor');


INSERT INTO roles (role_name)
VALUES ('Comprador');


--fake empresas:
INSERT INTO empresa (nome, endereco, telefone, email)
VALUES ('Empresa 1', 'Rua 1', '11111-1111', 'dhkjashdjkaj@gmail.com');

INSERT INTO empresa (nome, endereco, telefone, email)
VALUES ('Google teste', 'Rua 2', '22222-2222', NULL);


--populate product tables with some data
INSERT INTO product (product_id, specs_id, empresaPROD, name, price, quantity, description, stock)
VALUES (1, 1, 1, 'Celular', 1000, 10, 'Celular de qualidade', 10);

INSERT INTO product (product_id, specs_id, empresaPROD, name, price, quantity, description, stock)
VALUES (2, 2, 1, 'Notebook', 2000, 20, 'Notebook de qualidade', 20);

INSERT INTO product (product_id, specs_id, empresaPROD, name, price, quantity, description, stock)
VALUES (3, 3, 1, 'Tablet', 3000, 30, 'Tablet de qualidade', 30);

INSERT INTO product (product_id, specs_id, empresaPROD, name, price, quantity, description, stock)
VALUES (4, 4, 1, 'Smartphone', 4000, 40, 'Smartphone de qualidade', 40);