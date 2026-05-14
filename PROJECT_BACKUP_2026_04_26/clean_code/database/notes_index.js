import * as SQLite from 'expo-sqlite';
const db = SQLite.openDatabaseSync('notes.db');
export const initDB = async () => {
    await db.execAsync(
        'CREATE TABLE IF NOT EXISTS notes (id INTEGER PRIMARY KEY AUTOINCREMENT, text TEXT);'

    );

};
export const getNotes = async () => {
    const rows = await db.getAllAsync('SELECT * FROM notes;');
    return rows; // tableau d’objets {id, text}
};
export const addNote = async (text) => {
    await db.runAsync('INSERT INTO notes (text) VALUES (?);', [text]);
};
export const deleteNote = async (id) => {
    await db.runAsync('DELETE FROM notes WHERE id = ?;', [id]);
}