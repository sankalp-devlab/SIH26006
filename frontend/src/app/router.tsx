import { createBrowserRouter } from 'react-router-dom';
import { AppShell } from './layouts/AppShell';
import { LandingPage } from '../features/landing/LandingPage';
import { DashboardPage } from '../features/dashboard/DashboardPage';
import { VesselsPage } from '../features/vessels/VesselsPage';
import { VesselDashboardPage } from '../features/vessels/VesselDashboardPage';
import { VesselMapPage } from '../features/map/VesselMapPage';
import { PortsPage } from '../features/ports/PortsPage';
import { CargoPage } from '../features/cargo/CargoPage';
import { RoutesPage } from '../features/routes/RoutesPage';
import { VoyagesPage } from '../features/voyages/VoyagesPage';
import { BookingsPage } from '../features/bookings/BookingsPage';
import { TrackingDashboardPage } from '../features/tracking/TrackingDashboardPage';
import { AnalyticsPage } from '../features/analytics/AnalyticsPage';
import { VesselBookingIntelligencePage } from '../features/vessel-intelligence/VesselBookingIntelligencePage';
import OperationsPage from '../features/operations/OperationsPage';
import { NotFoundPage } from '../pages/NotFoundPage';

// Stubs & Capability Modules
import FixturesPage from '../features/fixtures/FixturesPage';
import VoyageCalculatorPage from '../features/voyage-calculator/VoyageCalculatorPage';
import DistanceCalculatorPage from '../features/distance-calculator/DistanceCalculatorPage';
import FreightAnalyticsPage from '../features/analytics/FreightAnalyticsPage';
import MarketInsightsPage from '../features/analytics/MarketInsightsPage';
import FlowsPage from '../features/analytics/FlowsPage';
import EmissionsPage from '../features/analytics/EmissionsPage';
import ValuationsPage from '../features/analytics/ValuationsPage';
import OrderbookPage from '../features/analytics/OrderbookPage';
import WaypointsPage from '../features/analytics/WaypointsPage';
import FloatingStoragePage from '../features/analytics/FloatingStoragePage';
import FleetsPage from '../features/analytics/FleetsPage';
import MarketPricesPage from '../features/analytics/MarketPricesPage';
import ReportsPage from '../features/analytics/ReportsPage';
import DataQueryPage from '../features/data-query/DataQueryPage';
import SkipperPage from '../features/skipper/SkipperPage';
import SettingsPage from '../features/settings/SettingsPage';
import NotificationsPage from '../features/notifications/NotificationsPage';
import WorkspacePage from '../features/workspace/WorkspacePage';
import { RouteErrorBoundary } from '../components/feedback/RouteErrorBoundary';

