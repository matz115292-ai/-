import React, { useState, useEffect } from 'react';
import { Property, Client, Appointment, TabType, PropertyType, PropertyPurpose, PropertyStatus, ClientRole, AppointmentStatus, Marketer, CurrentUserRole, MarketerTier, UserAccount } from './types';
import { INITIAL_PROPERTIES, INITIAL_CLIENTS, INITIAL_APPOINTMENTS, INITIAL_MARKETERS, INITIAL_USERS } from './data/initialData';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { PropertyCard } from './components/PropertyCard';
import { PropertyTable } from './components/PropertyTable';
import { PropertyModal } from './components/PropertyModal';
import { PropertyDetailModal } from './components/PropertyDetailModal';
import { ClientCard } from './components/ClientCard';
import { ClientTable } from './components/ClientTable';
import { ClientModal } from './components/ClientModal';
import { ClientDetailModal } from './components/ClientDetailModal';
import { MarketerModal } from './components/MarketerModal';
import { MarketersView } from './components/MarketersView';
import { SmartMatchingView } from './components/SmartMatchingView';
import { VisitsView } from './components/VisitsView';
import { StatsOverview } from './components/StatsOverview';
import { PropertiesMapView } from './components/PropertiesMapView';
import { BulkActionBar } from './components/BulkActionBar';
import { PromoteMarketerModal } from './components/PromoteMarketerModal';
import { ConfirmDeleteModal, DeleteModalState } from './components/ConfirmDeleteModal';
import { UserManagementView } from './components/UserManagementView';
import { UserModal } from './components/UserModal';
import { AuthScreen } from './components/AuthScreen';
import { TopMotivationBanner } from './components/TopMotivationBanner';
import { PROPERTY_TYPES, PROPERTY_PURPOSES, CLIENT_ROLES, calculateMatch } from './utils/helpers';
import { 
  seedInitialDataIfEmpty, 
  subscribeToCollection, 
  savePropertyToCloud, 
  deletePropertyFromCloud, 
  saveClientToCloud, 
  deleteClientFromCloud, 
  saveAppointmentToCloud, 
  deleteAppointmentFromCloud, 
  saveMarketerToCloud, 
  deleteMarketerFromCloud, 
  saveUserToCloud, 
  deleteUserFromCloud,
  COLLECTIONS 
} from './lib/firebase';
import { 
  Search, 
  Filter, 
  Building2, 
  Users, 
  Sparkles, 
  Plus, 
  SlidersHorizontal,
  CheckCircle2,
  LayoutGrid,
  List,
  UserCheck,
  KeyRound,
  MessageSquare
} from 'lucide-react';

const STORAGE_KEY_PROPERTIES = 'aqar_crm_properties_v1';
const STORAGE_KEY_CLIENTS = 'aqar_crm_clients_v1';
const STORAGE_KEY_APPOINTMENTS = 'aqar_crm_appointments_v1';
const STORAGE_KEY_MARKETERS = 'aqar_crm_marketers_v1';
const STORAGE_KEY_USERS = 'aqar_crm_users_v1';
const STORAGE_KEY_CURRENT_USER = 'aqar_crm_current_user_v1';
const STORAGE_KEY_AUTH_USER = 'aqar_crm_auth_user_v1';

