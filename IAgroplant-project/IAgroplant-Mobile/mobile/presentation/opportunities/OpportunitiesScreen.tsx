import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  Modal,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from 'react-native';
import { useAuth } from '../auth/AuthContext';
import { useOpportunities, OpportunitiesFilters } from './OportunidadesViewModel';
import { Vaga } from '../../domain/entities/vaga.types';
import MapView, { Marker, Circle } from 'react-native-maps';

const CITY_COORDINATES: Record<string, { latitude: number; longitude: number; latitudeDelta: number; longitudeDelta: number }> = {
  teresina: { latitude: -5.0892, longitude: -42.8016, latitudeDelta: 0.12, longitudeDelta: 0.12 },
  floriano: { latitude: -6.7669, longitude: -43.0225, latitudeDelta: 0.12, longitudeDelta: 0.12 },
  parnaiba: { latitude: -2.9098, longitude: -41.7766, latitudeDelta: 0.12, longitudeDelta: 0.12 },
  parnaíba: { latitude: -2.9098, longitude: -41.7766, latitudeDelta: 0.12, longitudeDelta: 0.12 },
};

export function OpportunitiesScreen({ navigation, route }: any) {
  const { user, updateRole } = useAuth();
  const {
    vagas,
    candidaturas,
    filters,
    isLoading,
    isSubmitting,
    searchByRegion,
    updateCategoryFilter,
    applyToVaga,
    createVacancy,
    refresh,
  } = useOpportunities();

  const initialTab = route?.params?.initialTab === 'applications' ? 'applications' : 'list';
  const [activeTab, setActiveTab] = useState<'list' | 'applications'>(initialTab);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedVaga, setSelectedVaga] = useState<Vaga | null>(null);
  const [showMap, setShowMap] = useState(false);

  React.useEffect(() => {
    if (route?.params?.initialTab) {
      setActiveTab(route.params.initialTab);
    }
  }, [route?.params?.initialTab]);

  // Form State
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newRegion, setNewRegion] = useState('Teresina');
  const [newCulture, setNewCulture] = useState('Soja');
  const [newType, setNewType] = useState<'Estágio' | 'Emprego' | 'Freelance'>('Estágio');
  const [newSalary, setNewSalary] = useState('R$ 1.500,00');
  const [newDuration, setNewDuration] = useState('6 meses');

  // Simulated GPS Teleportation State
  const [simulatedCity, setSimulatedCity] = useState('Teresina');
  
  // Custom In-App Banner Notification State
  const [notification, setNotification] = useState<{ message: string; city: string; count: number } | null>(null);
  const notificationY = useRef(new Animated.Value(-150)).current;
  const hideTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const userRole = user?.role || 'Estudante';
  const isProducer = userRole.toLowerCase().includes('produtor');

  // Helper lists
  const cultures = ['Todos', 'Soja', 'Milho', 'Algodão', 'Café'];
  const types = ['Todos', 'Estágio', 'Emprego', 'Freelance'];

  // Geolocation Pins logic
  const getCoordsForIndex = (index: number) => {
    const coords = [
      { x: 50, y: 70 },
      { x: 190, y: 110 },
      { x: 110, y: 220 },
      { x: 250, y: 180 },
      { x: 160, y: 290 },
      { x: 70, y: 310 },
    ];
    return coords[index % coords.length];
  };

  const triggerNotification = (cityName: string, count: number) => {
    if (hideTimeout.current) {
      clearTimeout(hideTimeout.current);
    }
    
    // Reset banner position
    notificationY.setValue(-150);
    
    setNotification({
      message: `🔔 IAgroplant: Detectamos ${count} vaga(s) de estágio ativa(s) na região de ${cityName}! Toque para ver no mapa.`,
      city: cityName,
      count
    });

    Animated.spring(notificationY, {
      toValue: 20,
      useNativeDriver: true,
      tension: 40,
      friction: 8,
    }).start();

    hideTimeout.current = setTimeout(() => {
      Animated.timing(notificationY, {
        toValue: -150,
        duration: 350,
        useNativeDriver: true,
      }).start(() => {
        setNotification(null);
      });
    }, 4500);
  };

  const handleSimulateCity = (cityName: string) => {
    setSimulatedCity(cityName);
    // Filtra vagas locais daquela cidade para obter a contagem em tempo real
    const cityVacanciesCount = vagas.filter(
      (v) => v.region.toLowerCase() === cityName.toLowerCase()
    ).length;
    triggerNotification(cityName, cityVacanciesCount);
  };

  const handleCreate = async () => {
    if (!newTitle.trim() || !newDescription.trim() || !newSalary.trim() || !newDuration.trim()) {
      alert('Por favor, preencha todos os campos do formulário.');
      return;
    }

    const success = await createVacancy({
      title: newTitle,
      description: newDescription,
      region: newRegion,
      culture: newCulture,
      vacancy_type: newType,
      salary: newSalary,
      duration: newDuration,
      expires_at: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
    });

    if (success) {
      setShowCreateModal(false);
      // Reset form
      setNewTitle('');
      setNewDescription('');
      setNewRegion('Teresina');
      setNewCulture('Soja');
      setNewType('Estágio');
      setNewSalary('R$ 1.500,00');
      setNewDuration('6 meses');
    }
  };

  const getRoleStyle = (role: string) => {
    if (role.toLowerCase().includes('produtor')) return styles.roleProducer;
    if (role.toLowerCase().includes('estudante')) return styles.roleStudent;
    return styles.roleTechnician;
  };

  const getVacancyTypeBadgeStyle = (type: string) => {
    switch (type) {
      case 'Estágio': return styles.badgeEstagio;
      case 'Emprego': return styles.badgeEmprego;
      default: return styles.badgeFreelance;
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* ─── IN-APP PUSH NOTIFICATION BANNER (WOW FACTOR) ─────────────────── */}
      {notification && (
        <Animated.View style={[styles.notificationBanner, { transform: [{ translateY: notificationY }] }]}>
          <TouchableOpacity
            style={styles.notificationTouchable}
            activeOpacity={0.9}
            onPress={() => {
              setShowMap(true);
              setNotification(null);
            }}
          >
            <View style={styles.notificationIconBg}>
              <Text style={styles.notificationEmoji}>🌱</Text>
            </View>
            <View style={styles.notificationTextWrapper}>
              <Text style={styles.notificationTitle}>Oportunidades Próximas</Text>
              <Text style={styles.notificationBody} numberOfLines={2}>{notification.message}</Text>
            </View>
          </TouchableOpacity>
        </Animated.View>
      )}



      {/* Header Info */}
      <View style={styles.header}>
        <View style={{ flex: 1, marginRight: 8 }}>
          <Text style={styles.welcomeText}>Olá, {user?.name ?? 'Usuário'}!</Text>
          <View style={styles.userRoleRow}>
            <Text style={styles.userRoleDesc}>Seu perfil atual é: </Text>
            <Text style={[styles.userRoleValue, getRoleStyle(userRole)]}>{userRole}</Text>
          </View>
        </View>
        
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <TouchableOpacity
            style={styles.notificationHeaderBtn}
            onPress={() => navigation?.navigate('Notifications')}
          >
            <Text style={styles.notificationHeaderEmoji}>🔔</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.mapToggle} onPress={() => setShowMap(!showMap)}>
            <Text style={styles.mapToggleText}>{showMap ? '📋 Listar' : '🗺️ Ver Mapa'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ─── SIMULADOR DE GPS / LOCALIZAÇÃO (WOW FACTOR) ──────────────────── */}
      <View style={styles.gpsSimulatorContainer}>
        <Text style={styles.gpsSimulatorLabel}>📍 Localização Simulada (Teletransporte GPS):</Text>
        <View style={styles.gpsButtonsRow}>
          {['Teresina', 'Floriano', 'Parnaíba'].map((city) => (
            <TouchableOpacity
              key={city}
              style={[styles.gpsButton, simulatedCity.toLowerCase() === city.toLowerCase() && styles.gpsButtonActive]}
              onPress={() => handleSimulateCity(city)}
            >
              <Text style={[styles.gpsButtonText, simulatedCity.toLowerCase() === city.toLowerCase() && styles.gpsButtonTextActive]}>
                📍 {city}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Tabs Menu */}
      <View style={styles.tabsHeader}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'list' && styles.tabButtonActive]}
          onPress={() => setActiveTab('list')}
        >
          <Text style={[styles.tabButtonText, activeTab === 'list' && styles.tabButtonTextActive]}>
            🌱 Vagas Disponíveis ({vagas.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'applications' && styles.tabButtonActive]}
          onPress={() => setActiveTab('applications')}
        >
          <Text style={[styles.tabButtonText, activeTab === 'applications' && styles.tabButtonTextActive]}>
            💼 Minhas Candidaturas ({candidaturas.length})
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'list' ? (
        <>
          {/* Filters Area */}
          <View style={styles.filtersWrapper}>
            {/* Search by Region */}
            <View style={styles.searchBarContainer}>
              <Text style={styles.searchIcon}>🔍</Text>
              <TextInput
                style={styles.searchInput}
                placeholder="Buscar por região (ex: Teresina)..."
                placeholderTextColor="#9CA3AF"
                value={filters.region}
                onChangeText={searchByRegion}
              />
            </View>

            {/* Culture Chips */}
            <View style={styles.filterChipsRow}>
              <Text style={styles.filterChipsLabel}>Cultura:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {cultures.map((c) => (
                  <TouchableOpacity
                    key={c}
                    style={[styles.chip, filters.culture === c && styles.chipActive]}
                    onPress={() => updateCategoryFilter('culture', c)}
                  >
                    <Text style={[styles.chipText, filters.culture === c && styles.chipTextActive]}>{c}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Type Chips */}
            <View style={styles.filterChipsRow}>
              <Text style={styles.filterChipsLabel}>Tipo:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {types.map((t) => (
                  <TouchableOpacity
                    key={t}
                    style={[styles.chip, filters.vacancy_type === t && styles.chipActive]}
                    onPress={() => updateCategoryFilter('vacancy_type', t)}
                  >
                    <Text style={[styles.chipText, filters.vacancy_type === t && styles.chipTextActive]}>{t}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>

          {/* ─── MAP VISUALIZER REAL (WOW FACTOR) ────────────────────────────── */}
          {showMap ? (
            <View style={styles.mapContainer}>
              <View style={styles.mapHeaderRow}>
                <Text style={styles.mapTitle}>🗺️ Geolocalização em {simulatedCity}</Text>
                <View style={styles.mapStatusBadge}>
                  <Text style={styles.mapStatusBadgeText}>GPS: {simulatedCity}</Text>
                </View>
              </View>
              <View style={styles.mapCanvasContainer}>
                <MapView
                  style={styles.mapCanvasReal}
                  region={CITY_COORDINATES[simulatedCity.toLowerCase()] || CITY_COORDINATES.teresina}
                  scrollEnabled={true}
                  zoomEnabled={true}
                  pitchEnabled={false}
                  rotateEnabled={false}
                >
                  {/* Ponto central indicando "Você" */}
                  <Marker
                    coordinate={CITY_COORDINATES[simulatedCity.toLowerCase()] || CITY_COORDINATES.teresina}
                    title="Sua Localização"
                    description={`Você simulado em: ${simulatedCity}`}
                  >
                    <View style={styles.userMarkerContainer}>
                      <View style={styles.userMarkerPulse} />
                      <View style={styles.userMarkerCore} />
                    </View>
                  </Marker>

                  {vagas
                    .filter((v) => v.region.toLowerCase() === simulatedCity.toLowerCase() && v.latitude && v.longitude)
                    .map((pin) => {
                      // Check if pin is active in filter
                      const matchesCulture = filters.culture === 'Todos' || pin.culture === filters.culture;
                      const matchesType = filters.vacancy_type === 'Todos' || pin.vacancy_type === filters.vacancy_type;
                      if (!matchesCulture || !matchesType) return null;

                      return (
                        <Marker
                          key={pin.id}
                          coordinate={{ latitude: pin.latitude!, longitude: pin.longitude! }}
                          title={pin.title}
                          description={`${pin.producer_name} • ${pin.salary}`}
                          onCalloutPress={() => setSelectedVaga(pin)}
                        >
                          <View style={styles.customPinContainer}>
                            <Text style={styles.mapMarkerEmoji}>📍</Text>
                          </View>
                        </Marker>
                      );
                    })}
                </MapView>
                <Text style={styles.mapHelperText}>Mapa Interativo Real • Toque nos pinos para ver detalhes</Text>
              </View>
            </View>
          ) : (
            /* Vacancy List */
            <FlatList<Vaga>
              data={vagas}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContainer}
              refreshing={isLoading}
              onRefresh={refresh}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyEmoji}>🌾</Text>
                  <Text style={styles.emptyTitle}>Nenhuma vaga encontrada</Text>
                  <Text style={styles.emptySubtitle}>Tente ajustar os filtros de região, cultura ou tipo.</Text>
                </View>
              }
              renderItem={({ item }) => {
                const alreadyApplied = user?.role !== 'Produtor Rural' && candidaturas.some((app) => app.opportunity_id === item.id && app.user_id === user?.id);
                return (
                  <TouchableOpacity style={styles.card} onPress={() => setSelectedVaga(item)}>
                    <View style={styles.cardHeader}>
                      <Text style={styles.cardTitle}>{item.title}</Text>
                      <Text style={[styles.badge, getVacancyTypeBadgeStyle(item.vacancy_type)]}>
                        {item.vacancy_type}
                      </Text>
                    </View>

                    <Text style={styles.cardProducer}>🚜 {item.producer_name}</Text>
                    <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>

                    <View style={styles.metaRow}>
                      <View style={styles.metaCol}>
                        <Text style={styles.metaLabel}>📍 Região</Text>
                        <Text style={styles.metaValue}>{item.region}</Text>
                      </View>
                      <View style={styles.metaCol}>
                        <Text style={styles.metaLabel}>🌱 Cultura</Text>
                        <Text style={styles.metaValue}>{item.culture}</Text>
                      </View>
                      <View style={styles.metaCol}>
                        <Text style={styles.metaLabel}>💰 Salário</Text>
                        <Text style={styles.metaValue}>{item.salary}</Text>
                      </View>
                    </View>

                    <View style={styles.cardFooter}>
                      <Text style={styles.cardDate}>Expira em: {new Date(item.expires_at).toLocaleDateString('pt-BR')}</Text>
                      
                      {alreadyApplied ? (
                        <View style={styles.appliedBadge}>
                          <Text style={styles.appliedBadgeText}>✓ Candidatado</Text>
                        </View>
                      ) : (
                        <TouchableOpacity
                          style={styles.cardApplyBtn}
                          onPress={() => applyToVaga(item.id)}
                        >
                          <Text style={styles.cardApplyBtnText}>Candidatar-se</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              }}
            />
          )}

          {/* Floating Action Button (FAB) for Rural Producers to Post Vacancies */}
          {isProducer && (
            <TouchableOpacity style={styles.fab} onPress={() => setShowCreateModal(true)}>
              <Text style={styles.fabText}>+</Text>
            </TouchableOpacity>
          )}
        </>
      ) : (
        /* Candidacy History Tab */
        <FlatList
          data={candidaturas}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          refreshing={isLoading}
          onRefresh={refresh}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyEmoji}>💼</Text>
              <Text style={styles.emptyTitle}>Nenhuma candidatura registrada</Text>
              <Text style={styles.emptySubtitle}>Busque vagas e envie seu perfil para visualizá-las aqui.</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.appCard}>
              <View style={styles.appCardHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.appCardTitle}>{item.vacancy_title || 'Estagiário Agronomia'}</Text>
                  <Text style={styles.appCardRegion}>📍 {item.vacancy_region || 'Mato Grosso'} • Cultivo: {item.vacancy_culture || 'Geral'}</Text>
                  
                  {/* Se for produtor, exibe quem se candidatou à vaga dele! */}
                  {user?.role === 'Produtor Rural' && (
                    <Text style={{ fontSize: 13, color: '#16A34A', fontWeight: '700', marginTop: 6 }}>
                      👤 Candidato: {item.user_name} ({item.user_role})
                    </Text>
                  )}
                </View>
                <View style={styles.statusBadgePending}>
                  <Text style={styles.statusBadgeText}>{item.status}</Text>
                </View>
              </View>

              <View style={styles.appCardFooter}>
                <Text style={styles.appCardDate}>
                  Enviado em: {new Date(item.applied_at).toLocaleDateString('pt-BR')} às {new Date(item.applied_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </Text>
                <Text style={styles.appCardId}>ID: {item.id.slice(0, 8)}...</Text>
              </View>
            </View>
          )}
        />
      )}

      {/* ─── VACANCY DETAILS MODAL ────────────────────────────────────────── */}
      <Modal visible={selectedVaga !== null} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.detailsModalContent}>
            {selectedVaga && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalHeaderTitle}>Detalhes da Vaga</Text>
                  <TouchableOpacity onPress={() => setSelectedVaga(null)} style={styles.closeBtn}>
                    <Text style={styles.closeBtnText}>✕</Text>
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.modalBody}>
                  <View style={styles.detailsHeaderRow}>
                    <Text style={styles.detailsTitle}>{selectedVaga.title}</Text>
                    <Text style={[styles.badge, getVacancyTypeBadgeStyle(selectedVaga.vacancy_type)]}>
                      {selectedVaga.vacancy_type}
                    </Text>
                  </View>
                  
                  <Text style={styles.detailsProducer}>Oferecido por: 🚜 {selectedVaga.producer_name}</Text>
                  
                  <View style={styles.detailDivider} />

                  <Text style={styles.detailSectionTitle}>Descrição da Vaga:</Text>
                  <Text style={styles.detailsDesc}>{selectedVaga.description}</Text>

                  <View style={styles.detailDivider} />

                  <Text style={styles.detailSectionTitle}>Requisitos & Detalhes:</Text>
                  
                  <View style={styles.detailInfoGrid}>
                    <View style={styles.detailGridItem}>
                      <Text style={styles.detailGridLabel}>📍 Região</Text>
                      <Text style={styles.detailGridValue}>{selectedVaga.region}</Text>
                    </View>
                    <View style={styles.detailGridItem}>
                      <Text style={styles.detailGridLabel}>🌱 Cultivo</Text>
                      <Text style={styles.detailGridValue}>{selectedVaga.culture}</Text>
                    </View>
                    <View style={styles.detailGridItem}>
                      <Text style={styles.detailGridLabel}>💰 Remuneração</Text>
                      <Text style={styles.detailGridValue}>{selectedVaga.salary}</Text>
                    </View>
                    <View style={styles.detailGridItem}>
                      <Text style={styles.detailGridLabel}>⏳ Duração</Text>
                      <Text style={styles.detailGridValue}>{selectedVaga.duration}</Text>
                    </View>
                  </View>

                  <View style={styles.detailDivider} />
                  
                  <Text style={styles.detailsExpiry}>
                    * As candidaturas serão aceitas até: {new Date(selectedVaga.expires_at).toLocaleDateString('pt-BR')}
                  </Text>
                </ScrollView>

                <View style={styles.modalActions}>
                  {candidaturas.some(app => app.opportunity_id === selectedVaga.id) ? (
                    <View style={styles.appliedButtonBig}>
                      <Text style={styles.appliedButtonBigText}>✓ Candidatura Já Realizada</Text>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={styles.applyButtonBig}
                      onPress={async () => {
                        const ok = await applyToVaga(selectedVaga.id);
                        if (ok) setSelectedVaga(null);
                      }}
                      disabled={isSubmitting}
                    >
                      <Text style={styles.applyButtonBigText}>
                        {isSubmitting ? 'Enviando...' : 'Confirmar Candidatura'}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* ─── CREATE VACANCY FORM MODAL (PRODUCERS ONLY) ───────────────────── */}
      <Modal visible={showCreateModal} transparent animationType="slide">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}
        >
          <View style={styles.formModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalHeaderTitle}>Cadastrar Oportunidade</Text>
              <TouchableOpacity onPress={() => setShowCreateModal(false)} style={styles.closeBtn}>
                <Text style={styles.closeBtnText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} contentContainerStyle={styles.formContent}>
              <Text style={styles.formLabel}>Título da Oportunidade</Text>
              <TextInput
                style={styles.formInput}
                placeholder="Ex: Auxiliar Técnico de Cultivo"
                placeholderTextColor="#9CA3AF"
                value={newTitle}
                onChangeText={setNewTitle}
              />

              <Text style={styles.formLabel}>Descrição Detalhada</Text>
              <TextInput
                style={[styles.formInput, styles.formInputTextArea]}
                placeholder="Descreva as atividades, pré-requisitos e benefícios..."
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={4}
                value={newDescription}
                onChangeText={setNewDescription}
              />

              <View style={styles.formRow}>
                <View style={styles.formCol}>
                  <Text style={styles.formLabel}>Região/Fazenda</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="Ex: Mato Grosso"
                    placeholderTextColor="#9CA3AF"
                    value={newRegion}
                    onChangeText={setNewRegion}
                  />
                </View>
                <View style={styles.formCol}>
                  <Text style={styles.formLabel}>Cultura/Cultivo</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="Ex: Soja / Milho"
                    placeholderTextColor="#9CA3AF"
                    value={newCulture}
                    onChangeText={setNewCulture}
                  />
                </View>
              </View>

              <Text style={styles.formLabel}>Tipo de Contrato</Text>
              <View style={styles.formTypeSelector}>
                {(['Estágio', 'Emprego', 'Freelance'] as const).map((t) => (
                  <TouchableOpacity
                    key={t}
                    style={[styles.formTypeBtn, newType === t && styles.formTypeBtnActive]}
                    onPress={() => setNewType(t)}
                  >
                    <Text style={[styles.formTypeBtnText, newType === t && styles.formTypeBtnTextActive]}>
                      {t}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.formRow}>
                <View style={styles.formCol}>
                  <Text style={styles.formLabel}>Salário / Ajuda de Custo</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="Ex: R$ 1.500,00"
                    placeholderTextColor="#9CA3AF"
                    value={newSalary}
                    onChangeText={setNewSalary}
                  />
                </View>
                <View style={styles.formCol}>
                  <Text style={styles.formLabel}>Duração do Contrato</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="Ex: 6 meses"
                    placeholderTextColor="#9CA3AF"
                    value={newDuration}
                    onChangeText={setNewDuration}
                  />
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.submitBtn}
                onPress={handleCreate}
                disabled={isSubmitting}
              >
                <Text style={styles.submitBtnText}>
                  {isSubmitting ? 'Cadastrando...' : 'Publicar Vaga'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F3F4F6', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  roleSwitcherContainer: {
    backgroundColor: '#E5E7EB',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#D1D5DB',
  },
  roleSwitcherLabel: { fontSize: 11, fontWeight: '700', color: '#4B5563', marginBottom: 4 },
  roleSwitcherScroll: { gap: 6 },
  roleSwitchBtn: {
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  roleSwitchBtnActive: {
    backgroundColor: '#16A34A',
    borderColor: '#16A34A',
  },
  roleSwitchText: { fontSize: 12, color: '#374151', fontWeight: '500' },
  roleSwitchTextActive: { color: '#fff', fontWeight: '700' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E5E7EB',
  },
  welcomeText: { fontSize: 18, fontWeight: '700', color: '#111827' },
  userRoleRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  userRoleDesc: { fontSize: 12, color: '#6B7280' },
  userRoleValue: { fontSize: 12, fontWeight: '700' },
  roleProducer: { color: '#B45309' },
  roleStudent: { color: '#16A34A' },
  roleTechnician: { color: '#2563EB' },
  mapToggle: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  mapToggleText: { fontSize: 12, fontWeight: '600', color: '#4B5563' },
  tabsHeader: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabButtonActive: {
    borderBottomColor: '#16A34A',
  },
  tabButtonText: { fontSize: 13, fontWeight: '600', color: '#6B7280' },
  tabButtonTextActive: { color: '#16A34A', fontWeight: '700' },
  filtersWrapper: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E5E7EB',
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchIcon: { fontSize: 14, marginRight: 6 },
  searchInput: { flex: 1, paddingVertical: 10, fontSize: 14, color: '#111827' },
  filterChipsRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  filterChipsLabel: { fontSize: 11, fontWeight: '600', color: '#6B7280', width: 50 },
  chip: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    marginRight: 6,
  },
  chipActive: { backgroundColor: '#16A34A' },
  chipText: { fontSize: 12, color: '#4B5563', fontWeight: '500' },
  chipTextActive: { color: '#fff', fontWeight: '700' },
  mapContainer: { flex: 1, padding: 16, backgroundColor: '#E5E7EB' },
  mapHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  mapStatusBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#86EFAC',
  },
  mapStatusBadgeText: { fontSize: 10, fontWeight: '700', color: '#16A34A' },
  mapTitle: { fontSize: 14, fontWeight: '700', color: '#374151' },
  mapCanvasContainer: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#A7F3D0',
    backgroundColor: '#E5E7EB',
    position: 'relative',
  },
  mapCanvasReal: {
    flex: 1,
  },
  
  // Real Map Marker pulse effect for User location
  userMarkerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
  },
  userMarkerCore: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#3B82F6',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
  },
  userMarkerPulse: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(59, 130, 246, 0.25)',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.4)',
  },
  customPinContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapMarkerEmoji: { fontSize: 28, textShadowColor: 'rgba(0,0,0,0.15)', textShadowOffset: { width: 1, height: 2 }, textShadowRadius: 3 },
  mapHelperText: { position: 'absolute', bottom: 12, alignSelf: 'center', fontSize: 10, color: '#065F46', fontWeight: '700', letterSpacing: 0.5, backgroundColor: 'rgba(255,255,255,0.85)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  
  // Custom In-App Notification Banner Styles
  notificationBanner: {
    position: 'absolute',
    top: 0, // Controlado por Animated.translateY
    left: 16,
    right: 16,
    zIndex: 9999,
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  notificationTouchable: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 12,
  },
  notificationIconBg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationEmoji: { fontSize: 18 },
  notificationTextWrapper: { flex: 1, gap: 2 },
  notificationTitle: { fontSize: 12, fontWeight: '800', color: '#16A34A', textTransform: 'uppercase', letterSpacing: 0.5 },
  notificationBody: { fontSize: 13, color: '#374151', fontWeight: '500', lineHeight: 17 },
  notificationHeaderBtn: {
    backgroundColor: '#F3F4F6',
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  notificationHeaderEmoji: {
    fontSize: 16,
  },
  
  // GPS Simulator Panel
  gpsSimulatorContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E5E7EB',
    gap: 6,
  },
  gpsSimulatorLabel: { fontSize: 11, fontWeight: '700', color: '#4B5563', textTransform: 'uppercase', letterSpacing: 0.5 },
  gpsButtonsRow: { flexDirection: 'row', gap: 8 },
  gpsButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingVertical: 8,
    borderRadius: 10,
    gap: 4,
  },
  gpsButtonActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  gpsButtonText: { fontSize: 12, color: '#4B5563', fontWeight: '600' },
  gpsButtonTextActive: { color: '#fff', fontWeight: '700' },

  listContainer: { padding: 16, gap: 16, paddingBottom: 80 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#111827', flex: 1 },
  badge: {
    fontSize: 10,
    fontWeight: '700',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  badgeEstagio: { backgroundColor: '#DCFCE7', color: '#15803D' },
  badgeEmprego: { backgroundColor: '#DBEAFE', color: '#1D4ED8' },
  badgeFreelance: { backgroundColor: '#FEF3C7', color: '#D97706' },
  cardProducer: { fontSize: 13, fontWeight: '600', color: '#4B5563', marginTop: 4 },
  cardDesc: { fontSize: 13, color: '#6B7280', marginTop: 8, lineHeight: 18 },
  metaRow: { flexDirection: 'row', gap: 16, marginTop: 12, backgroundColor: '#F9FAFB', padding: 10, borderRadius: 8 },
  metaCol: { flex: 1 },
  metaLabel: { fontSize: 9, color: '#9CA3AF', fontWeight: '700', textTransform: 'uppercase' },
  metaValue: { fontSize: 11, fontWeight: '600', color: '#374151', marginTop: 1 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 14, paddingTop: 12, borderTopWidth: 0.5, borderTopColor: '#E5E7EB' },
  cardDate: { fontSize: 11, color: '#9CA3AF' },
  cardApplyBtn: { backgroundColor: '#16A34A', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  cardApplyBtnText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  appliedBadge: { backgroundColor: '#F3F4F6', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  appliedBadgeText: { color: '#9CA3AF', fontSize: 12, fontWeight: '700' },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60, paddingHorizontal: 20 },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: '#374151', marginTop: 12 },
  emptySubtitle: { fontSize: 13, color: '#9CA3AF', textAlign: 'center', marginTop: 4 },
  fab: {
    position: 'absolute',
    bottom: 80,
    right: 20,
    backgroundColor: '#16A34A',
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 6,
  },
  fabText: { color: '#fff', fontSize: 28, fontWeight: '300', marginTop: -2 },
  appCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  appCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  appCardTitle: { fontSize: 15, fontWeight: '700', color: '#111827' },
  appCardRegion: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  statusBadgePending: { backgroundColor: '#FEF3C7', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999 },
  statusBadgeText: { fontSize: 10, fontWeight: '700', color: '#D97706', textTransform: 'uppercase' },
  appCardFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12, paddingTop: 10, borderTopWidth: 0.5, borderTopColor: '#E5E7EB' },
  appCardDate: { fontSize: 11, color: '#9CA3AF' },
  appCardId: { fontSize: 11, color: '#9CA3AF', fontFamily: 'monospace' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'flex-end' },
  detailsModalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 24,
    maxHeight: '85%',
  },
  formModalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 24,
    height: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 18,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E5E7EB',
  },
  modalHeaderTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },
  closeBtn: { padding: 4 },
  closeBtnText: { fontSize: 16, color: '#6B7280' },
  modalBody: { padding: 18 },
  detailsHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  detailsTitle: { fontSize: 20, fontWeight: '800', color: '#111827', flex: 1, marginRight: 8 },
  detailsProducer: { fontSize: 14, fontWeight: '600', color: '#4B5563', marginTop: 6 },
  detailDivider: { height: 0.5, backgroundColor: '#E5E7EB', marginVertical: 14 },
  detailSectionTitle: { fontSize: 14, fontWeight: '700', color: '#374151', marginBottom: 6 },
  detailsDesc: { fontSize: 14, color: '#4B5563', lineHeight: 22 },
  detailInfoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  detailGridItem: { width: '47%', backgroundColor: '#F9FAFB', padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#F3F4F6' },
  detailGridLabel: { fontSize: 10, color: '#9CA3AF', fontWeight: '700' },
  detailGridValue: { fontSize: 13, fontWeight: '600', color: '#374151', marginTop: 2 },
  detailsExpiry: { fontSize: 11, color: '#9CA3AF', fontStyle: 'italic' },
  modalActions: { padding: 18, borderTopWidth: 0.5, borderTopColor: '#E5E7EB' },
  applyButtonBig: { backgroundColor: '#16A34A', paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  applyButtonBigText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  appliedButtonBig: { backgroundColor: '#F3F4F6', paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  appliedButtonBigText: { color: '#9CA3AF', fontSize: 15, fontWeight: '700' },
  formContent: { gap: 14, paddingBottom: 40 },
  formLabel: { fontSize: 13, fontWeight: '700', color: '#374151' },
  formInput: { borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: '#111827' },
  formInputTextArea: { height: 80, textAlignVertical: 'top' },
  formRow: { flexDirection: 'row', gap: 12 },
  formCol: { flex: 1 },
  formTypeSelector: { flexDirection: 'row', gap: 8 },
  formTypeBtn: { flex: 1, borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 10, paddingVertical: 10, alignItems: 'center' },
  formTypeBtnActive: { backgroundColor: '#16A34A', borderColor: '#16A34A' },
  formTypeBtnText: { fontSize: 13, color: '#4B5563', fontWeight: '600' },
  formTypeBtnTextActive: { color: '#fff', fontWeight: '700' },
  submitBtn: { backgroundColor: '#16A34A', paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  submitBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
