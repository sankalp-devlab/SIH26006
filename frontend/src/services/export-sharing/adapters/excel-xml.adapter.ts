/**
 * SIH 26006 Maritime Intelligence Platform
 * MODULE 30 & 31: EXPORT & SHARING — Microsoft Excel XML Format Adapter (SpreadsheetML)
 *
 * Generates pure zero-dependency Microsoft Excel XML workbooks:
 * - Direct .xls / .xml file generation recognized natively by Microsoft Excel
 * - Styled header row (Navy background #0f172a, Sky-blue bold text #38bdf8)
 * - Frozen header pane for comfortable spreadsheet scrolling
 * - Multi-sheet support: Data, Query Config, Pivot Matrix, Charts, Provenance Metadata
 * - Type-safe cell tagging (<Data ss:Type="Number">, <Data ss:Type="String">)
 * - Formula calculation support (<Cell ss:Formula="=SUM(...)">)
 */

import type { ExportColumnDefinition, ExportProvenanceMetadata } from '../../../types/export-sharing';
import { ExportFormatter } from '../export-formatter.service';

export class ExcelXmlAdapter {
  /**
   * XML special character entity encoding
   */
  public static escapeXml(str: any): string {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  /**
   * Common SpreadsheetML Styles Definitions including Analytical styles for Module 31
   */
  public static getStylesXml(): string {
    return `  <!-- Default Body Style -->
  <Style ss:ID="Default" ss:Name="Normal">
   <Alignment ss:Vertical="Center"/>
   <Borders/>
   <Font ss:FontName="Calibri" x:Family="Swiss" ss:Size="11" ss:Color="#000000"/>
   <Interior/>
   <NumberFormat/>
   <Protection/>
  </Style>
  <!-- Table Header Style -->
  <Style ss:ID="HeaderStyle">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center" ss:WrapText="1"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#38bdf8"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#334155"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#334155"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#334155"/>
   </Borders>
   <Font ss:FontName="Calibri" ss:Size="11" ss:Color="#ffffff" ss:Bold="1"/>
   <Interior ss:Color="#0f172a" ss:Pattern="Solid"/>
  </Style>
  <!-- Accent Header Style -->
  <Style ss:ID="AccentHeaderStyle">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center" ss:WrapText="1"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="2" ss:Color="#0284c7"/>
   </Borders>
   <Font ss:FontName="Calibri" ss:Size="11" ss:Color="#ffffff" ss:Bold="1"/>
   <Interior ss:Color="#0369a1" ss:Pattern="Solid"/>
  </Style>
  <!-- Subtotal / Summary Footer Style -->
  <Style ss:ID="SubtotalStyle">
   <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#38bdf8"/>
    <Border ss:Position="Bottom" ss:LineStyle="Double" ss:Weight="3" ss:Color="#38bdf8"/>
   </Borders>
   <Font ss:FontName="Calibri" ss:Size="11" ss:Color="#0284c7" ss:Bold="1"/>
   <Interior ss:Color="#f0f9ff" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="SubtotalNumStyle">
   <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#38bdf8"/>
    <Border ss:Position="Bottom" ss:LineStyle="Double" ss:Weight="3" ss:Color="#38bdf8"/>
   </Borders>
   <Font ss:FontName="Calibri" ss:Size="11" ss:Color="#0f172a" ss:Bold="1"/>
   <Interior ss:Color="#f0f9ff" ss:Pattern="Solid"/>
   <NumberFormat ss:Format="#,##0"/>
  </Style>
  <Style ss:ID="SubtotalCurStyle">
   <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#38bdf8"/>
    <Border ss:Position="Bottom" ss:LineStyle="Double" ss:Weight="3" ss:Color="#38bdf8"/>
   </Borders>
   <Font ss:FontName="Calibri" ss:Size="11" ss:Color="#0f172a" ss:Bold="1"/>
   <Interior ss:Color="#f0f9ff" ss:Pattern="Solid"/>
   <NumberFormat ss:Format="&quot;$&quot;#,##0"/>
  </Style>
  <!-- Numeric Cell Style -->
  <Style ss:ID="NumericStyle">
   <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
   <NumberFormat ss:Format="#,##0"/>
  </Style>
  <Style ss:ID="DecimalStyle">
   <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
   <NumberFormat ss:Format="#,##0.0"/>
  </Style>
  <!-- Currency Cell Style -->
  <Style ss:ID="CurrencyStyle">
   <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
   <NumberFormat ss:Format="&quot;$&quot;#,##0"/>
  </Style>
  <!-- Percentage Cell Style -->
  <Style ss:ID="PercentStyle">
   <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
   <NumberFormat ss:Format="0.0%"/>
  </Style>
  <!-- Zebra Striped Row Style -->
  <Style ss:ID="ZebraStyle">
   <Alignment ss:Vertical="Center"/>
   <Interior ss:Color="#f8fafc" ss:Pattern="Solid"/>
  </Style>
  <!-- Positive / Negative Trend Styles -->
  <Style ss:ID="PositiveTrendStyle">
   <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
   <Font ss:FontName="Calibri" ss:Size="11" ss:Color="#059669" ss:Bold="1"/>
  </Style>
  <Style ss:ID="NegativeTrendStyle">
   <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
   <Font ss:FontName="Calibri" ss:Size="11" ss:Color="#dc2626" ss:Bold="1"/>
  </Style>
  <!-- Metadata Label & Value Styles -->
  <Style ss:ID="MetaLabel">
   <Font ss:FontName="Calibri" ss:Size="10" ss:Color="#64748b" ss:Bold="1"/>
  </Style>
  <Style ss:ID="MetaValue">
   <Font ss:FontName="Calibri" ss:Size="10" ss:Color="#0f172a"/>
  </Style>
  <Style ss:ID="CodeStyle">
   <Font ss:FontName="Consolas" ss:Size="9" ss:Color="#0369a1"/>
  </Style>`;
  }

  /**
   * Generates standard Module 30 Microsoft SpreadsheetML XML content
   */
  public static generate<T = any>(
    title: string,
    data: T[],
    columns: ExportColumnDefinition<T>[],
    metadata?: ExportProvenanceMetadata
  ): string {
    const safeSheetTitle = this.escapeXml(title.slice(0, 31) || 'Maritime Data');
    const nowIso = new Date().toISOString();

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <DocumentProperties xmlns="urn:schemas-microsoft-com:office:office">
  <Title>${this.escapeXml(title)}</Title>
  <Author>SIH 26006 Maritime Intelligence Platform</Author>
  <Created>${nowIso}</Created>
 </DocumentProperties>
 <Styles>
${this.getStylesXml()}
 </Styles>
`;

    // ----------------------------------------------------
    // WORKSHEET 1: MAIN DATASET
    // ----------------------------------------------------
    xml += ` <Worksheet ss:Name="${safeSheetTitle}">
  <Table ss:DefaultRowHeight="20">
`;

    // Define column widths
    for (const col of columns) {
      const headerText = col.header || col.label || col.key;
      const approxWidth = Math.max(100, (col.width || headerText.length * 10) + 20);
      xml += `   <Column ss:AutoFitWidth="1" ss:Width="${approxWidth}"/>\n`;
    }

    // Header Row
    xml += `   <Row ss:Height="26">\n`;
    for (const col of columns) {
      const headerText = col.header || col.label || col.key;
      xml += `    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">${this.escapeXml(headerText)}</Data></Cell>\n`;
    }
    xml += `   </Row>\n`;

    // Data Rows
    for (const row of data) {
      xml += `   <Row>\n`;
      for (const col of columns) {
        const raw = ExportFormatter.extractValue(row, col.key);
        const colType = col.type || 'text';

        if (raw === null || raw === undefined || raw === '') {
          xml += `    <Cell><Data ss:Type="String"></Data></Cell>\n`;
        } else if (colType === 'number' && typeof raw === 'number' && !isNaN(raw)) {
          xml += `    <Cell ss:StyleID="NumericStyle"><Data ss:Type="Number">${raw}</Data></Cell>\n`;
        } else if (colType === 'currency' && typeof raw === 'number' && !isNaN(raw)) {
          xml += `    <Cell ss:StyleID="CurrencyStyle"><Data ss:Type="Number">${raw}</Data></Cell>\n`;
        } else {
          const formatted = ExportFormatter.formatCellValue(raw, row, col, { sanitizeFormulas: true });
          xml += `    <Cell><Data ss:Type="String">${this.escapeXml(formatted)}</Data></Cell>\n`;
        }
      }
      xml += `   </Row>\n`;
    }

    xml += `  </Table>
  <!-- Freeze Header Row for Smooth Scrolling -->
  <WorksheetOptions xmlns="urn:schemas-microsoft-com:office:excel">
   <FreezePanes/>
   <FrozenNoSplit/>
   <SplitHorizontal>1</SplitHorizontal>
   <TopRowBottomPane>1</TopRowBottomPane>
   <ActivePane>2</ActivePane>
  </WorksheetOptions>
 </Worksheet>
`;

    // ----------------------------------------------------
    // WORKSHEET 2: PROVENANCE & CONTEXT
    // ----------------------------------------------------
    xml += ` <Worksheet ss:Name="Provenance &amp; Metadata">
  <Table ss:DefaultRowHeight="20">
   <Column ss:Width="160"/>
   <Column ss:Width="340"/>
   <Row ss:Height="24">
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Metadata Attribute</Data></Cell>
    <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Value / Audit Context</Data></Cell>
   </Row>
   <Row>
    <Cell ss:StyleID="MetaLabel"><Data ss:Type="String">Dataset Name</Data></Cell>
    <Cell ss:StyleID="MetaValue"><Data ss:Type="String">${this.escapeXml(metadata?.datasetName || title)}</Data></Cell>
   </Row>
   <Row>
    <Cell ss:StyleID="MetaLabel"><Data ss:Type="String">Export Timestamp (UTC)</Data></Cell>
    <Cell ss:StyleID="MetaValue"><Data ss:Type="String">${this.escapeXml(metadata?.exportedAt || nowIso)}</Data></Cell>
   </Row>
   <Row>
    <Cell ss:StyleID="MetaLabel"><Data ss:Type="String">Total Exported Records</Data></Cell>
    <Cell ss:StyleID="NumericStyle"><Data ss:Type="Number">${data.length}</Data></Cell>
   </Row>
   <Row>
    <Cell ss:StyleID="MetaLabel"><Data ss:Type="String">Provenance Status</Data></Cell>
    <Cell ss:StyleID="MetaValue"><Data ss:Type="String">${this.escapeXml(metadata?.provenanceStatus || 'CANONICAL_EMPIRICAL')}</Data></Cell>
   </Row>
   <Row>
    <Cell ss:StyleID="MetaLabel"><Data ss:Type="String">Platform System</Data></Cell>
    <Cell ss:StyleID="MetaValue"><Data ss:Type="String">SIH 26006 Maritime Intelligence Engine v1.0</Data></Cell>
   </Row>
`;

    if (metadata?.activeFilters && Object.keys(metadata.activeFilters).length > 0) {
      xml += `   <Row>
    <Cell ss:StyleID="MetaLabel"><Data ss:Type="String">Active Filter Parameters</Data></Cell>
    <Cell ss:StyleID="MetaValue"><Data ss:Type="String">${this.escapeXml(JSON.stringify(metadata.activeFilters))}</Data></Cell>
   </Row>\n`;
    }

    xml += `  </Table>
 </Worksheet>
</Workbook>`;

    return xml;
  }

  /**
   * Generates a valid multi-sheet Microsoft SpreadsheetML XML workbook (Module 31)
   */
  public static generateMultiSheetWorkbook(
    title: string,
    sheets: { name: string; contentXml: string }[]
  ): string {
    const nowIso = new Date().toISOString();
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <DocumentProperties xmlns="urn:schemas-microsoft-com:office:office">
  <Title>${this.escapeXml(title)}</Title>
  <Author>SIH 26006 Maritime Intelligence Platform</Author>
  <Created>${nowIso}</Created>
 </DocumentProperties>
 <Styles>
${this.getStylesXml()}
 </Styles>
`;

    for (const sheet of sheets) {
      xml += ` <Worksheet ss:Name="${this.escapeXml(sheet.name)}">\n`;
      xml += sheet.contentXml;
      xml += ` </Worksheet>\n`;
    }

    xml += `</Workbook>`;
    return xml;
  }
}
