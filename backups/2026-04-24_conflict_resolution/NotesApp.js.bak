import RootNavigator from './src/navigation/RootNavigator';
import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, FlatList } from 'react-native';
import { initDB, getNotes, addNote, deleteNote } from './database';

export default function App() {
    const [notes, setNotes] = useState([]);
    const [text, setText] = useState('');

    useEffect(() => {
        (async () => {
            await initDB();
            const data = await getNotes();
            setNotes(data);
        })();
    }, []);

    const handleAdd = async () => {
        if (text.length > 0) {
            await addNote(text);
            const data = await getNotes();
            setNotes(data);
            setText('');
        }
    };

    const handleDelete = async (id) => {
        await deleteNote(id);
        const data = await getNotes();
        setNotes(data);
    };

    return (
        <View style={{ padding: 20, marginTop: 50 }}>
            <Text style={{ fontSize: 24 }}>📒 Mes Notes</Text>
            <TextInput
                placeholder="Nouvelle note..."
                value={text}
                onChangeText={setText}
                style={{ borderWidth: 1, padding: 8, marginVertical: 10 }}
            />
            <Button title="Ajouter" onPress={handleAdd} />
            <FlatList
                data={notes}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 5 }}>
                        <Text>{item.content}</Text>
                        <Button title="Supprimer" onPress={() => handleDelete(item.id)} />
                    </View>
                )}
            />
        </View>
    );
}
