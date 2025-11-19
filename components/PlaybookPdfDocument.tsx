import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: "#0f172a",
  },
  heading: {
    fontSize: 18,
    marginBottom: 8,
    fontWeight: "bold",
  },
  subheading: {
    fontSize: 12,
    marginBottom: 4,
    fontWeight: "bold",
  },
  section: {
    marginBottom: 16,
  },
  pill: {
    fontSize: 8,
    padding: 4,
    borderRadius: 12,
    backgroundColor: "#e0f2fe",
    color: "#0369a1",
    alignSelf: "flex-start",
    marginBottom: 6,
  },
  bullet: {
    marginLeft: 10,
    marginBottom: 2,
  },
});

export default function PlaybookPdfDocument({ playbook }: { playbook: any }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.section}>
          <Text style={styles.heading}>{playbook.title}</Text>
          <Text>{playbook.summary}</Text>
        </View>

        {/* Product overview */}
        <View style={styles.section}>
          <Text style={styles.subheading}>Product overview</Text>
          <Text>{playbook.productOverview.description}</Text>
          <Text>{`\nTarget user: ${playbook.productOverview.targetUser}`}</Text>
          <Text style={{ marginTop: 4 }}>Key use cases:</Text>
          {playbook.productOverview.useCases.map((u: string, idx: number) => (
            <Text key={idx} style={styles.bullet}>{`\u2022 ${u}`}</Text>
          ))}
        </View>

        {/* Materials */}
        <View style={styles.section}>
          <Text style={styles.subheading}>Materials</Text>
          {playbook.materials.map(
            (m: any, idx: number) => (
              <View key={idx} style={{ marginBottom: 6 }}>
                <Text style={{ fontWeight: "bold" }}>{m.name}</Text>
                <Text style={{ fontStyle: "italic" }}>{m.role}</Text>
                <Text>Pros:</Text>
                {m.pros.map((p: string, i: number) => (
                  <Text key={i} style={styles.bullet}>{`\u2022 ${p}`}</Text>
                ))}
                <Text>Cons:</Text>
                {m.cons.map((c: string, i: number) => (
                  <Text key={i} style={styles.bullet}>{`\u2022 ${c}`}</Text>
                ))}
              </View>
            )
          )}
        </View>

        {/* Regions */}
        <View style={styles.section}>
          <Text style={styles.subheading}>Region recommendations</Text>
          {playbook.regionRecommendations.map((r: any, idx: number) => (
            <View key={idx} style={{ marginBottom: 6 }}>
              <Text style={{ fontWeight: "bold" }}>
                {r.region} ({r.suitability} suitability)
              </Text>
              <Text>{r.reasoning}</Text>
              <Text>{r.notes}</Text>
            </View>
          ))}
        </View>

        {/* Cost insights */}
        <View style={styles.section}>
          <Text style={styles.subheading}>Cost & feasibility</Text>
          <Text>{playbook.costInsights.feasibility}</Text>
          <Text style={{ marginTop: 4 }}>Main cost drivers:</Text>
          {playbook.costInsights.mainCostDrivers.map(
            (c: string, idx: number) => (
              <Text key={idx} style={styles.bullet}>{`\u2022 ${c}`}</Text>
            )
          )}
          <Text style={{ marginTop: 4 }}>Tradeoffs:</Text>
          {playbook.costInsights.tradeoffs.map(
            (t: string, idx: number) => (
              <Text key={idx} style={styles.bullet}>{`\u2022 ${t}`}</Text>
            )
          )}
        </View>

        {/* Timeline */}
        <View style={styles.section}>
          <Text style={styles.subheading}>Timeline</Text>
          {playbook.timeline.map((t: any, idx: number) => (
            <View key={idx} style={{ marginBottom: 4 }}>
              <Text style={{ fontWeight: "bold" }}>{t.phase}</Text>
              <Text>{`Duration: ${t.durationEstimate}`}</Text>
              <Text>{t.notes}</Text>
            </View>
          ))}
        </View>

        {/* Market saturation */}
        <View style={styles.section}>
          <Text style={styles.subheading}>Market saturation & differentiation</Text>
          <Text>{`Risk level: ${playbook.marketSaturation.riskLevel}`}</Text>
          <Text>{playbook.marketSaturation.summary}</Text>
          <Text style={{ marginTop: 4 }}>Differentiation ideas:</Text>
          {playbook.marketSaturation.differentiationIdeas.map(
            (d: string, idx: number) => (
              <Text key={idx} style={styles.bullet}>{`\u2022 ${d}`}</Text>
            )
          )}
        </View>

        {/* Next steps & risks */}
        <View style={styles.section}>
          <Text style={styles.subheading}>Recommended next steps</Text>
          {playbook.nextSteps.map((s: string, idx: number) => (
            <Text key={idx} style={styles.bullet}>{`\u2022 ${s}`}</Text>
          ))}
        </View>
        <View style={styles.section}>
          <Text style={styles.subheading}>Risks to watch</Text>
          {playbook.risks.map((r: string, idx: number) => (
            <Text key={idx} style={styles.bullet}>{`\u2022 ${r}`}</Text>
          ))}
        </View>
      </Page>
    </Document>
  );
}