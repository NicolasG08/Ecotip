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
import { RecyclingLocation, useAppStore } from '@/store/AppProvider';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Dimensions,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInRight,
  FadeInUp,
  SlideInRight,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';

const { width, height } = Dimensions.get('window');

// Material type config with emojis and better labels
const LOCATION_TYPES = [
  { key: 'all', label: 'Todos', icon: 'apps-outline' as const, emoji: '🌍', color: Palette.green.main },
  { key: 'plastic', label: 'Plástico', icon: 'water-outline' as const, emoji: '🧴', color: Palette.blue.main },
  { key: 'paper', label: 'Papel', icon: 'newspaper-outline' as const, emoji: '📄', color: Palette.yellow.dark },
  { key: 'glass', label: 'Vidrio', icon: 'wine-outline' as const, emoji: '🍶', color: Palette.green.dark },
  { key: 'electronics', label: 'RAEE', icon: 'phone-portrait-outline' as const, emoji: '📱', color: Palette.purple.main },
];

// Get the icon for a material type
function getTypeIcon(type: string): string {
  const found = LOCATION_TYPES.find(t => t.key === type);
  return found?.emoji ?? '♻️';
}

// ─── Location Card ───────────────────────────────────────────────────
function LocationCard({
  location,
  index,
  isSelected,
  onSelect,
}: {
  location: RecyclingLocation;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const isDark = colorScheme === 'dark';

  const mainType = location.types[0];
  const typeInfo = LOCATION_TYPES.find(t => t.key === mainType);

  return (
    <Animated.View entering={FadeInDown.delay(index * 80).springify()}>
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onSelect}
        style={[
          styles.locationCard,
          {
            backgroundColor: isDark ? colors.surface : '#FFFFFF',
            borderColor: isSelected
              ? (typeInfo?.color ?? colors.primary)
              : isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
            borderWidth: isSelected ? 2 : 1,
          },
          Shadows.md,
        ]}
      >
        {/* Top row: icon + info + distance */}
        <View style={styles.cardTopRow}>
          <LinearGradient
            colors={location.gradient as any}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.cardIcon}
          >
            <Ionicons name="leaf" size={20} color="#FFF" />
          </LinearGradient>

          <View style={styles.cardInfo}>
            <Text style={[styles.cardName, { color: colors.text }]} numberOfLines={1}>
              {location.name}
            </Text>
            <View style={styles.cardAddressRow}>
              <Ionicons name="location-outline" size={12} color={colors.textSecondary} />
              <Text style={[styles.cardAddress, { color: colors.textSecondary }]} numberOfLines={1}>
                {location.address}
              </Text>
            </View>
          </View>

          <View style={[styles.distanceBadge, { backgroundColor: (typeInfo?.color ?? Palette.green.main) + '15' }]}>
            <Ionicons name="navigate-outline" size={12} color={typeInfo?.color ?? Palette.green.main} />
            <Text style={[styles.distanceText, { color: typeInfo?.color ?? Palette.green.main }]}>
              {location.distance}
            </Text>
          </View>
        </View>

        {/* Middle: rating + hours + favorite */}
        <View style={styles.cardMiddleRow}>
          <View style={styles.ratingChip}>
            <Ionicons name="star" size={12} color={Palette.yellow.gold} />
            <Text style={[styles.ratingValue, { color: colors.text }]}>{location.rating}</Text>
            <Text style={[styles.reviewCount, { color: colors.textSecondary }]}>
              ({location.reviews})
            </Text>
          </View>

          <View style={styles.hoursChip}>
            <View style={[
              styles.statusDot,
              { backgroundColor: location.isOpen ? Palette.green.vibrant : Palette.red.main },
            ]} />
            <Text style={[styles.hoursText, { color: colors.textSecondary }]}>
              {location.hours}
            </Text>
          </View>

          {location.isFavorite && (
            <View style={styles.favBadge}>
              <Ionicons name="heart" size={14} color={Palette.red.main} />
            </View>
          )}
        </View>

        {/* Material type pills */}
        <View style={styles.typePills}>
          {location.types.map(type => {
            const info = LOCATION_TYPES.find(t => t.key === type);
            if (!info) return null;
            return (
              <View
                key={type}
                style={[styles.typePill, { backgroundColor: info.color + '15' }]}
              >
                <Text style={styles.typePillEmoji}>{info.emoji}</Text>
                <Text style={[styles.typePillLabel, { color: info.color }]}>
                  {info.label}
                </Text>
              </View>
            );
          })}
        </View>

        {/* Expandable actions */}
        {isSelected && (
          <Animated.View entering={FadeInUp.springify()} style={styles.cardActions}>
            <TouchableOpacity style={[styles.primaryActionBtn, { backgroundColor: typeInfo?.color ?? colors.primary }]}>
              <Ionicons name="navigate" size={16} color="#FFF" />
              <Text style={styles.primaryActionText}>Cómo llegar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.iconActionBtn, { borderColor: (typeInfo?.color ?? colors.primary) + '40' }]}>
              <Ionicons name="call-outline" size={18} color={typeInfo?.color ?? colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.iconActionBtn, { borderColor: (typeInfo?.color ?? colors.primary) + '40' }]}>
              <Ionicons name="share-social-outline" size={18} color={typeInfo?.color ?? colors.primary} />
            </TouchableOpacity>
          </Animated.View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

