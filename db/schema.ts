import {sqliteTable,text} from 'drizzle-orm/sqlite-core';
export const reports=sqliteTable('reports',{id:text('id').primaryKey(),name:text('name').notNull(),mime:text('mime').notNull(),created:text('created').notNull()});
export const events=sqliteTable('events',{id:text('id').primaryKey(),data:text('data').notNull(),created:text('created').notNull()});

export const eventKeys=sqliteTable('event_keys',{fingerprint:text('fingerprint').primaryKey(),eventId:text('event_id').notNull()});
