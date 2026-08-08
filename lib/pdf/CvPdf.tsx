import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import type { CvDocument } from "./types";

// Print-friendly restraint (WAVE 3 slice B spec): the rose accent (#f20c78)
// is used ONLY for the name underline rule and section headings. Everything
// else stays near-black / muted so the document reads as a real CV, not a
// branded flyer. Built-in Helvetica only — no custom font loading, no network.
const INK = "#18181b";
const MUTED = "#6f6f75";
const ROSE = "#f20c78";

const styles = StyleSheet.create({
  page: {
    paddingTop: 48,
    paddingBottom: 48,
    paddingHorizontal: 48,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: INK,
  },
  name: {
    fontSize: 24,
    fontFamily: "Helvetica-Bold",
    color: INK,
  },
  nameUnderline: {
    marginTop: 6,
    marginBottom: 10,
    height: 2,
    width: 64,
    backgroundColor: ROSE,
  },
  headline: {
    fontSize: 11,
    color: MUTED,
    marginBottom: 22,
  },
  section: {
    marginBottom: 16,
  },
  sectionHeading: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: ROSE,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  bulletRow: {
    flexDirection: "row",
    marginBottom: 4,
  },
  bulletMark: {
    width: 12,
    fontSize: 10,
    color: MUTED,
  },
  bulletText: {
    flex: 1,
    fontSize: 10,
    color: INK,
    lineHeight: 1.4,
  },
});

export function CvPdf({ doc }: { doc: CvDocument }) {
  return (
    <Document title={`${doc.name} — CV`}>
      <Page size="A4" style={styles.page}>
        <Text style={styles.name}>{doc.name}</Text>
        <View style={styles.nameUnderline} />
        <Text style={styles.headline}>{doc.headline}</Text>
        {doc.sections.map((section, i) => (
          <View key={i} style={styles.section} wrap={false}>
            <Text style={styles.sectionHeading}>{section.heading}</Text>
            {section.bullets.map((bullet, j) => (
              <View key={j} style={styles.bulletRow}>
                <Text style={styles.bulletMark}>{"•"}</Text>
                <Text style={styles.bulletText}>{bullet}</Text>
              </View>
            ))}
          </View>
        ))}
      </Page>
    </Document>
  );
}

export default CvPdf;
