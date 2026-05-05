import { db } from '@/config/firebase';
import { Colors, Gradients, Palette, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAppStore } from '@/store/AppProvider';
import { useAuth } from '@/store/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { addDoc, collection, onSnapshot, orderBy, query, serverTimestamp } from 'firebase/firestore';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ChatScreen() {
    const { id } = useLocalSearchParams<{ id: string }>(); // the friend's ID
    const insets = useSafeAreaInsets();
    const colorScheme = useColorScheme() ?? 'light';
    const colors = Colors[colorScheme];
    const { user: authUser } = useAuth();
    const { posts } = useAppStore();

    const [messageText, setMessageText] = useState('');
    const [messages, setMessages] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const scrollViewRef = useRef<ScrollView>(null);

    // Derivar userInfo del otro usuario. Usamos `posts` para encontrar su info si es mock.
    const friendInfo = posts.find(p => p.authorId === id)?.author || {
        name: id === 'system' ? 'EcoTeam Oficial' : 'Amigo',
        avatar: null,
        level: 1,
        badge: 'Nuevo'
    };

    const chatId = authUser && id ? [authUser.uid, id].sort().join('_') : null;

    useEffect(() => {
        if (!chatId) return;

        const q = query(
            collection(db, `chats/${chatId}/messages`),
            orderBy('createdAt', 'asc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setMessages(msgs);
            setLoading(false);

            // Auto-scroll on new message
            setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
        });

        return () => unsubscribe();
    }, [chatId]);

    const sendMessage = async () => {
        if (!messageText.trim() || !chatId || !authUser) return;

        const text = messageText.trim();
        setMessageText('');

        try {
            await addDoc(collection(db, `chats/${chatId}/messages`), {
                text,
                senderId: authUser.uid,
                createdAt: serverTimestamp(),
            });

            // MOCK BOT LOGIC: If replying to a mock user, they auto-reply.
            if (['user1', 'user2', 'system'].includes(id as string)) {
                setTimeout(async () => {
                    const autoReplies = [
                        "¡Qué interesante lo que dices! Yo trato de reciclar mis plásticos todos los días.",
                        "¡Totalmente de acuerdo! El cambio empieza por nosotros 🌍",
                        "¿Has revisado los nuevos retos de esta semana?",
                        "¡Excelente iniciativa! Yo justo ayer fui al punto limpio.",
                        "Me alegra haber conectado contigo por aquí. ¡Saludos!"
                    ];
                    const reply = autoReplies[Math.floor(Math.random() * autoReplies.length)];

                    await addDoc(collection(db, `chats/${chatId}/messages`), {
                        text: id === 'system' ? "Hola, soy el bot de Ecotip. ¡Sigue así ganando puntos!" : reply,
                        senderId: id,
                        createdAt: serverTimestamp(),
                    });
                }, 3000); // 3 seconds delay for typing simulation
            }

        } catch (error) {
            console.error("Error sending message", error);
        }
    };

    const renderMessage = (msg: any, index: number) => {
        const isMe = msg.senderId === authUser?.uid;

        return (
            <View key={msg.id} style={[styles.messageBubbleWrapper, isMe ? styles.messageBubbleWrapperRight : styles.messageBubbleWrapperLeft]}>
                {!isMe && (
                    <LinearGradient
                        colors={(id === 'system' ? Gradients.gold : Gradients.primary) as any}
                        style={styles.messageAvatar}
                    >
                        {friendInfo.avatar ? (
                            <Image source={{ uri: friendInfo.avatar }} style={styles.messageAvatarImage} />
                        ) : (
                            <Text style={styles.messageAvatarText}>{friendInfo.name.charAt(0)}</Text>
                        )}
                    </LinearGradient>
                )}
                <View style={[
                    styles.messageBubble,
                    isMe ? { ...styles.messageBubbleRight, backgroundColor: Palette.purple.main } : { ...styles.messageBubbleLeft, backgroundColor: colors.cardSocial as any }
                ]}>
                    <Text style={[styles.messageText, { color: isMe ? '#FFF' : colors.text }]}>
                        {msg.text}
                    </Text>
                </View>
            </View>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top, backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <LinearGradient
                    colors={(id === 'system' ? Gradients.gold : Gradients.primary) as any}
                    style={styles.headerAvatar}
                >
                    {friendInfo.avatar ? (
                        <Image source={{ uri: friendInfo.avatar }} style={styles.headerAvatarImage} />
                    ) : (
                        <Text style={styles.headerAvatarText}>{friendInfo.name.charAt(0)}</Text>
                    )}
                </LinearGradient>
                <View style={styles.headerInfo}>
                    <Text style={[styles.headerName, { color: colors.text }]}>{friendInfo.name}</Text>
                    <Text style={[styles.headerStatus, { color: Palette.green.main }]}>En línea</Text>
                </View>
            </View>

            {/* Messages */}
            {loading ? (
                <View style={styles.loaderContainer}>
                    <ActivityIndicator size="large" color={Palette.purple.main} />
                </View>
            ) : (
                <ScrollView
                    ref={scrollViewRef}
                    style={styles.messagesContainer}
                    contentContainerStyle={{ padding: Spacing.md, paddingBottom: Spacing.xl }}
                >
                    {messages.length === 0 && (
                        <Text style={[styles.emptyChatText, { color: colors.textSecondary }]}>
                            ¡Saluda a {friendInfo.name}! 👋
                        </Text>
                    )}
                    {messages.map(renderMessage)}
                </ScrollView>
            )}

            {/* Input */}
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <View style={[styles.inputContainer, { backgroundColor: colors.surface, borderTopColor: colors.border, paddingBottom: insets.bottom || Spacing.md }]}>
                    <TextInput
                        style={[styles.input, { backgroundColor: colors.background, color: colors.text }]}
                        placeholder="Escribe un mensaje..."
                        placeholderTextColor={colors.textSecondary}
                        value={messageText}
                        onChangeText={setMessageText}
                        multiline
                    />
                    <TouchableOpacity
                        style={[styles.sendButton, { backgroundColor: messageText.trim() ? Palette.purple.main : colors.border }]}
                        onPress={sendMessage}
                        disabled={!messageText.trim()}
                    >
                        <Ionicons name="send" size={20} color="#FFF" />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.md,
        paddingBottom: Spacing.sm,
        borderBottomWidth: 1,
    },
    backButton: { marginRight: Spacing.sm, padding: Spacing.xs },
    headerAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        marginRight: Spacing.sm,
    },
    headerAvatarImage: { width: '100%', height: '100%' },
    headerAvatarText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
    headerInfo: { flex: 1 },
    headerName: { fontSize: Typography.size.md, fontWeight: 'bold' },
    headerStatus: { fontSize: Typography.size.xs, fontWeight: '500' },
    loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    messagesContainer: { flex: 1 },
    emptyChatText: { textAlign: 'center', marginVertical: Spacing.xl },
    messageBubbleWrapper: {
        flexDirection: 'row',
        marginBottom: Spacing.md,
        alignItems: 'flex-end',
    },
    messageBubbleWrapperLeft: { justifyContent: 'flex-start' },
    messageBubbleWrapperRight: { justifyContent: 'flex-end' },
    messageAvatar: {
        width: 28,
        height: 28,
        borderRadius: 14,
        marginRight: Spacing.sm,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    messageAvatarImage: { width: '100%', height: '100%' },
    messageAvatarText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },
    messageBubble: {
        maxWidth: '75%',
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        borderRadius: 20,
    },
    messageBubbleLeft: { borderBottomLeftRadius: 4 },
    messageBubbleRight: { borderBottomRightRadius: 4 },
    messageText: { fontSize: Typography.size.md, lineHeight: 20 },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        paddingHorizontal: Spacing.md,
        paddingTop: Spacing.sm,
        borderTopWidth: 1,
    },
    input: {
        flex: 1,
        minHeight: 40,
        maxHeight: 120,
        borderRadius: 20,
        paddingHorizontal: Spacing.md,
        paddingTop: 10,
        paddingBottom: 10,
        marginRight: Spacing.sm,
        fontSize: Typography.size.md,
    },
    sendButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 0,
    },
});
