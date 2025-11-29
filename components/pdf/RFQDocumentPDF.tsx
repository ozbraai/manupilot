import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

// Register fonts (optional, using standard Helvetica for now)
// Font.register({ family: 'Inter', src: '...' });

const styles = StyleSheet.create({
    page: {
        padding: 40,
        fontFamily: 'Helvetica',
        fontSize: 10,
        color: '#334155', // Slate-700
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#cbd5e1',
        paddingBottom: 10,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#0f172a', // Slate-900
    },
    subtitle: {
        fontSize: 10,
        color: '#64748b', // Slate-500
        marginTop: 4,
    },
    section: {
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#0f172a',
        marginBottom: 8,
        backgroundColor: '#f1f5f9', // Slate-100
        padding: 4,
    },
    row: {
        flexDirection: 'row',
        marginBottom: 4,
    },
    label: {
        width: 120,
        fontWeight: 'bold',
        color: '#475569',
    },
    value: {
        flex: 1,
    },
    table: {
        width: 'auto',
        borderStyle: 'solid',
        borderWidth: 1,
        borderColor: '#cbd5e1',
        marginBottom: 10,
    },
    tableRow: {
        margin: 'auto',
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#cbd5e1',
    },
    tableHeader: {
        backgroundColor: '#f8fafc',
        fontWeight: 'bold',
    },
    tableCol: {
        width: '25%',
        borderRightWidth: 1,
        borderRightColor: '#cbd5e1',
        padding: 5,
    },
    tableCell: {
        fontSize: 9,
    },
    priceTable: {
        marginTop: 10,
    },
    priceRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
        paddingVertical: 6,
    },
    priceLabel: {
        flex: 2,
        fontWeight: 'bold',
    },
    priceInput: {
        flex: 1,
        borderBottomWidth: 1,
        borderBottomColor: '#94a3b8',
        borderStyle: 'dashed',
        color: '#94a3b8',
        textAlign: 'center',
    },
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 40,
        right: 40,
        textAlign: 'center',
        fontSize: 8,
        color: '#94a3b8',
        borderTopWidth: 1,
        borderTopColor: '#e2e8f0',
        paddingTop: 10,
    },
});

type SpecItem = {
    feature: string;
    spec: string;
    tolerance: string;
    criticality: string;
};

type RFQDocumentProps = {
    rfqRef: string;
    date: string;
    projectTitle: string;
    specs: SpecItem[];
    targetMoq: string;
    targetPrice: string;
    message: string;
};