// Module 27: Mobile Frontend Views
import { MobileAppShell } from '../components/mobile/MobileAppShell';
import { MobileVesselsView } from '../features/mobile/MobileVesselsView';
import { MobileVesselDetailView } from '../features/mobile/MobileVesselDetailView';
import { MobileDistanceView } from '../features/mobile/MobileDistanceView';
import { MobileCalculatorView } from '../features/mobile/MobileCalculatorView';
import { MobileFixturesView } from '../features/mobile/MobileFixturesView';
import { MobileListsView } from '../features/mobile/MobileListsView';
import { MobilePositionUpdaterView } from '../features/mobile/MobilePositionUpdaterView';
import { MobilePortsView } from '../features/mobile/MobilePortsView';
import { MobileSkipperView } from '../features/mobile/MobileSkipperView';
import { MobileWorkspaceView } from '../features/mobile/MobileWorkspaceView';
import { ExcelTaskpanePage } from '../features/excel/ExcelTaskpanePage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <LandingPage />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: '/excel-taskpane',
    element: <ExcelTaskpanePage />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    element: <AppShell />,
    errorElement: <RouteErrorBoundary />,
    children: [
      {
        path: '/dashboard',
        element: <DashboardPage />,
      },
      {
        path: '/cargo',
        element: <CargoPage />,
      },
      {
        path: '/bookings',
        element: <BookingsPage />,
      },
      {
        path: '/vessel-intelligence',
        element: <VesselBookingIntelligencePage />,
      },
      {
        path: '/booking-intelligence',
        element: <VesselBookingIntelligencePage />,
      },
      {
        path: '/vessel-booking-intelligence',
        element: <VesselBookingIntelligencePage />,
      },
      {
        path: '/tracking',
        element: <TrackingDashboardPage />,
      },
      {
        path: '/vessels',
        element: <VesselsPage />,
      },
      {
        path: '/map',
        element: <VesselMapPage />,
      },
      {
        path: '/live-map',
        element: <VesselMapPage />,
      },
      {
        path: '/vessel-map',
        element: <VesselMapPage />,
      },
      {
        path: '/vessels/map',
        element: <VesselMapPage />,
      },
      {
        path: '/fleet-map',
        element: <VesselMapPage />,
      },
      {
        path: '/tracking/map',
        element: <VesselMapPage />,
      },
      {
        path: '/vessels/:id',
        element: <VesselDashboardPage />,
      },
      {
        path: '/ports',
        element: <PortsPage />,
      },
      {
        path: '/routes',
        element: <RoutesPage />,
      },
      {
        path: '/voyages',
        element: <VoyagesPage />,
      },
      // Operations Stubs
      {
        path: '/fixtures',
        element: <FixturesPage />,
      },
      {
        path: '/voyage-calculator',
        element: <VoyageCalculatorPage />,
      },
      {
        path: '/distance-calculator',
        element: <DistanceCalculatorPage />,
      },
      // Operations Master Hub Route
      {
        path: '/operations',
        element: <OperationsPage />,
      },
      // Analytics Master & Sub-routes
      {
        path: '/analytics',
        element: <AnalyticsPage />,
      },
      // Commercial Bookings (Operations / Analytics)
      {
        path: '/commercial-bookings',
        element: <BookingsPage />,
      },
      {
        path: '/analytics/bookings',
        element: <BookingsPage />,
      },
      {
        path: '/analytics/commercial-bookings',
        element: <BookingsPage />,
      },
      // Voyages Analytics
      {
        path: '/voyages-analytics',
        element: <VoyagesPage />,
      },
      {
        path: '/analytics/voyages',
        element: <VoyagesPage />,
      },
      {
        path: '/analytics/voyages-analytics',
        element: <VoyagesPage />,
      },
      // Freight Analytics (M14)
      {
        path: '/analytics/freight',
        element: <FreightAnalyticsPage />,
      },
      {
        path: '/analytics/freight-analytics',
        element: <FreightAnalyticsPage />,
      },
      {
        path: '/freight-analytics',
        element: <FreightAnalyticsPage />,
      },
      {
        path: '/freight',
        element: <FreightAnalyticsPage />,
      },
      // Market Insights (M5)
      {
        path: '/analytics/market',
        element: <MarketInsightsPage />,
      },
      {
        path: '/analytics/market-insights',
        element: <MarketInsightsPage />,
      },
      {
        path: '/market-insights',
        element: <MarketInsightsPage />,
      },
      {
        path: '/market',
        element: <MarketInsightsPage />,
      },
      // Trade Flows (M16)
      {
        path: '/analytics/flows',
        element: <FlowsPage />,
      },
      {
        path: '/analytics/trade-flows',
        element: <FlowsPage />,
      },
      {
        path: '/flows',
        element: <FlowsPage />,
      },
      {
        path: '/trade-flows',
        element: <FlowsPage />,
      },
      // Emissions Intelligence (M21)
      {
        path: '/analytics/emissions',
        element: <EmissionsPage />,
      },
      {
        path: '/analytics/cii',
        element: <EmissionsPage />,
      },
      {
        path: '/emissions',
        element: <EmissionsPage />,
      },
      {
        path: '/cii',
        element: <EmissionsPage />,
      },
      // Vessel Valuations (M22)
      {
        path: '/analytics/valuations',
        element: <ValuationsPage />,
      },
      {
        path: '/valuations',
        element: <ValuationsPage />,
      },
      // Fleet Orderbook (M17)
      {
        path: '/analytics/orderbook',
        element: <OrderbookPage />,
      },
      {
        path: '/analytics/order-book',
        element: <OrderbookPage />,
      },
      {
        path: '/orderbook',
        element: <OrderbookPage />,
      },
      {
        path: '/order-book',
        element: <OrderbookPage />,
      },
      // Waypoints & Chokepoints (M18)
      {
        path: '/analytics/waypoints',
        element: <WaypointsPage />,
      },
      {
        path: '/analytics/canals',
        element: <WaypointsPage />,
      },
      {
        path: '/waypoints',
        element: <WaypointsPage />,
      },
      {
        path: '/canals',
        element: <WaypointsPage />,
      },
      // Floating Storage (M20)
      {
        path: '/analytics/floating-storage',
        element: <FloatingStoragePage />,
      },
      {
        path: '/analytics/storage',
        element: <FloatingStoragePage />,
      },
      {
        path: '/floating-storage',
        element: <FloatingStoragePage />,
      },
      {
        path: '/storage',
        element: <FloatingStoragePage />,
      },
      // Fleet Intelligence (M19)
      {
        path: '/analytics/fleet',
        element: <FleetsPage />,
      },
      {
        path: '/analytics/fleets',
        element: <FleetsPage />,
      },
      {
        path: '/analytics/fleet-intelligence',
        element: <FleetsPage />,
      },
      {
        path: '/fleets',
        element: <FleetsPage />,
      },
      {
        path: '/fleet',
        element: <FleetsPage />,
      },
      {
        path: '/fleet-intelligence',
        element: <FleetsPage />,
      },
      // Market Prices (M23) - Route fix for /analytics/prices & aliases
      {
        path: '/analytics/market-prices',
        element: <MarketPricesPage />,
      },
      {
        path: '/analytics/prices',
        element: <MarketPricesPage />,
      },
      {
        path: '/analytics/pricing',
        element: <MarketPricesPage />,
      },
      {
        path: '/market-prices',
        element: <MarketPricesPage />,
      },
      {
        path: '/prices',
        element: <MarketPricesPage />,
      },
      {
        path: '/pricing',
        element: <MarketPricesPage />,
      },
      // Reporting & Analytics (M25)
      {
        path: '/analytics/reports',
        element: <ReportsPage />,
      },
      {
        path: '/analytics/reporting',
        element: <ReportsPage />,
      },
      {
        path: '/reports',
        element: <ReportsPage />,
      },
      {
        path: '/reporting',
        element: <ReportsPage />,
      },
      // System & Data Workbench
      {
        path: '/analytics/data-query',
        element: <DataQueryPage />,
      },
      {
        path: '/data-query',
        element: <DataQueryPage />,
      },
      // Module 26: Skipper AI Assistant
      {
        path: '/skipper',
        element: <SkipperPage />,
      },
      {
        path: '/analytics/skipper',
        element: <SkipperPage />,
      },
      {
        path: '/analytics/skipper-ai',
        element: <SkipperPage />,
      },
      {
        path: '/notifications',
        element: <NotificationsPage />,
      },
      {
        path: '/alerts',
        element: <NotificationsPage />,
      },
      // Module 29: Personalization / User Workspace
      {
        path: '/workspace',
        element: <WorkspacePage />,
      },
      {
        path: '/personalization',
        element: <WorkspacePage />,
      },
      {
        path: '/settings',
        element: <SettingsPage />,
      },
      // 404 Fallback
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
  // Module 27: Mobile Frontend Application Shell
  {
    path: '/m',
    element: <MobileAppShell />,
    errorElement: <RouteErrorBoundary />,
    children: [
      {
        index: true,
        element: <MobileVesselsView />,
      },
      {
        path: 'vessels',
        element: <MobileVesselsView />,
      },
      {
        path: 'vessels/:id',
        element: <MobileVesselDetailView />,
      },
      {
        path: 'distance',
        element: <MobileDistanceView />,
      },
      {
        path: 'calculator',
        element: <MobileCalculatorView />,
      },
      {
        path: 'fixtures',
        element: <MobileFixturesView />,
      },
      {
        path: 'lists',
        element: <MobileListsView />,
      },
      {
        path: 'updater',
        element: <MobilePositionUpdaterView />,
      },
      {
        path: 'ports',
        element: <MobilePortsView />,
      },
      {
        path: 'skipper',
        element: <MobileSkipperView />,
      },
      {
        path: 'notifications',
        element: <NotificationsPage />,
      },
      {
        path: 'workspace',
        element: <MobileWorkspaceView />,
      },
    ],
  },
]);
