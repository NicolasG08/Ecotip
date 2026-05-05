import { Colors, Gradients, Palette, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAppStore } from '@/store/AppProvider';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ChatsListScreen() {
    const insets = useSafeAreaInsets();
    const colorScheme = useColorScheme() ?? 'light';
    const colors = Colors[colorScheme];
    const { user, posts } = useAppStore(); // A simple hack: getting user info from posts author mapping or just raw friends IDs

    // Mock list for now. Will map to actual friends from user.friends
    const [conversations, setConversations] = useState<any[]>([]);

    useEffect(() => {
        if (!user || !user.friends) return;
        const friendList = user.friends.map(friendId => {
            // Find friend info from posts they made, or use defaults
            const friendPost = posts.find(p => p.authorId === friendId);
            return {
                id: friendId,
                name: friendPost ? friendPost.author.name : 'Amigo Destacado',
                avatar: friendPost ? friendPost.author.avatar : null,
                lastMessage: friendId === 'system' ? '¡Bienvenido al equipo EcoTip!' : '¡Hola! Sigamos reciclando ♻️',
                time: 'Hace un momento',
                unread: friendId === 'system' ? 1 : 0,
            };
        });
        setConversations(friendList);
    }, [user, posts]);

    const renderItem = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={[styles.chatItem, { borderBottomColor: colors.border }]}
            onPress={() => router.push(`/chat/${item.id}`)}
        >
            <LinearGradient
                colors={(item.id === 'system' ? Gradients.gold : Gradients.primary) as any}
                style={styles.avatarContainer}
            >
                {item.avatar ? (
                    <Image source={{ uri: item.avatar }} style={styles.avatarImage} />
                ) : (
                    <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
                )}
            </LinearGradient>
            <View style={styles.chatInfo}>
                <View style={styles.chatHeader}>
                    <Text style={[styles.chatName, { color: colors.text }]}>{item.name}</Text>
                    <Text style={[styles.chatTime, { color: colors.textSecondary }]}>{item.time}</Text>
                </View>
                <View style={styles.chatHeader}>
                    <Text
                        style={[styles.lastMessage, { color: item.unread > 0 ? colors.text : colors.textSecondary }]}
                        numberOfLines={1}
                    >
                        {item.lastMessage}
                    </Text>
                    {item.unread > 0 && (
                        <View style={[styles.unreadBadge, { backgroundColor: Palette.purple.main }]}>
                            <Text style={styles.unreadText}>{item.unread}</Text>
                        </View>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
            <View style={[styles.header, { borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Mensajes 📩</Text>
                <View style={{ width: 24 }} />
            </View>
            {conversations.length === 0 ? (
                <View style={styles.emptyState}>
                    <Ionicons name="chatbubbles-outline" size={64} color={colors.textSecondary} />
                    <Text style={[styles.emptyTitle, { color: colors.text }]}>Aún no tienes mensajes</Text>
                    <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>Visita la comunidad y añade amigos para empezar a conversar.</Text>
                </View>
            ) : (
                <FlatList
                    data={conversations}
                    keyExtractor={item => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={{ paddingBottom: insets.bottom }}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.md,
        borderBottomWidth: 1,
    },
    backBtn: { padding: Spacing.xs },
    headerTitle: {
        fontSize: Typography.size.xl,
        fontWeight: Typography.weight.bold,
    },
    chatItem: {
        flexDirection: 'row',
        padding: Spacing.md,
        borderBottomWidth: StyleSheet.hairlineWidth,
        alignItems: 'center',
    },
    avatarContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: Spacing.md,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    avatarImage: { width: '100%', height: '100%' },
    avatarText: {
        color: '#FFF',
        fontSize: 20,
        fontWeight: 'bold',
    },
    chatInfo: { flex: 1 },
    chatHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    chatName: {
        fontSize: Typography.size.md,
        fontWeight: Typography.weight.bold,
    },
    chatTime: { fontSize: Typography.size.xs },
    lastMessage: {
        fontSize: Typography.size.sm,
        flex: 1,
        marginRight: Spacing.sm,
    },
    unreadBadge: {
        width: 20,
        height: 20,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    unreadText: {
        color: '#FFF',
        fontSize: 10,
        fontWeight: 'bold',
    },
    emptyState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: Spacing.xl,
    },
    emptyTitle: {
        fontSize: Typography.size.lg,
        fontWeight: 'bold',
        marginTop: Spacing.lg,
        marginBottom: Spacing.sm,
    },
    emptySubtitle: {
        fontSize: Typography.size.md,
        textAlign: 'center',
    },
});