export default function RFQDocumentPDF({
    rfqRef,
    date,
    projectTitle,
    specs,
    targetMoq,
    targetPrice,
    message
}: RFQDocumentProps) {
    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* 1. Header & Meta Data */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.title}>REQUEST FOR QUOTATION</Text>
                        <Text style={styles.subtitle}>Ref: {rfqRef}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                        <Text>Date: {date}</Text>
                        <Text>Valid Until: {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}</Text>
                        <Text>Currency: USD</Text>
                    </View>
                </View>

                {/* Project Info */}
                <View style={styles.section}>
                    <View style={styles.row}>
                        <Text style={styles.label}>Project Name:</Text>
                        <Text style={styles.value}>{projectTitle}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Target MOQ:</Text>
                        <Text style={styles.value}>{targetMoq}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Incoterms:</Text>
                        <Text style={styles.value}>FOB (Free On Board)</Text>
                    </View>
                </View>

                {/* 2. Commercial Terms (Fixed Skeleton) */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>I. COMMERCIAL TERMS & CONDITIONS</Text>
                    <View style={styles.row}>
                        <Text style={styles.label}>Payment Terms:</Text>
                        <Text style={styles.value}>30% Deposit T/T, 70% Balance after passing Third-Party Inspection.</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Validity:</Text>
                        <Text style={styles.value}>Quote must be valid for 30 days.</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Lead Time:</Text>
                        <Text style={styles.value}>Please specify Sample Lead Time and Mass Production Lead Time separately.</Text>
                    </View>
                </View>

                {/* 3. Packaging & Logistics (Fixed Skeleton) */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>II. PACKAGING & LOGISTICS</Text>
                    <View style={styles.row}>
                        <Text style={styles.label}>Retail Packaging:</Text>
                        <Text style={styles.value}>Standard Export Packaging (Polybag / Color Box as specified).</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Master Carton:</Text>
                        <Text style={styles.value}>Double-wall corrugated (5-ply). Max weight 15kg.</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Markings:</Text>
                        <Text style={styles.value}>UPC Barcode + "Made In [Country]" + PO Number.</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Drop Test:</Text>
                        <Text style={styles.value}>Must pass ISTA-1A standard drop test.</Text>
                    </View>
                </View>

                {/* 4. Quality & Compliance (Fixed Skeleton) */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>III. QUALITY & COMPLIANCE</Text>
                    <View style={styles.row}>
                        <Text style={styles.label}>Inspection:</Text>
                        <Text style={styles.value}>Pre-shipment inspection (PSI) required. Standard: AQL 2.5 Major / 4.0 Minor.</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Compliance:</Text>
                        <Text style={styles.value}>Must meet target market regulations (CE, FCC, RoHS, FDA as applicable).</Text>
                    </View>
                </View>

                {/* 5. Dynamic Core (Technical Specs) */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>IV. TECHNICAL SPECIFICATIONS</Text>
                    <View style={styles.table}>
                        <View style={[styles.tableRow, styles.tableHeader]}>
                            <View style={styles.tableCol}><Text style={styles.tableCell}>Feature / Component</Text></View>
                            <View style={styles.tableCol}><Text style={styles.tableCell}>Specification / Target</Text></View>
                            <View style={styles.tableCol}><Text style={styles.tableCell}>Tolerance / Standard</Text></View>
                            <View style={[styles.tableCol, { borderRightWidth: 0 }]}><Text style={styles.tableCell}>Criticality</Text></View>
                        </View>
                        {specs.length > 0 ? specs.map((item, i) => (
                            <View key={i} style={styles.tableRow}>
                                <View style={styles.tableCol}><Text style={styles.tableCell}>{item.feature}</Text></View>
                                <View style={styles.tableCol}><Text style={styles.tableCell}>{item.spec}</Text></View>
                                <View style={styles.tableCol}><Text style={styles.tableCell}>{item.tolerance}</Text></View>
                                <View style={[styles.tableCol, { borderRightWidth: 0 }]}><Text style={styles.tableCell}>{item.criticality}</Text></View>
                            </View>
                        )) : (
                            <View style={styles.tableRow}>
                                <View style={[styles.tableCol, { width: '100%', borderRightWidth: 0 }]}><Text style={[styles.tableCell, { fontStyle: 'italic', padding: 10 }]}>No specific technical requirements listed. Please quote based on standard industry practices for this product category.</Text></View>
                            </View>
                        )}
                    </View>
                </View>

                {/* 6. Price Breakdown Requirement */}
                <View style={[styles.section, { marginTop: 20 }]}>
                    <Text style={styles.sectionTitle}>V. REQUIRED QUOTE BREAKDOWN</Text>
                    <Text style={{ fontSize: 9, marginBottom: 10, color: '#64748b' }}>
                        Please provide your quotation using the following cost breakdown structure. Single "all-in" prices will not be accepted.
                    </Text>

                    <View style={styles.priceTable}>
                        <View style={styles.priceRow}>
                            <Text style={styles.priceLabel}>1. Unit Price (Ex-Works)</Text>
                            <Text style={styles.priceInput}>$ ______________</Text>
                        </View>
                        <View style={styles.priceRow}>
                            <Text style={styles.priceLabel}>2. Packaging Cost (Retail Box + Master)</Text>
                            <Text style={styles.priceInput}>$ ______________</Text>
                        </View>
                        <View style={styles.priceRow}>
                            <Text style={styles.priceLabel}>3. FOB Local Charges (Port Transport, Docs)</Text>
                            <Text style={styles.priceInput}>$ ______________</Text>
                        </View>
                        <View style={styles.priceRow}>
                            <Text style={styles.priceLabel}>4. Tooling / NRE (Molds, Setup) - One-time</Text>
                            <Text style={styles.priceInput}>$ ______________</Text>
                        </View>
                        <View style={styles.priceRow}>
                            <Text style={styles.priceLabel}>5. Sample Cost (inc. shipping)</Text>
                            <Text style={styles.priceInput}>$ ______________</Text>
                        </View>
                    </View>
                </View>

                {/* Footer */}
                <Text style={styles.footer}>
                    Generated by ManuPilot - The AI Operating System for Manufacturing | {rfqRef} | Page 1 of 1
                </Text>
            </Page>
        </Document>
    );
}
