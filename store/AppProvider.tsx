import { db } from '@/config/firebase';
import { Gradients, Palette } from '@/constants/theme';
import { useAuth } from '@/store/AuthContext';
import { addDoc, arrayRemove, arrayUnion, collection, deleteDoc, doc, getDoc, onSnapshot, orderBy, query, serverTimestamp, updateDoc } from 'firebase/firestore';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { Alert } from 'react-native';

// --- Type Definitions ---
export interface User {
    uid?: string;
    name: string;
    email?: string;
    photoURL: string | null;
    avatar?: string;
    phone: string;
    birthdate: string;
    gender: string;
    joinDate: string;
    level: number;
    xp: number;
    xpToNextLevel: number;
    rank: string;
    totalRecycled: number;
    co2Saved: string;
    treesEquivalent: number;
    savedPosts: string[];
    friends: string[];
    pendingRequests: string[];
    unreadMessages?: number;
};

export type Achievement = {
    id: string;
    title: string;
    icon: any;
    gradient: readonly string[];
    unlocked: boolean;
};

export type Challenge = {
    id: number;
    title: string;
    points: number;
    completed: boolean;
    icon: any;
    colors: string[];
    progress?: number;
    type: 'daily' | 'weekly';
};

export type Post = {
    id: string;
    authorId: string;
    author: {
        name: string;
        avatar: string | null;
        level: number;
        badge: string;
    };
    content: string;
    image: string | null;
    achievement: {
        id: string;
        title: string;
        icon?: string;
    } | null;
    likes: number;
    comments: number;
    commentsList?: { id: string; authorId: string; authorName: string; authorAvatar?: string | null; text: string; time: string; likedBy?: string[] }[];
    shares: number;
    time: string;
    likedBy: string[]; // <-- New field for Firestore
    tags: string[];
    isOfficial?: boolean;
    createdAt?: any; // To store Firestore timestamp
    isEdited?: boolean;
};

export type LeaderboardEntry = {
    rank: number;
    name: string;
    points: number;
    change: 'up' | 'down' | 'same';
    isUser?: boolean;
};

export type RecyclingLocation = {
    id: string;
    name: string;
    address: string;
    distance: string;
    rating: number;
    reviews: number;
    types: string[];
    hours: string;
    isOpen: boolean;
    isFavorite: boolean;
    gradient: readonly string[];
    latitude: number;
    longitude: number;
};

export type Group = {
    id: string;
    name: string;
    description: string;
    members: string[];
    createdAt?: any;
};

export interface Notification {
  id: string;
  type: 'achievement' | 'challenge' | 'reward' | 'community' | 'system';
  title: string;
  message: string;
  time: string;
  read: boolean;
  actionable?: boolean;
  points?: number;
  icon: any; // keyof typeof Ionicons.glyphMap
  gradient: any; // readonly string[]
}

export type AppState = {
    user: User;
    achievements: Achievement[];
    challenges: Challenge[];
    posts: Post[];
    groups: Group[];
    leaderboard: LeaderboardEntry[];
    locations: RecyclingLocation[];
    completeChallenge: (id: number) => void;
    addXp: (amount: number) => void;
    addPost: (content: string, imageUri?: string | null, achievement?: any) => Promise<void>;
    toggleLikePost: (postId: string) => void;
    savePost: (postId: string) => Promise<void>;
    editPost: (postId: string, newContent: string) => Promise<void>;
    deletePost: (postId: string) => Promise<void>;
    sendFriendRequest: (targetUserId: string) => Promise<void>;
    acceptFriendRequest: (targetUserId: string) => Promise<void>;
    rejectFriendRequest: (targetUserId: string) => Promise<void>;
    createGroup: (name: string, description: string) => Promise<void>;
    joinGroup: (groupId: string) => Promise<void>;
    addComment: (postId: string, text: string) => Promise<void>;
    deleteComment: (postId: string, commentId: string) => Promise<void>;
    toggleLikeComment: (postId: string, commentId: string) => Promise<void>;
    
    // Notifications
    notifications: Notification[];
    addNotification: (notification: Omit<Notification, 'id' | 'time' | 'read'>) => void;
    markNotificationRead: (id: string) => void;
    markAllNotificationsRead: () => void;
    deleteNotification: (id: string) => void;

    // Profile sync
    updateUserName: (newName: string) => void;
};

// --- Mock Initial Data ---
const INITIAL_USER: User = {
    name: 'Usuario',
    email: '',
    photoURL: null,
    phone: '',
    birthdate: '',
    gender: '',
    joinDate: '',
    level: 1,
    xp: 0,
    xpToNextLevel: 100,
    rank: '-',
    totalRecycled: 0,
    co2Saved: '0 kg',
    treesEquivalent: 0,
    savedPosts: [],
    friends: [],
    pendingRequests: [],
    unreadMessages: 0,
};

