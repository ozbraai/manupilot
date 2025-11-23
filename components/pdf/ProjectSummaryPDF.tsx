import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

// Define styles
const styles = StyleSheet.create({
    page: {
        padding: 40,
        fontSize: 10,
        fontFamily: 'Helvetica',
    },
    header: {
        marginBottom: 25,
        borderBottom: 2,
        borderBottomColor: '#18181b',
        paddingBottom: 12,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#18181b',
        marginBottom: 6,
    },
    subtitle: {
        fontSize: 9,
        color: '#71717a',
    },
    section: {
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#18181b',
        marginBottom: 8,
        borderBottom: 1,
        borderBottomColor: '#e4e4e7',
        paddingBottom: 3,
    },
    row: {
        flexDirection: 'row',
        marginBottom: 3,
    },
    label: {
        fontSize: 9,
        fontWeight: 'bold',
        color: '#52525b',
        width: '30%',
    },
    value: {
        fontSize: 9,
        color: '#18181b',
        width: '70%',
    },
    text: {
        fontSize: 9,
        color: '#3f3f46',
        lineHeight: 1.4,
        marginBottom: 5,
    },
    listItem: {
        flexDirection: 'row',
        marginBottom: 3,
        marginLeft: 10,
    },
    bullet: {
        width: 12,
        fontSize: 9,
    },
    bomTable: {
        marginTop: 8,
    },
    bomHeader: {
        flexDirection: 'row',
        backgroundColor: '#f4f4f5',
        padding: 5,
        fontWeight: 'bold',
        fontSize: 8,
        borderBottom: 1,
        borderBottomColor: '#d4d4d8',
    },
    bomRow: {
        flexDirection: 'row',
        padding: 5,
        fontSize: 8,
        borderBottom: 1,
        borderBottomColor: '#f4f4f5',
    },
    bomCell: {
        flex: 1,
    },
    footer: {
        position: 'absolute',
        bottom: 25,
        left: 40,
        right: 40,
        textAlign: 'center',
        fontSize: 7,
        color: '#a1a1aa',
        borderTop: 1,
        borderTopColor: '#e4e4e7',
        paddingTop: 8,
    },
});

type ProjectData = {
    title?: string;
    summary?: string;
    category?: string;
    sourcingMode?: string;
    targetMarket?: string;
    targetCustomer?: string;
    timeline?: any;
    bomDraft?: any[];
    financials?: any;
    manufacturingApproach?: any;
    notes?: string;
};

type ProjectSummaryPDFProps = {
    project: any;
    playbookFree: ProjectData;
};

