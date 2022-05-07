/*
--fake empresas:
INSERT INTO empresa (nome, endereco, telefone, email)
VALUES ('Empresa 1', 'Rua 1', '11111-1111', 'dhkjashdjkaj@gmail.com');

INSERT INTO empresa (nome, endereco, telefone, email)
VALUES ('Google teste', 'Rua 2', '22222-2222', NULL);

*/ --populate product tables with some data

INSERT INTO specification (product_id, name, valor_da_spec)
VALUES (1,
        'Tamanho',
        'Pequeno');


INSERT INTO specification (product_id, name, valor_da_spec)
VALUES (1,
        'Cor',
        'Azul');


INSERT INTO specification (product_id, name, valor_da_spec)
VALUES (1,
        'Processador',
        'I5');

------------------------------------------

INSERT INTO product (specs_id, empresaprod, name,price,description, stock)
VALUES (1,
        1,
        'Mega fixe',
        10,
        'Descricao do produto mega fixe',
        10);

--POPULATE specifications with data