// ─── Main Map Screen ─────────────────────────────────────────────────
export default function MapScreen() {
  const { locations } = useAppStore();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const isDark = colorScheme === 'dark';
  const insets = useSafeAreaInsets();
  const webViewRef = useRef<WebView>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      let location = await Location.getCurrentPositionAsync({});
      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    })();
  }, []);

  // ─── Bottom panel gesture ────────────
  const COLLAPSED = height * 0.38;
  const EXPANDED = height * 0.72;
  const listHeight = useSharedValue(COLLAPSED);
  const startHeight = useSharedValue(COLLAPSED);

  const panGesture = Gesture.Pan()
    .onStart(() => { startHeight.value = listHeight.value; })
    .onUpdate(e => {
      listHeight.value = Math.max(COLLAPSED, Math.min(EXPANDED, startHeight.value - e.translationY));
    })
    .onEnd(e => {
      const mid = (COLLAPSED + EXPANDED) / 2;
      if (e.velocityY < -400 || listHeight.value > mid) {
        listHeight.value = withSpring(EXPANDED, { damping: 20, stiffness: 120 });
      } else {
        listHeight.value = withSpring(COLLAPSED, { damping: 20, stiffness: 120 });
      }
    });

  const animatedPanelStyle = useAnimatedStyle(() => ({
    height: listHeight.value,
  }));

  // ─── Filtering (only affects card list, NOT the WebView) ─────
  const filteredLocations = useMemo(() => {
    return locations.filter(loc => {
      const matchType = selectedType === 'all' || loc.types.includes(selectedType);
      const q = searchQuery.toLowerCase();
      const matchSearch = !q || loc.name.toLowerCase().includes(q) || loc.address.toLowerCase().includes(q);
      return matchType && matchSearch;
    });
  }, [locations, selectedType, searchQuery]);

  // ─── Map HTML (rendered ONCE, does not depend on filters) ────
  const mapHtml = useMemo(() => {
    const allMarkersJson = JSON.stringify(locations);
    const lat = userLocation?.latitude ?? 4.6097;
    const lng = userLocation?.longitude ?? -74.0817;

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>
          * { margin:0; padding:0; box-sizing:border-box; }
          html, body, #map { height:100%; width:100%; }
          .recycling-marker {
            background: linear-gradient(135deg, ${Palette.green.main}, ${Palette.green.dark});
            border: 2.5px solid white;
            border-radius: 50%;
            box-shadow: 0 3px 8px rgba(0,0,0,0.35);
            width: 34px !important;
            height: 34px !important;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 16px;
            transition: transform 0.2s ease, opacity 0.3s ease;
          }
          .recycling-marker.hidden { opacity: 0; transform: scale(0); pointer-events: none; }
          .user-marker {
            background: linear-gradient(135deg, ${Palette.blue.main}, ${Palette.blue.dark});
            border: 3px solid white;
            border-radius: 50%;
            box-shadow: 0 0 0 8px rgba(33,150,243,0.2), 0 3px 8px rgba(0,0,0,0.35);
            width: 38px !important;
            height: 38px !important;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 18px;
            animation: userPulse 2s ease-in-out infinite;
          }
          @keyframes userPulse {
            0%, 100% { box-shadow: 0 0 0 8px rgba(33,150,243,0.2), 0 3px 8px rgba(0,0,0,0.35); }
            50% { box-shadow: 0 0 0 16px rgba(33,150,243,0.1), 0 3px 8px rgba(0,0,0,0.35); }
          }
          .leaflet-popup-content-wrapper { border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.15); }
          .leaflet-popup-content { margin: 12px 16px; font-family: -apple-system, BlinkMacSystemFont, sans-serif; }
          .popup-name { font-weight: 700; font-size: 14px; color: #1a1a2e; }
          .popup-addr { font-size: 12px; color: #666; margin-top: 4px; }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          const map = L.map('map', { zoomControl: false }).setView([${lat}, ${lng}], 12);
          L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
            maxZoom: 19,
            attribution: ''
          }).addTo(map);

          const allLocations = ${allMarkersJson};
          const markers = {};

          allLocations.forEach(loc => {
            const icon = L.divIcon({
              className: 'recycling-marker',
              html: '♻️',
              iconSize: [34, 34],
              iconAnchor: [17, 17]
            });
            const m = L.marker([loc.latitude, loc.longitude], { icon })
              .bindPopup('<div class="popup-name">' + loc.name + '</div><div class="popup-addr">' + loc.address + '</div>')
              .addTo(map);
            markers[loc.id] = m;
          });

          // User marker
          const userIcon = L.divIcon({
            className: 'user-marker',
            html: '📍',
            iconSize: [38, 38],
            iconAnchor: [19, 19]
          });
          L.marker([${lat}, ${lng}], { icon: userIcon }).addTo(map);

          // Initial fit
          if (allLocations.length > 0) {
            const bounds = L.latLngBounds(allLocations.map(l => [l.latitude, l.longitude]));
            bounds.extend([${lat}, ${lng}]);
            map.fitBounds(bounds, { padding: [50, 50], maxZoom: 13 });
          }

          // Listen for filter messages from RN
          document.addEventListener('message', handleMessage);
          window.addEventListener('message', handleMessage);

          function handleMessage(e) {
            try {
              const data = JSON.parse(e.data);
              if (data.type === 'filter') {
                const visibleIds = new Set(data.ids);
                Object.keys(markers).forEach(id => {
                  const el = markers[id].getElement();
                  if (el) {
                    const icon = el.querySelector('.recycling-marker');
                    if (icon) {
                      if (visibleIds.has(id)) {
                        icon.classList.remove('hidden');
                      } else {
                        icon.classList.add('hidden');
                      }
                    }
                  }
                });
              }
            } catch(err) {}
          }
        </script>
      </body>
      </html>
    `;
  }, [locations, userLocation]);

  // Send filter updates to WebView (no re-render!)
  useEffect(() => {
    if (!mapReady || !webViewRef.current) return;
    const visibleIds = filteredLocations.map(l => l.id);
    const msg = JSON.stringify({ type: 'filter', ids: visibleIds });
    webViewRef.current.injectJavaScript(`
      try {
        const e = new MessageEvent('message', { data: '${msg.replace(/'/g, "\\'")}' });
        document.dispatchEvent(e);
      } catch(err) {}
      true;
    `);
  }, [filteredLocations, mapReady]);

  const handleWebViewLoad = useCallback(() => { setMapReady(true); }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* ── Map ── */}
      <View style={styles.mapContainer}>
        <WebView
          ref={webViewRef}
          source={{ html: mapHtml }}
          style={StyleSheet.absoluteFillObject}
          scrollEnabled={false}
          onLoad={handleWebViewLoad}
          javaScriptEnabled
        />

        {/* Map controls */}
        <View style={[styles.mapControls, { top: insets.top + Spacing.md }]}>
          <TouchableOpacity style={[styles.mapBtn, { backgroundColor: isDark ? colors.surface : '#FFF' }, Shadows.md]}>
            <Ionicons name="add" size={22} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.mapBtn, { backgroundColor: isDark ? colors.surface : '#FFF' }, Shadows.md]}>
            <Ionicons name="remove" size={22} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.mapBtn, styles.locateBtn, Shadows.md]}>
            <Ionicons name="locate" size={22} color="#FFF" />
          </TouchableOpacity>
        </View>

        {/* Search bar */}
        <View style={[styles.searchBar, { top: insets.top + Spacing.md }]}>
          <BlurView intensity={Platform.OS === 'ios' ? 80 : 120} tint={isDark ? 'dark' : 'light'} style={styles.searchBlur}>
            <View style={styles.searchInner}>
              <Ionicons name="search" size={18} color={colors.textSecondary} />
              <TextInput
                style={[styles.searchInput, { color: colors.text }]}
                placeholder="Buscar punto de reciclaje..."
                placeholderTextColor={colors.textSecondary}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                  <View style={[styles.clearBtn, { backgroundColor: colors.textSecondary + '30' }]}>
                    <Ionicons name="close" size={14} color={colors.textSecondary} />
                  </View>
                </TouchableOpacity>
              )}
            </View>
          </BlurView>
        </View>
      </View>

      {/* ── Bottom Panel ── */}
      <Animated.View style={[styles.bottomPanel, animatedPanelStyle]}>
        <View style={[
          styles.panelContainer,
          { backgroundColor: isDark ? colors.surface : '#FAFCFF' },
        ]}>
          {/* Fixed-height zone (handle + header + filters) */}
          {/* Drag handle */}
          <GestureDetector gesture={panGesture}>
            <Animated.View style={styles.dragZone}>
              <View style={styles.handleRow}>
                <View style={[styles.handle, { backgroundColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.12)' }]} />
              </View>

              {/* Header */}
              <View style={styles.panelHeader}>
                <View>
                  <Text style={[styles.panelTitle, { color: colors.text }]}>
                    Puntos de reciclaje
                  </Text>
                  <Text style={[styles.panelCount, { color: colors.textSecondary }]}>
                    {filteredLocations.length} {filteredLocations.length === 1 ? 'encontrado' : 'encontrados'}
                  </Text>
                </View>
                <View style={[styles.countBadge, { backgroundColor: Palette.green.main + '20' }]}>
                  <Ionicons name="leaf" size={14} color={Palette.green.main} />
                  <Text style={[styles.countBadgeText, { color: Palette.green.main }]}>
                    {locations.length}
                  </Text>
                </View>
              </View>
            </Animated.View>
          </GestureDetector>


          {/* Filter chips */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ flexGrow: 0, flexShrink: 0 }}
            contentContainerStyle={styles.filterRow}
          >
            {LOCATION_TYPES.map(type => {
              const active = selectedType === type.key;
              return (
                <TouchableOpacity
                  key={type.key}
                  activeOpacity={0.8}
                  onPress={() => setSelectedType(type.key)}
                  style={[
                    styles.filterChip,
                    active
                      ? { backgroundColor: type.color, borderColor: type.color }
                      : { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#FFF', borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)' },
                  ]}
                >
                  <Text style={styles.filterEmoji}>{type.emoji}</Text>
                  <Text style={[
                    styles.filterLabel,
                    { color: active ? '#FFF' : colors.textSecondary },
                    active && { fontWeight: '700' as any },
                  ]}>
                    {type.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Location cards - this is the only part that should flex */}
          <ScrollView
            style={styles.cardList}
            contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
            showsVerticalScrollIndicator={false}
          >
            {filteredLocations.length === 0 ? (
              <Animated.View entering={FadeIn} style={styles.emptyState}>
                <Text style={styles.emptyEmoji}>🔍</Text>
                <Text style={[styles.emptyTitle, { color: colors.text }]}>No se encontraron puntos</Text>
                <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                  Intenta con otro filtro o búsqueda
                </Text>
              </Animated.View>
            ) : (
              filteredLocations.map((location, index) => (
                <LocationCard
                  key={location.id}
                  location={location}
                  index={index}
                  isSelected={selectedLocation === location.id}
                  onSelect={() =>
                    setSelectedLocation(
                      selectedLocation === location.id ? null : location.id
                    )
                  }
                />
              ))
            )}
          </ScrollView>
        </View>
      </Animated.View>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1 },

  // Map
  mapContainer: { flex: 1, position: 'relative' },
  mapControls: {
    position: 'absolute',
    right: Spacing.md,
    gap: Spacing.sm,
  },
  mapBtn: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  locateBtn: {
    backgroundColor: Palette.green.main,
  },

  // Search
  searchBar: {
    position: 'absolute',
    left: Spacing.md,
    right: 66,
  },
  searchBlur: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  searchInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    fontWeight: '500',
  },
  clearBtn: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Bottom Panel
  bottomPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 20,
  },
  panelContainer: {
    flex: 1,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'hidden',
  },
  dragZone: {
    flexShrink: 0,
    paddingBottom: 4,
  },
  handleRow: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 8,
  },
  handle: {
    width: 36,
    height: 5,
    borderRadius: 3,
  },
  panelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  panelTitle: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  panelCount: {
    fontSize: 13,
    marginTop: 2,
  },
  countBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 4,
  },
  countBadgeText: {
    fontSize: 13,
    fontWeight: '700',
  },

  // Filters
  filterRow: {
    flexShrink: 0,
    paddingHorizontal: 20,
    paddingBottom: 14,
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  filterEmoji: {
    fontSize: 14,
  },
  filterLabel: {
    fontSize: 13,
    fontWeight: '600',
  },

  // Card List
  cardList: {
    flex: 1,
    paddingHorizontal: 16,
  },

  // Location Cards
  locationCard: {
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardInfo: {
    flex: 1,
    marginLeft: 12,
  },
  cardName: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  cardAddressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 3,
  },
  cardAddress: {
    fontSize: 12,
    flex: 1,
  },
  distanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    gap: 3,
    marginLeft: 8,
  },
  distanceText: {
    fontSize: 12,
    fontWeight: '700',
  },

  // Middle row
  cardMiddleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 10,
  },
  ratingChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  ratingValue: {
    fontSize: 13,
    fontWeight: '700',
  },
  reviewCount: {
    fontSize: 12,
  },
  hoursChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  hoursText: {
    fontSize: 12,
  },
  favBadge: {
    marginLeft: 'auto',
  },

  // Type pills
  typePills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 12,
  },
  typePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 4,
  },
  typePillEmoji: {
    fontSize: 12,
  },
  typePillLabel: {
    fontSize: 11,
    fontWeight: '600',
  },

  // Card Actions
  cardActions: {
    flexDirection: 'row',
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
    gap: 8,
  },
  primaryActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 14,
    gap: 6,
  },
  primaryActionText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
  iconActionBtn: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },

  // Empty state
  emptyState: {
    alignItems: 'center',
    paddingTop: 40,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  emptySubtitle: {
    fontSize: 14,
    marginTop: 4,
  },
});