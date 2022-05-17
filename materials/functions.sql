cREATE OR REPLACE FUNCTION insert_notifications_thread() RETURNS TRIGGER AS
$BODY$
BEGIN
      INSERT INTO notificacoes(mensagem,aberta, title, users_nif) VALUES ('Someone commented your product',false, 'New Reply', NEW.users_nif);
      INSERT INTO notificacoes_thread(notificacoes_id, thread_id) VALUES (currval('notificacoes_id_seq'), NEW.thread_id);
      
      RETURN NEW;
END;
$BODY$
language plpgsql;

CREATE or replace TRIGGER trigger_notification_thread
     AFTER INSERT ON thread
     FOR EACH ROW
     EXECUTE PROCEDURE insert_notifications_thread();