const ProjectSummaryPDF = ({ project, playbookFree }: ProjectSummaryPDFProps) => {
    const currentDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>{project?.title || playbookFree?.title || 'Untitled Project'}</Text>
                    <Text style={styles.subtitle}>Project Summary Report • Generated {currentDate}</Text>
                </View>

                {/* Executive Summary */}
                {playbookFree?.summary && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Executive Summary</Text>
                        <Text style={styles.text}>{playbookFree.summary}</Text>
                    </View>
                )}

                {/* Project Details */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Project Details</Text>
                    {playbookFree?.category && (
                        <View style={styles.row}>
                            <Text style={styles.label}>Category:</Text>
                            <Text style={styles.value}>{playbookFree.category}</Text>
                        </View>
                    )}
                    {playbookFree?.sourcingMode && (
                        <View style={styles.row}>
                            <Text style={styles.label}>Sourcing Mode:</Text>
                            <Text style={styles.value}>
                                {playbookFree.sourcingMode === 'white-label' ? 'White Label / Private Label (ODM)' : 'Custom OEM Manufacturing'}
                            </Text>
                        </View>
                    )}
                    {playbookFree?.targetMarket && (
                        <View style={styles.row}>
                            <Text style={styles.label}>Target Market:</Text>
                            <Text style={styles.value}>{playbookFree.targetMarket}</Text>
                        </View>
                    )}
                    {playbookFree?.targetCustomer && (
                        <View style={styles.row}>
                            <Text style={styles.label}>Target Customer:</Text>
                            <Text style={styles.value}>{playbookFree.targetCustomer}</Text>
                        </View>
                    )}
                </View>

                {/* Timeline & Milestones */}
                {playbookFree?.timeline && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Timeline & Milestones</Text>
                        {playbookFree.timeline.totalDuration && (
                            <View style={styles.row}>
                                <Text style={styles.label}>Total Duration:</Text>
                                <Text style={styles.value}>{playbookFree.timeline.totalDuration}</Text>
                            </View>
                        )}
                        {playbookFree.timeline.milestones?.map((milestone: any, idx: number) => (
                            <View key={idx} style={styles.listItem}>
                                <Text style={styles.bullet}>•</Text>
                                <Text style={styles.text}>
                                    {milestone.phase || milestone.name || milestone.title}: {milestone.duration || milestone.timeline || milestone.timeframe}
                                </Text>
                            </View>
                        ))}
                    </View>
                )}

                {/* BOM */}
                {playbookFree?.bomDraft && playbookFree.bomDraft.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Bill of Materials ({playbookFree.bomDraft.length} items)</Text>
                        <View style={styles.bomTable}>
                            <View style={styles.bomHeader}>
                                <Text style={[styles.bomCell, { flex: 2 }]}>Component</Text>
                                <Text style={styles.bomCell}>Material</Text>
                                <Text style={styles.bomCell}>Qty</Text>
                                <Text style={styles.bomCell}>Process</Text>
                            </View>
                            {playbookFree.bomDraft.slice(0, 20).map((item: any, idx: number) => (
                                <View key={idx} style={styles.bomRow}>
                                    <Text style={[styles.bomCell, { flex: 2 }]}>
                                        {item.name || item.component || item.part || `Component ${idx + 1}`}
                                    </Text>
                                    <Text style={styles.bomCell}>{item.material || item.mat || 'N/A'}</Text>
                                    <Text style={styles.bomCell}>{item.quantity || item.qty || '1'}</Text>
                                    <Text style={styles.bomCell}>{item.process || item.manufacturing || 'N/A'}</Text>
                                </View>
                            ))}
                            {playbookFree.bomDraft.length > 20 && (
                                <Text style={[styles.text, { marginTop: 5, fontSize: 8, fontStyle: 'italic' }]}>
                                    ... and {playbookFree.bomDraft.length - 20} more components
                                </Text>
                            )}
                        </View>
                    </View>
                )}

                {/* Manufacturing Approach */}
                {playbookFree?.manufacturingApproach && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Manufacturing Approach</Text>
                        {playbookFree.manufacturingApproach.recommendation && (
                            <Text style={styles.text}>{playbookFree.manufacturingApproach.recommendation}</Text>
                        )}
                        {playbookFree.manufacturingApproach.processes && playbookFree.manufacturingApproach.processes.length > 0 && (
                            <>
                                <Text style={[styles.text, { fontWeight: 'bold', marginTop: 6, marginBottom: 3 }]}>Key Processes:</Text>
                                {playbookFree.manufacturingApproach.processes.map((process: any, idx: number) => (
                                    <View key={idx} style={styles.listItem}>
                                        <Text style={styles.bullet}>•</Text>
                                        <Text style={styles.text}>{typeof process === 'string' ? process : process.name || process.process}</Text>
                                    </View>
                                ))}
                            </>
                        )}
                    </View>
                )}

                {/* Financials */}
                {playbookFree?.financials && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Financial Projections</Text>
                        {playbookFree.financials.estimatedLandedCost && (
                            <View style={styles.row}>
                                <Text style={styles.label}>Estimated Landed Cost:</Text>
                                <Text style={styles.value}>{playbookFree.financials.estimatedLandedCost}</Text>
                            </View>
                        )}
                        {playbookFree.financials.unitEconomics && (
                            <>
                                {playbookFree.financials.unitEconomics.landedCost && (
                                    <View style={styles.row}>
                                        <Text style={styles.label}>Unit Landed Cost:</Text>
                                        <Text style={styles.value}>${playbookFree.financials.unitEconomics.landedCost}</Text>
                                    </View>
                                )}
                                {playbookFree.financials.unitEconomics.retailPrice && (
                                    <View style={styles.row}>
                                        <Text style={styles.label}>Retail Price:</Text>
                                        <Text style={styles.value}>${playbookFree.financials.unitEconomics.retailPrice}</Text>
                                    </View>
                                )}
                                {playbookFree.financials.unitEconomics.margin && (
                                    <View style={styles.row}>
                                        <Text style={styles.label}>Profit Margin:</Text>
                                        <Text style={styles.value}>{playbookFree.financials.unitEconomics.margin}%</Text>
                                    </View>
                                )}
                            </>
                        )}
                    </View>
                )}

                {/* Risks */}
                {playbookFree?.manufacturingApproach?.risks && playbookFree.manufacturingApproach.risks.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Manufacturing Risks & Mitigation</Text>
                        {playbookFree.manufacturingApproach.risks.map((risk: any, idx: number) => (
                            <View key={idx} style={styles.listItem}>
                                <Text style={styles.bullet}>•</Text>
                                <Text style={styles.text}>
                                    <Text style={{ fontWeight: 'bold' }}>{risk.risk || risk.name || risk.title}:</Text> {risk.mitigation || risk.solution || risk.description}
                                </Text>
                            </View>
                        ))}
                    </View>
                )}

                {/* DFM Warnings */}
                {playbookFree?.manufacturingApproach?.dfmWarnings && playbookFree.manufacturingApproach.dfmWarnings.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Design for Manufacturing (DFM) Considerations</Text>
                        {playbookFree.manufacturingApproach.dfmWarnings.map((warning: any, idx: number) => (
                            <View key={idx} style={styles.listItem}>
                                <Text style={styles.bullet}>⚠</Text>
                                <Text style={styles.text}>
                                    {typeof warning === 'string' ? warning : warning.warning || warning.message || warning.title}
                                </Text>
                            </View>
                        ))}
                    </View>
                )}

                {/* Compliance */}
                {playbookFree?.manufacturingApproach?.complianceTasks && playbookFree.manufacturingApproach.complianceTasks.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Compliance & Certification Tasks</Text>
                        {playbookFree.manufacturingApproach.complianceTasks.map((task: any, idx: number) => (
                            <View key={idx} style={styles.listItem}>
                                <Text style={styles.bullet}>□</Text>
                                <Text style={styles.text}>
                                    {typeof task === 'string' ? task : task.task || task.name || task.requirement}
                                </Text>
                            </View>
                        ))}
                    </View>
                )}

                {/* Notes */}
                {playbookFree?.notes && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Project Notes</Text>
                        <Text style={styles.text}>{playbookFree.notes}</Text>
                    </View>
                )}

                {/* Footer */}
                <View style={styles.footer}>
                    <Text>Generated by ManuPilot • manupilot.com</Text>
                    <Text>This report is confidential and intended for internal use only</Text>
                </View>
            </Page>
        </Document>
    );
};

export default ProjectSummaryPDF;
