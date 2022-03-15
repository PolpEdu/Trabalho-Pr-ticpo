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