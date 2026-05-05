import { ActionSheet } from '@/components/ui/ActionSheet';
import { AlertModal } from '@/components/ui/AlertModal';
import { GradientCard } from '@/components/ui/GradientCard';
import { IconBadge } from '@/components/ui/IconBadge';
import {
  BorderRadius,
  Colors,
  Gradients,
  Palette,
  Shadows,
  Spacing,
  Typography,
} from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { LeaderboardEntry, Post, useAppStore } from '@/store/AppProvider';
import { useAuth } from '@/store/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Modal,
  Image as RNImage,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  RefreshControl
} from 'react-native';
import Animated, {
  FadeInDown,
  FadeInRight
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const TABS = [
  { key: 'feed', label: 'Feed', icon: 'newspaper' },
  { key: 'friends', label: 'Amigos', icon: 'people' },
  { key: 'groups', label: 'Grupos', icon: 'albums' },
  { key: 'leaderboard', label: 'Ranking', icon: 'trophy' },
];

// Componente de Post
function PostCard({
  post,
  index,
  onAction,
  onEdit,
  onDelete,
  onSave,
  onAvatarPress,
  onImagePress
}: {
  post: Post;
  index: number;
  onAction: (feature: string) => void;
  onEdit: (post: Post) => void;
  onDelete: (id: string) => void;
  onSave: (id: string) => void;
  onAvatarPress: (profile: { id: string; author: Post['author'] }) => void;
  onImagePress: (imageUrl: string) => void;
}) {
  const { toggleLikePost, addComment, deleteComment, toggleLikeComment, user: appUser } = useAppStore();
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const { user } = useAuth();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const [imageHeight, setImageHeight] = useState(250);

  // Detect real image dimensions and compute container height
  const containerWidth = Dimensions.get('window').width - Spacing.lg * 2 - Spacing.md * 2;
  React.useEffect(() => {
    if (post.image) {
      RNImage.getSize(post.image, (w, h) => {
        if (w && h) {
          const computed = containerWidth / (w / h);
          setImageHeight(Math.min(500, Math.max(200, computed)));
        }
      }, () => setImageHeight(250));
    }
  }, [post.image]);

  const isLiked = user ? post.likedBy?.includes(user.uid) : false;
  const isSaved = appUser.savedPosts?.includes(post.id);
  const isOwnPost = user?.uid === post.authorId;

  const handleLike = () => {
    toggleLikePost(post.id);
  };

  const handleMoreOptions = () => {
    if (isOwnPost) {
      Alert.alert(
        "Opciones de Post",
        "¿Qué deseas hacer con tu publicación?",
        [
          { text: "Cancelar", style: "cancel" },
          { text: "Editar", onPress: () => onEdit(post) },
          { text: "Eliminar", style: "destructive", onPress: () => onDelete(post.id) },
        ]
      );
    } else {
      Alert.alert(
        "Opciones",
        "Aún no puedes reportar publicaciones.",
        [{ text: "Entendido", style: "cancel" }]
      );
    }
  };

  return (
    <Animated.View entering={FadeInDown.delay(index * 100).springify()}>
      <View style={[styles.postCard, { backgroundColor: colors.surface }, Shadows.sm]}>
        {/* Header del post */}
        <View style={styles.postHeader}>
          <TouchableOpacity onPress={() => onAvatarPress({ id: post.authorId, author: post.author })}>
            <LinearGradient
              colors={(post.isOfficial ? Gradients.gold : Gradients.primary) as any}
              style={styles.avatarContainer}
            >
              {post.author.avatar ? (
                <Image source={{ uri: post.author.avatar }} style={styles.avatarImage} />
              ) : (
                <Text style={styles.avatarText}>
                  {post.author.name.charAt(0).toUpperCase()}
                </Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.authorInfo}>
            <View style={styles.authorNameRow}>
              <Text style={[styles.authorName, { color: colors.text }]}>
                {post.author.name}
              </Text>
              {post.isOfficial && (
                <Ionicons name="checkmark-circle" size={16} color={Palette.blue.main} />
              )}
            </View>
            <View style={styles.authorMeta}>
              <View style={[styles.levelBadge, { backgroundColor: colors.primary + '20' }]}>
                <Text style={[styles.levelText, { color: colors.primary }]}>
                  Nv. {post.author.level}
                </Text>
              </View>
              <Text style={[styles.postTime, { color: colors.textSecondary }]}>
                • {post.time} {post.isEdited && '(Editado)'}
              </Text>
            </View>
          </View>

          <TouchableOpacity style={styles.moreButton} onPress={handleMoreOptions}>
            <Ionicons name="ellipsis-horizontal" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Contenido */}
        <Text style={[styles.postContent, { color: colors.text }]}>
          {post.content}
        </Text>

        {/* Imagen adjunta */}
        {post.image && (
          <TouchableOpacity
            style={[
              styles.postImageContainer,
              { height: imageHeight }
            ]}
            activeOpacity={0.9}
            onPress={() => onImagePress(post.image!)}
          >
            <Image source={{ uri: post.image }} style={styles.postImage} contentFit="cover" />
          </TouchableOpacity>
        )}

        {/* Logro adjunto */}
        {post.achievement && (
          <LinearGradient
            colors={(colors.surface === '#FFFFFF' ? Gradients.gold : [colors.surface, colors.background]) as any}
            style={styles.postAchievementCard}
          >
            <View style={styles.postAchievementIcon}>
              <Ionicons name={post.achievement.icon as any} size={24} color={Palette.yellow.dark} />
            </View>
            <View>
              <Text style={[styles.postAchievementLabel, { color: colors.textSecondary }]}>Logro Desbloqueado</Text>
              <Text style={[styles.postAchievementTitle, { color: colors.text }]}>{post.achievement.title}</Text>
            </View>
          </LinearGradient>
        )}

        {/* Tags */}
        <View style={styles.tagsContainer}>
          {post.tags.map((tag) => (
            <TouchableOpacity key={tag}>
              <Text style={[styles.tagText, { color: colors.primary }]}>{tag}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Acciones */}
        <View style={styles.postActions}>
          <TouchableOpacity style={styles.actionButton} onPress={handleLike}>
            <Ionicons
              name={isLiked ? 'heart' : 'heart-outline'}
              size={22}
              color={isLiked ? Palette.red.main : colors.textSecondary}
            />
            <Text
              style={[
                styles.actionText,
                { color: isLiked ? Palette.red.main : colors.textSecondary },
              ]}
            >
              {post.likes}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={() => setShowComments(!showComments)}>
            <Ionicons name="chatbubble-outline" size={20} color={colors.textSecondary} />
            <Text style={[styles.actionText, { color: colors.textSecondary }]}>
              {post.comments}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={() => onAction('Compartir')}>
            <Ionicons name="share-outline" size={20} color={colors.textSecondary} />
            <Text style={[styles.actionText, { color: colors.textSecondary }]}>
              {post.shares}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={() => onSave(post.id)}>
            <Ionicons name={isSaved ? "bookmark" : "bookmark-outline"} size={20} color={isSaved ? Gradients.sunrise[0] : colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Sección de Comentarios */}
        {showComments && (
          <View style={[styles.commentsSection, { borderColor: colors.border }]}>
            {post.commentsList && post.commentsList.length > 0 ? (
              <View style={styles.commentsList}>
                {post.commentsList.map(c => {
                  const isMyComment = c.authorId === user?.uid || c.authorName === 'Usuario';
                  const isPostOwner = post.authorId === user?.uid;
                  const canDelete = isMyComment || isPostOwner;
                  const hasLikedComment = c.likedBy?.includes(user?.uid || '');
                  const likeCount = c.likedBy?.length || 0;

                  return (
                    <View key={c.id} style={[styles.commentItem, { backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }]}>
                      <View style={styles.commentTop}>
                        <View style={styles.commentAvatarRow}>
                          {c.authorAvatar ? (
                            <Image source={{ uri: c.authorAvatar }} style={styles.commentAvatar} />
                          ) : (
                            <LinearGradient colors={Gradients.primary as any} style={styles.commentAvatar}>
                              <Ionicons name="person" size={12} color="#FFF" />
                            </LinearGradient>
                          )}
                          <View style={{ flex: 1 }}>
                            <Text style={[styles.commentAuthor, { color: colors.text }]}>{c.authorName}</Text>
                            <Text style={[styles.commentTime, { color: colors.textSecondary }]}>{c.time}</Text>
                          </View>
                          {canDelete && (
                            <TouchableOpacity
                              onPress={() => {
                                Alert.alert(
                                  'Eliminar comentario',
                                  '¿Estás seguro de que deseas eliminar este comentario?',
                                  [
                                    { text: 'Cancelar', style: 'cancel' },
                                    { text: 'Eliminar', style: 'destructive', onPress: () => deleteComment(post.id, c.id) },
                                  ]
                                );
                              }}
                              style={styles.commentDeleteBtn}
                            >
                              <Ionicons name="trash-outline" size={14} color={Palette.red.main} />
                            </TouchableOpacity>
                          )}
                        </View>
                        <Text style={[styles.commentText, { color: colors.text }]}>{c.text}</Text>
                      </View>
                      <View style={styles.commentFooter}>
                        <TouchableOpacity
                          onPress={() => toggleLikeComment(post.id, c.id)}
                          style={styles.commentLikeBtn}
                          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                          <Ionicons
                            name={hasLikedComment ? 'heart' : 'heart-outline'}
                            size={14}
                            color={hasLikedComment ? Palette.red.main : colors.textSecondary}
                          />
                          <Text style={[styles.commentLikeCount, { color: hasLikedComment ? Palette.red.main : colors.textSecondary }]}>
                            {likeCount > 0 ? `${likeCount} Me gusta` : 'Me gusta'}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                })}
              </View>
            ) : (
              <Text style={{ color: colors.textSecondary, fontSize: Typography.size.sm, textAlign: 'center', marginBottom: Spacing.md }}>
                Sé el primero en comentar
              </Text>
            )}
            <View style={styles.commentInputContainer}>
              <LinearGradient colors={Gradients.primary as any} style={styles.commentInputAvatar}>
                {user?.photoURL ? (
                  <Image source={{ uri: user.photoURL }} style={{ width: '100%', height: '100%', borderRadius: 14 }} />
                ) : (
                  <Ionicons name="person" size={14} color="#FFF" />
                )}
              </LinearGradient>
              <TextInput
                style={[styles.commentInput, { color: colors.text, borderColor: colors.border, backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.03)' }]}
                placeholder="Escribe un comentario..."
                placeholderTextColor={colors.textSecondary}
                value={commentText}
                onChangeText={setCommentText}
              />
              <TouchableOpacity
                style={[styles.commentSubmit, { backgroundColor: commentText.trim().length > 0 ? colors.primary : colors.border }]}
                disabled={commentText.trim().length === 0}
                onPress={() => {
                  addComment(post.id, commentText);
                  setCommentText('');
                }}
              >
                <Ionicons name="send" size={14} color="#FFF" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </Animated.View>
  );
}

// Componente de Leaderboard Item
function LeaderboardItem({
  item,
  index,
}: {
  item: LeaderboardEntry;
  index: number;
}) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const getRankColor = () => {
    switch (item.rank) {
      case 1: return Gradients.gold;
      case 2: return Gradients.silver;
      case 3: return Gradients.bronze;
      default: return [colors.border, colors.border];
    }
  };

  const getChangeIcon = () => {
    switch (item.change) {
      case 'up': return { icon: 'caret-up', color: Palette.green.vibrant };
      case 'down': return { icon: 'caret-down', color: Palette.red.main };
      default: return { icon: 'remove', color: colors.textSecondary };
    }
  };

  const change = getChangeIcon();

  return (
    <Animated.View entering={FadeInRight.delay(index * 100).springify()}>
      <View
        style={[
          styles.leaderboardItem,
          { backgroundColor: colors.surface },
          item.isUser && { borderColor: colors.primary, borderWidth: 2 },
          Shadows.sm,
        ]}
      >
        {/* Rank */}
        <LinearGradient
          colors={getRankColor() as any}
          style={styles.rankBadge}
        >
          <Text style={styles.rankText}>{item.rank}</Text>
        </LinearGradient>

        {/* Info */}
        <View style={styles.leaderboardInfo}>
          <Text
            style={[
              styles.leaderboardName,
              { color: colors.text },
              item.isUser && { fontWeight: Typography.weight.bold },
            ]}
          >
            {item.name} {item.isUser && '(Tú)'}
          </Text>
          <Text style={[styles.leaderboardPoints, { color: colors.primary }]}>
            {item.points.toLocaleString()} pts
          </Text>
        </View>

        {/* Change indicator */}
        <Ionicons name={change.icon as any} size={16} color={change.color} />
      </View>
    </Animated.View>
  );
}

export default function SocialScreen() {
  const { posts, leaderboard, groups, addPost, user, savePost, editPost, deletePost, sendFriendRequest, createGroup, joinGroup, acceptFriendRequest, rejectFriendRequest } = useAppStore();
  const { user: authUser } = useAuth();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState('feed');
  const [newPostContent, setNewPostContent] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedAchievement, setSelectedAchievement] = useState<any>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [alertConfig, setAlertConfig] = useState<any>(null);

  const [selectedImageFull, setSelectedImageFull] = useState<string | null>(null);
  const [showAchievementActionSheet, setShowAchievementActionSheet] = useState(false);

  // Custom Achievement State
  const [showCustomAchievementModal, setShowCustomAchievementModal] = useState(false);
  const [customAchievementText, setCustomAchievementText] = useState('');

  // Pull to refresh state
  const [refreshing, setRefreshing] = useState(false);

  // Since AppProvider uses onSnapshot, data updates in real-time automatically.
  // We simulate a refresh delay to provide the expected UX feedback.
  const handleRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1200);
  }, []);

  const ACHIEVEMENT_TEMPLATES = [
    { id: "a1", title: "Reciclador Destacado", icon: "star" },
    { id: "a2", title: "Salvador del Océano", icon: "water" },
    { id: "a3", title: "Líder Verde", icon: "leaf" },
    { id: "a4", title: "Guardián de la Tierra", icon: "globe" },
    { id: "custom", title: "Escribir mi propio logro...", icon: "pencil" }
  ];

  // Edit State
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [editContent, setEditContent] = useState('');

  // Profile Modal
  const [selectedProfile, setSelectedProfile] = useState<{ id: string; author: Post['author'] } | null>(null);

  // Group Creation Modal
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDesc, setNewGroupDesc] = useState('');

  // Add Friend state
  const [addFriendInput, setAddFriendInput] = useState('');

  const showFeatureAlert = (feature: string) => {
    let iconName = 'construct';
    let gradient: readonly string[] = Gradients.primary;

    if (feature === 'Foto') iconName = 'image';
    if (feature === 'Logro') { iconName = 'trophy'; gradient = Gradients.gold; }
    if (feature === 'Comentarios') iconName = 'chatbubble';
    if (feature === 'Compartir') { iconName = 'share'; gradient = Gradients.ocean; }

    setAlertConfig({
      visible: true,
      title: `📸 Función en desarrollo: ${feature}`,
      message: `La función de ${feature.toLowerCase()} estará disponible en la próxima versión. ¡Sigue reciclando!`,
      icon: iconName,
      iconGradient: [...gradient],
      primaryButtonText: 'Entendido',
      onPrimaryPress: () => setAlertConfig(null),
      onClose: () => setAlertConfig(null),
    });
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8, // Calidad inicial
      base64: false, // Pediremos el base64 al manipulador final, no aquí
    });

    if (!result.canceled) {
      // Reducir rígidamente la imagen a un tamaño máximo de 800px para cuidar la Payload limit de Firestore (1MB)
      const manipResult = await ImageManipulator.manipulateAsync(
        result.assets[0].uri,
        [{ resize: { width: 800 } }],
        { compress: 0.6, format: ImageManipulator.SaveFormat.JPEG, base64: true }
      );

      // Pasamos el string base64 concatenado con su mime type
      setSelectedImage(`data:image/jpeg;base64,${manipResult.base64}`);
    }
  };

  const pickAchievement = () => {
    setShowAchievementActionSheet(true);
  };

  const handlePublish = async () => {
    if (newPostContent.trim().length > 0 || selectedImage || selectedAchievement) {
      setIsPublishing(true);
      console.log('[UI_DEBUG] handlePublish accionado');
      try {
        await addPost(newPostContent, selectedImage, selectedAchievement);

        console.log('[UI_DEBUG] handlePublish terminó exitosamente');
        // Limpiar formulario asumiendo éxito
        setNewPostContent('');
        setSelectedImage(null);
        setSelectedAchievement(null);
      } catch (error: any) {
        console.error('[UI_DEBUG] Error atrapado en UI:', error);
        Alert.alert(
          "Error publicando",
          `No se pudo enviar tu publicación. Revisa tu conexión.\n\nDetalles:\n${error?.message || "Error desconocido"}`
        );
      } finally {
        console.log('[UI_DEBUG] Restaurando estado isPublishing a false');
        setIsPublishing(false);
      }
    }
  };

  const handleEditSave = async () => {
    if (editingPost && editContent.trim().length > 0) {
      try {
        await editPost(editingPost.id, editContent);
      } finally {
        setEditingPost(null);
        setEditContent('');
      }
    }
  };

  const startEditing = (post: Post) => {
    setEditingPost(post);
    setEditContent(post.content);
  };

  const handleAvatarPress = (userId: string, author: Post['author']) => {
    setSelectedProfile({ id: userId, author });
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'feed':
        return (
          <>
            {/* Crear post */}
            <Animated.View entering={FadeInDown.springify()}>
              <GradientCard
                colors={(colorScheme === 'dark' ? colors.cardSocial : ['#FFFFFF', '#FDF5FF']) as any}
                style={styles.createPostCard}
              >
                <View style={styles.createPostRow}>
                  <LinearGradient colors={Gradients.primary as any} style={styles.userAvatarSmall}>
                    {user?.photoURL ? (
                      <Image source={{ uri: user.photoURL }} style={styles.avatarImage} />
                    ) : (
                      <Ionicons name="person" size={20} color="#FFFFFF" />
                    )}
                  </LinearGradient>
                  <TextInput
                    style={[styles.createPostInput, { color: colors.text }]}
                    placeholder="¿Qué lograste hoy?"
                    placeholderTextColor={colors.textSecondary}
                    value={newPostContent}
                    onChangeText={setNewPostContent}
                    multiline
                  />
                </View>

                {/* Previews */}
                {(selectedImage || selectedAchievement) && (
                  <View style={styles.postPreviewContainer}>
                    {selectedImage && (
                      <View style={styles.imagePreviewWrapper}>
                        <Image source={{ uri: selectedImage }} style={styles.imagePreview} />
                        <TouchableOpacity style={styles.removePreviewBtn} onPress={() => setSelectedImage(null)}>
                          <Ionicons name="close-circle" size={24} color={Palette.red.main} />
                        </TouchableOpacity>
                      </View>
                    )}
                    {selectedAchievement && (
                      <View style={styles.achievementPreviewWrapper}>
                        <Ionicons name={selectedAchievement.icon as any} size={20} color={Palette.yellow.dark} />
                        <Text style={[styles.achievementPreviewText, { color: colors.text }]}>{selectedAchievement.title}</Text>
                        <TouchableOpacity style={styles.removePreviewBtnSm} onPress={() => setSelectedAchievement(null)}>
                          <Ionicons name="close" size={16} color={colors.textSecondary} />
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                )}

                <View style={styles.createPostActions}>
                  <TouchableOpacity style={styles.createPostAction} onPress={pickImage}>
                    <Ionicons name="image" size={20} color={Palette.green.main} />
                    <Text style={[styles.createPostActionText, { color: colors.textSecondary }]}>
                      Foto
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.createPostAction} onPress={pickAchievement}>
                    <Ionicons name="trophy" size={20} color={Palette.yellow.dark} />
                    <Text style={[styles.createPostActionText, { color: colors.textSecondary }]}>
                      Logro
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.publishButton, { backgroundColor: colors.primary, opacity: (newPostContent.trim().length > 0 || selectedImage || selectedAchievement) && !isPublishing ? 1 : 0.5 }]}
                    onPress={handlePublish}
                    disabled={(newPostContent.trim().length === 0 && !selectedImage && !selectedAchievement) || isPublishing}
                  >
                    {isPublishing ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Text style={styles.publishButtonText}>Publicar</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </GradientCard>
            </Animated.View>

            {/* Posts */}
            {posts.map((post, index) => (
              <PostCard
                key={post.id}
                post={post}
                index={index}
                onAction={showFeatureAlert}
                onEdit={startEditing}
                onDelete={deletePost}
                onSave={savePost}
                onAvatarPress={setSelectedProfile}
                onImagePress={setSelectedImageFull}
              />
            ))}
          </>
        );

      case 'leaderboard':
        return (
          <>
            {/* Tu posición destacada */}
            <Animated.View entering={FadeInDown.springify()}>
              <GradientCard colors={Gradients.aurora as any} style={styles.userRankCard}>
                <View style={styles.userRankContent}>
                  <View>
                    <Text style={styles.userRankLabel}>Tu posición actual</Text>
                    <Text style={styles.userRankValue}>#{leaderboard.find(l => l.isUser)?.rank || '-'}</Text>
                  </View>
                  <View style={styles.userRankStats}>
                    <View style={styles.userRankStat}>
                      <Text style={styles.userRankStatValue}>{user.xp.toLocaleString()}</Text>
                      <Text style={styles.userRankStatLabel}>Puntos</Text>
                    </View>
                    <View style={styles.userRankStat}>
                      <Text style={styles.userRankStatValue}>↑ 2</Text>
                      <Text style={styles.userRankStatLabel}>Esta semana</Text>
                    </View>
                  </View>
                </View>
              </GradientCard>
            </Animated.View>

            {/* Leaderboard */}
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Top Recicladores
              </Text>
              <TouchableOpacity>
                <Text style={[styles.seeAllText, { color: colors.primary }]}>Ver todos</Text>
              </TouchableOpacity>
            </View>

            {leaderboard.map((item, index) => (
              <LeaderboardItem key={item.rank} item={item} index={index} />
            ))}
          </>
        );

      case 'friends':
        return (
          <View style={{ paddingHorizontal: Spacing.md, paddingTop: Spacing.md }}>
            {/* Header con gradiente */}
            <Animated.View entering={FadeInDown.springify()}>
              <GradientCard colors={Gradients.ocean as any} style={{ padding: Spacing.lg, borderRadius: BorderRadius.xl, marginBottom: Spacing.lg }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.md }}>
                  <Ionicons name="people" size={28} color="#FFF" />
                  <Text style={{ fontSize: Typography.size.xl, fontWeight: 'bold', color: '#FFF', marginLeft: Spacing.sm }}>Mis Amigos</Text>
                </View>
                <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
                  <TextInput
                    style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: BorderRadius.pill, color: '#FFF', fontSize: Typography.size.sm }}
                    placeholder="ID de usuario para agregar..."
                    placeholderTextColor="rgba(255,255,255,0.6)"
                    value={addFriendInput}
                    onChangeText={setAddFriendInput}
                  />
                  <TouchableOpacity
                    style={{ backgroundColor: '#FFF', paddingHorizontal: Spacing.lg, justifyContent: 'center', borderRadius: BorderRadius.pill }}
                    onPress={() => {
                      if (addFriendInput.trim().length > 0) {
                        sendFriendRequest(addFriendInput.trim());
                        setAddFriendInput('');
                      }
                    }}
                  >
                    <Text style={{ color: Gradients.ocean[0], fontWeight: 'bold', fontSize: Typography.size.sm }}>Enviar</Text>
                  </TouchableOpacity>
                </View>
              </GradientCard>
            </Animated.View>

            {/* Solicitudes Pendientes */}
            {user?.pendingRequests && user.pendingRequests.length > 0 && (
              <Animated.View entering={FadeInDown.delay(100).springify()}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.md }}>
                  <IconBadge icon="notifications" size="small" colors={[...Gradients.sunset]} />
                  <Text style={{ fontSize: Typography.size.lg, fontWeight: 'bold', color: colors.text, marginLeft: Spacing.sm }}>
                    Solicitudes ({user.pendingRequests.length})
                  </Text>
                </View>
                {user.pendingRequests.map((reqId, idx) => (
                  <Animated.View key={reqId} entering={FadeInRight.delay(idx * 80).springify()}>
                    <View style={[styles.friendRequestCard, { backgroundColor: colors.surface }, Shadows.sm]}>
                      <LinearGradient colors={Gradients.sunset as any} style={styles.friendAvatar}>
                        <Ionicons name="person-add" size={18} color="#FFF" />
                      </LinearGradient>
                      <View style={{ flex: 1, marginLeft: Spacing.md }}>
                        <Text style={{ color: colors.text, fontWeight: 'bold', fontSize: Typography.size.md }}>User_{reqId.substring(0, 6)}</Text>
                        <Text style={{ color: colors.textSecondary, fontSize: Typography.size.sm }}>Quiere ser tu amigo</Text>
                      </View>
                      <View style={{ flexDirection: 'row', gap: Spacing.md }}>
                        <TouchableOpacity
                          onPress={() => acceptFriendRequest(reqId)}
                          style={[styles.friendActionBtn, { backgroundColor: Palette.green.main }]}
                        >
                          <Ionicons name="checkmark" size={18} color="#FFF" />
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => rejectFriendRequest(reqId)}
                          style={[styles.friendActionBtn, { backgroundColor: Palette.red.main }]}
                        >
                          <Ionicons name="close" size={18} color="#FFF" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </Animated.View>
                ))}
              </Animated.View>
            )}

            {/* Lista de Amigos */}
            <Animated.View entering={FadeInDown.delay(200).springify()}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.md, marginTop: Spacing.sm }}>
                <IconBadge icon="heart" size="small" colors={[...Gradients.primary]} />
                <Text style={{ fontSize: Typography.size.lg, fontWeight: 'bold', color: colors.text, marginLeft: Spacing.sm }}>
                  Amigos ({user?.friends?.length || 0})
                </Text>
              </View>

              {(!user?.friends || user.friends.length === 0) ? (
                <View style={styles.comingSoon}>
                  <Ionicons name="people-outline" size={56} color={colors.textSecondary} />
                  <Text style={[styles.comingSoonTitle, { color: colors.text }]}>Sin amigos aún</Text>
                  <Text style={[styles.comingSoonText, { color: colors.textSecondary }]}>Envía solicitudes usando el ID de tus amigos para conectar.</Text>
                </View>
              ) : (
                user.friends.map((friendId, idx) => (
                  <Animated.View key={friendId} entering={FadeInRight.delay(idx * 80).springify()}>
                    <View style={[styles.friendCard, { backgroundColor: colors.surface }, Shadows.sm]}>
                      <LinearGradient colors={Gradients.ocean as any} style={styles.friendAvatar}>
                        <Ionicons name="person" size={20} color="#FFF" />
                      </LinearGradient>
                      <View style={{ flex: 1, marginLeft: Spacing.md }}>
                        <Text style={{ color: colors.text, fontWeight: 'bold', fontSize: Typography.size.md }}>Usuario {friendId.substring(0, 6)}</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                          <Ionicons name="checkmark-circle" size={14} color={Palette.green.main} />
                          <Text style={{ color: Palette.green.main, fontSize: Typography.size.sm, marginLeft: 4 }}>Amigo</Text>
                        </View>
                      </View>
                      <TouchableOpacity
                        style={{ padding: Spacing.sm }}
                        onPress={() => router.push({ pathname: '/chat', params: { recipientId: friendId, recipientName: `Usuario ${friendId.substring(0, 6)}` } })}
                      >
                        <Ionicons name="chatbubble-ellipses-outline" size={22} color={colors.primary} />
                      </TouchableOpacity>
                    </View>
                  </Animated.View>
                ))
              )}
            </Animated.View>
          </View>
        );

      case 'groups':
        return (
          <View style={{ paddingHorizontal: Spacing.md, paddingTop: Spacing.md }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md }}>
              <Text style={{ fontSize: Typography.size.xl, fontWeight: 'bold', color: colors.text }}>Grupos Activos</Text>
              <TouchableOpacity onPress={() => setShowCreateGroup(true)} style={{ backgroundColor: Palette.purple.main, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 }}>
                <Text style={{ color: '#FFF', fontWeight: 'bold' }}>+ Crear Grupo</Text>
              </TouchableOpacity>
            </View>

            {groups.length === 0 ? (
              <View style={styles.comingSoon}>
                <Ionicons name="people-circle-outline" size={64} color={colors.textSecondary} />
                <Text style={[styles.comingSoonTitle, { color: colors.text }]}>Sin Grupos</Text>
                <Text style={[styles.comingSoonText, { color: colors.textSecondary }]}>Anímate a crear el primer grupo.</Text>
              </View>
            ) : (
              groups.map((group) => {
                const isMember = group.members.includes(authUser?.uid || '');
                return (
                  <View key={group.id} style={{ backgroundColor: colors.surface, padding: Spacing.lg, borderRadius: BorderRadius.xl, marginBottom: Spacing.md, ...Shadows.sm }}>
                    <Text style={{ fontSize: Typography.size.lg, fontWeight: 'bold', color: colors.text, marginBottom: 4 }}>{group.name}</Text>
                    <Text style={{ color: colors.textSecondary, marginBottom: Spacing.md }}>{group.description}</Text>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text style={{ color: Palette.purple.main, fontWeight: '600' }}>{group.members.length} miembros</Text>
                      {isMember ? (
                        <TouchableOpacity style={{ backgroundColor: colors.background, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 }}>
                          <Text style={{ color: colors.textSecondary, fontWeight: 'bold' }}>Ver Chat</Text>
                        </TouchableOpacity>
                      ) : (
                        <TouchableOpacity onPress={() => joinGroup(group.id)} style={{ backgroundColor: Palette.green.main, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 }}>
                          <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Unirme</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                );
              })
            )}
          </View>
        );

      default:
        return (
          <View style={styles.comingSoon}>
            <IconBadge icon="construct" size="large" colors={[...Gradients.sunrise]} />
            <Text style={[styles.comingSoonTitle, { color: colors.text }]}>
              Próximamente
            </Text>
            <Text style={[styles.comingSoonText, { color: colors.textSecondary }]}>
              Esta sección estará disponible pronto
            </Text>
          </View>
        );
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <LinearGradient
        colors={[Palette.purple.main, Palette.purple.light]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: insets.top + Spacing.md }]}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>Comunidad</Text>
            <Text style={styles.headerSubtitle}>Conecta con otros recicladores</Text>
          </View>
          <TouchableOpacity style={styles.notifButton} onPress={() => router.push('/chat' as any)}>
            <Ionicons name="chatbubbles-outline" size={24} color="#FFFFFF" />
            {user?.unreadMessages ? (
              <View style={styles.notifBadge}>
                <Text style={styles.notifBadgeText}>{user.unreadMessages > 99 ? '+99' : user.unreadMessages}</Text>
              </View>
            ) : null}
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsContainer}
        >
          {TABS.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              onPress={() => setActiveTab(tab.key)}
              style={[
                styles.tabButton,
                activeTab === tab.key && styles.tabButtonActive,
              ]}
            >
              <Ionicons
                name={tab.icon as any}
                size={18}
                color={activeTab === tab.key ? Palette.purple.main : '#FFFFFF'}
              />
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab.key && styles.tabTextActive,
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </LinearGradient>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {renderContent()}
      </ScrollView>

      {/* Edit Modal / Inline edit view */}
      {editingPost && (
        <View style={[styles.editOverlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
          <View style={[styles.editModal, { backgroundColor: colors.surface }]}>
            <Text style={[styles.editTitle, { color: colors.text }]}>Editar Publicación</Text>
            <TextInput
              style={[styles.editInput, { color: colors.text, borderColor: colors.border }]}
              value={editContent}
              onChangeText={setEditContent}
              multiline
              autoFocus
            />
            <View style={styles.editActions}>
              <TouchableOpacity onPress={() => setEditingPost(null)} style={styles.editCancelBtn}>
                <Text style={styles.editCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleEditSave} style={[styles.editSaveBtn, { backgroundColor: colors.primary }]}>
                <Text style={styles.editSaveText}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Profile Modal */}
      {selectedProfile && (
        <View style={[styles.editOverlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
          <View style={[styles.profileModal, { backgroundColor: colors.surface }]}>
            <View style={styles.profileModalHeader}>
              <LinearGradient
                colors={Gradients.primary as any}
                style={styles.profileModalAvatar}
              >
                {selectedProfile.author.avatar ? (
                  <Image source={{ uri: selectedProfile.author.avatar }} style={styles.avatarImage} />
                ) : (
                  <Text style={styles.avatarText}>
                    {selectedProfile.author.name.charAt(0).toUpperCase()}
                  </Text>
                )}
              </LinearGradient>
              <Text style={[styles.profileModalName, { color: colors.text }]}>{selectedProfile.author.name}</Text>
              <Text style={[styles.profileModalLevel, { color: colors.primary }]}>Nv. {selectedProfile.author.level} • {selectedProfile.author.badge}</Text>
            </View>

            <View style={styles.editActions}>
              <TouchableOpacity onPress={() => setSelectedProfile(null)} style={styles.editCancelBtn}>
                <Text style={styles.editCancelText}>Cerrar</Text>
              </TouchableOpacity>
              {selectedProfile.id !== user?.name && (
                <TouchableOpacity onPress={() => {
                  sendFriendRequest(selectedProfile.id);
                  setSelectedProfile(null);
                }} style={[styles.editSaveBtn, { backgroundColor: colors.primary }]}>
                  <Text style={styles.editSaveText}>
                    {user?.friends?.includes(selectedProfile.id) ? 'Amigos' : 'Agregar Amigo'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      )}

      {/* Create Group Modal */}
      {showCreateGroup && (
        <View style={[styles.editOverlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
          <View style={[styles.editModal, { backgroundColor: colors.surface }]}>
            <Text style={[styles.editTitle, { color: colors.text }]}>Nuevo Grupo</Text>
            <TextInput
              style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 12, color: colors.text, marginBottom: 12, fontSize: 16 }}
              placeholder="Nombre del grupo..."
              placeholderTextColor={colors.textSecondary}
              value={newGroupName}
              onChangeText={setNewGroupName}
              autoFocus
            />
            <TextInput
              style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 12, color: colors.text, marginBottom: 16, fontSize: 16, minHeight: 80, textAlignVertical: 'top' }}
              placeholder="Descripción (opcional)..."
              placeholderTextColor={colors.textSecondary}
              value={newGroupDesc}
              onChangeText={setNewGroupDesc}
              multiline
            />
            <View style={styles.editActions}>
              <TouchableOpacity onPress={() => setShowCreateGroup(false)} style={styles.editCancelBtn}>
                <Text style={styles.editCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => {
                if (newGroupName.trim().length > 0) {
                  createGroup(newGroupName, newGroupDesc);
                  setShowCreateGroup(false);
                  setNewGroupName('');
                  setNewGroupDesc('');
                }
              }} style={[styles.editSaveBtn, { backgroundColor: Palette.purple.main, opacity: newGroupName.trim().length > 0 ? 1 : 0.5 }]}>
                <Text style={styles.editSaveText}>Crear</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {alertConfig && <AlertModal {...alertConfig} />}

      <ActionSheet
        visible={showAchievementActionSheet}
        onClose={() => setShowAchievementActionSheet(false)}
        title="Selecciona un Logro"
        options={ACHIEVEMENT_TEMPLATES.map(a => a.title)}
        selectedValue={selectedAchievement?.title}
        onSelect={(value) => {
          if (value === "Escribir mi propio logro...") {
            setShowAchievementActionSheet(false);
            setTimeout(() => {
              setShowCustomAchievementModal(true);
            }, 300);
            return;
          }
          const achievement = ACHIEVEMENT_TEMPLATES.find(a => a.title === value);
          setSelectedAchievement(achievement || null);
          setShowAchievementActionSheet(false);
        }}
      />

      {/* Modal para Logro Personalizado */}
      <Modal visible={showCustomAchievementModal} transparent animationType="fade" onRequestClose={() => setShowCustomAchievementModal(false)}>
        <View style={[styles.editOverlay, { flex: 1 }]}>
          <TouchableWithoutFeedback onPress={() => setShowCustomAchievementModal(false)}>
            <View style={styles.backdrop} />
          </TouchableWithoutFeedback>
          <View style={[styles.editModal, { backgroundColor: colors.surface }]}>
            <Text style={[styles.editTitle, { color: colors.text }]}>Mi propio logro</Text>
            <TextInput
              style={[
                styles.editInput,
                { color: colors.text, borderColor: colors.border },
              ]}
              value={customAchievementText}
              onChangeText={setCustomAchievementText}
              placeholder="Ej. Limpié 3 playas hoy..."
              placeholderTextColor={colors.textSecondary}
              multiline
              autoFocus
              maxLength={40}
            />
            <View style={styles.editActions}>
              <TouchableOpacity
                onPress={() => setShowCustomAchievementModal(false)}
                style={styles.editCancelBtn}
              >
                <Text style={styles.editCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  if (customAchievementText.trim().length > 0) {
                    setSelectedAchievement({
                      id: "custom-" + Date.now(),
                      title: customAchievementText.trim(),
                      icon: "trophy"
                    });
                    setCustomAchievementText('');
                    setShowCustomAchievementModal(false);
                  }
                }}
                style={[
                  styles.editSaveBtn,
                  {
                    backgroundColor: customAchievementText.trim().length > 0 ? Palette.purple.main : colors.border,
                  },
                ]}
                disabled={customAchievementText.trim().length === 0}
              >
                <Text style={styles.editSaveText}>Aceptar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={!!selectedImageFull} transparent={true} animationType="fade" onRequestClose={() => setSelectedImageFull(null)}>
        <TouchableWithoutFeedback onPress={() => setSelectedImageFull(null)}>
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center' }}>
            {selectedImageFull && (
              <Image source={{ uri: selectedImageFull }} style={{ width: Dimensions.get('window').width, height: Dimensions.get('window').height * 0.8 }} contentFit="contain" />
            )}
            <TouchableOpacity style={{ position: 'absolute', top: 50, right: 20, padding: 10 }} onPress={() => setSelectedImageFull(null)}>
              <Ionicons name="close" size={32} color="#FFF" />
            </TouchableOpacity>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    borderBottomLeftRadius: BorderRadius.xxl,
    borderBottomRightRadius: BorderRadius.xxl,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  headerTitle: {
    fontSize: Typography.size.xxl,
    fontWeight: Typography.weight.bold,
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: Typography.size.sm,
    color: 'rgba(255,255,255,0.8)',
  },
  notifButton: {
    position: 'relative',
  },
  notifBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: Palette.red.main,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: Typography.weight.bold,
  },
  tabsContainer: {
    gap: Spacing.sm,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.pill,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  tabButtonActive: {
    backgroundColor: '#FFFFFF',
  },
  tabText: {
    color: '#FFFFFF',
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.medium,
    marginLeft: Spacing.xs,
  },
  tabTextActive: {
    color: Palette.purple.main,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: Spacing.lg,
  },
  createPostCard: {
    marginBottom: Spacing.lg,
  },
  createPostRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  userAvatarSmall: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  createPostInput: {
    flex: 1,
    fontSize: Typography.size.md,
  },
  createPostActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  createPostAction: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  createPostActionText: {
    fontSize: Typography.size.sm,
    marginLeft: Spacing.xs,
  },
  publishButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.pill,
  },
  publishButtonText: {
    color: '#FFFFFF',
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.semibold,
  },
  postCard: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.bold,
  },
  authorInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  authorNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  authorName: {
    fontSize: Typography.size.md,
    fontWeight: Typography.weight.semibold,
  },
  authorMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  levelBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  levelText: {
    fontSize: Typography.size.xs,
    fontWeight: Typography.weight.semibold,
  },
  postTime: {
    fontSize: Typography.size.sm,
    marginLeft: Spacing.xs,
  },
  moreButton: {
    padding: Spacing.xs,
  },
  postContent: {
    fontSize: Typography.size.md,
    lineHeight: 22,
    marginBottom: Spacing.sm,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  tagText: {
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.medium,
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.xs,
  },
  actionText: {
    fontSize: Typography.size.sm,
    marginLeft: Spacing.xs,
  },
  // Leaderboard styles
  userRankCard: {
    marginBottom: Spacing.lg,
  },
  userRankContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userRankLabel: {
    fontSize: Typography.size.sm,
    color: 'rgba(255,255,255,0.8)',
  },
  userRankValue: {
    fontSize: Typography.size.xxxl,
    fontWeight: Typography.weight.bold,
    color: '#FFFFFF',
  },
  userRankStats: {
    flexDirection: 'row',
    gap: Spacing.xl,
  },
  userRankStat: {
    alignItems: 'center',
  },
  userRankStatValue: {
    fontSize: Typography.size.xl,
    fontWeight: Typography.weight.bold,
    color: '#FFFFFF',
  },
  userRankStatLabel: {
    fontSize: Typography.size.xs,
    color: 'rgba(255,255,255,0.8)',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.bold,
  },
  seeAllText: {
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.medium,
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.sm,
  },
  rankBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  rankText: {
    color: '#FFFFFF',
    fontSize: Typography.size.md,
    fontWeight: Typography.weight.bold,
  },
  leaderboardInfo: {
    flex: 1,
  },
  leaderboardName: {
    fontSize: Typography.size.md,
  },
  leaderboardPoints: {
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.semibold,
  },
  // Coming soon
  comingSoon: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.huge,
  },
  comingSoonTitle: {
    fontSize: Typography.size.xl,
    fontWeight: Typography.weight.bold,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  comingSoonText: {
    fontSize: Typography.size.md,
    textAlign: 'center',
  },
  postPreviewContainer: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
    flexDirection: 'column',
    gap: Spacing.sm,
  },
  imagePreviewWrapper: {
    position: 'relative',
    height: 150,
    width: '100%',
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  removePreviewBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  achievementPreviewWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,193,7,0.1)',
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(255,193,7,0.3)',
  },
  achievementPreviewText: {
    flex: 1,
    marginLeft: Spacing.sm,
    fontWeight: Typography.weight.medium,
    fontSize: Typography.size.sm,
  },
  removePreviewBtnSm: {
    padding: 4,
  },
  commentsSection: {
    marginTop: Spacing.md,
    borderTopWidth: 1,
    paddingTop: Spacing.md,
    paddingHorizontal: Spacing.sm,
  },
  commentsList: {
    marginBottom: Spacing.md,
  },
  commentItem: {
    marginBottom: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
  },
  commentTop: {
    flex: 1,
  },
  commentAvatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  commentAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  commentAuthor: {
    fontWeight: Typography.weight.bold,
    fontSize: Typography.size.sm,
  },
  commentTime: {
    fontSize: 11,
  },
  commentText: {
    fontSize: Typography.size.sm,
    marginLeft: 32,
    marginTop: 2,
    lineHeight: 18,
  },
  commentFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 32,
    marginTop: Spacing.xs,
  },
  commentLikeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: BorderRadius.pill,
  },
  commentLikeCount: {
    fontSize: 12,
    marginLeft: 4,
  },
  commentDeleteBtn: {
    padding: 6,
    borderRadius: BorderRadius.sm,
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  commentInputAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: BorderRadius.pill,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    fontSize: Typography.size.sm,
  },
  commentSubmit: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Friends Tab
  friendRequestCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.xl,
    marginBottom: Spacing.sm,
  },
  friendCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.xl,
    marginBottom: Spacing.sm,
  },
  friendAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  friendActionBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  postImageContainer: {
    marginTop: Spacing.md,
    width: '100%',
    minHeight: 200,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
  },
  postImage: {
    width: '100%',
    height: '100%',
  },
  postAchievementCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.md,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  postAchievementIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  postAchievementLabel: {
    fontSize: 10,
    textTransform: 'uppercase',
    fontWeight: Typography.weight.bold,
  },
  postAchievementTitle: {
    fontSize: Typography.size.md,
    fontWeight: Typography.weight.bold,
  },
  profileModal: {
    width: '85%',
    padding: Spacing.xl,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
  },
  profileModalHeader: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  profileModalAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  profileModalName: {
    fontSize: Typography.size.xl,
    fontWeight: Typography.weight.bold,
    marginBottom: Spacing.xs,
  },
  profileModalLevel: {
    fontSize: Typography.size.md,
    fontWeight: Typography.weight.semibold,
  },
  editOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  editModal: {
    width: '90%',
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    ...Shadows.lg,
  },
  editTitle: {
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.bold,
    marginBottom: Spacing.md,
  },
  editInput: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    minHeight: 100,
    padding: Spacing.md,
    textAlignVertical: 'top',
    fontSize: Typography.size.md,
    marginBottom: Spacing.lg,
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.md,
  },
  editCancelBtn: {
    padding: Spacing.sm,
    justifyContent: 'center',
  },
  editCancelText: {
    fontSize: Typography.size.md,
    color: Palette.neutral.darkGray,
    fontWeight: '500',
  },
  editSaveBtn: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.pill,
    justifyContent: 'center',
  },
  editSaveText: {
    fontSize: Typography.size.md,
    color: '#FFF',
    fontWeight: 'bold',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
});