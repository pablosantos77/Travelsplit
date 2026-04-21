
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type LangCode = 'es' | 'en' | 'fr' | 'de' | 'pt' | 'it';

interface LangOption {
  code: LangCode;
  flag: string;
  name: string;
  nativeName: string;
}

export const LANGUAGES: LangOption[] = [
  { code: 'es', flag: '🇪🇸', name: 'Spanish', nativeName: 'Español' },
  { code: 'en', flag: '🇬🇧', name: 'English', nativeName: 'English' },
  { code: 'fr', flag: '🇫🇷', name: 'French', nativeName: 'Français' },
  { code: 'de', flag: '🇩🇪', name: 'German', nativeName: 'Deutsch' },
  { code: 'pt', flag: '🇵🇹', name: 'Portuguese', nativeName: 'Português' },
  { code: 'it', flag: '🇮🇹', name: 'Italian', nativeName: 'Italiano' },
];

export const translations: Record<LangCode, any> = {
  es: {
    nav: { trips: 'Viajes', payments: 'Pagos', insights: 'Insights', settings: 'Ajustes' },
    auth: { 
      title: 'TravelSplit AI', 
      subtitle: 'Inteligencia y diseño para dividir los gastos de tu viaje.',
      google: 'Continuar con Google',
      orEmail: 'o usa tu email',
      emailPlaceholder: 'ejemplo@email.com',
      passPlaceholder: 'Tu contraseña',
      login: 'Iniciar sesión',
      register: 'Crear mi cuenta',
      noAccount: '¿No tienes cuenta? Regístrate',
      hasAccount: '¿Ya tienes cuenta? Inicia sesión'
    },
    trips: {
      title: 'Mis Viajes',
      subtitle: 'Tus itinerarios digitales y folios de gastos.',
      empty: 'Aún no tienes viajes. ¡Crea el primero!',
      upcoming: 'Próximo',
      planned: 'Planificado',
      pendingDest: 'Destino pendiente',
      selectDates: 'Seleccionar fechas',
      guests: 'Invitados',
      budget: 'Presupuesto Estimado',
      manualExpense: 'Añadir Gasto Manual',
      history: 'Historial de Gastos',
      noExpenses: 'No hay gastos en este viaje aún.',
      descPlaceholder: 'Descripción (ej. Cena, Taxi...)',
      amountPlaceholder: 'Total (€)',
      paidBy: 'Pagó...',
      addExpense: 'Añadir al Viaje'
    },
    payments: {
      title: 'Liquidación de Cuentas',
      subtitle: 'Quién debe a quién en tus viajes activos.',
      members: 'Miembros del Grupo',
      settle: 'Liquidar',
      balances: 'Balances de Deuda'
    },
    insights: {
      title: 'Insights del Viaje',
      subtitle: 'Análisis inteligente de tus gastos compartidos.',
      totalSpent: 'Total Gastado',
      personalSpent: 'Tu Gasto',
      savings: 'Ahorro Potencial',
      summary: 'Resumen de Gastos',
      categoryDist: 'Distribución por Categoría'
    },
    settings: {
      headerTitle: 'Ajustes',
      accessControl: 'Control de Acceso',
      changePassword: 'Cambiar Contraseña',
      lastUpdated: 'Última actualización hace 3 meses',
      twoFactor: 'Autenticación de Dos Factores',
      active: 'Activa',
      biometricLogin: 'Acceso Biométrico',
      biometricDesc: 'Usar Face ID o Touch ID',
      activeSessions: 'Sesiones Activas',
      currentSession: 'Sesión actual',
      activeAgo: 'Activo hace 2 días',
      revoke: 'Revocar',
      logout: 'Cerrar sesión',
      language: 'Idioma',
      languageDesc: 'Selecciona tu idioma preferido',
      help: 'Ayuda',
    },
    modals: {
      scanTitle: 'Escanear Ticket IA',
      startCamera: 'Iniciar Cámara',
      analyze: 'Analizar Ticket',
      close: 'Cerrar',
      deleteTrip: '¿Borrar viaje?',
      deleteDesc: 'Esta acción es irreversible y se perderán todos los gastos registrados.',
      confirmDelete: 'Sí, eliminar viaje',
      cancel: 'Cancelar'
    }
  },
  en: {
    nav: { trips: 'Trips', payments: 'Payments', insights: 'Insights', settings: 'Settings' },
    auth: { 
      title: 'TravelSplit AI', 
      subtitle: 'Intelligence and design to split your trip expenses.',
      google: 'Continue with Google',
      orEmail: 'or use your email',
      emailPlaceholder: 'example@email.com',
      passPlaceholder: 'Your password',
      login: 'Login',
      register: 'Create account',
      noAccount: "Don't have an account? Register",
      hasAccount: 'Already have an account? Login'
    },
    trips: {
      title: 'My Trips',
      subtitle: 'Your digital itineraries and expense folios.',
      empty: "You don't have trips yet. Create your first one!",
      upcoming: 'Upcoming',
      planned: 'Planned',
      pendingDest: 'Pending destination',
      selectDates: 'Select dates',
      guests: 'Guests',
      budget: 'Estimated Budget',
      manualExpense: 'Add Manual Expense',
      history: 'Expense History',
      noExpenses: 'No expenses in this trip yet.',
      descPlaceholder: 'Description (e.g. Dinner, Taxi...)',
      amountPlaceholder: 'Total (€)',
      paidBy: 'Paid by...',
      addExpense: 'Add to Trip'
    },
    payments: {
      title: 'Debt Settlement',
      subtitle: 'Who owes whom in your active trips.',
      members: 'Group Members',
      settle: 'Settle Debt',
      balances: 'Debt Balances'
    },
    insights: {
      title: 'Trip Insights',
      subtitle: 'Intelligent analysis of your shared expenses.',
      totalSpent: 'Total Spent',
      personalSpent: 'Your Spend',
      savings: 'Potential Savings',
      summary: 'Expense Summary',
      categoryDist: 'Category Distribution'
    },
    settings: {
      headerTitle: 'Settings',
      accessControl: 'Access Control',
      changePassword: 'Change Password',
      lastUpdated: 'Last updated 3 months ago',
      twoFactor: 'Two-Factor Authentication',
      active: 'Active',
      biometricLogin: 'Biometric Login',
      biometricDesc: 'Use Face ID or Touch ID',
      activeSessions: 'Active Sessions',
      currentSession: 'Current Session',
      activeAgo: 'Active 2 days ago',
      revoke: 'Revoke',
      logout: 'Log out',
      language: 'Language',
      languageDesc: 'Select your preferred language',
      help: 'Help',
    },
    modals: {
      scanTitle: 'Scan AI Ticket',
      startCamera: 'Start Camera',
      analyze: 'Analyze Ticket',
      close: 'Close',
      deleteTrip: 'Delete trip?',
      deleteDesc: 'This action is irreversible and all recorded expenses will be lost.',
      confirmDelete: 'Yes, delete trip',
      cancel: 'Cancel'
    }
  },
  fr: {
    nav: { trips: 'Voyages', payments: 'Paiements', insights: 'Aperçus', settings: 'Paramètres' },
    auth: { 
      title: 'TravelSplit AI', 
      subtitle: 'Intelligence et design pour diviser vos dépenses de voyage.',
      google: 'Continuer avec Google',
      orEmail: 'ou utilisez votre email',
      emailPlaceholder: 'exemple@email.com',
      passPlaceholder: 'Votre mot de passe',
      login: 'Se connecter',
      register: 'Créer un compte',
      noAccount: 'Pas de compte ? S\'inscrire',
      hasAccount: 'Déjà un compte ? Se connecter'
    },
    trips: {
      title: 'Mes Voyages',
      subtitle: 'Vos itinéraires numériques et folios de dépenses.',
      empty: "Vous n'avez pas encore de voyages. Créez votre premier !",
      upcoming: 'À venir',
      planned: 'Planifié',
      pendingDest: 'Destination en attente',
      selectDates: 'Sélectionner les dates',
      guests: 'Invités',
      budget: 'Budget Estimé',
      manualExpense: 'Ajouter une dépense manuelle',
      history: 'Historique des dépenses',
      noExpenses: 'Pas encore de dépenses dans ce voyage.',
      descPlaceholder: 'Description (ex. Dîner, Taxi...)',
      amountPlaceholder: 'Total (€)',
      paidBy: 'Payé par...',
      addExpense: 'Ajouter au voyage'
    },
    payments: {
      title: 'Règlement des dettes',
      subtitle: 'Qui doit quoi dans vos voyages actifs.',
      members: 'Membres du groupe',
      settle: 'Régler la dette',
      balances: 'Soldes des dettes'
    },
    insights: {
      title: 'Aperçus du voyage',
      subtitle: 'Analyse intelligente de vos dépenses partagées.',
      totalSpent: 'Total dépensé',
      personalSpent: 'Votre dépense',
      savings: 'Économies potentielles',
      summary: 'Résumé des dépenses',
      categoryDist: 'Répartition par catégorie'
    },
    settings: {
      headerTitle: 'Paramètres',
      accessControl: 'Contrôle d\'accès',
      changePassword: 'Changer le mot de passe',
      lastUpdated: 'Mis à jour il y a 3 mois',
      twoFactor: 'Authentification à deux facteurs',
      active: 'Active',
      biometricLogin: 'Connexion biométrique',
      biometricDesc: 'Utiliser Face ID ou Touch ID',
      activeSessions: 'Sessions actives',
      currentSession: 'Session actuelle',
      activeAgo: 'Actif il y a 2 jours',
      revoke: 'Révoquer',
      logout: 'Se déconnecter',
      language: 'Langue',
      languageDesc: 'Sélectionnez votre langue préférée',
      help: 'Aide',
    },
    modals: {
      scanTitle: 'Scanner Ticket IA',
      startCamera: 'Démarrer la caméra',
      analyze: 'Analyser le ticket',
      close: 'Fermer',
      deleteTrip: 'Supprimer le voyage ?',
      deleteDesc: 'Cette action est irréversible et toutes les dépenses enregistrées seront perdues.',
      confirmDelete: 'Oui, supprimer le voyage',
      cancel: 'Annuler'
    }
  },
  de: {
    nav: { trips: 'Reisen', payments: 'Zahlungen', insights: 'Einblicke', settings: 'Einstellungen' },
    auth: { 
      title: 'TravelSplit AI', 
      subtitle: 'Intelligenz und Design zum Aufteilen Ihrer Reisekosten.',
      google: 'Mit Google fortfahren',
      orEmail: 'oder nutzen Sie Ihre E-Mail',
      emailPlaceholder: 'beispiel@email.com',
      passPlaceholder: 'Ihr Passwort',
      login: 'Anmelden',
      register: 'Konto erstellen',
      noAccount: 'Kein Konto? Registrieren',
      hasAccount: 'Bereits ein Konto? Anmelden'
    },
    trips: {
      title: 'Meine Reisen',
      subtitle: 'Ihre digitalen Reiserouten und Kostenausstellungen.',
      empty: 'Sie haben noch keine Reisen. Erstellen Sie Ihre erste!',
      upcoming: 'Bevorstehend',
      planned: 'Geplant',
      pendingDest: 'Ausstehendes Ziel',
      selectDates: 'Daten auswählen',
      guests: 'Gäste',
      budget: 'Geschätztes Budget',
      manualExpense: 'Manuelle Ausgabe hinzufügen',
      history: 'Ausgabenhistorie',
      noExpenses: 'Noch keine Ausgaben auf dieser Reise.',
      descPlaceholder: 'Beschreibung (z.B. Abendessen, Taxi...)',
      amountPlaceholder: 'Gesamt (€)',
      paidBy: 'Bezahlt von...',
      addExpense: 'Zur Reise hinzufügen'
    },
    payments: {
      title: 'Schuldenbegleichung',
      subtitle: 'Wer wem in Ihren aktiven Reisen was schuldet.',
      members: 'Gruppenmitglieder',
      settle: 'Schulden begleichen',
      balances: 'Schuldensalden'
    },
    insights: {
      title: 'Reise-Einblicke',
      subtitle: 'Intelligente Analyse Ihrer gemeinsamen Ausgaben.',
      totalSpent: 'Gesamtausgaben',
      personalSpent: 'Ihre Ausgaben',
      savings: 'Potenzielle Einsparungen',
      summary: 'Ausgabenzusammenfassung',
      categoryDist: 'Verteilung nach Kategorie'
    },
    settings: {
      headerTitle: 'Einstellungen',
      accessControl: 'Zugriffskontrolle',
      changePassword: 'Passwort ändern',
      lastUpdated: 'Zuletzt aktualisiert vor 3 Monaten',
      twoFactor: 'Zwei-Faktor-Authentifizierung',
      active: 'Aktiv',
      biometricLogin: 'Biometrische Anmeldung',
      biometricDesc: 'Face ID oder Touch ID verwenden',
      activeSessions: 'Aktive Sitzungen',
      currentSession: 'Aktuelle Sitzung',
      activeAgo: 'Aktiv vor 2 Tagen',
      revoke: 'Widerrufen',
      logout: 'Abmelden',
      language: 'Sprache',
      languageDesc: 'Wählen Sie Ihre bevorzugte Sprache',
      help: 'Hilfe',
    },
    modals: {
      scanTitle: 'KI-Ticket scannen',
      startCamera: 'Kamera starten',
      analyze: 'Ticket analysieren',
      close: 'Schließen',
      deleteTrip: 'Reise löschen?',
      deleteDesc: 'Dies ist unwiderruflich und alle aufgezeichneten Ausgaben gehen verloren.',
      confirmDelete: 'Ja, Reise löschen',
      cancel: 'Abbrechen'
    }
  },
  pt: {
    nav: { trips: 'Viagens', payments: 'Pagamentos', insights: 'Insights', settings: 'Ajustes' },
    auth: { 
      title: 'TravelSplit AI', 
      subtitle: 'Inteligência e design para dividir as despesas da sua viagem.',
      google: 'Continuar com Google',
      orEmail: 'ou use seu e-mail',
      emailPlaceholder: 'exemplo@email.com',
      passPlaceholder: 'Sua senha',
      login: 'Entrar',
      register: 'Criar conta',
      noAccount: 'Não tem conta? Registre-se',
      hasAccount: 'Já tem conta? Entrar'
    },
    trips: {
      title: 'Minhas Viagens',
      subtitle: 'Seus itinerários digitais e despesas.',
      empty: 'Você ainda não tem viagens. Crie a primeira!',
      upcoming: 'Próxima',
      planned: 'Planejada',
      pendingDest: 'Destino pendente',
      selectDates: 'Selecionar datas',
      guests: 'Convidados',
      budget: 'Orçamento Estimado',
      manualExpense: 'Adicionar Gasto Manual',
      history: 'Histórico de Gastos',
      noExpenses: 'Ainda não há gastos nesta viagem.',
      descPlaceholder: 'Descrição (ex: Jantar, Táxi...)',
      amountPlaceholder: 'Total (€)',
      paidBy: 'Pago por...',
      addExpense: 'Adicionar à Viagem'
    },
    payments: {
      title: 'Liquidação de Dívidas',
      subtitle: 'Quem deve a quem nas suas viagens ativas.',
      members: 'Membros do Grupo',
      settle: 'Liquidar Dívida',
      balances: 'Saldos de Dívida'
    },
    insights: {
      title: 'Insights da Viagem',
      subtitle: 'Análise inteligente das suas despesas partilhadas.',
      totalSpent: 'Total Gasto',
      personalSpent: 'Seu Gasto',
      savings: 'Economia Potencial',
      summary: 'Resumo de Gastos',
      categoryDist: 'Distribuição por Categoria'
    },
    settings: {
      headerTitle: 'Configurações',
      accessControl: 'Controle de Acesso',
      changePassword: 'Alterar Senha',
      lastUpdated: 'Atualizado há 3 meses',
      twoFactor: 'Autenticação de Dois Fatores',
      active: 'Ativa',
      biometricLogin: 'Login Biométrico',
      biometricDesc: 'Usar Face ID ou Touch ID',
      activeSessions: 'Sessões Ativas',
      currentSession: 'Sessão atual',
      activeAgo: 'Ativo há 2 dias',
      revoke: 'Revogar',
      logout: 'Sair',
      language: 'Idioma',
      languageDesc: 'Selecione seu idioma preferido',
      help: 'Ajuda',
    },
    modals: {
      scanTitle: 'Escanear Ticket IA',
      startCamera: 'Iniciar Câmera',
      analyze: 'Analisar Ticket',
      close: 'Fechar',
      deleteTrip: 'Eliminar viagem?',
      deleteDesc: 'Esta ação é irreversível e todos os gastos registados serão perdidos.',
      confirmDelete: 'Sim, eliminar viagem',
      cancel: 'Cancelar'
    }
  },
  it: {
    nav: { trips: 'Viaggi', payments: 'Pagamenti', insights: 'Approfondimenti', settings: 'Impostazioni' },
    auth: { 
      title: 'TravelSplit AI', 
      subtitle: 'Intelligenza e design per dividere le spese di viaggio.',
      google: 'Continua con Google',
      orEmail: 'o usa la tua email',
      emailPlaceholder: 'esempio@email.com',
      passPlaceholder: 'La tua password',
      login: 'Accedi',
      register: 'Crea account',
      noAccount: 'Non hai un account? Registrati',
      hasAccount: 'Hai già un account? Accedi'
    },
    trips: {
      title: 'I Miei Viaggi',
      subtitle: 'I tuoi itinerari digitali e riepiloghi spese.',
      empty: 'Non hai ancora viaggi. Crea il primo!',
      upcoming: 'In arrivo',
      planned: 'Pianificato',
      pendingDest: 'Destinazione in sospeso',
      selectDates: 'Seleziona date',
      guests: 'Ospiti',
      budget: 'Budget Stimato',
      manualExpense: 'Aggiungi Spesa Manuale',
      history: 'Cronologia Spese',
      noExpenses: 'Non ci sono ancora spese in questo viaggio.',
      descPlaceholder: 'Descrizione (es. Cena, Taxi...)',
      amountPlaceholder: 'Totale (€)',
      paidBy: 'Pagato da...',
      addExpense: 'Aggiungi al Viaggio'
    },
    payments: {
      title: 'Saldamento Debiti',
      subtitle: 'Chi deve a chi nei tuoi viaggi attivi.',
      members: 'Membri del Gruppo',
      settle: 'Salda Debito',
      balances: 'Bilanci Debiti'
    },
    insights: {
      title: 'Approfondimenti Viaggio',
      subtitle: 'Analisi intelligente delle tue spese condivise.',
      totalSpent: 'Totale Speso',
      personalSpent: 'La Tua Spesa',
      savings: 'Risparmio Potenziale',
      summary: 'Riepilogo Spese',
      categoryDist: 'Distribuzione per Categoria'
    },
    settings: {
      headerTitle: 'Impostazioni',
      accessControl: 'Controllo Accessi',
      changePassword: 'Cambia Password',
      lastUpdated: 'Aggiornato 3 mesi fa',
      twoFactor: 'Autenticazione a Due Fattori',
      active: 'Attiva',
      biometricLogin: 'Accesso Biometrico',
      biometricDesc: 'Usa Face ID o Touch ID',
      activeSessions: 'Sessioni Attive',
      currentSession: 'Sessione corrente',
      activeAgo: 'Attivo 2 giorni fa',
      revoke: 'Revoca',
      logout: 'Disconnetti',
      language: 'Lingua',
      languageDesc: 'Seleziona la tua lingua preferita',
      help: 'Aiuto',
    },
    modals: {
      scanTitle: 'Scansiona Ticket IA',
      startCamera: 'Avvia Fotocamera',
      analyze: 'Analizza Ticket',
      close: 'Chiudi',
      deleteTrip: 'Elimina viaggio?',
      deleteDesc: 'Questa azione è irreversibile e tutte le spese registrate andranno perse.',
      confirmDelete: 'Sì, elimina viaggio',
      cancel: 'Annulla'
    }
  }
};

interface LanguageContextType {
  language: LangCode;
  setLanguage: (lang: LangCode) => void;
  t: any;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<LangCode>(() => {
    return (localStorage.getItem('travelsplit-lang') as LangCode) || 'es';
  });

  useEffect(() => {
    localStorage.setItem('travelsplit-lang', language);
  }, [language]);

  const t = translations[language];

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
