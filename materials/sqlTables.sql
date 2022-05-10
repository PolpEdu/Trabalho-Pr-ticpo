-- delete all rows from table users
/*
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
*/
DELETE
FROM users;

-- Select para o info de compradores:

SELECT *
from comprador,
     users
where comprador.users_nif = users.nifSELECT *
    from comprador,
         users where comprador.users_nif = users.nif

         --drop all tables:
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;