export default function App() {
  // 1. Data States with LocalStorage backup
  const [properties, setProperties] = useState<Property[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PROPERTIES);
    if (saved) {
      try {
        const parsed: Property[] = JSON.parse(saved);
        return parsed.map(p => p.marketerId === 'marketer-2' && p.marketerName === 'سعد الدوسري' ? { ...p, marketerName: 'زكريا' } : p);
      } catch (e) {
        console.error('Error loading properties from storage', e);
      }
    }
    return INITIAL_PROPERTIES;
  });

  const [clients, setClients] = useState<Client[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_CLIENTS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error loading clients from storage', e);
      }
    }
    return INITIAL_CLIENTS;
  });

  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_APPOINTMENTS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error loading appointments from storage', e);
      }
    }
    return INITIAL_APPOINTMENTS;
  });

  const [marketers, setMarketers] = useState<Marketer[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_MARKETERS);
    if (saved) {
      try {
        const parsed: Marketer[] = JSON.parse(saved);
        return parsed.map(m => m.id === 'marketer-2' && m.name === 'سعد الدوسري' ? { ...m, name: 'زكريا', email: 'zakariya@aqar.sa' } : m);
      } catch (e) {
        console.error('Error loading marketers from storage', e);
      }
    }
    return INITIAL_MARKETERS;
  });

  const [users, setUsers] = useState<UserAccount[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_USERS);
    if (saved) {
      try {
        const parsed: UserAccount[] = JSON.parse(saved);
        return parsed.map(u => (u.id === 'user-staff-1' || u.marketerId === 'marketer-2') && u.name.includes('سعد الدوسري') ? { ...u, name: 'زكريا (مسوق عقاري)', username: 'zakariya', email: 'zakariya@aqar.sa' } : u);
      } catch (e) {
        console.error('Error loading users from storage', e);
      }
    }
    return INITIAL_USERS;
  });

  // الحساب الموثق الذي قام بتسجيل الدخول الفعلي (لحفظ صلاحيات التبديل للمسؤول فقط)
  const [authenticatedUser, setAuthenticatedUser] = useState<UserAccount | null>(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.has('login') || urlParams.has('logout') || window.location.hash === '#login') {
        localStorage.removeItem(STORAGE_KEY_AUTH_USER);
        localStorage.removeItem(STORAGE_KEY_CURRENT_USER);
        return null;
      }
    } catch (e) {}

    const saved = localStorage.getItem(STORAGE_KEY_AUTH_USER);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error loading auth user from storage', e);
      }
    }
    return null;
  });

  // الحساب الحالي النشط في الواجهة (قد يكون موظف يختاره المسؤول للمعاينة)
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.has('login') || urlParams.has('logout') || window.location.hash === '#login') {
        return null;
      }
    } catch (e) {}

    const saved = localStorage.getItem(STORAGE_KEY_CURRENT_USER);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error loading current user from storage', e);
      }
    }
    return null;
  });

  // Save to localStorage on changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PROPERTIES, JSON.stringify(properties));
  }, [properties]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_CLIENTS, JSON.stringify(clients));
  }, [clients]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_APPOINTMENTS, JSON.stringify(appointments));
  }, [appointments]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_MARKETERS, JSON.stringify(marketers));
  }, [marketers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (authenticatedUser) {
      localStorage.setItem(STORAGE_KEY_AUTH_USER, JSON.stringify(authenticatedUser));
    } else {
      localStorage.removeItem(STORAGE_KEY_AUTH_USER);
    }
  }, [authenticatedUser]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(STORAGE_KEY_CURRENT_USER, JSON.stringify(currentUser));
      setCurrentUserRole(currentUser.role);
    } else {
      localStorage.removeItem(STORAGE_KEY_CURRENT_USER);
    }
  }, [currentUser]);

  // Real-time Cloud Synchronization (Firebase Firestore)
  const [isCloudSynced, setIsCloudSynced] = useState(false);

  useEffect(() => {
    // Seed initial data to cloud if collections are empty
    seedInitialDataIfEmpty()
      .then(() => setIsCloudSynced(true))
      .catch((err) => console.warn('Initial cloud seed notice:', err));

    // Listen to real-time updates for properties
    const unsubProps = subscribeToCollection<Property>(COLLECTIONS.PROPERTIES, (cloudItems) => {
      setProperties(cloudItems || []);
      setIsCloudSynced(true);
    });

    // Listen to real-time updates for clients
    const unsubClients = subscribeToCollection<Client>(COLLECTIONS.CLIENTS, (cloudItems) => {
      setClients(cloudItems || []);
    });

    // Listen to real-time updates for appointments
    const unsubAppts = subscribeToCollection<Appointment>(COLLECTIONS.APPOINTMENTS, (cloudItems) => {
      setAppointments(cloudItems || []);
    });

    // Listen to real-time updates for marketers
    const unsubMarketers = subscribeToCollection<Marketer>(COLLECTIONS.MARKETERS, (cloudItems) => {
      setMarketers(cloudItems || []);
    });

    // Listen to real-time updates for users
    const unsubUsers = subscribeToCollection<UserAccount>(COLLECTIONS.USERS, (cloudItems) => {
      if (cloudItems && cloudItems.length > 0) {
        setUsers(cloudItems);
      }
    });

    return () => {
      unsubProps();
      unsubClients();
      unsubAppts();
      unsubMarketers();
      unsubUsers();
    };
  }, []);

  // 2. Navigation State
  const [activeTab, setActiveTab] = useState<TabType>('stats');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // 3. View Mode toggles ('cards' | 'table') for High Density flexibility
  const [propertyViewMode, setPropertyViewMode] = useState<'cards' | 'table'>('table');
  const [clientViewMode, setClientViewMode] = useState<'cards' | 'table'>('cards');

  // 4. Search and Filter states
  const [globalSearch, setGlobalSearch] = useState('');
  const [propertySearch, setPropertySearch] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterPurpose, setFilterPurpose] = useState<string>('all');
  const [filterCity, setFilterCity] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const [clientSearch, setClientSearch] = useState('');
  const [filterClientRole, setFilterClientRole] = useState<string>('all');

  // 5. Modals State
  const [isPropertyModalOpen, setIsPropertyModalOpen] = useState(false);
  const [propertyToEdit, setPropertyToEdit] = useState<Property | null>(null);

  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [clientToEdit, setClientToEdit] = useState<Client | null>(null);

  const [isMarketerModalOpen, setIsMarketerModalOpen] = useState(false);
  const [marketerToEdit, setMarketerToEdit] = useState<Marketer | null>(null);

  // Promotion modal state
  const [isPromoteModalOpen, setIsPromoteModalOpen] = useState(false);
  const [marketerToPromote, setMarketerToPromote] = useState<Marketer | null>(null);

  const [viewingProperty, setViewingProperty] = useState<Property | null>(null);
  const [viewingClient, setViewingClient] = useState<Client | null>(null);

  // 6. Role & Permissions Management
  const [currentUserRole, setCurrentUserRole] = useState<CurrentUserRole>(() => {
    return currentUser?.role || 'admin';
  });
  const isAdmin = currentUserRole === 'admin';
  // التحقق الحصري: هل المستخدم المسجل فعلياً هو المسؤول العام؟
  const isAdminAuthenticated = authenticatedUser?.role === 'admin';

  // تبديل سريع بين وضع المسؤول والموظف (متاح حصرياً للمسؤول)
  const handleToggleUserRole = () => {
    if (!isAdminAuthenticated) return;
    setCurrentUserRole(prev => {
      const next: CurrentUserRole = prev === 'admin' ? 'staff' : 'admin';
      showToast(
        next === 'admin' 
          ? 'تم تفعيل صلاحيات المسؤول 👑' 
          : 'تم التبديل إلى وضع الموظف 👤 (معاينة كمسؤول)'
      );
      return next;
    });
  };

  // تبديل مباشر إلى حساب أي موظف (متاح حصرياً للمسؤول)
  const handleSwitchEmployee = (employeeUser: UserAccount) => {
    if (!isAdminAuthenticated) return;
    setCurrentUser(employeeUser);
    setCurrentUserRole(employeeUser.role);
    localStorage.setItem(STORAGE_KEY_CURRENT_USER, JSON.stringify(employeeUser));
    showToast(
      employeeUser.role === 'admin'
        ? `تم التبديل إلى حساب المسؤول: ${employeeUser.name} 👑`
        : `تم التبديل إلى حساب الموظف: ${employeeUser.name} 👤 (معاينة كمسؤول)`
    );
  };

  // العودة الفورية إلى حساب المسؤول العام
  const handleReturnToAdmin = () => {
    if (!authenticatedUser) return;
    setCurrentUser(authenticatedUser);
    setCurrentUserRole(authenticatedUser.role);
    localStorage.setItem(STORAGE_KEY_CURRENT_USER, JSON.stringify(authenticatedUser));
    showToast('تمت العودة إلى حساب المسؤول العام بنجاح 👑');
  };

  // 7. Multi-Selection States (تحديد العناصر)
  const [selectedPropertyIds, setSelectedPropertyIds] = useState<string[]>([]);
  const [selectedClientIds, setSelectedClientIds] = useState<string[]>([]);
  const [selectedMarketerIds, setSelectedMarketerIds] = useState<string[]>([]);

  // 8. Custom In-App Delete Confirmation Modal State (بديل متكامل عن window.confirm)
  const [deleteModalState, setDeleteModalState] = useState<DeleteModalState | null>(null);

  // 9. User Account Management Modal State
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<UserAccount | null>(null);

  // Authentication & Account handlers
  const handleLoginSuccess = (user: UserAccount) => {
    setAuthenticatedUser(user);
    setCurrentUser(user);
    setCurrentUserRole(user.role);
    showToast(`مرحباً بك مجدداً يا ${user.name}! تم تسجيل الدخول بنجاح.`);
  };

  const handleLogout = () => {
    setAuthenticatedUser(null);
    setCurrentUser(null);
    localStorage.removeItem(STORAGE_KEY_AUTH_USER);
    localStorage.removeItem(STORAGE_KEY_CURRENT_USER);
    showToast('تم تسجيل الخروج بنجاح. أهلاً بك في أي وقت.');
  };

  const handleSaveUser = (userData: Omit<UserAccount, 'id' | 'createdAt'>, editingId?: string) => {
    if (editingId) {
      const existing = users.find(u => u.id === editingId);
      const updated: UserAccount = {
        ...(existing || {} as UserAccount),
        ...userData,
        id: editingId,
        createdAt: existing?.createdAt || new Date().toISOString().split('T')[0],
      };
      setUsers(prev => prev.map(u => u.id === editingId ? updated : u));
      saveUserToCloud(updated).catch(err => console.error('Cloud save user error:', err));
      if (currentUser?.id === editingId) {
        setCurrentUser(prev => prev ? { ...prev, ...userData } : null);
        setCurrentUserRole(userData.role);
      }
      showToast('تم تحديث بيانات الحساب والرقم السري بنجاح');
    } else {
      if (users.some(u => u.username.toLowerCase() === userData.username.toLowerCase())) {
        showToast('اسم المستخدم هذا مستخدم مسبقاً، يرجى اختيار اسم مستخدم آخر');
        return;
      }
      const newUser: UserAccount = {
        ...userData,
        id: `USR-${Date.now().toString().slice(-4)}`,
        createdAt: new Date().toISOString().split('T')[0],
      };
      setUsers(prev => [...prev, newUser]);
      saveUserToCloud(newUser).catch(err => console.error('Cloud save user error:', err));
      showToast(`تم إنشاء حساب ${newUser.name} بنجاح برقم سري: ${newUser.password}`);
    }
  };

  const handleDeleteUser = (userId: string) => {
    if (userId === currentUser?.id) {
      showToast('لا يمكنك حذف حسابك الحالي');
      return;
    }
    const targetUser = users.find(u => u.id === userId);
    setDeleteModalState({
      isOpen: true,
      type: 'user',
      id: userId,
      title: 'تأكيد حذف حساب المستخدم',
      itemName: targetUser?.name || 'هذا المستخدم',
      itemDescription: `حساب: ${targetUser?.name || userId} (${targetUser?.username})`,
      warningText: 'سيتم إلغاء صلاحية هذا المستخدم نهائياً ولن يتمكن من الدخول إلى النظام.',
      onConfirm: () => {
        setUsers(prev => prev.filter(u => u.id !== userId));
        deleteUserFromCloud(userId).catch(err => console.error('Cloud delete user error:', err));
        showToast('تم حذف حساب المستخدم بنجاح');
        setDeleteModalState(null);
      }
    });
  };

  const handleToggleUserStatus = (userId: string) => {
    if (userId === currentUser?.id) {
      showToast('لا يمكنك إيقاف حسابك الحالي');
      return;
    }
    const target = users.find(u => u.id === userId);
    if (target) {
      const newStatus = target.status === 'active' ? 'suspended' : 'active';
      const updated = { ...target, status: newStatus };
      setUsers(prev => prev.map(u => u.id === userId ? updated : u));
      saveUserToCloud(updated).catch(err => console.error('Cloud toggle user status error:', err));
      showToast(newStatus === 'active' ? `تم تفعيل حساب ${target.name}` : `تم إيقاف حساب ${target.name}`);
    }
  };

  // Client Portal Request Submission Handler
  const handleSubmitClientRequestFromPortal = (clientData: Omit<Client, 'id' | 'createdAt'>): Client => {
    const newClient: Client = {
      ...clientData,
      id: `CLI-${Date.now().toString().slice(-4)}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setClients(prev => [newClient, ...prev]);
    saveClientToCloud(newClient).catch(err => console.error('Cloud save portal client error:', err));
    showToast(`تم تسجيل وتوثيق طلب العميل ${newClient.name} بنجاح!`);
    return newClient;
  };

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Selection toggle helpers
  const handleToggleSelectProperty = (id: string) => {
    setSelectedPropertyIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleToggleSelectAllProperties = (allFilteredIds: string[]) => {
    if (selectedPropertyIds.length === allFilteredIds.length) {
      setSelectedPropertyIds([]);
    } else {
      setSelectedPropertyIds(allFilteredIds);
    }
  };

  const handleToggleSelectClient = (id: string) => {
    setSelectedClientIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleToggleSelectAllClients = (allFilteredIds: string[]) => {
    if (selectedClientIds.length === allFilteredIds.length) {
      setSelectedClientIds([]);
    } else {
      setSelectedClientIds(allFilteredIds);
    }
  };

  const handleToggleSelectMarketer = (id: string) => {
    setSelectedMarketerIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleToggleSelectAllMarketers = (allFilteredIds: string[]) => {
    if (selectedMarketerIds.length === allFilteredIds.length) {
      setSelectedMarketerIds([]);
    } else {
      setSelectedMarketerIds(allFilteredIds);
    }
  };

  // Property Handlers
  const handleSaveProperty = (propertyData: Omit<Property, 'id' | 'createdAt'>, editingId?: string) => {
    if (editingId) {
      const existing = properties.find(p => p.id === editingId);
      const updated: Property = {
        ...(existing || {} as Property),
        ...propertyData,
        id: editingId,
        createdAt: existing?.createdAt || new Date().toISOString().split('T')[0],
      };
      setProperties(prev => prev.map(p => p.id === editingId ? updated : p));
      savePropertyToCloud(updated).catch(err => console.error('Cloud save property error:', err));
      showToast('تم تحديث بيانات العقار ومزامنتها بنجاح');
    } else {
      const newProperty: Property = {
        ...propertyData,
        id: `prop-${Date.now()}`,
        createdAt: new Date().toISOString().split('T')[0],
      };
      setProperties(prev => [newProperty, ...prev]);
      savePropertyToCloud(newProperty).catch(err => console.error('Cloud save property error:', err));
      showToast('تم تسجيل العقار الجديد ومزامنته سحابياً');
    }
  };

  // Triggers custom delete modal without window.confirm
  const handleDeleteProperty = (id: string) => {
    const prop = properties.find(p => p.id === id);
    setDeleteModalState({
      isOpen: true,
      type: 'property',
      id,
      title: 'تأكيد حذف العقار',
      itemName: prop ? `${prop.title} (${prop.referenceCode})` : 'العقار المحدد',
    });
  };

  const handleBulkDeleteProperties = () => {
    if (selectedPropertyIds.length === 0) return;
    setDeleteModalState({
      isOpen: true,
      type: 'bulk-properties',
      title: 'تأكيد الحذف الجماعي للعقارات',
      count: selectedPropertyIds.length,
    });
  };

  const handlePropertyStatusChange = (id: string, status: PropertyStatus) => {
    const existing = properties.find(p => p.id === id);
    if (existing) {
      const updated = { ...existing, status };
      setProperties(prev => prev.map(p => p.id === id ? updated : p));
      savePropertyToCloud(updated).catch(err => console.error('Cloud property status error:', err));
    }
    showToast('تم تحديث حالة العقار');
  };

  // Client Handlers
  const handleSaveClient = (clientData: Omit<Client, 'id' | 'createdAt'>, editingId?: string) => {
    if (editingId) {
      const existing = clients.find(c => c.id === editingId);
      const updated: Client = {
        ...(existing || {} as Client),
        ...clientData,
        id: editingId,
        createdAt: existing?.createdAt || new Date().toISOString().split('T')[0],
      };
      setClients(prev => prev.map(c => c.id === editingId ? updated : c));
      saveClientToCloud(updated).catch(err => console.error('Cloud save client error:', err));
      showToast('تم تحديث بيانات العميل بنجاح');
    } else {
      const newClient: Client = {
        ...clientData,
        id: `client-${Date.now()}`,
        createdAt: new Date().toISOString().split('T')[0],
      };
      setClients(prev => [newClient, ...prev]);
      saveClientToCloud(newClient).catch(err => console.error('Cloud save client error:', err));
      showToast('تم تسجيل العميل الجديد بنجاح');
    }
  };

  const handleDeleteClient = (id: string) => {
    const client = clients.find(c => c.id === id);
    setDeleteModalState({
      isOpen: true,
      type: 'client',
      id,
      title: 'تأكيد حذف العميل',
      itemName: client ? client.name : 'العميل المحدد',
    });
  };

  const handleBulkDeleteClients = () => {
    if (selectedClientIds.length === 0) return;
    setDeleteModalState({
      isOpen: true,
      type: 'bulk-clients',
      title: 'تأكيد الحذف الجماعي للعملاء',
      count: selectedClientIds.length,
    });
  };

  // Marketer Handlers & Promotions
  const handleSaveMarketer = (marketerData: Omit<Marketer, 'id' | 'createdAt'>, editingId?: string) => {
    if (editingId) {
      const existing = marketers.find(m => m.id === editingId);
      const updated: Marketer = {
        ...(existing || {} as Marketer),
        ...marketerData,
        id: editingId,
        createdAt: existing?.createdAt || new Date().toISOString().split('T')[0],
      };
      setMarketers(prev => prev.map(m => m.id === editingId ? updated : m));
      saveMarketerToCloud(updated).catch(err => console.error('Cloud save marketer error:', err));
      setProperties(prev => prev.map(p => {
        if (p.marketerId === editingId) {
          const propUpdated = { ...p, marketerName: marketerData.name };
          savePropertyToCloud(propUpdated).catch(err => console.error('Cloud prop marketer update error:', err));
          return propUpdated;
        }
        return p;
      }));
      showToast('تم تحديث بيانات المسوق العقاري بنجاح');
    } else {
      const newMarketer: Marketer = {
        ...marketerData,
        id: `marketer-${Date.now()}`,
        createdAt: new Date().toISOString().split('T')[0],
      };
      setMarketers(prev => [newMarketer, ...prev]);
      saveMarketerToCloud(newMarketer).catch(err => console.error('Cloud save marketer error:', err));
      showToast('تم تسجيل المسوق العقاري الجديد بنجاح');
    }
  };

  const handleDeleteMarketer = (id: string) => {
    const marketer = marketers.find(m => m.id === id);
    setDeleteModalState({
      isOpen: true,
      type: 'marketer',
      id,
      title: 'تأكيد حذف المسوق',
      itemName: marketer ? marketer.name : 'المسوق المحدد',
    });
  };

  const handleBulkDeleteMarketers = () => {
    if (selectedMarketerIds.length === 0) return;
    setDeleteModalState({
      isOpen: true,
      type: 'bulk-marketers',
      title: 'تأكيد الحذف الجماعي للمسوقين',
      count: selectedMarketerIds.length,
    });
  };

  // Centralized deletion executor that performs deletion and updates state safely
  const handleConfirmExecuteDelete = () => {
    if (!deleteModalState) return;

    switch (deleteModalState.type) {
      case 'property':
        if (deleteModalState.id) {
          const targetId = deleteModalState.id;
          setProperties(prev => prev.filter(p => p.id !== targetId));
          setSelectedPropertyIds(prev => prev.filter(itemId => itemId !== targetId));
          deletePropertyFromCloud(targetId).catch(err => console.error('Cloud delete property error:', err));
          showToast('تم حذف العقار ومزامنة الحذف بنجاح 🗑️');
        }
        break;

      case 'bulk-properties': {
        const count = selectedPropertyIds.length;
        const idsToDelete = [...selectedPropertyIds];
        setProperties(prev => prev.filter(p => !idsToDelete.includes(p.id)));
        setSelectedPropertyIds([]);
        idsToDelete.forEach(id => deletePropertyFromCloud(id).catch(err => console.error(err)));
        showToast(`تم حذف ${count} عقار محدد ومزامنة الحذف سحابياً 🗑️`);
        break;
      }

      case 'client':
        if (deleteModalState.id) {
          const targetId = deleteModalState.id;
          setClients(prev => prev.filter(c => c.id !== targetId));
          setSelectedClientIds(prev => prev.filter(itemId => itemId !== targetId));
          deleteClientFromCloud(targetId).catch(err => console.error('Cloud delete client error:', err));
          showToast('تم حذف العميل بنجاح 🗑️');
        }
        break;

      case 'bulk-clients': {
        const count = selectedClientIds.length;
        const idsToDelete = [...selectedClientIds];
        setClients(prev => prev.filter(c => !idsToDelete.includes(c.id)));
        setSelectedClientIds([]);
        idsToDelete.forEach(id => deleteClientFromCloud(id).catch(err => console.error(err)));
        showToast(`تم حذف ${count} عميل محدد بنجاح 🗑️`);
        break;
      }

      case 'marketer':
        if (deleteModalState.id) {
          const targetId = deleteModalState.id;
          setMarketers(prev => prev.filter(m => m.id !== targetId));
          setProperties(prev => prev.map(p => {
            if (p.marketerId === targetId) {
              const updatedProp = { ...p, marketerId: undefined, marketerName: undefined };
              savePropertyToCloud(updatedProp).catch(err => console.error(err));
              return updatedProp;
            }
            return p;
          }));
          setSelectedMarketerIds(prev => prev.filter(itemId => itemId !== targetId));
          deleteMarketerFromCloud(targetId).catch(err => console.error('Cloud delete marketer error:', err));
          showToast('تم حذف المسوق بنجاح 🗑️');
        }
        break;

      case 'bulk-marketers': {
        const count = selectedMarketerIds.length;
        const idsToDelete = [...selectedMarketerIds];
        setMarketers(prev => prev.filter(m => !idsToDelete.includes(m.id)));
        setProperties(prev => prev.map(p => {
          if (p.marketerId && idsToDelete.includes(p.marketerId)) {
            const updatedProp = { ...p, marketerId: undefined, marketerName: undefined };
            savePropertyToCloud(updatedProp).catch(err => console.error(err));
            return updatedProp;
          }
          return p;
        }));
        setSelectedMarketerIds([]);
        idsToDelete.forEach(id => deleteMarketerFromCloud(id).catch(err => console.error(err)));
        showToast(`تم حذف ${count} مسوق محدد بنجاح 🗑️`);
        break;
      }

      case 'reset-data':
        setProperties(INITIAL_PROPERTIES);
        setClients(INITIAL_CLIENTS);
        setAppointments(INITIAL_APPOINTMENTS);
        setMarketers(INITIAL_MARKETERS);
        setSelectedPropertyIds([]);
        setSelectedClientIds([]);
        setSelectedMarketerIds([]);
        localStorage.removeItem(STORAGE_KEY_PROPERTIES);
        localStorage.removeItem(STORAGE_KEY_CLIENTS);
        localStorage.removeItem(STORAGE_KEY_APPOINTMENTS);
        localStorage.removeItem(STORAGE_KEY_MARKETERS);
        // Reseed to cloud
        INITIAL_PROPERTIES.forEach(p => savePropertyToCloud(p).catch(console.error));
        INITIAL_CLIENTS.forEach(c => saveClientToCloud(c).catch(console.error));
        INITIAL_APPOINTMENTS.forEach(a => saveAppointmentToCloud(a).catch(console.error));
        INITIAL_MARKETERS.forEach(m => saveMarketerToCloud(m).catch(console.error));
        showToast('تمت استعادة البيانات النموذجية وتحديث السحابة بنجاح 🔄');
        break;
    }

    setDeleteModalState(null);
  };

  const handleOpenPromoteModal = (marketer: Marketer) => {
    setMarketerToPromote(marketer);
    setIsPromoteModalOpen(true);
  };

  const handleSavePromotion = (
    marketerId: string, 
    newTier: MarketerTier, 
    newCommissionRate: number, 
    bonusPercentage?: number
  ) => {
    setMarketers(prev => prev.map(m => {
      if (m.id === marketerId) {
        const updated: Marketer = {
          ...m,
          tier: newTier,
          commissionRate: newCommissionRate,
          bonusPercentage: bonusPercentage,
        };
        saveMarketerToCloud(updated).catch(err => console.error('Cloud save promotion error:', err));
        return updated;
      }
      return m;
    }));
    showToast('🎉 تم تعيين ترقية المسوق وتحديث نسبة العمولة والمزايا بنجاح');
  };

  // Appointment Handlers
  const handleAddAppointment = (appData: Omit<Appointment, 'id'>) => {
    const newApp: Appointment = {
      ...appData,
      id: `app-${Date.now()}`,
    };
    setAppointments(prev => [newApp, ...prev]);
    saveAppointmentToCloud(newApp).catch(err => console.error('Cloud save appointment error:', err));
    showToast('تمت جدولة الموعد بنجاح');
  };

  const handleUpdateAppointmentStatus = (id: string, status: AppointmentStatus) => {
    const existing = appointments.find(a => a.id === id);
    if (existing) {
      const updated = { ...existing, status };
      setAppointments(prev => prev.map(a => a.id === id ? updated : a));
      saveAppointmentToCloud(updated).catch(err => console.error('Cloud update appointment error:', err));
    }
    showToast('تم تحديث حالة الموعد');
  };

  const handleDeleteAppointment = (id: string) => {
    setAppointments(prev => prev.filter(a => a.id !== id));
    deleteAppointmentFromCloud(id).catch(err => console.error('Cloud delete appointment error:', err));
  };

  // Schedule visit action from detail views
  const handleScheduleVisitQuick = (property: Property, client?: Client) => {
    setActiveTab('appointments');
    showToast(`انتقلنا إلى المواعيد لجدولة معاينة عقار: ${property.title}`);
  };

  // Reset to sample initial data using custom modal
  const handleResetData = () => {
    setDeleteModalState({
      isOpen: true,
      type: 'reset-data',
      title: 'تأكيد استعادة البيانات النموذجية',
      itemName: 'إعادة ضبط كافة العقارات والعملاء والمواعيد وقائمة المسوقين إلى البيانات النموذجية الأصلية',
    });
  };

  // Export data as JSON
  const handleExportData = () => {
    const exportData = {
      properties,
      clients,
      appointments,
      marketers,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aqar_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('تم تنزيل ملف النسخة الاحتياطية بنجاح');
  };

  // Calculate total matches
  const totalMatchesCount = clients.reduce((sum, client) => {
    const matches = properties.filter(prop => {
      if (prop.status === 'sold' || prop.status === 'rented') return false;
      return calculateMatch(client, prop).isMatch;
    });
    return sum + (matches.length > 0 ? 1 : 0);
  }, 0);

  // Filter properties (respects both propertySearch and globalSearch)
  const activePropertyQuery = (propertySearch || globalSearch).trim().toLowerCase();
  const filteredProperties = properties.filter(prop => {
    const matchesSearch = !activePropertyQuery || (
      prop.title.toLowerCase().includes(activePropertyQuery) ||
      prop.city.toLowerCase().includes(activePropertyQuery) ||
      prop.neighborhood.toLowerCase().includes(activePropertyQuery) ||
      prop.referenceCode.toLowerCase().includes(activePropertyQuery) ||
      prop.ownerName.toLowerCase().includes(activePropertyQuery)
    );

    const matchesType = filterType === 'all' || prop.type === filterType;
    const matchesPurpose = filterPurpose === 'all' || prop.purpose === filterPurpose;
    const matchesCity = filterCity === 'all' || prop.city === filterCity;
    const matchesStatus = filterStatus === 'all' || prop.status === filterStatus;

    return matchesSearch && matchesType && matchesPurpose && matchesCity && matchesStatus;
  });

  // Filter clients (respects both clientSearch and globalSearch)
  const activeClientQuery = (clientSearch || globalSearch).trim().toLowerCase();
  const filteredClients = clients.filter(client => {
    const matchesSearch = !activeClientQuery || (
      client.name.toLowerCase().includes(activeClientQuery) ||
      client.phone.toLowerCase().includes(activeClientQuery) ||
      client.preferredCities.some(c => c.toLowerCase().includes(activeClientQuery)) ||
      (client.notes && client.notes.toLowerCase().includes(activeClientQuery))
    );

    const matchesRole = filterClientRole === 'all' || client.role === filterClientRole;

    return matchesSearch && matchesRole;
  });

  const uniqueCities = Array.from(new Set(properties.map(p => p.city)));

  // If no user is logged in, show AuthScreen with client entry portal
  if (!currentUser) {
    return (
      <>
        {toastMessage && (
          <div className="fixed bottom-5 left-5 z-50 bg-slate-900 text-white text-xs font-semibold py-2.5 px-4 rounded-lg shadow-xl flex items-center gap-2 border border-blue-500/40 animate-in fade-in slide-in-from-bottom-4 duration-150">
            <CheckCircle2 className="w-4 h-4 text-blue-400" />
            <span>{toastMessage}</span>
          </div>
        )}
        <AuthScreen
          users={users}
          onLoginSuccess={handleLoginSuccess}
          properties={properties}
          onSubmitClientRequest={handleSubmitClientRequestFromPortal}
          onViewProperty={(prop) => setViewingProperty(prop)}
        />
        {viewingProperty && (
          <PropertyDetailModal
            property={viewingProperty}
            clients={clients}
            onClose={() => setViewingProperty(null)}
            onScheduleVisit={handleScheduleVisitQuick}
          />
        )}
      </>
    );
  }

  return (
    <div className="flex h-screen w-full bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans overflow-hidden" dir="rtl">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 left-5 z-50 bg-slate-900 text-white text-xs font-semibold py-2.5 px-4 rounded-lg shadow-xl flex items-center gap-2 border border-blue-500/40 animate-in fade-in slide-in-from-bottom-4 duration-150">
          <CheckCircle2 className="w-4 h-4 text-blue-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* High Density Dark Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        propertiesCount={properties.length}
        clientsCount={clients.length}
        marketersCount={marketers.length}
        usersCount={users.length}
        matchedCount={totalMatchesCount}
        appointmentsCount={appointments.length}
        onResetData={handleResetData}
        onExportData={handleExportData}
        isMobileOpen={isMobileSidebarOpen}
        setIsMobileOpen={setIsMobileSidebarOpen}
        currentUserRole={currentUserRole}
        currentUser={currentUser}
        isAdminAuthenticated={isAdminAuthenticated}
        users={users}
        onSwitchEmployee={isAdminAuthenticated ? handleSwitchEmployee : undefined}
        onReturnToAdmin={isAdminAuthenticated ? handleReturnToAdmin : undefined}
        onToggleUserRole={isAdminAuthenticated ? handleToggleUserRole : undefined}
        onLogout={handleLogout}
      />

      {/* Main View Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Motivational Marketing Banner */}
        <TopMotivationBanner />

        {/* Top Header */}
        <Header
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          globalSearch={globalSearch}
          setGlobalSearch={setGlobalSearch}
          onNewProperty={() => {
            setPropertyToEdit(null);
            setIsPropertyModalOpen(true);
          }}
          onNewClient={() => {
            setClientToEdit(null);
            setIsClientModalOpen(true);
          }}
          onNewMarketer={() => {
            setMarketerToEdit(null);
            setIsMarketerModalOpen(true);
          }}
          onNewUser={() => {
            setUserToEdit(null);
            setIsUserModalOpen(true);
          }}
          onOpenMobileMenu={() => setIsMobileSidebarOpen(true)}
          currentUserRole={currentUserRole}
          currentUser={currentUser}
          isAdminAuthenticated={isAdminAuthenticated}
          isCloudSynced={isCloudSynced}
          onReturnToAdmin={isAdminAuthenticated ? handleReturnToAdmin : undefined}
          onToggleUserRole={isAdminAuthenticated ? handleToggleUserRole : undefined}
          onLogout={handleLogout}
        />

        {/* شريط تنبيه معاينة الموظف للمسؤول */}
        {isAdminAuthenticated && currentUser?.id !== authenticatedUser?.id && (
          <div className="bg-amber-500/10 border-b border-amber-500/30 px-4 py-2 flex items-center justify-between text-xs text-amber-900 dark:text-amber-200 shrink-0">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              </span>
              <span>
                أنت الآن تتصفح النظام في وضع المعاينة كـ: <strong>{currentUser?.name}</strong> (صلاحيات مقيدة)
              </span>
            </div>
            <button
              type="button"
              onClick={handleReturnToAdmin}
              className="px-3 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition-colors shadow-2xs flex items-center gap-1.5"
            >
              <span>العودة لحساب المسؤول العام 👑</span>
            </button>
          </div>
        )}

        {/* Scrollable View Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {/* ================= TAB 0: DASHBOARD / OVERVIEW ================= */}
          {activeTab === 'stats' && (
            <StatsOverview
              properties={properties}
              clients={clients}
              appointments={appointments}
              onViewProperty={(prop) => setViewingProperty(prop)}
              onViewClient={(c) => setViewingClient(c)}
              onNavigateToTab={(tab) => setActiveTab(tab)}
            />
          )}

          {/* ================= TAB 1: PROPERTIES ================= */}
          {activeTab === 'properties' && (
            <div className="space-y-4">
              {/* Filter and View Toggle Card */}
              <div className="bg-white dark:bg-slate-900 rounded-xl p-3 sm:p-4 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                  {/* Search box */}
                  <div className="relative w-full sm:max-w-md">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                    <input
                      id="input-search-properties"
                      type="text"
                      value={propertySearch}
                      onChange={(e) => setPropertySearch(e.target.value)}
                      placeholder="بحث بالعنوان، الحي، المدينة، الكود، المالك..."
                      className="w-full text-xs pr-8 pl-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:bg-white dark:focus:bg-slate-850 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                    />
                  </div>

                  {/* View mode toggle + Add button */}
                  <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                    <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs">
                      <button
                        onClick={() => setPropertyViewMode('table')}
                        className={`p-1.5 rounded-md flex items-center gap-1 transition-all ${
                          propertyViewMode === 'table' ? 'bg-white dark:bg-slate-700 shadow-xs text-blue-600 dark:text-blue-400 font-semibold' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                        }`}
                        title="عرض كجدول عالي الكثافة"
                      >
                        <List className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline text-[11px]">جدول</span>
                      </button>
                      <button
                        onClick={() => setPropertyViewMode('cards')}
                        className={`p-1.5 rounded-md flex items-center gap-1 transition-all ${
                          propertyViewMode === 'cards' ? 'bg-white dark:bg-slate-700 shadow-xs text-blue-600 dark:text-blue-400 font-semibold' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                        }`}
                        title="عرض كبطاقات"
                      >
                        <LayoutGrid className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline text-[11px]">بطاقات</span>
                      </button>
                    </div>

                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      العدد: <strong className="text-slate-900 dark:text-white font-bold">{filteredProperties.length}</strong>
                    </span>

                    <button
                      id="btn-add-prop-inner"
                      onClick={() => {
                        setPropertyToEdit(null);
                        setIsPropertyModalOpen(true);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>إضافة عقار</span>
                    </button>
                  </div>
                </div>

                {/* Filter pills row */}
                <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-2">
                  {/* Purpose Filter */}
                  <div className="flex items-center gap-0.5 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-xs">
                    <button
                      onClick={() => setFilterPurpose('all')}
                      className={`px-2.5 py-1 rounded-md text-xs transition-all ${
                        filterPurpose === 'all' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-bold' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      الكل
                    </button>
                    <button
                      onClick={() => setFilterPurpose('sale')}
                      className={`px-2.5 py-1 rounded-md text-xs transition-all ${
                        filterPurpose === 'sale' ? 'bg-blue-600 text-white font-bold' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      للبيع
                    </button>
                    <button
                      onClick={() => setFilterPurpose('rent')}
                      className={`px-2.5 py-1 rounded-md text-xs transition-all ${
                        filterPurpose === 'rent' ? 'bg-slate-900 dark:bg-slate-700 text-white font-bold' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      للإيجار
                    </button>
                  </div>

                  {/* Type Filter */}
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="text-xs px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 font-medium outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="all">كافة أنواع العقارات</option>
                    {PROPERTY_TYPES.map(t => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>

                  {/* City Filter */}
                  <select
                    value={filterCity}
                    onChange={(e) => setFilterCity(e.target.value)}
                    className="text-xs px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 font-medium outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="all">كافة المدن</option>
                    {uniqueCities.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>

                  {/* Status Filter */}
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="text-xs px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 font-medium outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="all">كافة الحالات</option>
                    <option value="available">متاح</option>
                    <option value="reserved">محجوز</option>
                    <option value="sold">تم البيع</option>
                    <option value="rented">تم التأجير</option>
                  </select>

                  {(filterType !== 'all' || filterPurpose !== 'all' || filterCity !== 'all' || filterStatus !== 'all' || propertySearch) && (
                    <button
                      onClick={() => {
                        setFilterType('all');
                        setFilterPurpose('all');
                        setFilterCity('all');
                        setFilterStatus('all');
                        setPropertySearch('');
                      }}
                      className="text-xs text-rose-600 hover:text-rose-700 font-medium px-2 py-1"
                    >
                      إعادة ضبط
                    </button>
                  )}
                </div>
              </div>

              {/* Bulk Action Bar for Properties */}
              {selectedPropertyIds.length > 0 && (
                <BulkActionBar
                  selectedCount={selectedPropertyIds.length}
                  totalCount={filteredProperties.length}
                  itemLabel="عقار"
                  isAdmin={isAdmin}
                  onClearSelection={() => setSelectedPropertyIds([])}
                  onBulkDelete={handleBulkDeleteProperties}
                  onSelectAll={() => handleToggleSelectAllProperties(filteredProperties.map(p => p.id))}
                  allSelected={filteredProperties.length > 0 && selectedPropertyIds.length === filteredProperties.length}
                />
              )}

              {/* View Presentation */}
              {filteredProperties.length > 0 ? (
                propertyViewMode === 'table' ? (
                  <PropertyTable
                    properties={filteredProperties}
                    clients={clients}
                    onView={(prop) => setViewingProperty(prop)}
                    onEdit={(prop) => {
                      setPropertyToEdit(prop);
                      setIsPropertyModalOpen(true);
                    }}
                    onDelete={handleDeleteProperty}
                    onStatusChange={handlePropertyStatusChange}
                    selectedIds={selectedPropertyIds}
                    onToggleSelect={handleToggleSelectProperty}
                    onToggleSelectAll={() => handleToggleSelectAllProperties(filteredProperties.map(p => p.id))}
                    onBulkDelete={handleBulkDeleteProperties}
                    isAdmin={isAdmin}
                  />
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredProperties.map(property => (
                      <PropertyCard
                        key={property.id}
                        property={property}
                        clients={clients}
                        onView={(prop) => setViewingProperty(prop)}
                        onEdit={(prop) => {
                          setPropertyToEdit(prop);
                          setIsPropertyModalOpen(true);
                        }}
                        onDelete={handleDeleteProperty}
                        onStatusChange={handlePropertyStatusChange}
                        isSelected={selectedPropertyIds.includes(property.id)}
                        onToggleSelect={() => handleToggleSelectProperty(property.id)}
                        isAdmin={isAdmin}
                      />
                    ))}
                  </div>
                )
              ) : (
                <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
                  <Building2 className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                  <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-1">لم يتم العثور على أي عقار</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-3">
                    لا توجد نتائج مطابقة لبحثك أو الفلاتر المحددة. جرب تغيير كلمة البحث أو سجل عقاراً جديداً.
                  </p>
                  <button
                    onClick={() => {
                      setPropertyToEdit(null);
                      setIsPropertyModalOpen(true);
                    }}
                    className="px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                  >
                    تسجيل عقار جديد
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ================= TAB 1.5: GOOGLE MAPS VIEW ================= */}
          {activeTab === 'map' && (
            <PropertiesMapView
              properties={properties}
              onSelectProperty={(prop) => setViewingProperty(prop)}
            />
          )}

          {/* ================= TAB 2: CLIENTS ================= */}
          {activeTab === 'clients' && (
            <div className="space-y-4">
              {/* Search & Filters Card */}
              <div className="bg-white dark:bg-slate-900 rounded-xl p-3 sm:p-4 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="relative w-full sm:max-w-md">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="input-search-clients"
                    type="text"
                    value={clientSearch}
                    onChange={(e) => setClientSearch(e.target.value)}
                    placeholder="ابحث بالاسم، الهاتف، المدينة، أو الملاحظات..."
                    className="w-full text-xs pr-8 pl-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:bg-white dark:focus:bg-slate-850 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                  />
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-end flex-wrap">
                  {/* View Mode Toggle */}
                  <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs">
                    <button
                      onClick={() => setClientViewMode('cards')}
                      className={`p-1.5 rounded-md flex items-center gap-1 transition-all ${
                        clientViewMode === 'cards' ? 'bg-white dark:bg-slate-700 shadow-xs text-blue-600 dark:text-blue-400 font-semibold' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                      }`}
                      title="عرض كبطاقات"
                    >
                      <LayoutGrid className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline text-[11px]">بطاقات</span>
                    </button>
                    <button
                      onClick={() => setClientViewMode('table')}
                      className={`p-1.5 rounded-md flex items-center gap-1 transition-all ${
                        clientViewMode === 'table' ? 'bg-white dark:bg-slate-700 shadow-xs text-blue-600 dark:text-blue-400 font-semibold' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                      }`}
                      title="عرض كجدول عالي الكثافة"
                    >
                      <List className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline text-[11px]">جدول</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-0.5 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-xs">
                    <button
                      onClick={() => setFilterClientRole('all')}
                      className={`px-2.5 py-1 rounded-md text-xs transition-all ${
                        filterClientRole === 'all' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-bold' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      كافة الأدوار
                    </button>
                    {CLIENT_ROLES.map(r => (
                      <button
                        key={r.value}
                        onClick={() => setFilterClientRole(r.value)}
                        className={`px-2.5 py-1 rounded-md text-xs transition-all ${
                          filterClientRole === r.value ? 'bg-blue-600 text-white font-bold' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        {r.label}
                      </button>
                    ))}
                  </div>

                  <button
                    id="btn-add-client-whatsapp"
                    onClick={() => {
                      setClientToEdit(null);
                      setIsClientModalOpen(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-all active:scale-95"
                    title="استيراد وتعبئة بيانات العميل ذكياً من نص رسالة الواتساب"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>استيراد ذكي من واتساب ✨</span>
                  </button>

                  <button
                    id="btn-add-client-inner"
                    onClick={() => {
                      setClientToEdit(null);
                      setIsClientModalOpen(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>تسجيل عميل</span>
                  </button>
                </div>
              </div>

              {/* Bulk Action Bar for Clients */}
              {selectedClientIds.length > 0 && (
                <BulkActionBar
                  selectedCount={selectedClientIds.length}
                  totalCount={filteredClients.length}
                  itemLabel="عميل"
                  isAdmin={isAdmin}
                  onClearSelection={() => setSelectedClientIds([])}
                  onBulkDelete={handleBulkDeleteClients}
                  onSelectAll={() => handleToggleSelectAllClients(filteredClients.map(c => c.id))}
                  allSelected={filteredClients.length > 0 && selectedClientIds.length === filteredClients.length}
                />
              )}

              {/* Clients presentation */}
              {filteredClients.length > 0 ? (
                clientViewMode === 'table' ? (
                  <ClientTable
                    clients={filteredClients}
                    properties={properties}
                    onView={(c) => setViewingClient(c)}
                    onEdit={(c) => {
                      setClientToEdit(c);
                      setIsClientModalOpen(true);
                    }}
                    onDelete={handleDeleteClient}
                    onViewMatches={(c) => setViewingClient(c)}
                    selectedIds={selectedClientIds}
                    onToggleSelect={handleToggleSelectClient}
                    onToggleSelectAll={() => handleToggleSelectAllClients(filteredClients.map(c => c.id))}
                    onBulkDelete={handleBulkDeleteClients}
                    isAdmin={isAdmin}
                  />
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredClients.map(client => (
                      <ClientCard
                        key={client.id}
                        client={client}
                        properties={properties}
                        onView={(c) => setViewingClient(c)}
                        onEdit={(c) => {
                          setClientToEdit(c);
                          setIsClientModalOpen(true);
                        }}
                        onDelete={handleDeleteClient}
                        onViewMatches={(c) => setViewingClient(c)}
                        isSelected={selectedClientIds.includes(client.id)}
                        onToggleSelect={() => handleToggleSelectClient(client.id)}
                        isAdmin={isAdmin}
                      />
                    ))}
                  </div>
                )
              ) : (
                <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
                  <Users className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                  <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-1">لم يتم العثور على أي عميل</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-3">
                    لا توجد نتائج مطابقة لبحثك. سجل عميل جديد لتتبع طلباته وتزويده بالعروض المتطابقة.
                  </p>
                  <button
                    onClick={() => {
                      setClientToEdit(null);
                      setIsClientModalOpen(true);
                    }}
                    className="px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                  >
                    تسجيل عميل جديد
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ================= TAB 3: SMART MATCHING ================= */}
          {activeTab === 'matching' && (
            <SmartMatchingView
              properties={properties}
              clients={clients}
              onScheduleVisit={handleScheduleVisitQuick}
              onViewProperty={(prop) => setViewingProperty(prop)}
              onViewClient={(c) => setViewingClient(c)}
              onAddNewProperty={() => {
                setPropertyToEdit(null);
                setIsPropertyModalOpen(true);
              }}
              onAddNewClient={() => {
                setClientToEdit(null);
                setIsClientModalOpen(true);
              }}
            />
          )}

          {/* ================= TAB 4: VISITS & APPOINTMENTS ================= */}
          {activeTab === 'appointments' && (
            <VisitsView
              appointments={appointments}
              properties={properties}
              clients={clients}
              onAddAppointment={handleAddAppointment}
              onUpdateStatus={handleUpdateAppointmentStatus}
              onDeleteAppointment={handleDeleteAppointment}
            />
          )}

          {/* ================= TAB 5: MARKETERS ================= */}
          {activeTab === 'marketers' && (
            <MarketersView
              marketers={marketers}
              properties={properties}
              selectedIds={selectedMarketerIds}
              onToggleSelect={handleToggleSelectMarketer}
              onToggleSelectAll={() => handleToggleSelectAllMarketers(marketers.map(m => m.id))}
              onBulkDelete={handleBulkDeleteMarketers}
              isAdmin={isAdmin}
              onPromoteMarketer={handleOpenPromoteModal}
              onAddMarketer={() => {
                setMarketerToEdit(null);
                setIsMarketerModalOpen(true);
              }}
              onEditMarketer={(m) => {
                setMarketerToEdit(m);
                setIsMarketerModalOpen(true);
              }}
              onDeleteMarketer={handleDeleteMarketer}
              onViewMarketerProperties={(mId) => {
                const targetMarketer = marketers.find(m => m.id === mId);
                if (targetMarketer) {
                  setPropertySearch(targetMarketer.name);
                }
                setActiveTab('properties');
              }}
            />
          )}

          {/* ================= TAB 6: USERS & PASSWORDS (ADMIN ONLY) ================= */}
          {activeTab === 'users' && (
            <UserManagementView
              users={users}
              marketers={marketers}
              currentUser={currentUser}
              onNewUser={() => {
                setUserToEdit(null);
                setIsUserModalOpen(true);
              }}
              onEditUser={(u) => {
                setUserToEdit(u);
                setIsUserModalOpen(true);
              }}
              onDeleteUser={handleDeleteUser}
              onToggleUserStatus={handleToggleUserStatus}
              onSwitchEmployee={isAdminAuthenticated ? handleSwitchEmployee : undefined}
            />
          )}
        </main>
      </div>

      {/* ================= MODALS ================= */}
      <PropertyModal
        isOpen={isPropertyModalOpen}
        onClose={() => {
          setIsPropertyModalOpen(false);
          setPropertyToEdit(null);
        }}
        onSave={handleSaveProperty}
        propertyToEdit={propertyToEdit}
        marketers={marketers}
        onQuickAddMarketer={() => {
          setMarketerToEdit(null);
          setIsMarketerModalOpen(true);
        }}
      />

      <ClientModal
        isOpen={isClientModalOpen}
        onClose={() => {
          setIsClientModalOpen(false);
          setClientToEdit(null);
        }}
        onSave={handleSaveClient}
        clientToEdit={clientToEdit}
      />

      <MarketerModal
        isOpen={isMarketerModalOpen}
        onClose={() => {
          setIsMarketerModalOpen(false);
          setMarketerToEdit(null);
        }}
        onSave={handleSaveMarketer}
        marketerToEdit={marketerToEdit}
      />

      <PropertyDetailModal
        property={viewingProperty}
        clients={clients}
        onClose={() => setViewingProperty(null)}
        onScheduleVisit={handleScheduleVisitQuick}
      />

      <ClientDetailModal
        client={viewingClient}
        properties={properties}
        onClose={() => setViewingClient(null)}
        onSelectProperty={(prop) => {
          setViewingClient(null);
          setViewingProperty(prop);
        }}
        onScheduleVisit={handleScheduleVisitQuick}
      />

      <PromoteMarketerModal
        isOpen={isPromoteModalOpen}
        marketer={marketerToPromote}
        onClose={() => {
          setIsPromoteModalOpen(false);
          setMarketerToPromote(null);
        }}
        onPromote={handleSavePromotion}
      />

      <UserModal
        isOpen={isUserModalOpen}
        onClose={() => {
          setIsUserModalOpen(false);
          setUserToEdit(null);
        }}
        onSave={handleSaveUser}
        userToEdit={userToEdit}
        marketers={marketers}
      />

      {/* Reusable In-App Deletion Confirmation Modal */}
      <ConfirmDeleteModal
        modalState={deleteModalState}
        onClose={() => setDeleteModalState(null)}
        onConfirm={handleConfirmExecuteDelete}
        isAdmin={isAdmin}
      />
    </div>
  );
}