const INITIAL_ACHIEVEMENTS: Achievement[] = [
    { id: '1', title: 'Primera Semana', icon: 'ribbon-outline', gradient: Gradients.gold, unlocked: true },
    { id: '2', title: '100 Items', icon: 'trash-outline', gradient: Gradients.ocean, unlocked: true },
    { id: '3', title: 'Racha 7d', icon: 'flame-outline', gradient: Gradients.sunrise, unlocked: true },
    { id: '4', title: 'Eco Master', icon: 'trophy-outline', gradient: Gradients.aurora, unlocked: false },
];

const INITIAL_CHALLENGES: Challenge[] = [
    { id: 1, title: 'Recicla 20 botellas de plástico', points: 10, completed: true, icon: 'water-outline', colors: [Palette.blue.main, Palette.blue.light], type: 'daily' },
    { id: 2, title: 'Clasifica correctamente 5 tipos de residuos', points: 50, completed: true, icon: 'layers-outline', colors: [Palette.green.main, Palette.green.light], type: 'daily' },
    { id: 3, title: 'Entrega 3 artículos al punto de reciclaje', points: 70, completed: true, icon: 'location-outline', colors: [Palette.orange.main, Palette.orange.light], type: 'daily' },
    { id: 4, title: 'Invita a un amigo a usar Ecotip', points: 10, completed: false, icon: 'person-add-outline', colors: [Palette.purple.main, Palette.purple.light], type: 'daily' },
    { id: 5, title: 'Completa un mini-curso interactivo', points: 20, completed: false, icon: 'school-outline', colors: [Palette.yellow.dark, Palette.yellow.main], type: 'daily' },
    { id: 6, title: 'Reduce tu basura en un 30%', points: 150, completed: false, icon: 'trending-down-outline', colors: [Palette.green.dark, Palette.green.main], progress: 65, type: 'weekly' },
    { id: 7, title: 'Visita 3 puntos de reciclaje diferentes', points: 100, completed: false, icon: 'navigate-outline', colors: [Palette.blue.dark, Palette.blue.main], progress: 33, type: 'weekly' },
];

const INITIAL_POSTS: Post[] = [
    {
        id: '1',
        authorId: 'user1',
        author: { name: 'María García', avatar: null, level: 12, badge: 'Eco Warrior' },
        content: '¡Hoy completé mi reto de reciclar 100 botellas! 🎉 El planeta lo agradece 🌍',
        image: null,
        achievement: null,
        likes: 24,
        comments: 8,
        shares: 3,
        time: 'Hace 2h',
        likedBy: [],
        tags: ['#RetoCompletado', '#100Botellas'],
    },
    {
        id: '2',
        authorId: 'user2',
        author: { name: 'Carlos Rodríguez', avatar: null, level: 8, badge: 'Reciclador Pro' },
        content: 'Tip: ¿Sabían que las tapas de plástico se reciclan por separado? 💡 Siempre quítenlas antes de depositar las botellas.',
        image: null,
        achievement: null,
        likes: 45,
        comments: 12,
        shares: 15,
        time: 'Hace 4h',
        likedBy: [],
        tags: ['#EcoTips', '#Reciclaje'],
    },
    {
        id: '3',
        authorId: 'system',
        author: { name: 'EcoTeam Oficial', avatar: null, level: 50, badge: 'Verificado' },
        content: '🌟 ¡Nuevo reto comunitario! Esta semana el objetivo es reciclar 10,000 items entre todos. ¿Se unen? 💪',
        image: null,
        achievement: null,
        likes: 156,
        comments: 43,
        shares: 67,
        time: 'Hace 6h',
        likedBy: [],
        tags: ['#RetoComunidad', '#JuntosPodemos'],
        isOfficial: true,
    },
];

const INITIAL_GROUPS: Group[] = [
    {
        id: 'group1',
        name: 'EcoWarriors Bogotá',
        description: 'Buscamos limpiar los parques de la ciudad cada domingo.',
        members: ['user1', 'user2', 'system'],
    },
    {
        id: 'group2',
        name: 'Cero Plástico',
        description: 'Grupo para compartir tips de reducción de plástico de un solo uso.',
        members: ['system'],
    }
];

const INITIAL_LEADERBOARD: LeaderboardEntry[] = [
    { rank: 1, name: 'Ana Torres', points: 15420, change: 'up' },
    { rank: 2, name: 'Miguel Ángel', points: 14850, change: 'up' },
    { rank: 3, name: 'Laura Sánchez', points: 14200, change: 'down' },
    { rank: 4, name: 'Tú', points: 12000, change: 'up', isUser: true },
    { rank: 5, name: 'Pedro López', points: 11800, change: 'same' },
];

