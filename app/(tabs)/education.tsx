import { AlertModal } from '@/components/ui/AlertModal';
import { AnimatedButton } from '@/components/ui/AnimatedButton';
import { CircularProgress } from '@/components/ui/CircularProgress';
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
import {
  CATEGORIES,
  COURSES_DATA,
  Course,
  FEATURED_ARTICLES,
  Lesson,
  RESOURCES,
} from '@/data/educationData';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppStore } from '@/store/AppProvider';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Dimensions,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInRight,
  FadeInUp,
  SlideInRight
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const STORAGE_KEY = '@ecotip_lesson_progress';

// ─── Lesson Content Viewer ──────────────────────────
function LessonViewer({
  lesson,
  courseGradient,
  lessonIndex,
  totalLessons,
  onClose,
  onComplete,
  isCompleted,
}: {
  lesson: Lesson;
  courseGradient: readonly string[];
  lessonIndex: number;
  totalLessons: number;
  onClose: () => void;
  onComplete: () => void;
  isCompleted: boolean;
}) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();

  return (
    <Modal visible animationType="none" onRequestClose={onClose}>
      <Animated.View
        entering={SlideInRight.springify().damping(20).stiffness(150)}
        style={[styles.fullScreen, { backgroundColor: colors.background }]}
      >
        {/* Header */}
        <LinearGradient
          colors={courseGradient as any}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.lessonHeader, { paddingTop: insets.top + Spacing.sm }]}
        >
          <View style={styles.lessonHeaderRow}>
            <TouchableOpacity onPress={onClose} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.lessonCounter}>
              {lessonIndex + 1} / {totalLessons}
            </Text>
            <View style={{ width: 36 }} />
          </View>
          <Animated.View entering={FadeInDown.delay(100).springify()}>
            <View style={styles.lessonHeaderIconRow}>
              <View style={styles.lessonHeaderIconBg}>
                <Ionicons name={lesson.icon as any} size={24} color="#FFFFFF" />
              </View>
              <View style={{ flex: 1, marginLeft: Spacing.md }}>
                <Text style={styles.lessonHeaderTitle}>{lesson.title}</Text>
                <Text style={styles.lessonHeaderDuration}>
                  <Ionicons name="time-outline" size={12} color="rgba(255,255,255,0.8)" />{' '}
                  {lesson.duration}
                </Text>
              </View>
            </View>
          </Animated.View>
          {/* Progress bar */}
          <View style={styles.lessonProgressTrack}>
            <View
              style={[
                styles.lessonProgressFill,
                { width: `${((lessonIndex + 1) / totalLessons) * 100}%` },
              ]}
            />
          </View>
        </LinearGradient>

        {/* Content */}
        <ScrollView
          style={styles.lessonScroll}
          contentContainerStyle={[
            styles.lessonScrollContent,
            { paddingBottom: insets.bottom + 120 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View entering={FadeInUp.delay(200).springify()}>
            {lesson.content.split('\n\n').map((paragraph, i) => (
              <Text
                key={i}
                style={[
                  styles.lessonParagraph,
                  { color: colors.text },
                  paragraph.startsWith('•') && styles.lessonBullet,
                ]}
              >
                {paragraph}
              </Text>
            ))}
          </Animated.View>
        </ScrollView>

        {/* Bottom button */}
        <Animated.View
          entering={FadeInUp.delay(300).springify()}
          style={[
            styles.lessonBottom,
            {
              paddingBottom: insets.bottom + Spacing.md,
              backgroundColor:
                colorScheme === 'dark'
                  ? 'rgba(10,31,10,0.95)'
                  : 'rgba(255,255,255,0.95)',
            },
          ]}
        >
          {isCompleted ? (
            <View style={styles.completedRow}>
              <Ionicons name="checkmark-circle" size={22} color={Palette.green.main} />
              <Text style={[styles.completedLabel, { color: Palette.green.main }]}>
                Lección completada
              </Text>
            </View>
          ) : (
            <AnimatedButton
              title="Marcar como completada"
              onPress={onComplete}
              icon="checkmark-circle"
            />
          )}
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

// ─── Course Detail Modal ─────────────────────────────
function CourseDetail({
  course,
  completedLessons,
  onClose,
  onOpenLesson,
}: {
  course: Course;
  completedLessons: Set<string>;
  onClose: () => void;
  onOpenLesson: (lesson: Lesson, index: number) => void;
}) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();

  const done = course.lessons.filter((l) => completedLessons.has(l.id)).length;
  const progress = (done / course.lessons.length) * 100;

  return (
    <Modal visible animationType="none" onRequestClose={onClose}>
      <View style={[styles.fullScreen, { backgroundColor: colors.background }]}>
        {/* Header */}
        <LinearGradient
          colors={course.gradient as any}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.courseDetailHeader, { paddingTop: insets.top + Spacing.sm }]}
        >
          <Animated.View entering={FadeIn.duration(200)}>
            <View style={styles.courseDetailHeaderRow}>
              <TouchableOpacity onPress={onClose} style={styles.backBtn}>
                <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
              </TouchableOpacity>
              <View style={styles.courseDetailBadges}>
                <View style={styles.levelPill}>
                  <Ionicons name="school" size={12} color="#FFFFFF" />
                  <Text style={styles.levelPillText}>{course.level}</Text>
                </View>
                <View style={styles.xpPill}>
                  <Ionicons name="star" size={12} color={Palette.yellow.gold} />
                  <Text style={styles.xpPillText}>{course.xp} XP</Text>
                </View>
              </View>
            </View>

            <View style={styles.courseDetailTitleSection}>
              <View style={styles.courseDetailIconBg}>
                <Ionicons name={course.icon as any} size={30} color="#FFFFFF" />
              </View>
              <Text style={styles.courseDetailTitle}>{course.title}</Text>
              <Text style={styles.courseDetailDesc}>{course.description}</Text>
            </View>

            {/* Progress */}
            <View style={styles.courseDetailProgressRow}>
              <View style={{ flex: 1 }}>
                <View style={styles.courseDetailProgressHeader}>
                  <Text style={styles.courseDetailProgressLabel}>
                    {done} de {course.lessons.length} lecciones
                  </Text>
                  <Text style={styles.courseDetailProgressPercent}>
                    {Math.round(progress)}%
                  </Text>
                </View>
                <View style={styles.courseDetailProgressTrack}>
                  <View
                    style={[
                      styles.courseDetailProgressFill,
                      { width: `${progress}%` },
                    ]}
                  />
                </View>
              </View>
              <View style={styles.courseDetailTimeBox}>
                <Ionicons name="time" size={16} color="#FFFFFF" />
                <Text style={styles.courseDetailTimeText}>{course.duration}</Text>
              </View>
            </View>
          </Animated.View>
        </LinearGradient>

        {/* Lesson list */}
        <ScrollView
          style={styles.lessonList}
          contentContainerStyle={[
            styles.lessonListContent,
            { paddingBottom: insets.bottom + 100 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <Text style={[styles.lessonListTitle, { color: colors.text }]}>Lecciones</Text>

          {course.lessons.map((lesson, index) => {
            const isDone = completedLessons.has(lesson.id);
            return (
              <Animated.View
                key={lesson.id}
                entering={FadeInDown.delay(index * 60).springify()}
              >
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => onOpenLesson(lesson, index)}
                  style={[
                    styles.lessonRow,
                    {
                      backgroundColor: isDone
                        ? colors.primary + '10'
                        : colorScheme === 'dark'
                          ? 'rgba(255,255,255,0.04)'
                          : 'rgba(0,0,0,0.02)',
                      borderColor: isDone ? colors.primary + '30' : colors.border,
                    },
                  ]}
                >
                  {/* Number / Check */}
                  <View
                    style={[
                      styles.lessonNumber,
                      {
                        backgroundColor: isDone
                          ? colors.primary
                          : colorScheme === 'dark'
                            ? 'rgba(255,255,255,0.08)'
                            : 'rgba(0,0,0,0.06)',
                      },
                    ]}
                  >
                    {isDone ? (
                      <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                    ) : (
                      <Text
                        style={[
                          styles.lessonNumberText,
                          { color: colors.textSecondary },
                        ]}
                      >
                        {index + 1}
                      </Text>
                    )}
                  </View>

                  {/* Info */}
                  <View style={{ flex: 1 }}>
                    <Text
                      style={[
                        styles.lessonRowTitle,
                        {
                          color: isDone ? colors.primary : colors.text,
                          fontWeight: isDone
                            ? Typography.weight.bold
                            : Typography.weight.medium,
                        },
                      ]}
                    >
                      {lesson.title}
                    </Text>
                    <Text
                      style={[styles.lessonRowDuration, { color: colors.textSecondary }]}
                    >
                      {lesson.duration}
                    </Text>
                  </View>

                  <Ionicons
                    name={isDone ? 'checkmark-circle' : 'chevron-forward'}
                    size={20}
                    color={isDone ? colors.primary : colors.textSecondary}
                  />
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </ScrollView>
      </View>
    </Modal>
  );
}

// ─── Main Screen ─────────────────────────────────────
export default function EducationScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const { addNotification, addXp } = useAppStore();
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Progress
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());

  // Modals
  const [activeCourse, setActiveCourse] = useState<Course | null>(null);
  const [activeLesson, setActiveLesson] = useState<{
    lesson: Lesson;
    index: number;
    course: Course;
  } | null>(null);
  const [alertConfig, setAlertConfig] = useState<any>(null);
  const [activeArticle, setActiveArticle] = useState<typeof FEATURED_ARTICLES[0] | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (raw) setCompletedLessons(new Set(JSON.parse(raw)));
    });
  }, []);

  const markComplete = useCallback(
    async (lessonId: string) => {
      const next = new Set(completedLessons);
      next.add(lessonId);
      setCompletedLessons(next);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
    },
    [completedLessons],
  );

  const getDoneCount = (c: Course) =>
    c.lessons.filter((l) => completedLessons.has(l.id)).length;
  const isCourseComplete = (c: Course) => getDoneCount(c) === c.lessons.length;

  const completedCourses = COURSES_DATA.filter(isCourseComplete).length;
  const totalXP = COURSES_DATA.filter(isCourseComplete).reduce(
    (s, c) => s + c.xp,
    0,
  );

  const filteredCourses =
    selectedCategory === 'all'
      ? COURSES_DATA
      : COURSES_DATA.filter((c) => c.category === selectedCategory);

  const openLesson = (lesson: Lesson, index: number, course: Course) => {
    setActiveLesson({ lesson, index, course });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <LinearGradient
        colors={[Palette.blue.main, Palette.blue.light]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: insets.top + Spacing.md }]}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>Aprende</Text>
            <Text style={styles.headerSubtitle}>Conocimiento que transforma</Text>
          </View>
          <View style={styles.headerStats}>
            <View style={styles.headerStat}>
              <Text style={styles.headerStatValue}>{completedCourses}</Text>
              <Text style={styles.headerStatLabel}>Cursos</Text>
            </View>
            <View style={styles.headerStatDivider} />
            <View style={styles.headerStat}>
              <Text style={styles.headerStatValue}>{totalXP}</Text>
              <Text style={styles.headerStatLabel}>XP</Text>
            </View>
          </View>
        </View>

        <View style={styles.overallProgress}>
          <View style={styles.progressCircleContainer}>
            <CircularProgress
              progress={(completedCourses / COURSES_DATA.length) * 100}
              size={80}
              strokeWidth={8}
              gradientColors={['#FFFFFF', 'rgba(255,255,255,0.7)']}
            />
          </View>
          <View style={styles.progressTextContainer}>
            <Text style={styles.progressMainText}>
              {completedCourses} de {COURSES_DATA.length} cursos completados
            </Text>
            <Text style={styles.progressSubText}>
              ¡Sigue así! Estás en el camino correcto 🌟
            </Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Categories */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContainer}
        >
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.key}
              onPress={() => setSelectedCategory(cat.key)}
              style={[
                styles.categoryButton,
                selectedCategory === cat.key && {
                  backgroundColor: cat.color + '20',
                },
              ]}
            >
              <Ionicons
                name={cat.icon as any}
                size={18}
                color={
                  selectedCategory === cat.key ? cat.color : colors.textSecondary
                }
              />
              <Text
                style={[
                  styles.categoryText,
                  {
                    color:
                      selectedCategory === cat.key
                        ? cat.color
                        : colors.textSecondary,
                  },
                ]}
              >
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Featured articles */}
        <Animated.View entering={FadeInDown.delay(100).springify()}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <IconBadge icon="flash" size="small" colors={[...Gradients.sunrise]} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Lecturas Rápidas
              </Text>
            </View>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.articlesScroll}
          >
            {FEATURED_ARTICLES.map((article, index) => (
              <Animated.View
                key={article.id}
                entering={FadeInRight.delay(index * 150).springify()}
              >
                <TouchableOpacity activeOpacity={0.9} onPress={() => setActiveArticle(article)}>
                  <LinearGradient
                    colors={article.gradient as any}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[styles.articleCard, Shadows.md]}
                  >
                    <View style={styles.articleContent}>
                      <Text style={styles.articleEmoji}>{article.emoji}</Text>
                      <Text style={styles.articleTitle}>{article.title}</Text>
                      <View style={styles.articleMeta}>
                        <Ionicons
                          name="time-outline"
                          size={13}
                          color="rgba(255,255,255,0.8)"
                        />
                        <Text style={styles.articleReadTime}>
                          {article.readTime}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.articleArrow}>
                      <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </ScrollView>
        </Animated.View>

        {/* Courses */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <IconBadge icon="book" size="small" colors={[...Gradients.ocean]} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Cursos</Text>
          </View>
        </View>

        {filteredCourses.map((course, index) => {
          const done = getDoneCount(course);
          const progress = (done / course.lessons.length) * 100;
          const completed = isCourseComplete(course);

          return (
            <Animated.View
              key={course.id}
              entering={FadeInDown.delay(index * 100).springify()}
            >
              <TouchableOpacity
                activeOpacity={0.95}
                onPress={() => setActiveCourse(course)}
                style={[styles.courseCard, { backgroundColor: colors.surface }, Shadows.md]}
              >
                <LinearGradient
                  colors={(course.gradient as any) as any}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.courseHeader}
                >
                  <View style={styles.courseIconContainer}>
                    <Ionicons name={course.icon as any} size={28} color="#FFFFFF" />
                  </View>
                  {completed ? (
                    <View style={styles.completedBadge}>
                      <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" />
                      <Text style={styles.completedText}>Completado</Text>
                    </View>
                  ) : (
                    <View style={styles.xpBadge}>
                      <Ionicons name="star" size={14} color={Palette.yellow.gold} />
                      <Text style={styles.xpText}>{course.xp} XP</Text>
                    </View>
                  )}
                </LinearGradient>

                <View style={styles.courseContent}>
                  <View style={styles.courseLevelRow}>
                    <View style={[styles.levelTag, { backgroundColor: colors.primary + '20' }]}>
                      <Text style={[styles.levelTagText, { color: colors.primary }]}>
                        {course.level}
                      </Text>
                    </View>
                    <Text style={[styles.courseDuration, { color: colors.textSecondary }]}>
                      <Ionicons name="time-outline" size={14} /> {course.duration}
                    </Text>
                  </View>
                  <Text style={[styles.courseTitle, { color: colors.text }]}>
                    {course.title}
                  </Text>
                  <Text
                    style={[styles.courseDescription, { color: colors.textSecondary }]}
                    numberOfLines={2}
                  >
                    {course.description}
                  </Text>

                  {/* Progress */}
                  <View style={styles.progressSection}>
                    <View style={styles.progressHeader}>
                      <Text style={[styles.progressLabel, { color: colors.textSecondary }]}>
                        {done}/{course.lessons.length} lecciones
                      </Text>
                      <Text style={[styles.progressPercent, { color: colors.primary }]}>
                        {Math.round(progress)}%
                      </Text>
                    </View>
                    <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
                      <LinearGradient
                        colors={(course.gradient as any) as any}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={[styles.progressFill, { width: `${progress}%` }]}
                      />
                    </View>
                  </View>

                  <TouchableOpacity
                    style={[styles.courseButton, { backgroundColor: colors.primary }]}
                    onPress={() => setActiveCourse(course)}
                  >
                    <Text style={styles.courseButtonText}>
                      {completed ? 'Repasar' : progress > 0 ? 'Continuar' : 'Comenzar'}
                    </Text>
                    <Ionicons
                      name={completed ? 'refresh' : 'arrow-forward'}
                      size={18}
                      color="#FFFFFF"
                    />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            </Animated.View>
          );
        })}

        {/* Resources */}
        <Animated.View entering={FadeInUp.delay(300).springify()}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <IconBadge icon="folder" size="small" colors={[...Gradients.primary]} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Recursos Descargables
              </Text>
            </View>
          </View>
          <GradientCard colors={colorScheme === 'dark' ? [colors.surface, colors.surface] : ['#FFFFFF', '#F8FCFF']}>
            {RESOURCES.map((resource, index) => (
              <Animated.View key={resource.id} entering={FadeInRight.delay(index * 100).springify()}>
                <TouchableOpacity
                  style={[styles.resourceItem, { backgroundColor: colors.surface }, Shadows.sm]}
                  onPress={() => setAlertConfig({
                    visible: true,
                    title: '📥 Descarga Simulada',
                    message: `"${resource.title}" se ha guardado correctamente. En la versión final, se descargará el archivo ${resource.type} (${resource.size}) a tu dispositivo.`,
                    icon: 'checkmark-circle',
                    iconGradient: [...Gradients.primary],
                    primaryButtonText: 'Entendido',
                    onPrimaryPress: () => setAlertConfig(null),
                    onClose: () => setAlertConfig(null),
                  })}
                >
                  <View style={[styles.resourceIcon, { backgroundColor: resource.color + '20' }]}>
                    <Ionicons name={resource.icon as any} size={24} color={resource.color} />
                  </View>
                  <View style={styles.resourceInfo}>
                    <Text style={[styles.resourceTitle, { color: colors.text }]} numberOfLines={1}>
                      {resource.title}
                    </Text>
                    <Text style={[styles.resourceMeta, { color: colors.textSecondary }]}>
                      {resource.type} • {resource.size} • {resource.downloads.toLocaleString()} descargas
                    </Text>
                  </View>
                  <View style={[styles.downloadButton, { backgroundColor: colors.primary }]}>
                    <Ionicons name="download-outline" size={20} color="#FFFFFF" />
                  </View>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </GradientCard>
        </Animated.View>

        {/* Quiz */}
        <Animated.View entering={FadeInUp.delay(400).springify()}>
          <GradientCard colors={[...Gradients.aurora]} style={styles.quizCard}>
            <View style={styles.quizContent}>
              <View style={styles.quizIcon}>
                <Ionicons name="help-circle" size={40} color="#FFFFFF" />
              </View>
              <View style={styles.quizInfo}>
                <Text style={styles.quizTitle}>Quiz Diario</Text>
                <Text style={styles.quizSubtitle}>
                  Pon a prueba tus conocimientos y gana 50 XP
                </Text>
              </View>
            </View>
            <AnimatedButton
              title="Jugar Ahora"
              onPress={() =>
                setAlertConfig({
                  visible: true,
                  title: '¡Próximamente!',
                  message: 'El quiz diario estará disponible en la próxima actualización. ¡Sigue aprendiendo!',
                  icon: 'rocket',
                  iconGradient: [...Gradients.aurora],
                  primaryButtonText: 'Entendido',
                  onPrimaryPress: () => setAlertConfig(null),
                  onClose: () => setAlertConfig(null),
                })
              }
              variant="outline"
              icon="play"
              style={styles.quizButton}
            />
          </GradientCard>
        </Animated.View>
      </ScrollView>

      {/* Course Detail Modal */}
      {activeCourse && !activeLesson && (
        <CourseDetail
          course={activeCourse}
          completedLessons={completedLessons}
          onClose={() => setActiveCourse(null)}
          onOpenLesson={(lesson, index) =>
            openLesson(lesson, index, activeCourse)
          }
        />
      )}

      {/* Lesson Viewer Modal */}
      {activeLesson && (
        <LessonViewer
          lesson={activeLesson.lesson}
          courseGradient={activeLesson.course.gradient}
          lessonIndex={activeLesson.index}
          totalLessons={activeLesson.course.lessons.length}
          isCompleted={completedLessons.has(activeLesson.lesson.id)}
          onClose={() => setActiveLesson(null)}
          onComplete={() => {
            markComplete(activeLesson.lesson.id);
            // auto-advance if not last lesson
            const nextIndex = activeLesson.index + 1;
            if (nextIndex < activeLesson.course.lessons.length) {
              setTimeout(() => {
                setActiveLesson({
                  lesson: activeLesson.course.lessons[nextIndex],
                  index: nextIndex,
                  course: activeLesson.course,
                });
              }, 400);
            } else {
              setActiveLesson(null);
              if (
                getDoneCount(activeLesson.course) + 1 ===
                activeLesson.course.lessons.length
              ) {
                setTimeout(() => {
                  addXp(activeLesson.course.xp);
                  addNotification({
                    type: 'achievement',
                    title: '¡Curso Completado!',
                    message: `Has terminado "${activeLesson.course.title}" y ganado ${activeLesson.course.xp} XP.`,
                    actionable: false,
                    points: activeLesson.course.xp,
                    icon: 'school',
                    gradient: activeLesson.course.gradient
                  });
                  
                  setAlertConfig({
                    visible: true,
                    title: '🎉 ¡Curso Completado!',
                    message: `Has terminado "${activeLesson.course.title}" y ganado ${activeLesson.course.xp} XP. ¡Sigue así, campeón del reciclaje!`,
                    icon: 'trophy',
                    iconGradient: [...Gradients.gold],
                    primaryButtonText: '¡Genial!',
                    onPrimaryPress: () => setAlertConfig(null),
                    onClose: () => setAlertConfig(null),
                  });
                }, 500);
              }
            }
          }}
        />
      )}

      {/* Article Viewer Modal */}
      {activeArticle && (
        <Modal visible animationType="slide" onRequestClose={() => setActiveArticle(null)}>
          <View
            style={[styles.fullScreen, { backgroundColor: colors.background }]}
          >
            <LinearGradient
              colors={activeArticle.gradient as any}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.lessonHeader, { paddingTop: insets.top + Spacing.sm }]}
            >
              <View style={styles.lessonHeaderRow}>
                <TouchableOpacity onPress={() => setActiveArticle(null)} style={styles.backBtn}>
                  <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
                </TouchableOpacity>
                <View style={styles.articleReadTimeBadge}>
                  <Ionicons name="time-outline" size={14} color="rgba(255,255,255,0.9)" />
                  <Text style={styles.articleReadTimeBadgeText}>{activeArticle.readTime}</Text>
                </View>
                <View style={{ width: 36 }} />
              </View>
              <Animated.View entering={FadeInDown.delay(100).springify()}>
                <Text style={styles.articleViewerEmoji}>{activeArticle.emoji}</Text>
                <Text style={styles.articleViewerTitle}>{activeArticle.title}</Text>
              </Animated.View>
            </LinearGradient>

            <ScrollView
              style={styles.lessonScroll}
              contentContainerStyle={[styles.lessonScrollContent, { paddingBottom: insets.bottom + 80 }]}
              showsVerticalScrollIndicator={false}
            >
              <Animated.View entering={FadeInUp.delay(200).springify()}>
                {activeArticle.content.split('\n\n').map((paragraph: string, i: number) => (
                  <Text
                    key={i}
                    style={[styles.lessonParagraph, { color: colors.text }]}
                  >
                    {paragraph}
                  </Text>
                ))}
              </Animated.View>
            </ScrollView>
          </View>
        </Modal>
      )}

      {alertConfig && <AlertModal {...alertConfig} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  fullScreen: { flex: 1 },
  // Header
  header: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xl, borderBottomLeftRadius: BorderRadius.xxl, borderBottomRightRadius: BorderRadius.xxl },
  headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Spacing.lg },
  headerTitle: { fontSize: Typography.size.xxl, fontWeight: Typography.weight.bold, color: '#FFFFFF' },
  headerSubtitle: { fontSize: Typography.size.sm, color: 'rgba(255,255,255,0.8)' },
  headerStats: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: BorderRadius.lg, padding: Spacing.md },
  headerStat: { alignItems: 'center', paddingHorizontal: Spacing.md },
  headerStatValue: { fontSize: Typography.size.xl, fontWeight: Typography.weight.bold, color: '#FFFFFF' },
  headerStatLabel: { fontSize: Typography.size.xs, color: 'rgba(255,255,255,0.8)' },
  headerStatDivider: { width: 1, height: 30, backgroundColor: 'rgba(255,255,255,0.3)' },
  overallProgress: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: BorderRadius.xl, padding: Spacing.md },
  progressCircleContainer: { marginRight: Spacing.md },
  progressTextContainer: { flex: 1 },
  progressMainText: { fontSize: Typography.size.md, fontWeight: Typography.weight.semibold, color: '#FFFFFF', marginBottom: Spacing.xs },
  progressSubText: { fontSize: Typography.size.sm, color: 'rgba(255,255,255,0.8)' },
  scrollView: { flex: 1, marginTop: -BorderRadius.lg },
  content: { padding: Spacing.lg, paddingTop: Spacing.xl },
  // Categories
  categoriesContainer: { paddingBottom: Spacing.md, gap: Spacing.sm },
  categoryButton: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: BorderRadius.pill, marginRight: Spacing.sm },
  categoryText: { fontSize: Typography.size.sm, fontWeight: Typography.weight.medium, marginLeft: Spacing.xs },
  // Section
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: Spacing.lg, marginBottom: Spacing.md },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center' },
  sectionTitle: { fontSize: Typography.size.lg, fontWeight: Typography.weight.bold, marginLeft: Spacing.sm },
  // Articles
  articlesScroll: { paddingRight: Spacing.lg },
  articleCard: { width: width * 0.7, height: 130, borderRadius: 20, padding: Spacing.lg, marginRight: Spacing.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  articleContent: { flex: 1 },
  articleEmoji: { fontSize: 24, marginBottom: Spacing.xs },
  articleTitle: { fontSize: Typography.size.md, fontWeight: Typography.weight.bold, color: '#FFFFFF', marginBottom: Spacing.sm },
  articleMeta: { flexDirection: 'row', alignItems: 'center' },
  articleReadTime: { fontSize: Typography.size.sm, color: 'rgba(255,255,255,0.8)', marginLeft: Spacing.xs },
  articleArrow: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  // Courses
  courseCard: { borderRadius: 20, overflow: 'hidden', marginBottom: Spacing.lg },
  courseHeader: { padding: Spacing.lg, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  courseIconContainer: { width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  completedBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: Spacing.sm, paddingVertical: Spacing.xs, borderRadius: BorderRadius.pill },
  completedText: { color: '#FFFFFF', fontSize: Typography.size.xs, fontWeight: Typography.weight.semibold, marginLeft: 4 },
  xpBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.2)', paddingHorizontal: Spacing.sm, paddingVertical: Spacing.xs, borderRadius: BorderRadius.pill },
  xpText: { color: '#FFFFFF', fontSize: Typography.size.xs, fontWeight: Typography.weight.bold, marginLeft: 4 },
  courseContent: { padding: Spacing.lg },
  courseLevelRow: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.sm },
  levelTag: { paddingHorizontal: Spacing.sm, paddingVertical: 2, borderRadius: BorderRadius.sm },
  levelTagText: { fontSize: Typography.size.xs, fontWeight: Typography.weight.semibold },
  courseDuration: { fontSize: Typography.size.sm, marginLeft: Spacing.sm },
  courseTitle: { fontSize: Typography.size.lg, fontWeight: Typography.weight.bold, marginBottom: Spacing.xs },
  courseDescription: { fontSize: Typography.size.sm, lineHeight: 20, marginBottom: Spacing.md },
  progressSection: { marginBottom: Spacing.md },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.xs },
  progressLabel: { fontSize: Typography.size.sm },
  progressPercent: { fontSize: Typography.size.sm, fontWeight: Typography.weight.semibold },
  progressTrack: { height: 8, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4 },
  courseButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: Spacing.md, borderRadius: 16, gap: Spacing.sm },
  courseButtonText: { color: '#FFFFFF', fontSize: Typography.size.md, fontWeight: Typography.weight.semibold },
  // Resources
  resourceItem: { flexDirection: 'row', alignItems: 'center', padding: Spacing.md, borderRadius: 16, marginBottom: Spacing.sm },
  resourceIcon: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: Spacing.md },
  resourceInfo: { flex: 1 },
  resourceTitle: { fontSize: Typography.size.md, fontWeight: Typography.weight.medium, marginBottom: 2 },
  resourceMeta: { fontSize: Typography.size.xs },
  downloadButton: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  // Quiz card
  quizCard: { marginTop: Spacing.lg },
  quizContent: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.md },
  quizIcon: { width: 70, height: 70, borderRadius: 35, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', marginRight: Spacing.md },
  quizInfo: { flex: 1 },
  quizTitle: { fontSize: Typography.size.xl, fontWeight: Typography.weight.bold, color: '#FFFFFF', marginBottom: Spacing.xs },
  quizSubtitle: { fontSize: Typography.size.sm, color: 'rgba(255,255,255,0.8)' },
  quizButton: { backgroundColor: 'rgba(255,255,255,0.9)', borderColor: 'transparent' },
  // Course Detail
  courseDetailHeader: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xl, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 },
  courseDetailHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.lg },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  courseDetailBadges: { flexDirection: 'row', gap: Spacing.sm },
  levelPill: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: Spacing.sm, paddingVertical: Spacing.xs, borderRadius: BorderRadius.pill, gap: 4 },
  levelPillText: { color: '#FFFFFF', fontSize: Typography.size.xs, fontWeight: Typography.weight.semibold },
  xpPill: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.2)', paddingHorizontal: Spacing.sm, paddingVertical: Spacing.xs, borderRadius: BorderRadius.pill, gap: 4 },
  xpPillText: { color: '#FFFFFF', fontSize: Typography.size.xs, fontWeight: Typography.weight.bold },
  courseDetailTitleSection: { alignItems: 'center', marginBottom: Spacing.lg },
  courseDetailIconBg: { width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.md },
  courseDetailTitle: { fontSize: Typography.size.xxl, fontWeight: Typography.weight.bold, color: '#FFFFFF', textAlign: 'center', marginBottom: Spacing.xs },
  courseDetailDesc: { fontSize: Typography.size.sm, color: 'rgba(255,255,255,0.85)', textAlign: 'center' },
  courseDetailProgressRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 16, padding: Spacing.md, gap: Spacing.md },
  courseDetailProgressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.xs },
  courseDetailProgressLabel: { fontSize: Typography.size.sm, color: 'rgba(255,255,255,0.9)' },
  courseDetailProgressPercent: { fontSize: Typography.size.sm, fontWeight: Typography.weight.bold, color: '#FFFFFF' },
  courseDetailProgressTrack: { height: 6, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 3, overflow: 'hidden' },
  courseDetailProgressFill: { height: '100%', backgroundColor: '#FFFFFF', borderRadius: 3 },
  courseDetailTimeBox: { alignItems: 'center', gap: 2 },
  courseDetailTimeText: { fontSize: Typography.size.xs, color: 'rgba(255,255,255,0.9)' },
  // Lesson List
  lessonList: { flex: 1 },
  lessonListContent: { padding: Spacing.lg },
  lessonListTitle: { fontSize: Typography.size.lg, fontWeight: Typography.weight.bold, marginBottom: Spacing.md },
  lessonRow: { flexDirection: 'row', alignItems: 'center', padding: Spacing.lg, borderRadius: 16, borderWidth: 1.5, marginBottom: Spacing.sm, gap: Spacing.md },
  lessonNumber: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  lessonNumberText: { fontSize: Typography.size.sm, fontWeight: Typography.weight.bold },
  lessonRowTitle: { fontSize: Typography.size.md, marginBottom: 2, letterSpacing: -0.2 },
  lessonRowDuration: { fontSize: Typography.size.xs },
  // Lesson Viewer
  lessonHeader: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.lg, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 },
  lessonHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.lg },
  lessonCounter: { fontSize: Typography.size.sm, fontWeight: Typography.weight.semibold, color: 'rgba(255,255,255,0.9)' },
  lessonHeaderIconRow: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.lg },
  lessonHeaderIconBg: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  lessonHeaderTitle: { fontSize: Typography.size.xl, fontWeight: Typography.weight.bold, color: '#FFFFFF' },
  lessonHeaderDuration: { fontSize: Typography.size.sm, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  lessonProgressTrack: { height: 4, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 2, overflow: 'hidden' },
  lessonProgressFill: { height: '100%', backgroundColor: '#FFFFFF', borderRadius: 2 },
  lessonScroll: { flex: 1 },
  lessonScrollContent: { padding: Spacing.xl },
  lessonParagraph: { fontSize: Typography.size.md, lineHeight: 24, marginBottom: Spacing.lg, letterSpacing: -0.1 },
  lessonBullet: { paddingLeft: Spacing.sm },
  lessonBottom: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: Spacing.xl, paddingTop: Spacing.md, ...Shadows.float },
  completedRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, paddingVertical: Spacing.md },
  completedLabel: { fontSize: Typography.size.md, fontWeight: Typography.weight.bold },
  // Article Viewer
  articleViewerEmoji: { fontSize: 40, marginBottom: Spacing.sm },
  articleViewerTitle: { fontSize: Typography.size.xxl, fontWeight: Typography.weight.bold, color: '#FFFFFF', marginBottom: Spacing.sm },
  articleReadTimeBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, borderRadius: BorderRadius.pill, gap: 4 },
  articleReadTimeBadgeText: { fontSize: Typography.size.xs, fontWeight: Typography.weight.semibold, color: 'rgba(255,255,255,0.9)' },
});