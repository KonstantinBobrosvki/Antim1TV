import { Client } from 'pg';

//clear db before test
module.exports = async () => {
    /*
    const client: Client = new Client({
        connectionString: `postgresql://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_DATABASE}`,
    });

    await client.connect();

    //wait 10 seconds for viewing db
    // await new Promise((resolve) => setTimeout(resolve, 10000))
    //Clear all tables
     const result = await client.query(`DO $$ DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = current_schema()) LOOP
   
   		EXECUTE 'DROP TABLE ' || quote_ident(r.tablename) || ' CASCADE';

    END LOOP;

END $$;

DO $$ DECLARE
    r right_value_enum;
BEGIN
    FOR r IN
        SELECT  unnest(enum_range(NULL::public.right_value_enum))
    LOOP
        INSERT INTO public.right(value, "receiverId") VALUES (r,1);
    END LOOP;


END $$;
`);


    await client.end();
*/
    return true;
};