const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: 'mock-1',
    type: 'system',
    title: '🌍 Recuerda reciclar',
    message: '¡El planeta te necesita! Encuentra un punto verde cerca a ti.',
    time: 'Hace 5 min',
    read: false,
    actionable: true,
    icon: 'map',
    gradient: Gradients.ocean,
  },
  {
    id: 'mock-2',
    type: 'challenge',
    title: '📚 A un paso del certificado',
    message: 'Te falta poco para terminar el curso "Introducción al Reciclaje". ¡Continúa!',
    time: 'Ayer',
    read: true,
    actionable: true,
    icon: 'school',
    gradient: Gradients.primary,
  },
];

const INITIAL_LOCATIONS: RecyclingLocation[] = [
    // Bogotá & Cundinamarca
    {
        id: '1',
        name: 'Reciclaje Mathius',
        address: 'Calle 128b # 54 – 51, Prado Veraniego',
        distance: '2.5 km',
        rating: 4.8,
        reviews: 120,
        types: ['electronics', 'paper', 'plastic'],
        hours: 'Lun-Vie: 8:00-17:00',
        isOpen: true,
        isFavorite: false,
        gradient: Gradients.ocean,
        latitude: 4.7176,
        longitude: -74.0621,
    },
    {
        id: '2',
        name: 'BogotaRecicla',
        address: 'Calle 94B # 56-42',
        distance: '3.2 km',
        rating: 4.9,
        reviews: 340,
        types: ['paper', 'glass', 'plastic'],
        hours: 'Lun-Sáb: 7:30-18:00',
        isOpen: true,
        isFavorite: true,
        gradient: Gradients.primary,
        latitude: 4.6865,
        longitude: -74.0722,
    },
    {
        id: '3',
        name: 'ECA Engativá',
        address: 'Localidad Engativá',
        distance: '5.1 km',
        rating: 4.5,
        reviews: 85,
        types: ['electronics', 'paper'],
        hours: 'Lun-Sáb: 8:00-17:00',
        isOpen: true,
        isFavorite: false,
        gradient: Gradients.sunrise,
        latitude: 4.7000,
        longitude: -74.1100,
    },
    {
        id: '4',
        name: 'ECA Suba',
        address: 'Localidad Suba',
        distance: '4.8 km',
        rating: 4.6,
        reviews: 210,
        types: ['plastic', 'glass', 'paper'],
        hours: 'Lun-Dom: Variable',
        isOpen: true,
        isFavorite: false,
        gradient: Gradients.aurora,
        latitude: 4.7400,
        longitude: -74.0800,
    },
    {
        id: '5',
        name: 'Orinoco E-Scrap SAS',
        address: 'Calle 27 #7a-85, Funza',
        distance: '15.0 km',
        rating: 4.7,
        reviews: 150,
        types: ['electronics'],
        hours: 'Lun-Vie: 7:00-16:00',
        isOpen: false,
        isFavorite: false,
        gradient: Gradients.primary,
        latitude: 4.7100,
        longitude: -74.2100,
    },

    // Antioquia & Valle de Aburrá
    {
        id: '6',
        name: 'Punto Naranja Belén',
        address: 'Carrera 66B con Calle 30A',
        distance: '2.0 km',
        rating: 4.9,
        reviews: 420,
        types: ['plastic', 'glass', 'paper', 'electronics'],
        hours: 'Lun-Sáb: 6:00-14:00',
        isOpen: true,
        isFavorite: true,
        gradient: Gradients.ocean,
        latitude: 6.2300,
        longitude: -75.5940,
    },
    {
        id: '7',
        name: 'Punto Naranja El Poblado',
        address: 'Calle 9 con carrera 41 (Parque Lleras)',
        distance: '3.5 km',
        rating: 4.8,
        reviews: 512,
        types: ['plastic', 'glass', 'paper'],
        hours: 'Lun-Dom: 10:00-22:00',
        isOpen: true,
        isFavorite: false,
        gradient: Gradients.primary,
        latitude: 6.2088,
        longitude: -75.5677,
    },
    {
        id: '8',
        name: 'Centro de Acopio B. San Juan',
        address: 'Calle 44 #50-42',
        distance: '4.2 km',
        rating: 4.6,
        reviews: 110,
        types: ['paper', 'electronics'],
        hours: 'Lun-Vie: 7:30-16:00',
        isOpen: true,
        isFavorite: false,
        gradient: Gradients.sunrise,
        latitude: 6.2483,
        longitude: -75.5684,
    },
    {
        id: '9',
        name: 'Centro de Acopio Prado',
        address: 'Calle 58 # 51B – 30',
        distance: '5.0 km',
        rating: 4.5,
        reviews: 95,
        types: ['plastic', 'glass', 'paper'],
        hours: 'Lun-Vie: 8:00-17:30',
        isOpen: true,
        isFavorite: false,
        gradient: Gradients.ocean,
        latitude: 6.2574,
        longitude: -75.5623,
    },

    // Cali
    {
        id: '10',
        name: 'Asociación de Recicladores de Cali',
        address: 'Carrera 14 #18-24',
        distance: '1.5 km',
        rating: 4.9,
        reviews: 630,
        types: ['plastic', 'glass', 'paper', 'electronics'],
        hours: 'Lun-Dom: 8:00-24:00',
        isOpen: true,
        isFavorite: true,
        gradient: Gradients.aurora,
        latitude: 3.4400,
        longitude: -76.5200,
    },
    {
        id: '11',
        name: 'ASOBOCE',
        address: 'Carrera 2C #30-09, Barrio Santander',
        distance: '2.8 km',
        rating: 4.7,
        reviews: 200,
        types: ['plastic', 'glass', 'paper'],
        hours: 'Lun-Vie: 8:00-18:00',
        isOpen: true,
        isFavorite: false,
        gradient: Gradients.primary,
        latitude: 3.4566,
        longitude: -76.5165,
    },
    {
        id: '12',
        name: 'ARAC22',
        address: 'Comuna 22',
        distance: '6.5 km',
        rating: 4.6,
        reviews: 145,
        types: ['plastic'],
        hours: 'Rutas Selectivas',
        isOpen: true,
        isFavorite: false,
        gradient: Gradients.ocean,
        latitude: 3.3500,
        longitude: -76.5300,
    },
    {
        id: '13',
        name: 'Fundación Ciclos',
        address: 'Zonas COP16 (La Merced, El Hoyo)',
        distance: '3.0 km',
        rating: 4.8,
        reviews: 310,
        types: ['plastic', 'glass', 'paper'],
        hours: 'Lun, Mié, Vie: 18:00-23:00',
        isOpen: false,
        isFavorite: true,
        gradient: Gradients.sunrise,
        latitude: 3.4510,
        longitude: -76.5330,
    },

    // Bucaramanga & Regional
    {
        id: '14',
        name: 'Punto Limpio Metropolitano',
        address: 'Bucaramanga',
        distance: '1.2 km',
        rating: 4.9,
        reviews: 540,
        types: ['plastic', 'glass', 'paper', 'electronics'],
        hours: 'Lun-Sáb: 9:00-16:00',
        isOpen: true,
        isFavorite: true,
        gradient: Gradients.ocean,
        latitude: 7.0984,
        longitude: -73.1119,
    },
    {
        id: '15',
        name: 'ECA Manizales (Regional)',
        address: 'Manizales, Caldas',
        distance: '35.0 km',
        rating: 4.5,
        reviews: 120,
        types: ['paper', 'plastic'],
        hours: 'Horario de Oficina',
        isOpen: true,
        isFavorite: false,
        gradient: Gradients.primary,
        latitude: 5.0688,
        longitude: -75.5173,
    }
];

// --- Context & Provider ---
const AppContext = createContext<AppState | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
    const { user: authUser } = useAuth();
    const [user, setUser] = useState<User>(INITIAL_USER);
    const [achievements, setAchievements] = useState<Achievement[]>(INITIAL_ACHIEVEMENTS);
    const [challenges, setChallenges] = useState<Challenge[]>(INITIAL_CHALLENGES);
    const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS);
    const [groups, setGroups] = useState<Group[]>(INITIAL_GROUPS);
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(INITIAL_LEADERBOARD);
    const [locations, setLocations] = useState<RecyclingLocation[]>(INITIAL_LOCATIONS);
    const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);

    // Cargar datos reales del usuario de Firebase Auth y Firestore
    useEffect(() => {
        if (authUser) {
            const loadUserProfile = async () => {
                try {
                    const userDoc = await getDoc(doc(db, 'users', authUser.uid));
                    const firestoreData = userDoc.exists() ? userDoc.data() : {};

                    const now = new Date();
                    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
                    const createdAt = firestoreData.createdAt?.toDate?.() || now;
                    const joinDate = `${months[createdAt.getMonth()]} ${createdAt.getFullYear()}`;

                    setUser(prev => ({
                        ...prev,
                        name: authUser.displayName || firestoreData.name || 'Usuario',
                        email: authUser.email || firestoreData.email || '',
                        photoURL: authUser.photoURL || null,
                        level: firestoreData.level || 1,
                        xp: firestoreData.xp || 0,
                        xpToNextLevel: firestoreData.xpToNextLevel || 100,
                        joinDate,
                        totalRecycled: firestoreData.totalRecycled || 0,
                        co2Saved: firestoreData.co2Saved || '0 kg',
                        treesEquivalent: firestoreData.treesEquivalent || 0,
                        rank: firestoreData.rank || '-',
                        completedChallenges: firestoreData.completedChallenges || 0,
                        savedPosts: firestoreData.savedPosts || [],
                        friends: firestoreData.friends || [],
                        pendingRequests: firestoreData.pendingRequests || [],
                    }));
                } catch (error) {
                    // Si falla Firestore, al menos usar datos de Firebase Auth
                    setUser(prev => ({
                        ...prev,
                        name: authUser.displayName || 'Usuario',
                        email: authUser.email || '',
                        photoURL: authUser.photoURL || null,
                        savedPosts: [],
                        friends: [],
                        pendingRequests: [],
                    }));
                }
            };
            loadUserProfile();

            // Real-time listener for groups
            const groupQ = query(collection(db, 'groups'), orderBy('createdAt', 'desc'));
            const unsubscribeGroups = onSnapshot(groupQ, (snapshot) => {
                const fetchedGroups: Group[] = [];
                snapshot.forEach((docSnap) => {
                    fetchedGroups.push({ id: docSnap.id, ...docSnap.data() } as Group);
                });
                if (fetchedGroups.length > 0) setGroups(fetchedGroups);
            });

            // Real-time listener for posts
            const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
            const unsubscribePosts = onSnapshot(q, (snapshot) => {
                const fetchedPosts: Post[] = [];
                snapshot.forEach((docSnap) => {
                    const data = docSnap.data();
                    let timeString = 'Hace un momento';
                    if (data.createdAt) {
                        try {
                            const postTime = typeof data.createdAt.toDate === 'function'
                                ? data.createdAt.toDate().getTime()
                                : new Date(data.createdAt).getTime();

                            const seconds = Math.floor((new Date().getTime() - postTime) / 1000);
                            if (seconds < 60) timeString = 'Hace un momento';
                            else if (seconds < 3600) timeString = `Hace ${Math.floor(seconds / 60)}m`;
                            else if (seconds < 86400) timeString = `Hace ${Math.floor(seconds / 3600)}h`;
                            else timeString = `Hace ${Math.floor(seconds / 86400)}d`;
                        } catch (e) {
                            timeString = 'Hace un momento';
                        }
                    }

                    fetchedPosts.push({
                        id: docSnap.id,
                        authorId: data.authorId || 'mock',
                        author: {
                            name: data.authorName || 'Usuario',
                            avatar: data.authorAvatar || null,
                            level: data.authorLevel || 1,
                            badge: data.authorBadge || 'Eco Warrior',
                        },
                        content: data.content || '',
                        image: data.image || null,
                        achievement: data.achievement || null,
                        likes: data.likesCount || 0,
                        comments: data.commentsList?.length || data.commentsCount || 0,
                        commentsList: data.commentsList || [],
                        shares: data.sharesCount || 0,
                        time: timeString,
                        likedBy: data.likedBy || [],
                        tags: data.tags || [],
                        isOfficial: data.isOfficial || false,
                        createdAt: data.createdAt,
                        isEdited: data.isEdited || false,
                    });
                });

                // Si la colección está vacía, usamos los posts iniciales y los subimos a Firestore (solo 1 vez por proyecto)
                if (fetchedPosts.length === 0 && authUser) {
                    const initPosts = async () => {
                        console.log('[POST_DEBUG] Base de datos vacía. Subiendo INITIAL_POSTS a Firestore...');
                        try {
                            for (const p of INITIAL_POSTS) {
                                await addDoc(collection(db, 'posts'), {
                                    authorId: p.author.name === 'EcoTeam Oficial' ? 'system' : 'mockUser',
                                    authorName: p.author.name,
                                    authorLevel: p.author.level,
                                    authorBadge: p.author.badge,
                                    content: p.content,
                                    likesCount: p.likes,
                                    commentsCount: p.comments,
                                    sharesCount: p.shares,
                                    likedBy: [],
                                    tags: p.tags,
                                    isOfficial: p.isOfficial || false,
                                    createdAt: serverTimestamp(),
                                });
                            }
                            console.log('[POST_DEBUG] INITIAL_POSTS subidos exitosamente.');
                        } catch (err) {
                            console.error('[POST_DEBUG] Error inyectando INITIAL_POSTS: ', err);
                        }
                    };
                    initPosts();
                    // Opcionalmente podemos mostrar los INITIAL localmente de inmediato mientras se suben:
                    setPosts(INITIAL_POSTS);
                } else {
                    // Set the fetched posts immediately
                    setPosts(fetchedPosts);
                }
            });

            return () => {
                unsubscribePosts();
            };
        }
    }, [authUser]);

    const addXp = (amount: number) => {
        setUser((prevUser) => {
            let newXp = prevUser.xp + amount;
            let newLevel = prevUser.level;
            let newXpToNextLevel = prevUser.xpToNextLevel;

            if (newXp >= newXpToNextLevel) {
                newLevel += 1;
                newXp = newXp - newXpToNextLevel;
                newXpToNextLevel = Math.floor(newXpToNextLevel * 1.2);
            }

            setLeaderboard((prevLeaderboard) =>
                prevLeaderboard.map(entry => entry.isUser ? { ...entry, points: entry.points + amount, name: prevUser.name } : entry)
            );

            return {
                ...prevUser,
                xp: newXp,
                level: newLevel,
                xpToNextLevel: newXpToNextLevel,
            };
        });
    };

    const completeChallenge = (id: number) => {
        let earnedPoints = 0;
        let challengeTitle = '';
        setChallenges((prev) =>
            prev.map((c) => {
                if (c.id === id && !c.completed) {
                    earnedPoints = c.points;
                    challengeTitle = c.title;
                    return { ...c, completed: true, progress: c.type === 'weekly' ? 100 : undefined };
                }
                return c;
            })
        );

        if (earnedPoints > 0) {
            setTimeout(() => addXp(earnedPoints), 0);
            
            // Dispatch notification
            setNotifications(prev => [{
                id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
                type: 'challenge',
                title: '¡Reto Completado!',
                message: `Has completado "${challengeTitle}" y ganado ${earnedPoints} puntos.`,
                time: 'Justo ahora',
                read: false,
                actionable: false,
                points: earnedPoints,
                icon: 'checkmark-circle-outline',
                gradient: Gradients.primary
            }, ...prev]);
        }
    };

    const addPost = async (content: string, imageUri?: string | null, achievement?: any) => {
        if (!authUser) throw new Error("Debes iniciar sesión para publicar");

        console.log('[POST_DEBUG] Empezando addPost con:', { contentLength: content.length, hasImage: !!imageUri });

        try {
            // El imageUri que recibimos AHORA es un string en base64 completo,
            // (ej. "data:image/jpeg;base64,....") listo para guardar y renderizar.
            const uploadedImageUrl = imageUri || null;

            if (uploadedImageUrl) {
                console.log(`[POST_DEBUG] Usando imagen en Base64 (Aprox ${Math.round(uploadedImageUrl.length / 1024)} KB).`);
            }

            console.log('[POST_DEBUG] Guardando documento en Firestore...');

            const docData = {
                authorId: authUser.uid,
                authorName: user?.name && user.name !== 'Usuario' ? user.name : (authUser.displayName || 'Usuario'),
                authorAvatar: user?.photoURL || authUser.photoURL || null,
                authorLevel: user?.level || 1,
                authorBadge: 'Eco Warrior',
                content,
                image: uploadedImageUrl,
                achievement: achievement || null,
                likesCount: 0,
                commentsCount: 0,
                sharesCount: 0,
                likedBy: [],
                tags: [],
                isOfficial: false,
                createdAt: serverTimestamp(),
            };

            // Ejecutamos addDoc con un timeout temporal de 10 segundos para no bloquear la app
            const addDocPromise = addDoc(collection(db, 'posts'), docData);

            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error("Timeout: Firestore no respondió en 10s. Verifica si estás conectado o hay restricciones en la base de datos.")), 10000)
            );

            await Promise.race([addDocPromise, timeoutPromise]);

            console.log('[POST_DEBUG] Documento guardado exitosamente en Firestore.');

        } catch (error) {
            console.error("[POST_DEBUG] Error atrapado en addPost: ", error);
            throw error; // Propagar a social.tsx
        }
    };

    const editPost = async (postId: string, newContent: string) => {
        if (!authUser) return;
        try {
            updateDoc(doc(db, 'posts', postId), {
                content: newContent,
                isEdited: true
            }).catch(error => console.error("Error editing post: ", error));
        } catch (error) {
            console.error("Error in editPost definition: ", error);
        }
    };

    const deletePost = async (postId: string) => {
        if (!authUser) return;
        try {
            deleteDoc(doc(db, 'posts', postId)).catch(error => console.error("Error deleting post: ", error));
            setPosts((prev) => prev.filter((p) => p.id !== postId));
        } catch (error) {
            console.error("Error in deletePost: ", error);
        }
    };

    const savePost = async (postId: string) => {
        if (!authUser) return;
        try {
            const isSaved = user.savedPosts?.includes(postId);

            setUser(prev => ({
                ...prev,
                savedPosts: isSaved
                    ? (prev.savedPosts || []).filter(id => id !== postId)
                    : [...(prev.savedPosts || []), postId]
            }));

            updateDoc(doc(db, 'users', authUser.uid), {
                savedPosts: isSaved ? arrayRemove(postId) : arrayUnion(postId)
            }).catch(error => console.error("Error saving post to user profile: ", error));
        } catch (error) {
            console.error("Error executing savePost: ", error);
        }
    };

    const toggleLikePost = async (postId: string) => {
        if (!authUser) return;

        const post = posts.find(p => p.id === postId);
        if (!post) return;

        const hasLiked = post.likedBy.includes(authUser.uid);

        // Firestore update (state will auto-update via onSnapshot listener)
        try {
            const postRef = doc(db, 'posts', postId);
            await updateDoc(postRef, {
                likedBy: hasLiked ? arrayRemove(authUser.uid) : arrayUnion(authUser.uid),
                likesCount: hasLiked ? post.likes - 1 : post.likes + 1
            });
            
            // Mock notification locally when giving a like
            if (!hasLiked && post.authorId !== authUser.uid) {
                setNotifications(prev => [{
                    id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
                    type: 'community',
                    title: '¡Tu post recibió un like!',
                    message: 'A alguien de la comunidad le encantó tu publicación.',
                    time: 'Justo ahora',
                    read: false,
                    actionable: true,
                    icon: 'heart',
                    gradient: [Palette.red.light, Palette.red.main]
                }, ...prev]);
            }
        } catch (error) {
            console.error("Error toggling like: ", error);
        }
    };

    const addComment = async (postId: string, text: string) => {
        if (!authUser) return;

        const date = new Date();
        const formatter = new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
        const timeString = formatter.format(date);

        const newComment = {
            id: Date.now().toString(),
            authorId: authUser.uid,
            authorName: user?.name || authUser.displayName || 'Usuario',
            authorAvatar: user?.avatar || authUser.photoURL || null,
            text,
            time: timeString,
        };

        // Firestore persistente (state will auto-update via onSnapshot listener)
        try {
            const postRef = doc(db, 'posts', postId);
            await updateDoc(postRef, {
                commentsList: arrayUnion(newComment),
            });
        } catch (error) {
            console.error("Error agregando comentario:", error);
        }
    };

    const deleteComment = async (postId: string, commentId: string) => {
        if (!authUser) return;

        const post = posts.find(p => p.id === postId);
        if (!post || !post.commentsList) return;

        const commentToRemove = post.commentsList.find(c => c.id === commentId);
        if (!commentToRemove) return;

        // Firestore persistente (UI updates via onSnapshot)
        try {
            const postRef = doc(db, 'posts', postId);
            await updateDoc(postRef, {
                commentsList: arrayRemove(commentToRemove)
            });
        } catch (error) {
            console.error("Error eliminando comentario:", error);
        }
    };

    const toggleLikeComment = async (postId: string, commentId: string) => {
        if (!authUser) return;

        const post = posts.find(p => p.id === postId);
        if (!post || !post.commentsList) return;

        const targetComment = post.commentsList.find(c => c.id === commentId);
        if (!targetComment) return;

        const hasLiked = targetComment.likedBy?.includes(authUser.uid);

        // Prepare the new comment object
        const newComment = {
            ...targetComment,
            likedBy: hasLiked
                ? (targetComment.likedBy || []).filter(id => id !== authUser.uid)
                : [...(targetComment.likedBy || []), authUser.uid]
        };

        const updatedCommentsList = post.commentsList.map(c =>
            c.id === commentId ? newComment : c
        );

        // Firestore updates (UI updates via onSnapshot)
        // Guardar el arreglo completo previene el parpadeo (glitch) causado por 
        // hacer un arrayRemove y arrayUnion por separado, lo que activaba 2 estados de red.
        try {
            const postRef = doc(db, 'posts', postId);
            await updateDoc(postRef, {
                commentsList: updatedCommentsList
            });
        } catch (error) {
            console.error("Error toggling like en comentario:", error);
        }
    };

    const sendFriendRequest = async (targetUserId: string) => {
        if (!authUser) return;

        // Mock Auto-Accept Logic
        if (['user1', 'user2', 'system'].includes(targetUserId)) {
            // Give it a realistic delay
            setTimeout(async () => {
                setUser(prev => ({
                    ...prev,
                    friends: [...(prev.friends || []), targetUserId]
                }));

                await updateDoc(doc(db, 'users', authUser.uid), {
                    friends: arrayUnion(targetUserId)
                });
                Alert.alert("¡Solicitud Aceptada!", "Este perfil verificado ha aceptado tu solicitud automáticamente para probar el chat.");
                
                // MOCK Notification
                setNotifications(prev => [{
                    id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
                    type: 'community',
                    title: '¡Nueva amistad!',
                    message: 'Alguien ha aceptado tu solicitud de amistad.',
                    time: 'Justo ahora',
                    read: false,
                    actionable: true,
                    icon: 'people',
                    gradient: Gradients.ocean
                }, ...prev]);
            }, 1500);
            return;
        }

        // Real logic for real users
        try {
            await updateDoc(doc(db, 'users', targetUserId), {
                pendingRequests: arrayUnion(authUser.uid)
            });
            Alert.alert("Enviada", "Solicitud de amistad enviada.");
        } catch (error) {
            console.error("Error sending friend request", error);
        }
    };

    const acceptFriendRequest = async (requesterId: string) => {
        if (!authUser) return;

        setUser(prev => ({
            ...prev,
            pendingRequests: (prev.pendingRequests || []).filter(id => id !== requesterId),
            friends: [...(prev.friends || []), requesterId]
        }));

        try {
            // Update my doc
            await updateDoc(doc(db, 'users', authUser.uid), {
                pendingRequests: arrayRemove(requesterId),
                friends: arrayUnion(requesterId)
            });
            // Update their doc
            await updateDoc(doc(db, 'users', requesterId), {
                friends: arrayUnion(authUser.uid)
            });
            Alert.alert("¡Aceptado!", "Ahora sois amigos.");
        } catch (error) {
            console.error("Error accepting friend request", error);
        }
    };

    const rejectFriendRequest = async (requesterId: string) => {
        if (!authUser) return;

        setUser(prev => ({
            ...prev,
            pendingRequests: (prev.pendingRequests || []).filter(id => id !== requesterId)
        }));

        try {
            await updateDoc(doc(db, 'users', authUser.uid), {
                pendingRequests: arrayRemove(requesterId)
            });
            Alert.alert("Rechazada", "Solicitud de amistad rechazada.");
        } catch (error) {
            console.error("Error rejecting friend request", error);
        }
    };

    const createGroup = async (name: string, description: string) => {
        if (!authUser) return;
        try {
            await addDoc(collection(db, 'groups'), {
                name,
                description,
                members: [authUser.uid],
                createdAt: serverTimestamp()
            });
            Alert.alert("Grupo Creado", "Tu grupo se creó exitosamente.");
        } catch (error) {
            console.error("Error creating group", error);
            Alert.alert("Error", "No se pudo crear el grupo.");
        }
    };

    const joinGroup = async (groupId: string) => {
        if (!authUser) return;
        try {
            await updateDoc(doc(db, 'groups', groupId), {
                members: arrayUnion(authUser.uid)
            });

            setGroups(prev => prev.map(g =>
                g.id === groupId ? { ...g, members: [...g.members, authUser.uid] } : g
            ));

            Alert.alert("¡Te uniste!", "Ahora eres parte de este grupo.");
        } catch (error) {
            console.error("Error joining group", error);
        }
    };

    // --- Notifications ---
    const addNotification = (notificationData: Omit<Notification, 'id' | 'time' | 'read'>) => {
        const newNotification: Notification = {
            ...notificationData,
            id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            time: 'Justo ahora',
            read: false,
        };
        setNotifications((prev) => [newNotification, ...prev]);
    };

    const markNotificationRead = (id: string) => {
        setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, read: true } : n))
        );
    };

    const markAllNotificationsRead = () => {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    };

    const deleteNotification = (id: string) => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
    };

    const updateUserName = (newName: string) => {
        // Update local user state
        setUser(prev => ({ ...prev, name: newName }));
        // Update author name on all posts by this user
        if (authUser) {
            setPosts(prev => prev.map(post =>
                post.authorId === authUser.uid
                    ? { ...post, author: { ...post.author, name: newName } }
                    : post
            ));
        }
    };

    return (
        <AppContext.Provider value={{
            user, achievements, challenges, posts, groups, leaderboard, locations,
            completeChallenge, addXp, addPost, toggleLikePost, savePost, editPost, deletePost,
            sendFriendRequest, acceptFriendRequest, rejectFriendRequest, createGroup, joinGroup, addComment, deleteComment, toggleLikeComment,
            notifications, addNotification, markNotificationRead, markAllNotificationsRead, deleteNotification,
            updateUserName
        }}>
            {children}
        </AppContext.Provider>
    );
};

export const useAppStore = () => {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useAppStore must be used within an AppProvider');
    }
    return context;
};
